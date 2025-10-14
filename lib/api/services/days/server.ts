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
};