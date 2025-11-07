import { useMemo } from 'react'
import { useTodoLists } from './useTodoLists'

interface TodoItem {
    id: string
    text: string
    completed: boolean
    dueDate?: string
    priority: number
    listName?: string
}

interface TodoList {
    id: string
    listName: string
    todos: TodoItem[]
}

export function useDashboardTodos() {
    const { data: todoLists, isLoading, error } = useTodoLists()

    const dashboardData = useMemo(() => {
        if (!todoLists) return { upcomingTodos: [], priorityTodos: [] }

        // Flatten all todos from all lists
        const allTodos: TodoItem[] = (todoLists as TodoList[]).flatMap((list: TodoList) =>
            list.todos.map((todo: TodoItem) => ({ ...todo, listName: list.listName }))
        )

        // Filter out completed todos
        const incompleteTodos = allTodos.filter(todo => !todo.completed)

        // Top 8 by due date (earliest first)
        const upcomingTodos = incompleteTodos
            .filter(todo => todo.dueDate) // Only todos with due dates
            .sort((a, b) => {
                const dateA = new Date(a.dueDate!).getTime()
                const dateB = new Date(b.dueDate!).getTime()
                return dateA - dateB
            })
            .slice(0, 8)

        // Top 8 by priority (highest first)
        const priorityTodos = incompleteTodos
            .sort((a, b) => {
                // Sort by priority (4=High, 3=Medium, 2=Low, 1=None)
                if (a.priority !== b.priority) {
                    return b.priority - a.priority
                }
                // If same priority, sort by due date
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                }
                return 0
            })
            .slice(0, 8)

        return { upcomingTodos, priorityTodos }
    }, [todoLists])

    return {
        ...dashboardData,
        isLoading,
        error,
        refetch: () => { } // If you need to manually refetch
    }
}