import { serverFetch } from '../../server';

export const serverDays = {
    async findOrCreateDay(dayDate: string) {
        console.log('dayDate being sent to server:', dayDate);
        const response = await serverFetch('/days/find-or-create', {
            method: 'POST',
            body: JSON.stringify({ dayDate }),
        });
        console.log('serverDays.findOrCreateDay response status:', response.status);
        console.log('reponse json:', await response.clone().json().catch(() => ({})));
        if (!response.ok) throw new Error('Failed to find or create day');
        return response.json();
    },
};