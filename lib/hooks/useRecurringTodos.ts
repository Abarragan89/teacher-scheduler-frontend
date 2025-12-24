import { TodoItem, TodoList } from "@/types/todo";
import { useState, useEffect } from "react"
import { clientTodo } from "../api/services/todos/client";
import { useQueryClient } from "@tanstack/react-query";

interface UseRecurringTodosParams {
    startDate: string;
    endDate: string;
}

// HOOK TO FETCH RECURRING TODOS IN A DATE RANGE
export function useRecurringTodos({
    startDate,
    endDate
}: UseRecurringTodosParams) {

    const queryClient = useQueryClient()
    const [recurringTodos, setRecurringTodos] = useState<Array<TodoItem>>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecurringTodos = async () => {
            try {
                setIsLoading(true)
                const requestForTodos = await clientTodo.getRecurringTodosInRange(startDate, endDate)
                setRecurringTodos(requestForTodos)

                // Update the todos cache with the new recurring todos
                if (requestForTodos.length > 0) {
                    queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                        if (!oldData) return oldData

                        return oldData.map(list => {
                            // Find todos that belong to this list
                            const newTodosForThisList = requestForTodos.filter(
                                (todo: TodoItem) => todo.recurrencePattern.todoListId === list.id
                            )

                            if (newTodosForThisList.length === 0) return list

                            // Merge new todos with existing, avoiding duplicates
                            const existingTodoIds = new Set(list.todos.map(todo => todo.id))
                            const uniqueNewTodos = newTodosForThisList.filter(
                                (todo: TodoItem) => !existingTodoIds.has(todo.id)
                            )

                            if (uniqueNewTodos.length === 0) return list

                            return {
                                ...list,
                                todos: [...list.todos, ...uniqueNewTodos]
                                    .sort((a, b) => b.priority - a.priority)
                            }
                        })
                    })
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch recurring todos')
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecurringTodos()
    }, [startDate, endDate, queryClient])

    return {
        recurringTodos,
        getRecurringTodoForDate: (date: string) => recurringTodos.filter(todo => todo.dueDate?.toString().split('T')[0] === date),
        isLoading,
        error
    }
}