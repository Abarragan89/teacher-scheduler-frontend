console.log('🔧 Service Worker loaded and ready')

self.addEventListener('install', function (event) {
    console.log('⚡ Service Worker installing')
    self.skipWaiting() // Force immediate activation
})

self.addEventListener('activate', function (event) {
    console.log('✅ Service Worker activated')
    event.waitUntil(self.clients.claim()) // Take control immediately
})

self.addEventListener('push', function (event) {
    console.log('📨 PUSH EVENT RECEIVED!', event)
    console.log('📨 Event type:', typeof event)
    console.log('📨 Event data exists:', !!event.data)

    if (event.data) {
        try {
            const dataText = event.data.text()
            console.log('📋 Raw push data:', dataText)

            const data = JSON.parse(dataText)
            console.log('📦 Parsed notification data:', data)

            const options = {
                body: data.body,
                icon: data.icon || '/android-chrome-192x192.png',
                badge: '/android-chrome-192x192.png',
                vibrate: [100, 50, 100],
                requireInteraction: true, // Keep notification visible
                tag: 'test-notification', // Prevent duplicate notifications
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: '2',
                },
            }

            console.log('🔔 About to show notification with title:', data.title)
            console.log('🔔 Notification options:', options)

            const showNotificationPromise = self.registration.showNotification(data.title, options)

            showNotificationPromise.then(() => {
                console.log('✅ Notification displayed successfully!')
            }).catch(error => {
                console.error('❌ Failed to display notification:', error)
            })

            event.waitUntil(showNotificationPromise)

        } catch (error) {
            console.error('❌ Error processing push data:', error)
        }
    } else {
        console.error('❌ Push event has no data!')

        // Show a fallback notification
        event.waitUntil(
            self.registration.showNotification('Test Notification', {
                body: 'Fallback notification - no data received',
                icon: '/android-chrome-192x192.png'
            })
        )
    }
})

self.addEventListener('notificationclick', function (event) {
    console.log('👆 Notification clicked!')
    event.notification.close()

    event.waitUntil(
        self.clients.openWindow('https://localhost:3000/dashboard')
    )
})

// Add error handling
self.addEventListener('error', function (error) {
    console.error('🚨 Service Worker error:', error)
})

console.log('🎯 Service Worker setup complete')