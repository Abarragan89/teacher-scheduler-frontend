import { clientFetch } from "../../client";

export const clientTodoLists = {

    async getTodoLists() {
        const response = await clientFetch('/todo-list/get-all-lists')
        if (!response.ok) throw new Error('Failed to get todo lists');
        return response.json();
    },

    async createTodoList(listName: string) {
        const response = await clientFetch('/todo-list/create-list', {
            method: 'POST',
            body: JSON.stringify({ listName }),
        })
        if (!response.ok) throw new Error('Failed to create todo list');
        return response.json();
    },

    async updateTodoListTitle(todoListId: string, listName: string) {
        const response = await clientFetch(`/todo-list/update-list-title`, {
            method: 'PUT',
            body: JSON.stringify({ listName, todoListId }),
        });
        if (!response.ok) throw new Error('Failed to update todo list title');
        return response.json();
    }
}