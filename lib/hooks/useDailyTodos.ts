import { useMemo } from 'react'
import { useTodoLists } from './useTodoLists'
import { TodoItem, TodoList } from '@/types/todo'

export interface DailyTodoItem extends TodoItem {
    listName: string
    listId: string
}

// HOOK TO FETCH TODOS FOR A SPECIFIC DAY
export function useDailyTodos(dateString: string) {
    const { data: todoLists, isLoading, error } = useTodoLists()

    const dailyTodos = useMemo(() => {
        if (!todoLists) return []

        // Convert dateString to date for comparison
        const targetDate = new Date(dateString)
        const targetDateISO = targetDate.toISOString().split('T')[0] // YYYY-MM-DD

        // Flatten all todos and filter by the target date
        const todosForDate = (todoLists as TodoList[]).flatMap((list: TodoList) =>
            list.todos
                .filter(todo => {
                    if (!todo.dueDate) return false

                    const todoDateISO = new Date(String(todo.dueDate)).toISOString().split('T')[0]
                    return todoDateISO === targetDateISO
                })
                .map(todo => ({
                    ...todo,
                    listName: list.listName,
                    listId: list.id,
                    deleting: (todo as any).deleting || false
                }))
        )

        // Sort by priority (high to low), then by due time
        return todosForDate.sort((a, b) => {
            // Sort by priority first (4=High, 3=Medium, 2=Low, 1=None)
            if (a.priority !== b.priority) {
                return b.priority - a.priority
            }

            // If same priority, sort by due time
            if (a.dueDate && b.dueDate) {
                const timeA = new Date(String(a.dueDate)).getTime()
                const timeB = new Date(String(b.dueDate)).getTime()
                return timeA - timeB
            }

            return 0
        })
    }, [todoLists, dateString])

    return {
        todos: dailyTodos,
        isLoading,
        error,
        todosCount: dailyTodos.length
    }
}