'use client'
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { BsFillBookmarkFill } from 'react-icons/bs'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'

interface AddTodoFormProps {
    listId: string
}

export default function AddTodoForm({ listId }: AddTodoFormProps) {
    const queryClient = useQueryClient()

    const [text, setText] = useState('')
    const [dueDate, setDueDate] = useState<Date | undefined>()
    const [time, setTime] = useState<string>('07:00')
    const [priority, setPriority] = useState<number>(1)
    const [isCreating, setIsCreating] = useState(false)
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

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
            const newTodo = await clientTodo.createTodoItem(listId, text.trim(), dueDateISO || '', priority)

            // Update the React Query cache
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData

                return oldData.map(list => {
                    if (list.id === listId) {
                        // Remove any empty temp todos and add the new one
                        const filteredTodos = list.todos.filter(todo =>
                            !todo.id.startsWith('temp-') || todo.text.trim() !== ''
                        )

                        return {
                            ...list,
                            todos: [...filteredTodos, newTodo]
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
            // Focus back to input
            inputRef.current?.focus()
        } catch (error) {
            console.error('Failed to create todo:', error)
        } finally {
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
        <form onSubmit={handleSubmit} className="">
            {/* Text Input */}
            <Input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1"
                disabled={isCreating}
            />
            <div className="flex items-center justify-end gap-2 w-full mt-2">
                {/* Due Date Popover */}
                <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`p-2 ${dueDate ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="end">
                        <div className="space-y-4">
                            {/* <div className="flex items-center justify-between">
                                {dueDate && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearDueDate}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div> */}

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
                          

                            {/* <div className="text-xs text-muted-foreground">
                                        Due: {formatDisplayDate(dueDate)} at {time}
                                    </div> */}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Priority Popover */}
                <Popover open={isPriorityPopoverOpen} onOpenChange={setIsPriorityPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="p-2"
                        >
                            <BsFillBookmarkFill
                                className={`w-4 h-4 ${priority === 4 ? 'text-red-500' :
                                    priority === 3 ? 'text-yellow-500' :
                                        priority === 2 ? 'text-blue-500' :
                                            'text-muted-foreground'
                                    }`}
                            />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 space-y-2" align="end">
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
                                    size="sm"
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

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={!text.trim() || isCreating}
                    size="sm"
                >
                    {isCreating ? 'Adding...' : 'Add'}
                </Button>
            </div>

        </form>
    )
}
