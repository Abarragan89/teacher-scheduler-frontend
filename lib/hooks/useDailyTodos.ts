import { TodoItem } from '@/types/todo'
import { useQuery } from "@tanstack/react-query"
import { clientTodo } from "../api/services/todos/client"

export interface DailyTodoItem extends TodoItem {
    listName: string
    listId: string
}

export function useDailyTodos(dateString: string) {
    const { data: todos = [], isLoading, error } = useQuery({
        queryKey: ['dailyTodos', dateString],
        queryFn: () => clientTodo.getTodosForDate(dateString),
        staleTime: 1000 * 60 * 5,
    })

    console.log('Daily Todos for Date:', todos) // Debug log to check the fetched daily todos for the calendar

    return {
        todos,
        isLoading,
        error,
        todosCount: todos.length
    }
}