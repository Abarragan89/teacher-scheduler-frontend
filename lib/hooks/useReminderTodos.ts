import { useMemo } from 'react'
import { useTodoLists } from './useTodoLists'
import { TodoList } from '@/types/todo'

// THIS IS THE REMINDERS HOOK THAT SHOWS TODAY, WEEK, AND MONTH TODOS
export function useReminderTodos() {
    const { data: todoLists, isLoading, error } = useTodoLists()

    const reminderData = useMemo(() => {
        if (!todoLists) return { todayTodos: [], weekTodos: [], monthTodos: [] }

        // Flatten all todos from all lists
        const allTodos = (todoLists as TodoList[]).flatMap((list: TodoList) =>
            list.todos.map((todo) => ({
                ...todo,
                listName: list.listName,
                todoListId: list.id, // Add the list ID for TodoListItem
                deleting: (todo as any).deleting || false
            }))
        )

        // Filter only todos with due dates
        const todosWithDueDates = allTodos.filter((todo) => todo.dueDate)

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

        // Today's todos + overdue todos
        const todayTodos = todosWithDueDates
            .filter((todo) => {
                const dueDate = new Date(String(todo.dueDate!))
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

                // Include today's todos and overdue todos
                return dueDateOnly <= today
            })
            .sort((a, b) => {
                const dateA = new Date(String(a.dueDate!))
                const dateB = new Date(String(b.dueDate!))
                return dateA.getTime() - dateB.getTime()
            })

        // Next 7 days (excluding today and overdue)
        const weekTodos = todosWithDueDates
            .filter((todo) => {
                const dueDate = new Date(String(todo.dueDate!))
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

                // Include tomorrow through next 7 days
                return dueDateOnly >= tomorrow && dueDateOnly < nextWeek
            })
            .sort((a, b) => {
                const dateA = new Date(String(a.dueDate!))
                const dateB = new Date(String(b.dueDate!))
                return dateA.getTime() - dateB.getTime()
            })

        // Next 30 days (including everything - overdue, today, week, etc.)
        const monthTodos = todosWithDueDates
            .filter((todo) => {
                const dueDate = new Date(String(todo.dueDate!))
                const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

                // Include all todos from overdue through next 30 days
                return dueDateOnly < nextMonth
            })
            .sort((a, b) => {
                const dateA = new Date(String(a.dueDate!))
                const dateB = new Date(String(b.dueDate!))
                return dateA.getTime() - dateB.getTime()
            })

        return { todayTodos, weekTodos, monthTodos }
    }, [todoLists])

    return {
        ...reminderData,
        isLoading,
        error
    }
}