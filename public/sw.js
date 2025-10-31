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
                badge: data.badge || '/android-chrome-192x192.png',
                vibrate: [100, 50, 100],
                requireInteraction: true, // Keep notification visible
                tag: data.data?.todoId || 'todo-notification', // Use todoId as tag
                actions: data.actions || [], // Include action buttons from backend
                data: data.data || {}, // Pass through todo data for action handling
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
    console.log('🔔 Notification clicked:', event.action, event.notification.data);

    event.notification.close(); // Close the notification

    if (event.action === 'mark-complete') {
        console.log('✅ Mark complete action clicked');

        event.waitUntil(
            fetch(`/api/todos/${event.notification.data.todoId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies for auth
            }).then(response => {
                if (response.ok) {
                    console.log('✅ Todo marked complete via notification');

                    // Show a success notification
                    return self.registration.showNotification('Todo Complete!', {
                        body: 'Task marked as complete',
                        icon: '/android-chrome-192x192.png',
                        tag: 'todo-complete',
                        requireInteraction: false
                    });
                } else {
                    console.error('❌ Failed to mark todo complete:', response.status);
                    throw new Error('Failed to mark complete');
                }
            }).catch(err => {
                console.error('❌ Network error marking complete:', err);

                // Show error notification
                return self.registration.showNotification('Error', {
                    body: 'Failed to mark todo complete',
                    icon: '/android-chrome-192x192.png',
                    tag: 'todo-error',
                    requireInteraction: false
                });
            })
        );

    } else if (event.action === 'snooze') {
        console.log('⏰ Snooze action clicked');

        // Snooze for 1 hour
        const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        event.waitUntil(
            fetch(`/api/todos/${event.notification.data.todoId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    dueDate: oneHourLater
                })
            }).then(response => {
                if (response.ok) {
                    console.log('✅ Todo snoozed for 1 hour');

                    // Show success notification
                    return self.registration.showNotification('Todo Snoozed', {
                        body: 'Reminder set for 1 hour from now',
                        icon: '/android-chrome-192x192.png',
                        tag: 'todo-snooze',
                        requireInteraction: false
                    });
                } else {
                    console.error('❌ Failed to snooze todo:', response.status);
                    throw new Error('Failed to snooze');
                }
            }).catch(err => {
                console.error('❌ Network error snoozing:', err);

                // Show error notification
                return self.registration.showNotification('Error', {
                    body: 'Failed to snooze todo',
                    icon: '/android-chrome-192x192.png',
                    tag: 'todo-error',
                    requireInteraction: false
                });
            })
        );

    } else {
        // Default action (clicking notification body) - open the app
        console.log('📱 Opening app from notification');

        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes('/dashboard') && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Otherwise, open new window
                if (clients.openWindow) {
                    return clients.openWindow('/dashboard');
                }
            })
        );
    }
})

// Add error handling
self.addEventListener('error', function (error) {
    console.error('🚨 Service Worker error:', error)
})