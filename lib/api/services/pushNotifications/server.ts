import { serverFetch } from '../../server';

export const serverPushNotifications = {
    async subscribe(subscriptionData: {
        endpoint: string;
        p256dhKey: string;
        authKey: string;
    }) {
        const response = await serverFetch('/api/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscriptionData),
        });
        if (!response.ok) throw new Error('Failed to subscribe to notifications');
        return response.json();
    },

    async unsubscribe(endpoint: string) {
        console.log('🛑 Unsubscribing from notifications for endpoint:', endpoint)
        const response = await serverFetch('/api/notifications/unsubscribe', {
            method: 'DELETE',
            body: JSON.stringify({ endpoint }),
        });
        console.log(response)
        console.log(await response.json())
        if (!response.ok) throw new Error('Failed to unsubscribe from notifications');
        return response.json();
    },

    async getAllSubscriptions() {
        const response = await serverFetch('/api/notifications/subscriptions', {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Failed to get subscriptions');
        return response.json();
    },
};