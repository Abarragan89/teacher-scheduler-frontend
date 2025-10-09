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
        // Get all subscriptions using serverFetch helper function
        const subscriptions = await serverPushNotifications.getAllSubscriptions()

        const results = []

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

            } catch (error) {
                console.error('❌ Failed to send to:', subscription.endpoint, error)
                results.push({ success: false, endpoint: subscription.endpoint, error: String(error) })
            }
        }
        return { success: true, results }

    } catch (error) {
        console.error('❌ Error sending notifications:', error)
        return { success: false, error: String(error) }
    }
}

export async function sendDelayedTestNotification() {
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                const result = await sendNotificationToAllUsers('🎉 Test notification sent to ALL users! Your PWA is working!')
            } catch (error) {
                console.error('❌ Test notification failed:', error)
                resolve({ success: false, error: String(error) })
            }
        }, 10000)
    })
}