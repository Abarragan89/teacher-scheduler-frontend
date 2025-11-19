'use client'
import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ChevronDown, Flag, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'
import AddTodoListForm from './add-todolist-form'
import { Separator } from '../ui/separator'
import { Label } from '../ui/label'


interface AddTodoFormProps {
    listId?: string // Make optional since we'll have dropdown
    todoId?: string // For editing existing todo
    onComplete?: () => void // Callback for when form completes
    onCancel?: () => void   // Callback for cancel action
    context?: 'in-modal' | 'under-todo'   // Allow custom styling
}

export default function AddTodoForm({
    listId,
    todoId,
    onComplete,
    onCancel,
    context = 'in-modal',

}: AddTodoFormProps) {

    const queryClient = useQueryClient()

    // Get all todo lists from React Query cache
    const todoLists = (queryClient.getQueryData(['todos']) as TodoList[]) || []

    let currentTodo: TodoItem | undefined = undefined
    if (todoId) {
        currentTodo = todoLists
            .flatMap(list => list.todos)
            .find(todo => todo.id === todoId)
    }

    const [text, setText] = useState(currentTodo ? currentTodo.text : '')
    const [dueDate, setDueDate] = useState<Date | undefined>(currentTodo && currentTodo.dueDate ? new Date(currentTodo.dueDate as string) : undefined)
    const [time, setTime] = useState<string>(currentTodo && currentTodo.dueDate ? new Date(currentTodo.dueDate as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '07:00')
    const [priority, setPriority] = useState<number>(currentTodo ? currentTodo.priority : 1)
    const [selectedListId, setSelectedListId] = useState<string>(listId || todoLists[0]?.id || '')
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState<boolean>(false)
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

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
    }, [text])

    function combineDateAndTime(date: Date | undefined, time: string): string | null {
        if (!date) return null

        const combined = new Date(date)
        const [hours, minutes] = time.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)
        return combined.toISOString()
    }

    function formatDisplayDate(date: Date): string {
        return date.toLocaleDateString()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!text.trim()) return
        setIsCreating(true)

        try {
            const dueDateISO = combineDateAndTime(dueDate, time)

            let newTodo: TodoItem
            if (currentTodo) {
                const updatedTodo: TodoItem = {
                    ...currentTodo,
                    text: text.trim(),
                    dueDate: dueDateISO || '',
                    priority: priority,
                    todoListId: selectedListId
                }
                // Update existing todo
                newTodo = await clientTodo.updateTodo(updatedTodo)
                queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                    if (!oldData) return oldData

                    return oldData.map(list => {
                        // Remove from old list (if it was in a different list)
                        if (list.id === currentTodo.todoListId && list.id !== selectedListId) {
                            return {
                                ...list,
                                todos: list.todos.filter(todo => todo.id !== newTodo.id)
                            }
                        }

                        // Add/update in new list
                        if (list.id === selectedListId) {
                            const existingIndex = list.todos.findIndex(todo => todo.id === newTodo.id)
                            let updatedTodos
                            if (existingIndex >= 0) {
                                // Replace existing todo
                                updatedTodos = list.todos.map(todo =>
                                    todo.id === newTodo.id ? newTodo : todo
                                )
                            } else {
                                // Add to new list
                                updatedTodos = [...list.todos, newTodo]
                            }
                            return {
                                ...list,
                                todos: updatedTodos
                            }
                        }
                        return list
                    })
                })
            } else {
                // Create new todo
                newTodo = await clientTodo.createTodoItem(selectedListId, text.trim(), dueDateISO || '', priority)
                // Update the React Query cache
                queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                    if (!oldData) return oldData

                    return oldData.map(list => {
                        if (list.id === selectedListId) {
                            // Remove any empty temp todos and add the new one
                            const filteredTodos = list.todos.filter(todo =>
                                !todo.id.startsWith('temp-') || todo.text.trim() !== ''
                            )

                            // Add the new todo and sort by priority (descending)
                            const updatedTodos = [...filteredTodos, newTodo].sort((a, b) => b.priority - a.priority)

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
            setText('')
            setDueDate(undefined)
            setTime('07:00')
            setPriority(1)

            // Call completion callback
            onComplete?.()
        } catch (error) {
            console.error('Failed to create todo:', error)
        } finally {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 0)
            setIsCreating(false)
        }
    }

    const isInModal = context === 'in-modal'

    return (
        <div>
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Task Title styles depend on the contextk, in modal or under todo*/}
                    {isInModal ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Todo</label>
                            <Input
                                ref={inputRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter todo..."
                                className="w-full"
                                disabled={isCreating}
                            />
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            className={`w-full min-h-[24px] px-2 ml-1 -mt-1 leading-normal text-[15px] bg-transparent border-b-2 border-muted  pb-[2px] resize-none overflow-hidden transition-all duration-500 focus:outline-none focus:ring-0 focus:ring-ring`}
                            placeholder="Add todo..."
                            value={text}
                            onChange={(e) => {
                                const textarea = e.target as HTMLTextAreaElement
                                resizeTextarea(textarea)
                                setText(e.target.value)
                            }}
                            rows={1}
                            style={{
                                lineHeight: '1.5',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            autoFocus
                        />
                    )}

                    {/* Due Date and Priority Row */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {/* Due Date */}
                        <div className="w-full min-w-[145px] flex-2">
                            <Label className='pl-1 pb-1'>Due Date <span className='text-xs opacity-60'>(optional)</span></Label>
                            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        disabled={isCreating}
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {dueDate ? formatDisplayDate(dueDate) : "Select date"}
                                        <ChevronDown className="ml-auto h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                    <div className="space-y-4">
                                        <div className='w-[235px] mx-auto min-h-[280px]'>
                                            <Calendar
                                                mode="single"
                                                selected={dueDate}
                                                onSelect={setDueDate}
                                                className="rounded-md bg-transparent w-full p-0"
                                                captionLayout='dropdown'
                                            />
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Selction */}
                        <div className="w-full min-w-[100px] flex-1">
                            <Label htmlFor="time-picker" className="pl-1 pb-1">
                                Time <span className='text-xs opacity-60'>(optional)</span>
                            </Label>
                            <Input
                                type="time"
                                id="time-picker"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                        </div>
                    </div>

                    {/* List and Priority Selection */}
                    <div className="flex flex-wrap gap-4 text-sm w-full">
                        {/* List Selection */}
                        <div className="w-full min-w-[145px] flex-1">
                            <label className="pl-1 pb-1">List</label>
                            <Select value={selectedListId} onValueChange={setSelectedListId} disabled={isCreating}>
                                <Button variant='outline' asChild>
                                    <SelectTrigger className="w-full justify-between text-left">
                                        <SelectValue placeholder="Select a list..." />
                                    </SelectTrigger>
                                </Button>
                                <SelectContent>
                                    {todoLists.map((list) => (
                                        <SelectItem key={list.id} value={list.id}>
                                            {list.listName}
                                        </SelectItem>
                                    ))}
                                    <button
                                        className="text-ring w-full rounded-md text-sm p-1 hover:bg-accent hover:cursor-pointer"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add New List
                                        </div>
                                    </button>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority */}
                        <div className="w-full min-w-[145px] flex-1 text-sm">
                            <Label className="pl-1 pb-1">Priority <span className='text-xs opacity-60'>(optional)</span></Label>
                            <Popover open={isPriorityPopoverOpen} onOpenChange={setIsPriorityPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        disabled={isCreating}
                                    >
                                        <Flag
                                            className={`mr-2 w-4 h-4 ${priority === 4 ? 'text-red-500' :
                                                priority === 3 ? 'text-yellow-500' :
                                                    priority === 2 ? 'text-blue-500' :
                                                        'text-muted-foreground'
                                                }`}
                                        />
                                        {priority === 4 ? 'High Priority' :
                                            priority === 3 ? 'Medium Priority' :
                                                priority === 2 ? 'Low Priority' : 'No Priority'}
                                        <ChevronDown className="ml-auto h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="space-y-2" align="start">
                                    <div className="space-y-1">
                                        {[
                                            { level: 4, label: 'High Priority', color: 'text-red-500', bgColor: 'hover:bg-red-50' },
                                            { level: 3, label: 'Medium Priority', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50' },
                                            { level: 2, label: 'Low Priority', color: 'text-blue-500', bgColor: 'hover:bg-blue-50' },
                                            { level: 1, label: 'No Priority', color: 'text-muted-foreground', bgColor: 'hover:bg-muted/50' }
                                        ].map(({ level, label, color, bgColor }) => (
                                            <Button
                                                key={level}
                                                type="button"
                                                variant="ghost"
                                                className={`w-full justify-start ${bgColor} ${color}`}
                                                onClick={() => {
                                                    setPriority(level)
                                                    setIsPriorityPopoverOpen(false)
                                                }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${level === 4 ? 'bg-red-500' :
                                                        level === 3 ? 'bg-yellow-500' :
                                                            level === 2 ? 'bg-blue-500' :
                                                                'bg-muted-foreground'
                                                        }`} />
                                                    {label}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-5">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isCreating}
                                className='shadow-none'
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={!text.trim() || isCreating || !selectedListId}
                            className="px-6 shadow-none"
                        >
                            {todoId ?
                                isCreating ? 'Saving...' : 'Save'
                                :
                                isCreating ? 'Adding...' : '+ Add Todo'
                            }
                        </Button>
                    </div>
                </form>
            </div>
            {!isInModal && (<Separator className='w-full mt-5 mb-3 ' />)}
            <AddTodoListForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                todoListsLength={todoLists.length}
            />
        </div>
    )
}
