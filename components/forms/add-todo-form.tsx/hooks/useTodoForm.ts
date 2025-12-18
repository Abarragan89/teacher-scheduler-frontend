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

    console.log('Current Todo:', currentTodo)

    const [formData, setFormData] = useState<TodoFormData>( () =>
        toTodoFormData({ currentTodo, listId, timeSlot, todoLists })
    )
    // Form data state
    // const [formData, setFormData] = useState<TodoFormData>({
    //     text: currentTodo?.text || '',
    //     dueDate: currentTodo?.dueDate ? new Date(currentTodo.dueDate as string) : undefined,
    //     time: currentTodo?.dueDate
    //         ? new Date(currentTodo.dueDate as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    //         : timeSlot || '07:00',
    //     priority: currentTodo?.priority || 1,
    //     selectedListId: listId || currentTodo?.todoListId || todoLists[0]?.id || '',
    //     isRecurring: currentTodo?.isRecurring || false,
    //     recurrencePattern: currentTodo?.recurrencePattern ?
    //         currentTodo.recurrencePattern :
    //         {
    //             type: 'DAILY',
    //             daysOfWeek: [1],
    //             timeOfDay: timeSlot || '07:00',
    //             daysOfMonth: [],
    //             nthWeekdayOccurrence: { ordinal: 2, weekday: 5 },
    //             yearlyDate: null,
    //             timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    //             startDate: new Date(),
    //             endDate: undefined,
    //             monthPatternType: 'BY_DATE'
    //         }
    // })

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
        updateDueDate: (dueDate: Date | undefined) => setFormData(prev => ({ ...prev, dueDate })),
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

        resetForm: () => {
            setFormData({
                text: '',
                dueDate: undefined,
                time: '07:00',
                priority: 1,
                selectedListId: listId || todoLists[0]?.id || '',
                isRecurring: false,
                recurrencePattern: {
                    type: formData.recurrencePattern.type,
                    timeOfDay: '07:00',
                    daysOfWeek: [1],
                    daysOfMonth: [],
                    nthWeekdayOccurrence: { ordinal: 1, weekday: 5 },
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