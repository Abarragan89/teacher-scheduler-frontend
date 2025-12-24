'use client'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList, RecurrencePattern } from '@/types/todo'
import { toTodoFormData } from '../utils/format-todo-form'

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
    editScope: 'single' | 'future' // For editing recurring todos
}

export interface TodoFormActions {
    updateText: (text: string) => void
    updateDueDate: (date: Date | undefined) => void
    updateTime: (time: string) => void
    updatePriority: (priority: number) => void
    updateSelectedListId: (listId: string) => void
    updateRecurrencePattern: (pattern: RecurrencePattern) => void
    updateIsRecurring: (isRecurring: boolean) => void
    updateEditScope: (scope: 'single' | 'future') => void
    toggleDatePopover: (open?: boolean) => void
    togglePriorityPopover: (open?: boolean) => void,
    toggleModal: (open?: boolean) => void
    setCreating: (creating: boolean) => void
    resetForm: (newTodo: TodoItem) => void
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

    const [formData, setFormData] = useState<TodoFormData>(() =>
        toTodoFormData({ currentTodo, listId, timeSlot, todoLists })
    )

    // UI state
    const [uiState, setUIState] = useState<TodoFormUIState>({
        isDatePopoverOpen: false,
        isPriorityPopoverOpen: false,
        isModalOpen: false,
        isCreating: false,
        editScope: 'single'
    })

    // Actions
    const actions: TodoFormActions = {
        updateText: (text: string) => setFormData(prev => ({ ...prev, text })),

        // setting the date and possibly the time if it is not already set
        updateDueDate: (dueDate: Date | undefined) => setFormData(prev => {
            if (formData.time === "") {
                return { ...prev, dueDate, time: '07:00' }
            } else {
                return { ...prev, dueDate }
            }
        }),

        updateTime: (time: string) => setFormData(prev => ({ ...prev, time })),
        updatePriority: (priority: number) => setFormData(prev => ({ ...prev, priority })),
        updateSelectedListId: (selectedListId: string) => setFormData(prev => ({ ...prev, selectedListId })),
        updateRecurrencePattern: (recurrencePattern: RecurrencePattern) => setFormData(prev => ({ ...prev, recurrencePattern })),
        updateIsRecurring: (isRecurring: boolean) => setFormData(prev => ({ ...prev, isRecurring })),
        updateEditScope: (editScope: 'single' | 'future') => setUIState(prev => ({ ...prev, editScope })),

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

        resetForm: (formResetPrevState: TodoItem) => {
            setFormData(toTodoFormData({ todoLists, formResetPrevState }))
            setUIState({
                isDatePopoverOpen: false,
                isPriorityPopoverOpen: false,
                isModalOpen: false,
                isCreating: false,
                editScope: 'single'
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