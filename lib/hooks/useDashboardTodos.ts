import { useMemo } from 'react'
import { useTodoLists } from './useTodoLists'
import { TodoList } from '@/types/todo'

export function useDashboardTodos() {
    const { data: todoLists, isLoading, error } = useTodoLists()

    const dashboardData = useMemo(() => {
        if (!todoLists) return { upcomingTodos: [], priorityTodos: [] }

        // Flatten all todos from all lists
        const allTodos = (todoLists as TodoList[]).flatMap((list: TodoList) =>
            list.todos.map((todo) => ({
                ...todo,
                listName: list.listName,
                deleting: (todo as any).deleting || false  // Ensure deleting property is included
            }))
        )

        // Filter for active todos (not completed unless deleting for animation)
        const activeTodos = allTodos.filter(todo => !todo.completed || todo.deleting)

        // Top 8 by due date (earliest first)
        const upcomingTodos = activeTodos
            .filter((todo) => todo.dueDate) // Only todos with due dates
            .sort((a, b) => {
                const dateA = new Date(String(a.dueDate!)).getTime()
                const dateB = new Date(String(b.dueDate!)).getTime()
                return dateA - dateB
            })
            .slice(0, 8)

        // Top 8 by priority (only priority > 1: Low=2, Medium=3, High=4)
        const priorityTodos = activeTodos
            .filter((todo) => todo.priority > 1) // Only show todos with priority higher than 1
            .sort((a, b) => {
                // Sort by priority (4=High, 3=Medium, 2=Low)
                if (a.priority !== b.priority) {
                    return b.priority - a.priority
                }
                // If same priority, sort by due date
                if (a.dueDate && b.dueDate) {
                    return new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime()
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