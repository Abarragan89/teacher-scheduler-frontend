import { clientFetch } from '../../client';

// Client-side auth functions
export const clientAuth = {
    async getSession() {
        let response = await clientFetch('/auth/session');

        // If session fails with 401, try to refresh the token
        if (response.status === 401) {
            console.error('Session expired, attempting token refresh...');

            try {
                const refreshResponse = await clientFetch('/auth/refresh', { method: 'POST' });

                if (refreshResponse.ok) {
                    // Retry session check - browser will use new HttpOnly cookies automatically
                    response = await clientFetch('/auth/session');
                } else {
                    console.error('Token refresh failed with status:', refreshResponse.status);
                    throw new Error('Failed to get session');
                }
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
                throw new Error('Failed to get session');
            }
        }

        if (!response.ok) {
            throw new Error('Failed to get session');
        }

        return response.json();
    },

    async refresh() {
        const response = await clientFetch('/auth/refresh', {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Token refresh failed');
        return response.json();
    },
};