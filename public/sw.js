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
            actions: data.actions || [],
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

// ✅ shared navigation helper
function navigateToUrl(urlToOpen) {
    return clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function (clientList) {
            for (let client of clientList) {
                if ('focus' in client) {
                    return client.navigate(urlToOpen).then(() => client.focus()) // ✅ any open window
                }
            }
            return clients.openWindow(urlToOpen)
        })
}

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    const notificationData = event.notification.data || {}
    const urlToOpen = notificationData.url || '/dashboard'
    const todoId = notificationData.todoId

    if (event.action === 'mark-complete') {
        event.waitUntil(
            fetch(`/api/todos/${todoId}/complete`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ completed: true })
            }).then(response => {
                if (response.ok) {
                    console.log('✅ Todo marked complete from notification')
                    return self.registration.showNotification('Todo Completed ✅', {
                        body: 'Todo marked as complete',
                        icon: '/android-chrome-192x192.png',
                        tag: 'todo-complete',
                        requireInteraction: false
                    })
                } else {
                    console.error('❌ Failed to mark complete:', response.status)
                }
            }).catch(err => console.error('❌ Network error marking complete:', err))
        )

    } else if (event.action === 'snooze') {
        console.log('⏰ Snooze action clicked')
        const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString()

        event.waitUntil(
            fetch(`/api/todos/${todoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ dueDate: oneHourLater })
            }).then(response => {
                if (response.ok) {
                    console.log('✅ Todo snoozed for 1 hour')
                    return self.registration.showNotification('Todo Snoozed ⏰', {
                        body: 'Reminder set for 1 hour from now',
                        icon: '/android-chrome-192x192.png',
                        tag: 'todo-snooze',
                        requireInteraction: false
                    })
                } else {
                    console.error('❌ Failed to snooze:', response.status)
                    throw new Error('Failed to snooze')
                }
            }).catch(err => {
                console.error('❌ Network error snoozing:', err)
                return self.registration.showNotification('Error', {
                    body: 'Failed to snooze todo',
                    icon: '/android-chrome-192x192.png',
                    tag: 'todo-error',
                    requireInteraction: false
                })
            })
        )

    } else {
        // Default — navigate to todo's date
        console.log('📱 Opening app from notification')
        event.waitUntil(navigateToUrl(urlToOpen))
    }
})

self.addEventListener('error', function (error) {
    console.error('🚨 Service Worker error:', error)
})