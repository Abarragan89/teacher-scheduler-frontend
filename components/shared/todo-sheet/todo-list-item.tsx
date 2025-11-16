'use client'
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useSound from 'use-sound'
import { CheckCircle, Circle } from 'lucide-react'
import { TodoItem } from '@/types/todo'
import {
    updateTodoItem,
    handleTodoFocus,
    handleTodoBlur,
    toggleTodoCompletion
} from './utils/todo-operations'
import DueDatePopover from './popovers/due-date-popover'
import PriorityPopover from './popovers/priority-popover'

interface ExtendedTodoItem extends TodoItem {
    listName?: string
    todoListId?: string
}

interface TodoListItemProps {
    todo: ExtendedTodoItem
    listId: string
    // Optional customization props
    onTextareaRef?: (todoId: string, el: HTMLTextAreaElement | null) => void
    showPopovers?: boolean
    showListName?: boolean
    className?: string
    isOverdue?: boolean
    showOverdue?: boolean // New prop to enable overdue detection
}

export default function TodoListItem({
    todo,
    listId,
    onTextareaRef,
    showPopovers = true,
    showListName = false,
    className = "",
    isOverdue = false,
    showOverdue = false
}: TodoListItemProps) {
    // Internal state management
    const [localText, setLocalText] = useState(todo.text)
    const queryClient = useQueryClient()

    // Internal sound effects
    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', { volume: 0.4 })
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', { volume: 0.3 })

    // Overdue detection
    const checkIsOverdue = (dueDate?: string | Date | null) => {
        if (!showOverdue || !dueDate) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        return due < today
    }

    const todoIsOverdue = isOverdue || checkIsOverdue(todo.dueDate as string)

    // Auto-resize function for textareas
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Create minimal state object for operations that need it
    const state = {
        todoLists: [],
        focusedText: '',
        setFocusedText: () => { },
        setCurrentListIndex: () => { }
    }

    // For read-only views (like dashboard), use a simple paragraph instead of textarea
    const isReadOnly = !onTextareaRef

    return (
        <div
            className={`flex items-start gap-3 border-b pb-3 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
                ? 'opacity-0 scale-95 -translate-y-1'
                : todo.isNew
                    ? 'animate-slide-in-from-top'
                    : todo.slideDown
                        ? 'animate-slide-down'
                        : 'opacity-100 scale-100 translate-y-0'
                } ${className}`}
            style={{
                height: todo.deleting ? '0px' : 'auto',
                minHeight: todo.deleting ? '0px' : '60px',
                paddingTop: todo.deleting ? '0px' : '4px',
                paddingBottom: todo.deleting ? '0px' : '4px',
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

            {/* Content */}
            <div className={`flex-1 min-w-0 pt-[2px] transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
                }`}>
                {isReadOnly ? (
                    // Read-only paragraph for dashboard views
                    <p className={`text-sm font-medium leading-normal ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                        } ${isOverdue && !todo.completed ? 'text-red-500' : ''
                        } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                        }`}>
                        {todo.text}
                    </p>
                ) : (
                    // Editable textarea for list views
                    <textarea
                        ref={(el) => {
                            onTextareaRef?.(todo.id, el)
                            if (el) {
                                requestAnimationFrame(() => resizeTextarea(el))
                            }
                        }}
                        className={`w-full min-h-[24px] leading-normal text-[15px] bg-transparent border-none resize-none overflow-hidden transition-all duration-500 focus:outline-none ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                            } ${isOverdue && !todo.completed ? 'text-red-500' : ''
                            } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                            }`}
                        placeholder="Add todo..."
                        value={localText}
                        onChange={(e) => {
                            const textarea = e.target as HTMLTextAreaElement
                            resizeTextarea(textarea)
                            setLocalText(e.target.value)
                        }}
                        onBlur={() => {
                            updateTodoItem(listId, todo.id, localText, queryClient)
                            handleTodoBlur(listId, todo.id, localText, state, queryClient)
                        }}
                        onFocus={(e) => {
                            const textarea = e.target as HTMLTextAreaElement
                            resizeTextarea(textarea)
                            handleTodoFocus(listId, todo.id, state, queryClient)
                        }}
                        data-todo-id={todo.id}
                        disabled={todo.deleting}
                        rows={1}
                        style={{
                            lineHeight: '1.5',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap'
                        }}
                    />
                )}

                {/* List name for dashboard views */}
                {showListName && todo.listName && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {todo.listName}
                    </p>
                )}

                {/* Popovers for due date and priority */}
                {!todo.id.startsWith("temp-") && !todo.deleting && showPopovers && (
                    <div className="flex justify-between text-muted-foreground opacity-70 text-xs mt-1">
                        <DueDatePopover
                            todo={todo}
                            queryClient={queryClient}
                            listId={listId}
                        />
                        <PriorityPopover
                            todo={todo}
                            queryClient={queryClient}
                            listId={listId}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}