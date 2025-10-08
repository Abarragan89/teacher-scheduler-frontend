import { serverFetch } from '../../server';

// Server-side auth functions
export const serverAuth = {
    async getSession() {
        const response = await serverFetch('/auth/session');
        if (!response.ok) throw new Error('Failed to get session');
        return response.json();
    },
};