'use client'
import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotificationToAllUsers } from '@/app/actions'
import { Button } from './ui/button'
import { toast } from 'sonner'

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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [isStandalone, setIsStandalone] = useState(false)


    const checkStandalone = () => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://')
        setIsStandalone(standalone)
    }

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
            checkStandalone();
        }
    }, [])



    // ✅ Expose renewal function globally for other components to trigger
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).renewPushSubscription = renewSubscriptionSeamlessly
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete (window as any).renewPushSubscription
            }
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

    // ✅ Seamless subscription renewal function
    async function renewSubscriptionSeamlessly() {
        try {
            const registration = await navigator.serviceWorker.ready

            // Create new subscription (this automatically replaces the old one)
            const newSub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })

            // Serialize and save new subscription
            const serializedSubscription = {
                endpoint: newSub.endpoint,
                expirationTime: newSub.expirationTime,
                keys: {
                    p256dh: arrayBufferToBase64(newSub.getKey('p256dh')!),
                    auth: arrayBufferToBase64(newSub.getKey('auth')!)
                }
            }

            const result = await subscribeUser(serializedSubscription)

            if (result.success) {
                setSubscription(newSub)
                return true
            } else {
                console.error('❌ Failed to save renewed subscription:', result.error)
                return false
            }

        } catch (error) {
            console.error('❌ Seamless renewal failed:', error)
            return false
        }
    }



    async function subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })

            // ✅ Serialize the subscription object before sending to server action
            const serializedSubscription = {
                endpoint: sub.endpoint,
                expirationTime: sub.expirationTime,
                keys: {
                    p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
                    auth: arrayBufferToBase64(sub.getKey('auth')!)
                }
            }

            setSubscription(sub)

            // Save to database via backend - send serialized object
            await subscribeUser(serializedSubscription)
            toast.success('✅ Subscribed to push notifications!')

        } catch (error) {
            console.error('❌ Subscription failed:', error)
        }
    }

    async function unsubscribeFromPush() {
        if (subscription) {

            // Unsubscribe from browser
            await subscription.unsubscribe()

            // Remove from database
            const result = await unsubscribeUser(subscription.endpoint)
            if (result.success) {
                setSubscription(null)
            } else {
                console.error('❌ Failed to remove subscription from database:', result.error)
            }
        }
    }

    // async function sendTestNotification() {
    //     if (message.trim()) {
    //         const result = await sendNotificationToAllUsers(message)
    //         if (result.success) {
    //             setMessage('')

    //             // ✅ If subscriptions were cleaned up, trigger renewal
    //             if (result.needsRenewal && subscription) {
    //                 await renewSubscriptionSeamlessly()
    //             }
    //         } else {
    //             console.error('❌ Failed to send test notification:', result.error)
    //         }
    //     }
    // }

    if (!isSupported) {
        return null // Hide if not supported
    }

    return (
        <>
            {isStandalone && !subscription && (
                <Button variant='outline' onClick={subscription ? unsubscribeFromPush : subscribeToPush}>
                    {/* {subscription ? 'Unsubscribe' : 'Subscribe'} */}
                    Get Notifications
                </Button>
            )}
        </>
    )
}
