'use client'
import React from 'react'
import { useDailyTodos } from '@/lib/hooks/useDailyTodos'
import { useDefaultTodoList } from '@/lib/hooks/useDefaultTodoList'
import { useQueryClient } from '@tanstack/react-query'
import { toggleTodoCompletion, updateTodoItem } from '@/components/shared/todo-sheet/utils/todo-operations'
import AddTodoForm from '@/components/forms/add-todo-form'
import DueDatePopover from '@/components/shared/todo-sheet/popovers/due-date-popover'
import PriorityPopover from '@/components/shared/todo-sheet/popovers/priority-popover'
import useSound from 'use-sound'
import { CheckCircle, Circle, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DailyTodoItem } from '@/lib/hooks/useDailyTodos'
import { useState, useEffect, useRef } from 'react'

interface TodoListProps {
    dateString: string
}

export default function TodoList({ dateString }: TodoListProps) {
    const { todos, isLoading, todosCount } = useDailyTodos(dateString)
    const { defaultListId } = useDefaultTodoList()
    const queryClient = useQueryClient()

    // Local state for textarea content (same as todo-sheet)
    const [localTodoTexts, setLocalTodoTexts] = useState<Record<string, string>>({})

    // Refs for textarea auto-resize (same as todo-sheet)
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', {
        volume: 0.3
    });

    // Auto-resize function (same as todo-sheet)
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Sync local todo texts when todos change (same as todo-sheet)
    useEffect(() => {
        const newLocalTexts: Record<string, string> = {}
        todos?.forEach(todo => {
            if (!localTodoTexts[todo.id]) {
                newLocalTexts[todo.id] = todo.text
            }
        })
        if (Object.keys(newLocalTexts).length > 0) {
            setLocalTodoTexts(prev => ({ ...prev, ...newLocalTexts }))
        }
    }, [todos, localTodoTexts])

    // Format the date for display
    const formatDateForDisplay = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const handleTodoToggle = (todoId: string, listId: string) => {
        toggleTodoCompletion(
            listId,
            todoId,
            playCompleteSound,
            playTodoRemovedSound,
            queryClient
        )
    }

    const renderTodoItem = (todo: DailyTodoItem) => (
        <div
            key={todo.id}
            className={`flex items-start border-b gap-3 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
                ? 'opacity-0 scale-95 -translate-y-1'
                : 'opacity-100 scale-100 translate-y-0'
                }`}
            style={{
                height: todo.deleting ? '0px' : 'auto',
                minHeight: todo.deleting ? '0px' : '60px',
                paddingTop: todo.deleting ? '0px' : '4px',
                paddingBottom: todo.deleting ? '0px' : '4px',
                transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                transformOrigin: 'top center'
            }}
        >
            {/* Checkbox */}
            <div className={`flex-shrink-0 pt-1 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-75 opacity-0' : 'transform scale-100 opacity-100'
                }`}>
                <button
                    onClick={() => handleTodoToggle(todo.id, todo.listId)}
                    className={`flex-shrink-0 rounded transition-all duration-300 ${todo.deleting
                        ? 'opacity-0 pointer-events-none transform scale-50'
                        : 'hover:bg-muted transform scale-100'
                        }`}
                    disabled={todo.deleting}
                >
                    {todo.completed ? (
                        <CheckCircle className="w-5 h-5 text-ring" />
                    ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>
            </div>

            {/* Content - Textarea approach */}
            <div className={`flex-1 min-w-0 pt-[2px] transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
                }`}>
                {/* Textarea - Exactly like todo-sheet */}
                <textarea
                    ref={(el) => {
                        textareaRefs.current[todo.id] = el
                        if (el) {
                            // Auto-resize on mount/content change
                            requestAnimationFrame(() => resizeTextarea(el))
                        }
                    }}
                    className={`w-full min-h-[24px] leading-normal text-[15px] bg-transparent border-none resize-none overflow-hidden transition-all duration-500 focus:outline-none ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                        } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                        }`}
                    placeholder="Add todo..."
                    value={localTodoTexts[todo.id] || todo.text}
                    onChange={(e) => {
                        const textarea = e.target as HTMLTextAreaElement

                        // Auto-resize
                        resizeTextarea(textarea)

                        // Update local state
                        setLocalTodoTexts(prev => ({
                            ...prev,
                            [todo.id]: e.target.value
                        }))
                    }}
                    onBlur={() => {
                        const currentText = localTodoTexts[todo.id] || todo.text
                        updateTodoItem(todo.listId, todo.id, currentText, queryClient)
                    }}
                    onFocus={(e) => {
                        const textarea = e.target as HTMLTextAreaElement
                        resizeTextarea(textarea)
                    }}
                    disabled={todo.deleting}
                    rows={1}
                    style={{
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                    }}
                />

                {/* Popovers */}
                {!todo.deleting && (
                    <div className="flex justify-between text-muted-foreground opacity-70 text-xs">
                        {/* Due Date Popover */}
                        <DueDatePopover
                            todo={todo}
                            queryClient={queryClient}
                        />

                        {/* Priority Popover */}
                        <PriorityPopover
                            todo={todo}
                            queryClient={queryClient}
                        />
                    </div>
                )}
            </div>
        </div>
    )

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className='mx-5 mt-10 space-y-6 mb-36'>
            {/* Todos List */}
            {todos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No todos for this day</h3>
                    <p>Add a todo below to get started</p>
                </div>
            ) : (
                <div className="space-y-0 transition-all duration-300 ease-in-out">
                    {todos.map(renderTodoItem)}
                </div>
            )}
        </div>
    )
}
