self.addEventListener('install', function () {
    self.skipWaiting()
})

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function (event) {
    if (!event.data) {
        console.error('❌ Push event has no data!')
        event.waitUntil(
            self.registration.showNotification('Notification', {
                body: 'You have a new reminder',
                icon: '/android-chrome-192x192.png'
            })
        )
        return
    }

    try {
        const data = JSON.parse(event.data.text())

        const options = {
            body: data.body,
            icon: data.icon || '/android-chrome-192x192.png',
            badge: data.badge || '/android-chrome-192x192.png',
            vibrate: [100, 50, 100],
            requireInteraction: true,
            tag: data.data?.todoId || 'todo-notification',
            data: data.data || {},
        }

        event.waitUntil(
            self.registration.showNotification(data.title, options)
                .catch(error => console.error('❌ Failed to display notification:', error))
        )

    } catch (error) {
        console.error('❌ Error processing push data:', error)
    }
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    const urlToOpen = event.notification.data?.url || '/dashboard'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                for (let client of clientList) {
                    if ('focus' in client) {
                        return client.navigate(urlToOpen).then(() => client.focus())
                    }
                }
                return clients.openWindow(urlToOpen)
            })
    )
})

self.addEventListener('error', function (error) {
    console.error('🚨 Service Worker error:', error)
})