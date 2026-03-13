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
    selectedListId: string
    isRecurring: boolean
    editScope: 'single' | 'future'
    recurrencePattern: RecurrencePattern
}

export interface TodoFormUIState {
    isDatePopoverOpen: boolean
    isPriorityPopoverOpen: boolean
    isModalOpen: boolean
    isCreating: boolean
    editScope: 'single' | 'future'
}

interface UseTodoFormProps {
    listId?: string
    todoId?: string
    timeSlot?: string
    todo?: TodoItem  // accept todo directly to support virtuals
    defaultDueDate?: Date
}

export function useTodoForm({ listId, todoId, timeSlot, todo, defaultDueDate }: UseTodoFormProps = {}) {
    const queryClient = useQueryClient()
    const todoLists = (queryClient.getQueryData(['todos']) as TodoList[]) || []

    // Use passed todo directly, or look up by ID in cache for regular todos
    const currentTodo: TodoItem | undefined = todo ?? (
        todoId ? todoLists.flatMap(list => list.todos).find(t => t.id === todoId) : undefined
    )

    const [formData, setFormData] = useState<TodoFormData>(() =>
        toTodoFormData({ currentTodo, listId, timeSlot, todoLists, defaultDueDate })
    )

    const [uiState, setUIState] = useState<TodoFormUIState>({
        isDatePopoverOpen: false,
        isPriorityPopoverOpen: false,
        isModalOpen: false,
        isCreating: false,
        editScope: 'single'
    })

    const setField = (field: keyof TodoFormData, value: any) =>
        setFormData(prev => ({ ...prev, [field]: value }))

    const setUIField = (field: keyof TodoFormUIState, value: any) =>
        setUIState(prev => ({ ...prev, [field]: value }))

    const resetForm = (newTodo?: TodoItem) => {
        setFormData(toTodoFormData({ todoLists, formResetPrevState: newTodo }))
        setUIState({
            isDatePopoverOpen: false,
            isPriorityPopoverOpen: false,
            isModalOpen: false,
            isCreating: false,
            editScope: 'single'
        })
    }

    const formatDisplayDate = (date: Date): string =>
        date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })

    const isFormValid = (): boolean =>
        !!(formData.text.trim() && formData.selectedListId && !uiState.isCreating)

    return {
        formData,
        uiState,
        resetForm,
        setUIField,
        setField,
        todoLists,
        currentTodo,
        formatDisplayDate,
        isFormValid
    }
}