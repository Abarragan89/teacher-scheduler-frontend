import { serverFetch } from "../../server";

export const serverTodoLists = {
    async getTodoLists() {
        const response = await serverFetch('/todo-list/get-all-lists')
        console.log('resonse', response)
        if (!response.ok) throw new Error('Failed to get subscriptions');
        return response.json();
    }
} 