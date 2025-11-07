import { clientFetch } from '../../client';

export const clientTasks = {
    async createTask(scheduleId: string, position: number, completed: boolean) {
        const response = await clientFetch('/task/create', {
            method: 'POST',
            body: JSON.stringify({
                scheduleId,
                position,
                completed
            }),
        });
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    },

    async updateTask(id: string, title: string, position: number, completed: boolean) {
        const response = await clientFetch('/task/update-task', {
            method: 'PUT',
            body: JSON.stringify({
                id,
                title,
                position,
                completed
            }),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    },

    async toggleTaskComplete(id: string, completed: boolean) {
        const response = await clientFetch('/task/toggle-complete', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-Public-Token": process.env.NEXT_PUBLIC_PUBLIC_TOKEN!,
            },
            body: JSON.stringify({
                id,
                completed
            }),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    },

    async deleteTask(taskId: string) {
        const response = await clientFetch(`/task/delete/${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
        return response;
    },

    async batchUpdateTaskPositions(tasks: any[]) {
        try {
            // Try batch endpoint first
            const response = await clientFetch('/task/batch-update-positions', {
                method: 'PUT',
                body: JSON.stringify({ tasks }),
            });

            if (response.ok) {
                return response.json();
            }

            // Fallback to individual updates if batch fails
            console.warn('Batch update failed, falling back to individual requests');
            await Promise.all(
                tasks.map(task =>
                    clientFetch('/task/update-task', {
                        method: 'PUT',
                        body: JSON.stringify(task),
                    })
                )
            );
        } catch (error) {
            console.error('Failed to update task positions:', error);
            throw error;
        }
    },

    async moveTaskToLaterDate(taskId: string, newDate: string) {
        try {
            const reopnse = await clientFetch('/task/move-to-later-date', {
                method: 'POST',
                body: JSON.stringify({ taskId, newDate }),
            });
            if (!reopnse.ok) throw new Error('Failed to move task to later date');
            return true;

        } catch (error) {
            throw error;
        }
    },
    async updateTaskTime(taskId: string, startTime:string, endTime:string) {
        try {
            const reopnse = await clientFetch('/task/update-task-times', {
                method: 'PUT',
                body: JSON.stringify({ taskId, startTime, endTime }),
            });
            if (!reopnse.ok) throw new Error('Failed to move task to later date');
            return true;

        } catch (error) {
            throw error;
        }
    }
};

export const clientOutlineItems = {
    async createOutlineItem(taskId: string, text: string, position: number, indentLevel: number, completed: boolean) {
        const response = await clientFetch('/task-outline-item/create', {
            method: 'POST',
            body: JSON.stringify({
                taskId,
                text,
                position,
                indentLevel,
                completed
            }),
        });
        if (!response.ok) throw new Error('Failed to create outline item');
        return response.json();
    },

    async updateOutlineItem(id: string, text: string, position: number, indentLevel: number, completed: boolean) {
        const response = await clientFetch('/task-outline-item/update-item', {
            method: 'PUT',
            body: JSON.stringify({
                id,
                text,
                position,
                indentLevel,
                completed
            }),
        });
        if (!response.ok) throw new Error('Failed to update outline item');
        return response.json();
    },

    async updateOutlineItemToggleComplete(id: string, completed: boolean) {
        const response = await clientFetch('/task-outline-item/toggle-complete', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "X-Public-Token": process.env.NEXT_PUBLIC_PUBLIC_TOKEN!,
            },
            body: JSON.stringify({
                id,
                completed
            }),
        });
        if (!response.ok) throw new Error('Failed to update outline item');
        return response.json();
    },

    async deleteOutlineItem(itemId: string) {
        const response = await clientFetch(`/task-outline-item/delete/${itemId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete outline item');
        return response;
    },

    async batchUpdateOutlineItemPositions(items: any[]) {
        try {

            // Try batch endpoint first
            const response = await clientFetch('/task-outline-item/batch-update-positions', {
                method: 'PUT',
                body: JSON.stringify({ items }),
            });

            if (response.ok) {
                return response.json();
            }

            // Fallback to individual updates if batch fails
            console.warn('Batch outline update failed, falling back to individual requests');
            await Promise.all(
                items.map(item =>
                    clientFetch('/task-outline-item/update-item', {
                        method: 'PUT',
                        body: JSON.stringify(item),
                    })
                )
            );
        } catch (error) {
            console.error('Failed to update outline item positions:', error);
            throw error;
        }
    },
};