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

    async moveScheduleToDate(scheduleId: string, dayDate: string) {
        const response = await clientFetch('/days/move-schedule-to-date', {
            method: 'POST',
            body: JSON.stringify({ scheduleId, dayDate }),
        });
        if (!response.ok) throw new Error('Failed to move schedule to date');
        return response.json();
    },

    async getHoliaysForMonth(year: number, month: number) {
        const response = await clientFetch(`/api/holidays/${year}/${month}`)

        if (!response.ok) throw new Error('Failed to move schedule to date');
        return response.json();
    },

    async updateDayNotes(dayId: string, notes: object[]) {
        const response = await clientFetch('/days/update-notes', {
            method: 'PUT',
            body: JSON.stringify({ dayId, notes }),
        });
        if (!response.ok) throw new Error('Failed to update notes');
        return response.json();
    }
};
