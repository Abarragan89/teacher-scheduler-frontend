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
        const response = await serverFetch(`/days/single-day/${dayId}`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Failed to find day');
        return response.json();
    },

    async findSingleDayPublic(dayId: string) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/days/single-day-public/${dayId}`, {
            method: 'GET',
        });
        if (!response.ok) throw new Error('Failed to find day');
        return response.json();
    }
};