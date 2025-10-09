self.addEventListener('install', function (event) {
    self.skipWaiting() // Force immediate activation
})

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim()) // Take control immediately
})

self.addEventListener('push', function (event) {

    if (event.data) {
        try {
            const dataText = event.data.text()
            const data = JSON.parse(dataText)

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

            const showNotificationPromise = self.registration.showNotification(data.title, options)

            showNotificationPromise.then(() => {
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
    event.notification.close()

    event.waitUntil(
        self.clients.openWindow(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
    )
})

// Add error handling
self.addEventListener('error', function (error) {
    console.error('🚨 Service Worker error:', error)
})