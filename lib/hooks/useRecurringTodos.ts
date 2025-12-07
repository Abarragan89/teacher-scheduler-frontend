import { TodoItem } from "@/types/todo";
import { useState, useEffect } from "react"
import { clientTodo } from "../api/services/todos/client";

interface UseRecurringTodosParams {
    startDate: string;
    endDate: string;
}

export function useRecurringTodos({
    startDate,
    endDate
}: UseRecurringTodosParams) {

    const [recurringTodos, setRecurringTodos] = useState<Array<TodoItem>>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecurringTodos = async () => {
            try {
                setIsLoading(true)
                const requestForTodos = await clientTodo.getRecurringTodosInRange(startDate, endDate)
                setRecurringTodos(requestForTodos)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch recurring todos')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecurringTodos()
    }, [startDate, endDate])

    return {
        recurringTodos,
        getRecurringTodoForDate: (date: string) => recurringTodos.filter(todo => todo.dueDate?.toString().split('T')[0]  === date),
        isLoading,
        error
    }
}