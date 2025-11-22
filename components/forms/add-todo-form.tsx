'use client'
import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ChevronDown, Clock, Flag, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'
import AddTodoListForm from './add-todolist-form'
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
                        // Remove the todo from ALL lists first (prevents duplicates)
                        const todosWithoutCurrent = list.todos.filter(todo => todo.id !== newTodo.id)

                        // Only add the updated todo to the target list
                        if (list.id === selectedListId) {
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

    useEffect(() => {
        if (textareaRef.current && text) {
            // Position cursor at end of text when editing existing todo
            const length = text.length
            textareaRef.current.setSelectionRange(length, length)
            textareaRef.current.focus()
        }
    }, []) // Run only on mount

    return (
        <div>
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Button className='p-2.5 px-3.5' variant={'outline'} asChild>
                        <textarea
                            ref={textareaRef}
                            className={`w-full leading-normal text-[15px] bg-secondary resize-none overflow-hidden  focus:ring-ring`}
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
                    </Button>
                    {/* Due Date and Priority Row */}
                    <div className="flex-between flex-wrap gap-5 xs:gap-x-16 text-sm">
                        {/* Due Date */}
                        <div className="w-full min-w-[140px] flex-2">
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
                                        <div className='w-[230px] mx-auto min-h-[300px]'>
                                            <Calendar
                                                mode="single"
                                                selected={dueDate}
                                                onSelect={(val) => { setDueDate(val); setIsDatePopoverOpen(false) }}
                                                className="rounded-md bg-transparent w-full p-0"
                                                captionLayout='dropdown'
                                            />
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Selction */}
                        <div className="w-full min-w-[120px] flex-1">
                            <Label htmlFor="time-picker" className="pl-1 pb-1">
                                Time <span className='text-xs opacity-60'>(optional)</span>
                            </Label>
                            <div className="relative flex gap-x-1">
                                <Input
                                    type="time"
                                    id="time-picker"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="bg-background text-sm appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* List and Priority Selection */}
                    <div className="flex-between flex-wrap gap-5 xs:gap-x-16 text-sm">
                        {/* List Selection */}
                        <div className="w-full min-w-[140px] flex-2">
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
                        <div className="w-full min-w-[120px] flex-1 text-sm">
                            <Label className="pl-1 pb-1">Priority <span className='text-xs opacity-60'>(optional)</span></Label>
                            <Popover open={isPriorityPopoverOpen} onOpenChange={setIsPriorityPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-0 justify-start text-left font-normal p-0"
                                        disabled={isCreating}
                                    >
                                        <Flag
                                            className={`mr-2 w-4 h-4 ${priority === 4 ? 'text-red-500' :
                                                priority === 3 ? 'text-yellow-500' :
                                                    priority === 2 ? 'text-blue-500' :
                                                        'text-muted-foreground'
                                                }`}
                                        />
                                        {priority === 4 ? 'High' :
                                            priority === 3 ? 'Medium' :
                                                priority === 2 ? 'Low' : 'None'}
                                        <ChevronDown className="ml-auto h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="space-y-2" align="start">
                                    <div className="space-y-1">
                                        {[
                                            { level: 4, label: 'High', color: 'text-red-500', bgColor: 'hover:bg-red-50' },
                                            { level: 3, label: 'Medium', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50' },
                                            { level: 2, label: 'Low', color: 'text-blue-500', bgColor: 'hover:bg-blue-50' },
                                            { level: 1, label: 'None', color: 'text-muted-foreground', bgColor: 'hover:bg-muted/50' }
                                        ].map(({ level, label, color, bgColor }) => (
                                            <Button
                                                key={level}
                                                type="button"
                                                variant="ghost"
                                                className={`w-full justify-start space-x-2 ${bgColor} ${color}`}
                                                onClick={() => {
                                                    setPriority(level)
                                                    setIsPriorityPopoverOpen(false)
                                                }}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Flag className={`w-4 h-4 ${level === 4 ? 'text-red-500' :
                                                        level === 3 ? 'text-yellow-500' :
                                                            level === 2 ? 'text-blue-500' :
                                                                'text-muted-foreground'
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
                    <div className={`flex justify-start gap-5 mt-5`}>
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
            <AddTodoListForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                todoListsLength={todoLists.length}
            />
        </div>
    )
}
