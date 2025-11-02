import { TodoItem } from "@/types/todo";
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
    },
    async deleteTodoList(todoListId: string) {
        const response = await clientFetch(`/todo-list/delete-list/${todoListId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete todo list');
        return true;
    },
    
    async setDefaultList(todoListId: string) {
        const response = await clientFetch(`/todo-list/set-default-list/${todoListId}`, {
            method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to set default todo list');
        return true;
    }
}

export const clientTodo = {
    async createTodoItem(todoListId: string, todoText: string) {
        const response = await clientFetch('/todo/create-list-item', {
            method: 'POST',
            body: JSON.stringify({ todoListId, todoText }),
        });
        if (!response.ok) throw new Error('Failed to create todo item');
        return response.json();
    },

    // async updateTodo(todoId: string, todoText: string, completed: boolean, priority: number) {
    async updateTodo(todoItem: TodoItem) {
        const response = await clientFetch('/todo/update-list-item', {
            method: 'PUT',
            body: JSON.stringify({ 
                todoId: todoItem.id, 
                todoText: todoItem.text, 
                completed: todoItem.completed, 
                priority: todoItem.priority,
                dueDate: todoItem.dueDate 
            }),
        });
        if (!response.ok) throw new Error('Failed to update todo item');
        return response.json();
    },

    async deleteTodo(todoId: string) {
        const response = await clientFetch(`/todo/delete-list-item/${todoId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete todo item');
        return true;
    }

}