'use server'

import webpush from 'web-push'
import { cookies } from 'next/headers'

console.log('🔑 VAPID Public Key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Set' : 'Missing')
console.log('🔑 VAPID Private Key:', process.env.VAPID_PRIVATE_KEY ? 'Set' : 'Missing')

webpush.setVapidDetails(
    'mailto:anthony.bar.89@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

// Helper function to get auth token from cookies
async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')
    return accessToken?.value
}

export async function subscribeUser(sub: PushSubscription) {
    console.log('📱 subscribeUser called with:', sub.endpoint)

    const key = sub.getKey('p256dh')
    const authKey = sub.getKey('auth')

    if (!key || !authKey) {
        throw new Error('Unable to get subscription keys')
    }

    const subscriptionData = {
        endpoint: sub.endpoint,
        p256dhKey: Buffer.from(key).toString('base64'),
        authKey: Buffer.from(authKey).toString('base64')
    }

    try {
        // Send to your Java backend
        const authToken = await getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify(subscriptionData)
        })

        const result = await response.json()
        console.log('✅ Subscription saved to database:', result)
        return result
    } catch (error) {
        console.error('❌ Failed to save subscription:', error)
        return { success: false, error: String(error) }
    }
}

export async function unsubscribeUser(endpoint: string) {
    try {
        const authToken = await getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unsubscribe`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify({ endpoint })
        })

        const result = await response.json()
        console.log('✅ Unsubscribed from database:', result)
        return result
    } catch (error) {
        console.error('❌ Failed to unsubscribe:', error)
        return { success: false, error: String(error) }
    }
}

export async function sendNotificationToAllUsers(message: string) {
    console.log('🚀 Sending notification to all users:', message)

    try {
        // Get all subscriptions from your Java backend
        const authToken = await getAuthToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscriptions`, {
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            }
        })

        const subscriptions = await response.json()
        console.log('📱 Found subscriptions:', subscriptions.length)

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
                console.log('✅ Sent to:', subscription.endpoint.substring(0, 50) + '...')

            } catch (error) {
                console.error('❌ Failed to send to:', subscription.endpoint, error)
                results.push({ success: false, endpoint: subscription.endpoint, error: String(error) })
            }
        }

        console.log(`📊 Sent ${results.filter(r => r.success).length}/${results.length} notifications`)
        return { success: true, results }

    } catch (error) {
        console.error('❌ Error sending notifications:', error)
        return { success: false, error: String(error) }
    }
}

export async function sendDelayedTestNotification() {
    console.log('⏰ Test notification scheduled for 10 seconds...')

    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                console.log('🚀 Sending test notification now...')
                const result = await sendNotificationToAllUsers('🎉 Test notification sent to ALL users! Your PWA is working!')
                console.log('📊 Test result:', result)
                resolve(result)
            } catch (error) {
                console.error('❌ Test notification failed:', error)
                resolve({ success: false, error: String(error) })
            }
        }, 10000)
    })
}