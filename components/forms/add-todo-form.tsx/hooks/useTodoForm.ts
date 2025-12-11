'use client'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList } from '@/types/todo'

export interface TodoFormData {
    text: string
    dueDate: Date | undefined
    time: string
    priority: number
    selectedListId: string,
    isRecurring: boolean
    recurrencePattern: RecurrencePattern

}

export interface TodoFormUIState {
    isDatePopoverOpen: boolean
    isPriorityPopoverOpen: boolean
    isModalOpen: boolean
    isCreating: boolean
}

export interface RecurrencePattern {
    recurrenceType: 'daily' | 'weekly' | 'monthly' | 'yearly'
    selectedDays: number[]           // For weekly recurrence (0=Sunday, 1=Monday, etc.)
    selectedMonthDays: number[]      // For monthly recurrence (1-31, -1 for last day)
    nthWeekday: { nth: number, weekday: number } // For monthly recurrence (e.g., 1st Monday)
    time: string                   // Time of the recurring todo
    yearlyDate: string | null              // For yearly recurrence
    timeZone: string               // Time zone for the recurrence
    startDate: Date | undefined,
    endDate: Date | undefined,
    monthPatternType: 'BY_DAY' | 'BY_DATE' // For monthly recurrence
}
 
export interface TodoFormActions {
    updateText: (text: string) => void
    updateDueDate: (date: Date | undefined) => void
    updateTime: (time: string) => void
    updatePriority: (priority: number) => void
    updateSelectedListId: (listId: string) => void
    updateRecurrencePattern: (pattern: RecurrencePattern) => void
    updateIsRecurring: (isRecurring: boolean) => void
    toggleDatePopover: (open?: boolean) => void
    togglePriorityPopover: (open?: boolean) => void,
    toggleModal: (open?: boolean) => void
    setCreating: (creating: boolean) => void
    resetForm: () => void
}

interface UseTodoFormProps {
    listId?: string
    todoId?: string
    timeSlot?: string
}

export function useTodoForm({ listId, todoId, timeSlot }: UseTodoFormProps = {}) {
    const queryClient = useQueryClient()

    // Get all todo lists from React Query cache
    const todoLists = (queryClient.getQueryData(['todos']) as TodoList[]) || []

    // Find current todo if editing
    const currentTodo: TodoItem | undefined = todoId
        ? todoLists.flatMap(list => list.todos).find(todo => todo.id === todoId)
        : undefined

    // Form data state
    const [formData, setFormData] = useState<TodoFormData>({
        text: currentTodo?.text || '',
        dueDate: currentTodo?.dueDate ? new Date(currentTodo.dueDate as string) : undefined,
        time: currentTodo?.dueDate
            ? new Date(currentTodo.dueDate as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : timeSlot || '07:00',
        priority: currentTodo?.priority || 1,
        selectedListId: listId || todoLists[0]?.id || '',
        isRecurring: false,
        recurrencePattern: {
            recurrenceType: 'daily',
            selectedDays: [1],
            time: currentTodo?.dueDate
                ? new Date(currentTodo.dueDate as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                : timeSlot || '07:00',
            selectedMonthDays: [],
            nthWeekday: { nth: 1, weekday: 1 },
            yearlyDate: currentTodo?.dueDate ? new Date(currentTodo.dueDate as string).toISOString().split('T')[0] : null,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            startDate: new Date(),
            endDate: undefined,
            monthPatternType: 'BY_DATE'
        }

    })

    // UI state
    const [uiState, setUIState] = useState<TodoFormUIState>({
        isDatePopoverOpen: false,
        isPriorityPopoverOpen: false,
        isModalOpen: false,
        isCreating: false
    })

    // Actions
    const actions: TodoFormActions = {
        updateText: (text: string) => setFormData(prev => ({ ...prev, text })),
        updateDueDate: (dueDate: Date | undefined) => setFormData(prev => ({ ...prev, dueDate })),
        updateTime: (time: string) => setFormData(prev => ({ ...prev, time })),
        updatePriority: (priority: number) => setFormData(prev => ({ ...prev, priority })),
        updateSelectedListId: (selectedListId: string) => setFormData(prev => ({ ...prev, selectedListId })),
        updateRecurrencePattern: (recurrencePattern: RecurrencePattern) => setFormData(prev => ({ ...prev, recurrencePattern })),
        updateIsRecurring: (isRecurring: boolean) => setFormData(prev => ({ ...prev, isRecurring })),

        toggleDatePopover: (open?: boolean) => setUIState(prev => ({
            ...prev,
            isDatePopoverOpen: open !== undefined ? open : !prev.isDatePopoverOpen
        })),
        togglePriorityPopover: (open?: boolean) => setUIState(prev => ({
            ...prev,
            isPriorityPopoverOpen: open !== undefined ? open : !prev.isPriorityPopoverOpen
        })),
        toggleModal: (open?: boolean) => setUIState(prev => ({
            ...prev,
            isModalOpen: open !== undefined ? open : !prev.isModalOpen
        })),
        setCreating: (isCreating: boolean) => setUIState(prev => ({ ...prev, isCreating })),

        resetForm: () => {
            setFormData({
                text: '',
                dueDate: undefined,
                time: '07:00',
                priority: 1,
                selectedListId: listId || todoLists[0]?.id || '',
                isRecurring: false,
                recurrencePattern: {
                    recurrenceType: formData.recurrencePattern.recurrenceType,
                    time: '07:00',
                    selectedDays: [1],
                    selectedMonthDays: [],
                    nthWeekday: { nth: 1, weekday: 1 },
                    yearlyDate: null,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    startDate: new Date(),
                    endDate: undefined,
                     monthPatternType: 'BY_DATE'
                }
            })
            setUIState({
                isDatePopoverOpen: false,
                isPriorityPopoverOpen: false,
                isModalOpen: false,
                isCreating: false
            })
        }
    }

    // Helper functions
    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const isFormValid = (): boolean => {
        return !!(formData.text.trim() && formData.selectedListId && !uiState.isCreating)
    }

    return {
        formData,
        uiState,
        actions,
        todoLists,
        currentTodo,
        formatDisplayDate,
        isFormValid
    }
}