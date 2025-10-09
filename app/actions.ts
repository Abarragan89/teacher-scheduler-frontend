'use server'
 
import webpush from 'web-push'
 
webpush.setVapidDetails(
  'mailto:anthony.bar.89@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
 
let subscription: PushSubscription | null = null
 
export async function subscribeUser(sub: PushSubscription) {
  subscription = sub
  console.log('📬 New subscription added:', sub)
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true }
}
 
export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}
 
export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }
 
  try {
    await webpush.sendNotification(
      subscription as any,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/images/logo.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export async function sendDelayedTestNotification() {
    console.log('⏰ Test notification scheduled for 10 seconds...')
    console.log('📱 Current subscription status:', subscription ? 'Available' : 'Missing - Need to subscribe first!')
    
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                console.log('🚀 Sending test notification now...')
                const result = await sendNotification('🎉 Test notification sent successfully! Your PWA is working!')
                console.log('📊 Test result:', result)
                resolve(result)
            } catch (error) {
                console.error('❌ Test notification failed:', error)
                resolve({ success: false, error: String(error) })
            }
        }, 10000)
    })
}