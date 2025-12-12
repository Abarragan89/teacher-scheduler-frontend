'use client'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useSound from 'use-sound'
import { CheckCircle, Circle, Calendar, Clock, Flag } from 'lucide-react'
import { TodoItem } from '@/types/todo'
import { toggleTodoCompletion } from './utils/todo-operations'

interface ExtendedTodoItem extends TodoItem {
    listName?: string
    todoListId?: string
    category?: string
}

type TodoContext = 'reminder' | 'dashboard' | 'todosheet' | 'daily'

interface DisplayConfig {
    showCategory: boolean
    showDueDate: boolean
    showPriority: boolean
}

interface FocusedEditingTodoItemProps {
    todo: ExtendedTodoItem
    listId: string
    context?: TodoContext
    onTextareaRef?: (todoId: string, el: HTMLTextAreaElement | null) => void
    onEdit?: () => void
    className?: string
}

// Smart context-aware display configuration
const getDisplayConfig = (context: TodoContext): DisplayConfig => {
    switch (context) {
        case 'reminder':
            return {
                showCategory: true,
                showDueDate: true,
                showPriority: true
            }

        case 'dashboard':
            return {
                showCategory: true,
                showDueDate: true,
                showPriority: true
            }

        case 'todosheet':
            return {
                showCategory: false,
                showDueDate: true,
                showPriority: true
            }

        case 'daily':
            return {
                showCategory: true,
                showDueDate: false,
                showPriority: true
            }

        default:
            return {
                showCategory: true,
                showDueDate: true,
                showPriority: true
            }
    }
}

// Category display component
const CategoryDisplay = ({ category }: { category?: string }) => {
    if (!category) return null

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {category}
        </span>
    )
}

// Due date display component for non-focused state
const DueDateDisplay = ({ dueDate, context }: { dueDate?: any, context?: TodoContext }) => {
    if (!dueDate) return null

    const formatRelativeDate = (date: any) => {
        const todoDate = new Date(date.toString())

        // For daily context, only show time since date is obvious
        if (context === 'daily') {
            return todoDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todoDay = new Date(todoDate.getFullYear(), todoDate.getMonth(), todoDate.getDate())

        const diffTime = todoDay.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            const timeString = todoDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            return `Today at ${timeString}`
        } else if (diffDays === 1) {
            const timeString = todoDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            return `Tomorrow at ${timeString}`
        } else if (diffDays === -1) {
            const timeString = todoDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            return `Yesterday at ${timeString}`
        } else if (diffDays > 1 && diffDays <= 7) {
            const dayName = todoDate.toLocaleDateString('en-US', { weekday: 'long' })
            const timeString = todoDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            return `${dayName} at ${timeString}`
        } else {
            return todoDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
        }
    }

    const isOverdue = new Date(dueDate.toString()) < new Date()

    return (
        <div className={`flex items-center text-xs gap-x-1 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
            {context === 'daily' ? (
                <Clock className="w-3 h-3" />
            ) : (
                <Calendar className="w-3 h-3" />
            )}
            <span>{formatRelativeDate(dueDate)}</span>
        </div>
    )
}

// Priority display component
const PriorityDisplay = ({ priority }: { priority?: number }) => {
    if (!priority || priority === 1) return null

    const priorityColors = {
        4: 'text-red-500',
        3: 'text-yellow-500',
        2: 'text-blue-500'
    }

    return (
        <Flag
            size={15}
            className={`${priorityColors[priority as keyof typeof priorityColors] || 'bg-muted-foreground'}`}
        />
    )
}

export default function FocusedEditingTodoItem({
    todo,
    listId,
    context = 'dashboard',
    onEdit,
    className = ""
}: FocusedEditingTodoItemProps) {

    // Get display configuration based on context
    const displayConfig = getDisplayConfig(context)

    const queryClient = useQueryClient()

    // Sound effects
    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', { volume: 0.4 })
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', { volume: 0.3 })

    return (
        <div
            className={`flex items-start gap-1 border-b pb-3 mb-1 transition-all duration-300 ease-in-out ${todo.deleting
                ? 'opacity-0 scale-95 -translate-y-1'
                : todo.isNew
                    ? 'animate-slide-in-from-top'
                    : todo.slideDown
                        ? 'animate-slide-down'
                        : 'opacity-100 scale-100 translate-y-0'
                } ${className}`}
            style={{
                height: todo.deleting ? '0px' : 'auto',
                minHeight: todo.deleting ? '0px' : '50px',
                paddingTop: todo.deleting ? '0px' : '4px',
                paddingBottom: todo.deleting ? '0px' : '5px',
                transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                transformOrigin: 'top center',
                ...(todo.isNew && {
                    animation: 'slideInFromTop 300ms ease-out forwards'
                }),
                ...(todo.slideDown && {
                    transform: 'translateY(60px)',
                    transition: 'transform 300ms ease-out'
                })
            }}
        >
            {/* Checkbox */}
            <div className={`flex-shrink-0 pt-1 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-75 opacity-0' : 'transform scale-100 opacity-100'
                }`}>
                <button
                    onClick={() => toggleTodoCompletion(listId, todo.id, playCompleteSound, playTodoRemovedSound, queryClient)}
                    className={`flex-shrink-0 hover:cursor-pointer rounded transition-all duration-300 ${todo.deleting
                        ? 'opacity-0 pointer-events-none transform scale-50'
                        : 'transform scale-100'
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

            {/* Content */}
            <div className={`hover:text-ring flex-1 min-w-0 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'}`}>
                <div
                    className="cursor-pointer"
                    onClick={() => !todo.deleting && onEdit?.()}
                >
                    <p className={`text-[15px] font-medium leading-normal rounded px-2 py-[2px] transition-colors ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                        }`}>
                        {todo.text}
                    </p>

                    {/* Display-only info when not editing */}
                    <div className="flex items-center gap-3 ml-2 mt-1">
                        {displayConfig.showCategory && (
                            <CategoryDisplay category={todo.listName} />
                        )}
                        {displayConfig.showDueDate && (
                            <DueDateDisplay dueDate={todo.dueDate} context={context} />
                        )}
                        {displayConfig.showPriority && (
                            <PriorityDisplay priority={todo.priority} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export alias for compatibility
export { FocusedEditingTodoItem as TodoListItem }