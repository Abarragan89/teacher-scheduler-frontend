import { useMemo } from 'react'
import { useTodoLists } from './useTodoLists'
import { TodoItem, TodoList } from '@/types/todo'

export interface CalendarReminder extends TodoItem {
    listName: string
}

export interface DayReminders {
    date: string // YYYY-MM-DD format
    reminders: CalendarReminder[]
    displayReminders: CalendarReminder[] // First 3 reminders
    overflowCount: number // How many more beyond the first 3
}

export function useCalendarReminders(year: number, month: number) {
    const { data: todoLists, isLoading, error } = useTodoLists()

    const calendarData = useMemo(() => {
        if (!todoLists) return {}

        // Flatten all todos with due dates in the specified month
        const allTodosWithDates = (todoLists as TodoList[]).flatMap(list =>
            list.todos
                .filter(todo => {
                    if (!todo.dueDate) return false

                    const todoDate = new Date(String(todo.dueDate))
                    return todoDate.getFullYear() === year &&
                        todoDate.getMonth() === month - 1 // month is 0-indexed
                })
                .map(todo => ({
                    ...todo,
                    listName: list.listName,
                    deleting: (todo as any).deleting || false
                }))
        )

        // Filter out completed todos (unless deleting for animation)
        const activeTodos = allTodosWithDates.filter(todo =>
            !todo.completed || todo.deleting
        )

        // Group todos by date
        const remindersByDate: Record<string, CalendarReminder[]> = {}

        activeTodos.forEach(todo => {
            const dateKey = new Date(String(todo.dueDate!)).toISOString().split('T')[0] // YYYY-MM-DD

            if (!remindersByDate[dateKey]) {
                remindersByDate[dateKey] = []
            }

            remindersByDate[dateKey].push(todo)
        })

        // Sort todos within each date by priority, then by id for consistency
        Object.keys(remindersByDate).forEach(dateKey => {
            remindersByDate[dateKey].sort((a, b) => {
                // Sort by priority first (High to Low)
                if (a.priority !== b.priority) {
                    return b.priority - a.priority
                }
                // Then by id for consistent ordering
                return a.id.localeCompare(b.id)
            })
        })

        // Create DayReminders objects with display logic
        const dayRemindersMap: Record<string, DayReminders> = {}

        Object.entries(remindersByDate).forEach(([dateKey, reminders]) => {
            // New logic: if 3 or fewer, show all; if more than 3, show only first 2
            const shouldShowOverflow = reminders.length > 3
            const displayReminders = shouldShowOverflow ? reminders.slice(0, 2) : reminders.slice(0, 3)
            const overflowCount = shouldShowOverflow ? reminders.length - 2 : 0

            dayRemindersMap[dateKey] = {
                date: dateKey,
                reminders,
                displayReminders,
                overflowCount
            }
        })

        return dayRemindersMap
    }, [todoLists, year, month])

    return {
        remindersByDate: calendarData,
        isLoading,
        error,
        // Helper function to get reminders for a specific date
        getRemindersForDate: (date: string) => calendarData[date] || null,
        // Helper function to check if a date has reminders
        hasReminders: (date: string) => !!calendarData[date]?.reminders.length
    }
}