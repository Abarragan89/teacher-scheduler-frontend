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
    isRecurring?: boolean
    recurrencePattern?: {}

}

export interface TodoFormUIState {
    isDatePopoverOpen: boolean
    isPriorityPopoverOpen: boolean
    isModalOpen: boolean
    isCreating: boolean
}

export interface TodoFormActions {
    updateText: (text: string) => void
    updateDueDate: (date: Date | undefined) => void
    updateTime: (time: string) => void
    updatePriority: (priority: number) => void
    updateSelectedListId: (listId: string) => void
    toggleDatePopover: (open?: boolean) => void
    togglePriorityPopover: (open?: boolean) => void
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
        recurrencePattern: {}
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
                selectedListId: listId || todoLists[0]?.id || ''
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