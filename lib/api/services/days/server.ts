import { serverFetch } from '../../server';

export const serverDays = {
    async findOrCreateDay(dayDate: string) {
        const response = await serverFetch('/days/find-or-create', {
            method: 'POST',
            body: JSON.stringify({ dayDate }),
        });
        if (!response.ok) throw new Error('Failed to find or create day');
        return response.json();
    },

    async findSingleDay(dayId: string) {
        console.log('Finding single day with ID:', dayId);
        const response = await serverFetch(`/days/single-day/${dayId}`, {
            method: 'GET',
        });
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Failed to find day');
        return response.json();
    }
};