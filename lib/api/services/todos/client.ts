import { TodoItem } from "@/types/todo";
import { clientFetch } from "../../client";
import { RecurrencePattern } from "@/types/todo";
import { defaultRecurrencePattern } from "@/components/forms/add-todo-form.tsx/utils/format-todo-form";

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
    async createTodoItem(
        todoListId: string,
        todoText: string,
        dueDate: string,
        priority: number,
        isRecurring: boolean = false,
        recurrencePattern: RecurrencePattern = defaultRecurrencePattern(),
        viewStartDate: string = '',
        viewEndDate: string = '',
    ) {
        const response = await clientFetch('/todo/create-list-item', {
            method: 'POST',
            body: JSON.stringify({ todoListId, todoText, dueDate, priority, isRecurring, recurrencePattern, viewStartDate, viewEndDate }),
        });
        if (!response.ok) throw new Error('Failed to create todo item');
        return response.json();
    },

    async getRecurringTodosInRange(startDate: string, endDate: string) {
        const response = await clientFetch(`/recurrence/todos-in-range/${startDate}/${endDate}`);
        if (!response.ok) throw new Error('Failed to fetch recurring todos in range');
        const data = await response.json();
        return data;

    },

    async updateTodo(todoItem: TodoItem) {
        console.log('Updating todo item with ID:', todoItem);

        const response = await clientFetch('/todo/update-list-item', {
            method: 'PUT',
            body: JSON.stringify({
                todoId: todoItem.id,
                todoText: todoItem.text,
                completed: todoItem.completed,
                priority: todoItem.priority,
                dueDate: todoItem.dueDate,
                todoListId: todoItem.todoListId,
                isRecurring: todoItem.isRecurring,
                patternId: todoItem.patternId ?? null,
                // updated virtuals lose the prefix, so we need to also check for patternId
                isVirtual: todoItem.id.startsWith("virtual_") || todoItem.patternId != null,
                recurrencePattern: todoItem.recurrencePattern,
                editScope: todoItem.editScope || 'single', // Default to 'single' if not provided
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
    },

    async getNextOccurrences() {
        const response = await clientFetch('/recurrence/next-occurrences');
        if (!response.ok) throw new Error('Failed to fetch next occurrences of recurring todos');
        return response.json();
    },

    async getTodosForDate(date: string) {
        const response = await clientFetch(`/recurrence/todos-for-date/${date}`);
        if (!response.ok) throw new Error('Failed to fetch todos for date');
        return response.json();
    }

}