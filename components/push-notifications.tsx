'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotificationToAllUsers } from '@/app/actions'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [message, setMessage] = useState('')

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush() {
        try {
            console.log('🚀 Starting subscription process...')

            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })

            setSubscription(sub)
            console.log('📱 Browser subscription created:', sub)

            // Save to database via backend
            const result = await subscribeUser(sub)

            if (result.success) {
                console.log('✅ Successfully subscribed and saved to database')
            } else {
                console.error('❌ Failed to save subscription:', result.error)
            }

        } catch (error) {
            console.error('❌ Subscription failed:', error)
        }
    }

    async function unsubscribeFromPush() {
        if (subscription) {
            console.log('🚫 Unsubscribing from notifications...')

            // Unsubscribe from browser
            await subscription.unsubscribe()

            // Remove from database
            const result = await unsubscribeUser(subscription.endpoint)

            if (result.success) {
                console.log('✅ Successfully unsubscribed and removed from database')
                setSubscription(null)
            } else {
                console.error('❌ Failed to remove subscription from database:', result.error)
            }
        }
    }

    async function sendTestNotification() {
        if (message.trim()) {
            console.log('📤 Sending test notification to all users...')
            const result = await sendNotificationToAllUsers(message)

            if (result.success) {
                console.log('✅ Test notification sent successfully')
                setMessage('')
            } else {
                console.error('❌ Failed to send test notification:', result.error)
            }
        }
    }

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>
    }

    return (
        <div>
            <h3>Push Notifications</h3>
            {subscription ? (
                <>
                    <p>You are subscribed to push notifications.</p>
                    <button onClick={unsubscribeFromPush}>Unsubscribe</button>
                    <input
                        type="text"
                        placeholder="Enter notification message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendTestNotification}>Send Test</button>
                </>
            ) : (
                <>
                    <p>You are not subscribed to push notifications.</p>
                    <button onClick={subscribeToPush}>Subscribe</button>
                </>
            )}
        </div>
    )
}
