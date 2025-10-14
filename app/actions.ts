'use server'

import webpush from 'web-push'
import { serverPushNotifications } from '@/lib/api/services/pushNotifications/server'

webpush.setVapidDetails(
    'mailto:anthony.bar.89@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: any) {
    let p256dhKey: string
    let authKey: string

    // Handle serialized subscription object (what we receive from client)
    if (sub.keys && sub.keys.p256dh && sub.keys.auth) {
        p256dhKey = sub.keys.p256dh
        authKey = sub.keys.auth
    } else if (typeof sub.getKey === 'function') {
        // Fallback: if somehow we get raw PushSubscription
        const key = sub.getKey('p256dh')
        const authKeyRaw = sub.getKey('auth')

        if (!key || !authKeyRaw) {
            throw new Error('Unable to get subscription keys')
        }

        p256dhKey = Buffer.from(key).toString('base64')
        authKey = Buffer.from(authKeyRaw).toString('base64')
    } else {
        console.error('❌ Invalid subscription object:', sub)
        throw new Error('Invalid subscription object - no keys found')
    }

    const subscriptionData = {
        endpoint: sub.endpoint,
        p256dhKey,
        authKey
    }

    try {
        // Use serverFetch helper function
        const result = await serverPushNotifications.subscribe(subscriptionData)
        return result
    } catch (error) {
        console.error('❌ Failed to save subscription:', error)
        return { success: false, error: String(error) }
    }
}

export async function unsubscribeUser(endpoint: string) {
    try {
        // Use serverFetch helper function
        const result = await serverPushNotifications.unsubscribe(endpoint)
        return result
    } catch (error) {
        console.error('❌ Failed to unsubscribe:', error)
        return { success: false, error: String(error) }
    }
}

export async function sendNotificationToAllUsers(message: string) {
    try {
        const subscriptions = await serverPushNotifications.getAllSubscriptions()
        const results = []
        const invalidSubscriptions = []

        // Send to each subscription
        for (const subscription of subscriptions) {
            try {
                const webPushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dhKey,
                        auth: subscription.authKey
                    }
                }

                await webpush.sendNotification(
                    webPushSubscription,
                    JSON.stringify({
                        title: 'Teacher Scheduler',
                        body: message,
                        icon: '/android-chrome-192x192.png',
                    })
                )

                results.push({ success: true, endpoint: subscription.endpoint })

            } catch (error: any) {
                console.error('❌ Failed to send to:', subscription.endpoint.substring(0, 50) + '...', error.message)

                // ✅ Handle expired/invalid subscriptions - mark for renewal
                if (error.statusCode === 410 || error.statusCode === 404) {
                    invalidSubscriptions.push(subscription.endpoint)
                }

                results.push({
                    success: false,
                    endpoint: subscription.endpoint,
                    error: `${error.statusCode}: ${error.message}`
                })
            }
        }

        // ✅ Clean up invalid subscriptions from database
        if (invalidSubscriptions.length > 0) {
            for (const invalidEndpoint of invalidSubscriptions) {
                try {
                    await serverPushNotifications.unsubscribe(invalidEndpoint)
                } catch (cleanupError) {
                    console.error('❌ Failed to cleanup invalid subscription:', cleanupError)
                }
            }
        }

        const successCount = results.filter(r => r.success).length
        return {
            success: true,
            results,
            sentCount: successCount,
            totalCount: results.length,
            cleanedUp: invalidSubscriptions.length,
            needsRenewal: invalidSubscriptions.length > 0 // ✅ Signal that renewal is needed
        }

    } catch (error) {
        console.error('❌ Error sending notifications:', error)
        return { success: false, error: String(error) }
    }
}

export async function cleanupInvalidSubscriptions() {
    try {
        const subscriptions = await serverPushNotifications.getAllSubscriptions()
        const invalidSubscriptions = []

        // Test each subscription with a minimal notification
        for (const subscription of subscriptions) {
            try {
                const webPushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dhKey,
                        auth: subscription.authKey
                    }
                }

                // Send a test notification to validate subscription
                await webpush.sendNotification(
                    webPushSubscription,
                    JSON.stringify({
                        title: 'Subscription Test',
                        body: 'Validating subscription...',
                        icon: '/android-chrome-192x192.png',
                        tag: 'cleanup-test', // Won't show to user
                        silent: true // Silent notification
                    })
                )
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    invalidSubscriptions.push(subscription.endpoint)
                }
            }
        }

        // Remove invalid subscriptions
        for (const invalidEndpoint of invalidSubscriptions) {
            await serverPushNotifications.unsubscribe(invalidEndpoint)
        }
        
        return {
            success: true,
            cleanedUp: invalidSubscriptions.length,
            remaining: subscriptions.length - invalidSubscriptions.length
        }
    } catch (error) {
        console.error('❌ Cleanup failed:', error)
        return { success: false, error: String(error) }
    }
}

export async function sendDelayedTestNotification() {
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                const result = await sendNotificationToAllUsers('🎉 Test notification sent to ALL users! Your PWA is working!')
                resolve(result) // ✅ Added missing resolve
            } catch (error) {
                console.error('❌ Test notification failed:', error)
                resolve({ success: false, error: String(error) })
            }
        }, 1000)
    })
}

// ✅ New function to check if subscription renewal is needed
export async function checkSubscriptionStatus() {
    try {
        const subscriptions = await serverPushNotifications.getAllSubscriptions()
        return {
            success: true,
            hasSubscriptions: subscriptions.length > 0,
            count: subscriptions.length
        }
    } catch (error) {
        console.error('❌ Failed to check subscription status:', error)
        return { success: false, error: String(error) }
    }
}