'use client'
import React, { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'
import AddTodoListForm from '../add-todolist-form'
import NonRecurringForm from './non-recurring-form'
import { useTodoForm } from './hooks/useTodoForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RecurringForm from './recurring-form'

interface AddTodoFormProps {
    listId?: string // Make optional since we'll have dropdown
    todoId?: string // For editing existing todo
    onComplete?: () => void // Callback for when form completes
    onCancel?: () => void   // Callback for cancel action
    timeSlot?: string      // Optional time slot for pre-filling time
    isRecurring?: boolean  // Indicates if the todo is recurring
}

export default function AddTodoForm({
    listId,
    todoId,
    onComplete,
    onCancel,
    timeSlot
}: AddTodoFormProps) {

    const {
        formData,
        uiState,
        actions,
        todoLists,
        currentTodo,
        formatDisplayDate,
        isFormValid,
    } = useTodoForm({ listId, todoId, timeSlot })

    const inputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const queryClient = useQueryClient()


    // Auto-resize textarea function
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Resize textarea when text changes or component mounts
    useEffect(() => {
        if (textareaRef.current) {
            resizeTextarea(textareaRef.current)
        }
    }, [formData.text])


    function combineDateAndTime(date: Date | undefined, time: string): string | null {
        if (!date) return null

        const combined = new Date(date)
        const [hours, minutes] = time.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)

        // Convert to ISO string (UTC)
        return combined.toISOString()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.text.trim()) return
        actions.setCreating(true)

        try {
            const dueDateISO = combineDateAndTime(formData.dueDate, formData.time)

            // IF editing existing todo
            if (currentTodo) {
                const updatedTodo: TodoItem = {
                    ...currentTodo,
                    text: formData.text.trim(),
                    dueDate: dueDateISO || null,
                    priority: formData.priority,
                    todoListId: formData.selectedListId,
                    isRecurring: formData.isRecurring,
                    recurrencePattern: formData.recurrencePattern

                }
                
                // For recurring todos, pass the edit scope
                // const updateOptions = currentTodo.isRecurring ? {
                //     editScope: uiState.editScope
                // } : undefined
                
                // Update existing todo
                let newTodo = await clientTodo.updateTodo(updatedTodo)
                queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                    if (!oldData) return oldData

                    return oldData.map(list => {
                        // Remove the todo from ALL lists first (prevents duplicates)
                        const todosWithoutCurrent = list.todos.filter(todo => todo.id !== newTodo.id)

                        // Only add the updated todo to the target list
                        if (list.id === formData.selectedListId) {
                            return {
                                ...list,
                                todos: [...todosWithoutCurrent, newTodo]
                            }
                        }

                        // For all other lists, just return without the old todo
                        return {
                            ...list,
                            todos: todosWithoutCurrent
                        }
                    })
                })
            } else {

                // Create new todo
                const  newTodo = await clientTodo.createTodoItem(
                    formData.selectedListId,
                    formData.text.trim(),
                    dueDateISO || '',
                    formData.priority,
                    formData.isRecurring,
                    {
                        ...formData.recurrencePattern,
                        timeOfDay: formData.time,
                        yearlyDate: formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : null,
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                )

                const isArrayOfTodos = Array.isArray(newTodo)

                // Update the React Query cache
                queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                    if (!oldData) return oldData

                    return oldData.map(list => {
                        if (list.id === formData.selectedListId) {
                            // Remove any empty temp todos and add the new one
                            const filteredTodos = list.todos.filter(todo =>!todo.id.startsWith('temp-') || todo.text.trim() !== '')

                            // Add the new todo and sort by priority (descending)
                            let updatedTodos: TodoItem[]  | []= []
                            // Array of todos (recurring creation)
                            if (isArrayOfTodos) {
                                 updatedTodos = [...filteredTodos, ...newTodo].sort((a, b) => b.priority - a.priority)
                                return {
                                    ...list,
                                    todos: updatedTodos
                                }
                            // Single todo item
                            } else {
                                updatedTodos = [...filteredTodos, newTodo].sort((a, b) => b.priority - a.priority)
                            }
                            return {
                                ...list,
                                todos: updatedTodos
                            }
                        }
                        return list
                    })
                })
            }
            // Reset form
            actions.resetForm()
            // Call completion callback
            onComplete?.()
        } catch (error) {
            console.error('Failed to create todo:', error)
        } finally {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 0)
            actions.setCreating(false)
        }
    }

    useEffect(() => {
        if (textareaRef.current && formData.text) {
            // Position cursor at end of text when editing existing todo
            const length = formData.text.length
            textareaRef.current.setSelectionRange(length, length)
            textareaRef.current.focus()
        }
    }, []) // Run only on mount

    // Check if we're editing a recurring todo
    const isEditing = currentTodo !== undefined
    // Determine the initial tab value based on editing state
    const initialTabValue =  formData.isRecurring ? "recurring" : "one-time"

    return (
        <div>
            <div>
                <form onSubmit={handleSubmit}>
                    <Tabs value={initialTabValue} className="p-1">
                        <TabsList className='mb-4'>
                            <TabsTrigger 
                                onClick={() => !isEditing && actions.updateIsRecurring(false)} 
                                value="one-time"
                                disabled={isEditing}
                                className={isEditing ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                One-Time
                            </TabsTrigger>
                            <TabsTrigger 
                                onClick={() => !isEditing && actions.updateIsRecurring(true)} 
                                value="recurring"
                                disabled={isEditing}
                                className={isEditing ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                Recurring
                            </TabsTrigger>
                        </TabsList>

                        <Button className='p-2.5 px-3.5' variant={'outline'} asChild>
                            <textarea
                                ref={textareaRef}
                                className={`w-full mb-2 leading-normal text-[15px] bg-secondary resize-none overflow-hidden focus:ring-ring`}
                                placeholder="Add todo..."
                                value={formData.text}
                                onChange={(e) => {
                                    const textarea = e.target as HTMLTextAreaElement
                                    resizeTextarea(textarea)
                                    actions.updateText(e.target.value)
                                }}
                                rows={1}
                                style={{
                                    lineHeight: '1.5',
                                    wordWrap: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                }}
                                autoFocus
                            />
                        </Button>

                        <TabsContent value="one-time">
                            <NonRecurringForm
                                formData={formData}
                                uiState={uiState}
                                actions={actions}
                                todoLists={todoLists}
                                todoId={todoId}
                                onCancel={onCancel}
                                formatDisplayDate={formatDisplayDate}
                                isFormValid={isFormValid}
                            />
                        </TabsContent>
                        <TabsContent value="recurring">
                            <RecurringForm
                                formData={formData}
                                uiState={uiState}
                                actions={actions}
                                todoLists={todoLists}
                                todoId={todoId}
                                onCancel={onCancel}
                            />
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
            <AddTodoListForm
                isOpen={uiState.isModalOpen}
                onClose={() => actions.toggleModal(false)}
                todoListsLength={todoLists.length}
            />
        </div>
    )
}
