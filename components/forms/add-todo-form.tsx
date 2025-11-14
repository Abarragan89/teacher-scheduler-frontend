'use client'
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { BsFillBookmarkFill } from 'react-icons/bs'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem, TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'


interface AddTodoFormProps {
    listId?: string // Make optional since we'll have dropdown
    todoId?: string // For editing existing todo
}

export default function AddTodoForm({ listId, todoId }: AddTodoFormProps) {

    const queryClient = useQueryClient()

    // Get all todo lists from React Query cache
    const todoLists = (queryClient.getQueryData(['todos']) as TodoList[]) || []

    console.log('todoLists in AddTodoForm:', todoLists);

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
    const [isCreating, setIsCreating] = useState(false)
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)


    console.log('currentTodo', currentTodo)


    function combineDateAndTime(date: Date | undefined, time: string): string | null {
        if (!date) return null

        const combined = new Date(date)
        const [hours, minutes] = time.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)
        return combined.toISOString()
    }

    function formatDisplayDate(date: Date, includeTime: boolean = false): string {
        if (includeTime) {
            return `${date.toLocaleDateString()} at ${time}`
        }
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
            } else {
                // Create new todo
                 newTodo = await clientTodo.createTodoItem(selectedListId, text.trim(), dueDateISO || '', priority)
            }

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

            // Reset form
            setText('')
            setDueDate(undefined)
            setTime('07:00')
            setPriority(1)
        } catch (error) {
            console.error('Failed to create todo:', error)
        } finally {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 0)
            setIsCreating(false)
        }
    }

    const clearDueDate = () => {
        setDueDate(undefined)
        setIsDatePopoverOpen(false)
    }

    const clearPriority = () => {
        setPriority(1)
        setIsPriorityPopoverOpen(false)
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Task Title */}
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

                {/* Due Date and Priority Row */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                    {/* Due Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date <span className='text-xs opacity-60'>(optional)</span></label>
                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                    disabled={isCreating}
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                    {dueDate ? formatDisplayDate(dueDate, true) : "Select date"}
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="start">
                                <div className="space-y-4">
                                    <div className='w-[255px] mx-auto min-h-[330px]'>
                                        <Calendar
                                            mode="single"
                                            selected={dueDate}
                                            onSelect={setDueDate}
                                            className="rounded-md bg-transparent w-full pt-1 pb-0"
                                            captionLayout='dropdown'
                                        />
                                    </div>
                                    <div className="flex gap-x-4 -mt-3">
                                        <Input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="flex-2"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => setIsDatePopoverOpen(false)}
                                            className="flex-2"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority <span className='text-xs opacity-60'>(optional)</span></label>
                        <Popover open={isPriorityPopoverOpen} onOpenChange={setIsPriorityPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                    disabled={isCreating}
                                >
                                    <BsFillBookmarkFill
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
                            <PopoverContent className="w-48 space-y-2" align="start">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Set Priority</h4>
                                    {priority > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearPriority}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
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

                {/* List Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">List</label>
                    <Select value={selectedListId} onValueChange={setSelectedListId} disabled={isCreating}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a list..." />
                        </SelectTrigger>
                        <SelectContent>
                            {todoLists.map((list) => (
                                <SelectItem key={list.id} value={list.id}>
                                    {list.listName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Submit Button */}
                <div className="flex justify-start">
                    <Button
                        type="submit"
                        disabled={!text.trim() || isCreating || !selectedListId}
                        className="px-6"
                    >
                        {isCreating ? 'Adding...' : '+ Add Task'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
