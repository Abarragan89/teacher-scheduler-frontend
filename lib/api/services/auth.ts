import { clientFetch } from '../client';
import { serverFetch } from '../server';

// Helper function to extract CSRF token from cookie header
function getCsrfFromCookies(cookieHeader: string): string {
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    return match?.[1] ?? '';
}

// Client-side auth functions
export const clientAuth = {
    async getSession() {
        const response = await clientFetch('/auth/session');
        if (!response.ok) throw new Error('Failed to get session');
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

// Server-side auth functions
export const serverAuth = {
    async getSession() {
        const response = await serverFetch('/auth/session');
        if (!response.ok) throw new Error('Failed to get session');
        return response.json();
    },
};