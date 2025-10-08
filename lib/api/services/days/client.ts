import { clientFetch } from '../../client';

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
