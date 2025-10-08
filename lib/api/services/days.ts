import { clientFetch } from '../client';
import { serverFetch } from '../server';

export const clientDays = {
    async createDay(dayDate: string) {
        const response = await clientFetch('/days/find-or-create', {
            method: 'POST',
            body: JSON.stringify({ dayDate }),
        });
        if (!response.ok) throw new Error('Failed to create day');
        return response.json();
    },

    async getAllDays() {
        const response = await clientFetch('/days/get-all-days');
        if (!response.ok) throw new Error('Failed to get days');
        return response.json();
    },
};

export const serverDays = {
    async findOrCreateDay(dayDate: string) {
        const response = await serverFetch('/days/find-or-create', {
            method: 'POST',
            body: JSON.stringify({ dayDate }),
        });
        if (!response.ok) throw new Error('Failed to find or create day');
        return response.json();
    },
};