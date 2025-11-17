// 'use client'
// import React, { useState } from 'react'
// import { useQueryClient } from '@tanstack/react-query'
// import useSound from 'use-sound'
// import { CheckCircle, Circle } from 'lucide-react'
// import { TodoItem } from '@/types/todo'
// import {
//     updateTodoItem,
//     handleTodoFocus,
//     handleTodoBlur,
//     toggleTodoCompletion
// } from './utils/todo-operations'
// import DueDatePopover from './popovers/due-date-popover'
// import PriorityPopover from './popovers/priority-popover'

// interface ExtendedTodoItem extends TodoItem {
//     listName?: string
//     todoListId?: string
// }

// interface TodoListItemProps {
//     todo: ExtendedTodoItem
//     listId: string
//     // Optional customization props
//     onTextareaRef?: (todoId: string, el: HTMLTextAreaElement | null) => void
//     showPopovers?: boolean
//     showListName?: boolean
//     className?: string
//     isOverdue?: boolean
//     showOverdue?: boolean // New prop to enable overdue detection
// }

// export default function TodoListItem({
//     todo,
//     listId,
//     onTextareaRef,
//     showPopovers = true,
//     showListName = false,
//     className = "",
//     isOverdue = false,
//     showOverdue = false
// }: TodoListItemProps) {
//     // Internal state management
//     const [localText, setLocalText] = useState(todo.text)
//     const queryClient = useQueryClient()

//     // Internal sound effects
//     const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', { volume: 0.4 })
//     const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', { volume: 0.3 })

//     // Overdue detection
//     const checkIsOverdue = (dueDate?: string | Date | null) => {
//         if (!showOverdue || !dueDate) return false
//         const today = new Date()
//         today.setHours(0, 0, 0, 0)
//         const due = new Date(dueDate)
//         due.setHours(0, 0, 0, 0)
//         return due < today
//     }

//     const todoIsOverdue = isOverdue || checkIsOverdue(todo.dueDate as string)

//     // Auto-resize function for textareas
//     const resizeTextarea = (textarea: HTMLTextAreaElement) => {
//         textarea.style.height = 'auto'
//         textarea.style.height = `${textarea.scrollHeight}px`
//     }

//     // Create minimal state object for operations that need it
//     const state = {
//         todoLists: [],
//         focusedText: '',
//         setFocusedText: () => { },
//         setCurrentListIndex: () => { }
//     }

//     // For read-only views (like dashboard), use a simple paragraph instead of textarea
//     const isReadOnly = !onTextareaRef

//     return (
//         <div
//             className={`flex items-start gap-3 border-b pb-3 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
//                 ? 'opacity-0 scale-95 -translate-y-1'
//                 : todo.isNew
//                     ? 'animate-slide-in-from-top'
//                     : todo.slideDown
//                         ? 'animate-slide-down'
//                         : 'opacity-100 scale-100 translate-y-0'
//                 } ${className}`}
//             style={{
//                 height: todo.deleting ? '0px' : 'auto',
//                 minHeight: todo.deleting ? '0px' : '60px',
//                 paddingTop: todo.deleting ? '0px' : '4px',
//                 paddingBottom: todo.deleting ? '0px' : '4px',
//                 transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
//                 transformOrigin: 'top center',
//                 ...(todo.isNew && {
//                     animation: 'slideInFromTop 300ms ease-out forwards'
//                 }),
//                 ...(todo.slideDown && {
//                     transform: 'translateY(60px)',
//                     transition: 'transform 300ms ease-out'
//                 })
//             }}
//         >
//             {/* Checkbox */}
//             <div className={`flex-shrink-0 pt-1 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-75 opacity-0' : 'transform scale-100 opacity-100'
//                 }`}>
//                 <button
//                     onClick={() => toggleTodoCompletion(listId, todo.id, playCompleteSound, playTodoRemovedSound, queryClient)}
//                     className={`flex-shrink-0 rounded transition-all duration-300 ${todo.deleting
//                         ? 'opacity-0 pointer-events-none transform scale-50'
//                         : 'hover:bg-muted transform scale-100'
//                         }`}
//                     disabled={todo.deleting}
//                 >
//                     {todo.completed ? (
//                         <CheckCircle className="w-5 h-5 text-ring" />
//                     ) : (
//                         <Circle className="w-5 h-5 text-muted-foreground" />
//                     )}
//                 </button>
//             </div>

//             {/* Content */}
//             <div className={`flex-1 min-w-0 pt-[2px] transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
//                 }`}>
//                 {isReadOnly ? (
//                     // Read-only paragraph for dashboard views
//                     <p className={`text-sm font-medium leading-normal ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
//                         } ${isOverdue && !todo.completed ? 'text-red-500' : ''
//                         } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
//                         }`}>
//                         {todo.text}
//                     </p>
//                 ) : (
//                     // Editable textarea for list views
//                     <textarea
//                         ref={(el) => {
//                             onTextareaRef?.(todo.id, el)
//                             if (el) {
//                                 requestAnimationFrame(() => resizeTextarea(el))
//                             }
//                         }}
//                         className={`w-full min-h-[24px] leading-normal text-[15px] bg-transparent border-none resize-none overflow-hidden transition-all duration-500 focus:outline-none ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
//                             } ${isOverdue && !todo.completed ? 'text-red-500' : ''
//                             } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
//                             }`}
//                         placeholder="Add todo..."
//                         value={localText}
//                         onChange={(e) => {
//                             const textarea = e.target as HTMLTextAreaElement
//                             resizeTextarea(textarea)
//                             setLocalText(e.target.value)
//                         }}
//                         onBlur={() => {
//                             updateTodoItem(listId, todo.id, localText, queryClient)
//                             handleTodoBlur(listId, todo.id, localText, state, queryClient)
//                         }}
//                         onFocus={(e) => {
//                             const textarea = e.target as HTMLTextAreaElement
//                             resizeTextarea(textarea)
//                             handleTodoFocus(listId, todo.id, state, queryClient)
//                         }}
//                         data-todo-id={todo.id}
//                         disabled={todo.deleting}
//                         rows={1}
//                         style={{
//                             lineHeight: '1.5',
//                             wordWrap: 'break-word',
//                             whiteSpace: 'pre-wrap'
//                         }}
//                     />
//                 )}

//                 {/* List name for dashboard views */}
//                 {showListName && todo.listName && (
//                     <p className="text-xs text-muted-foreground mt-1">
//                         {todo.listName}
//                     </p>
//                 )}

//                 {/* Popovers for due date and priority */}
//                 {!todo.id.startsWith("temp-") && !todo.deleting && showPopovers && (
//                     <div className="flex justify-between text-muted-foreground opacity-70 text-xs mt-1">
//                         <DueDatePopover
//                             todo={todo}
//                             queryClient={queryClient}
//                             listId={listId}
//                         />
//                         <PriorityPopover
//                             todo={todo}
//                             queryClient={queryClient}
//                             listId={listId}
//                         />
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }










// /////////////////////////////// ALTERNATIVE IMPLEMENTATION ///////////////////////////////
'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useSound from 'use-sound'
import { CheckCircle, Circle, Bookmark, Calendar, Clock, CalendarIcon, ChevronDown } from 'lucide-react'
import { TodoItem, TodoList } from '@/types/todo'
import { clientTodo } from '@/lib/api/services/todos/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
                showDueDate: true, // Show due date but only time portion
                showPriority: true
            }
    }
}

// Priority display component for non-focused state
const PriorityDisplay = ({ priority }: { priority?: string | number }) => {
    if (!priority || priority === 'low' || priority === 1) return null

    const level = typeof priority === 'string' ?
        (priority === 'high' ? 4 : priority === 'medium' ? 3 : 2) :
        priority

    const colorClass = level === 4 ? 'text-red-500' : level === 3 ? 'text-yellow-500' : 'text-blue-500'
    const label = level === 4 ? 'High' : level === 3 ? 'Medium' : 'Low'

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${level === 4 ? 'bg-red-500' : level === 3 ? 'bg-yellow-500' : 'bg-blue-500'}`} />
            <span className={colorClass}>{label}</span>
        </div>
    )
}

// Category display component
const CategoryDisplay = ({ category }: { category?: string }) => {
    // Always show a category, default to 'Other' if not set
    const displayCategory = category || 'Other'

    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {displayCategory}
        </span>
    )
}

// Priority selector for editing mode
const PrioritySelector = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
    const priorityOptions = [
        { level: 1, label: 'No Priority', color: 'text-muted-foreground' },
        { level: 2, label: 'Low', color: 'text-blue-500' },
        { level: 3, label: 'Medium', color: 'text-yellow-500' },
        { level: 4, label: 'High', color: 'text-red-500' }
    ]

    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Priority</label>
            <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))}>
                <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                    {priorityOptions.map(option => (
                        <SelectItem key={option.level} value={option.level.toString()}>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${option.level === 4 ? 'bg-red-500' :
                                    option.level === 3 ? 'bg-yellow-500' :
                                        option.level === 2 ? 'bg-blue-500' :
                                            'bg-muted-foreground'
                                    }`} />
                                <span className={option.color}>{option.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

// Date selector for editing mode - using same UI as add-todo-form
const DateSelector = ({ value, onChange }: { value?: Date | null, onChange: (date: Date | null) => void }) => {
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)
    const [tempDate, setTempDate] = useState<Date | null>(value || null)
    const [time, setTime] = useState<string>(() => {
        if (value) {
            return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }
        return '12:00'
    })

    // Update temp date and time when prop changes
    React.useEffect(() => {
        setTempDate(value || null)
        if (value) {
            setTime(value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
        }
    }, [value])

    function formatDisplayDate(date: Date, includeTime: boolean = false): string {
        if (includeTime) {
            // Use the current time state for display
            return `${date.toLocaleDateString()} at ${time}`
        }
        return date.toLocaleDateString()
    }

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) {
            setTempDate(null)
            return
        }

        // Just update temp date, don't save yet
        const combined = new Date(newDate)
        const [hours, minutes] = time.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)
        setTempDate(combined)
    }

    const handleTimeChange = (newTime: string) => {
        setTime(newTime)
        if (tempDate) {
            // Update the temp date with the new time
            const combined = new Date(tempDate)
            const [hours, minutes] = newTime.split(':').map(Number)
            combined.setHours(hours, minutes, 0, 0)
            setTempDate(combined)
        }
    }

    const handleDone = () => {
        setIsDatePopoverOpen(false)
        // Only save when Done is clicked
        onChange(tempDate)
    }

    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Due Date</label>
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-8 justify-start text-left font-normal text-xs"
                        type="button"
                    >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {tempDate ? formatDisplayDate(tempDate, true) : value ? formatDisplayDate(value, true) : "Select date"}
                        <ChevronDown className="ml-auto h-3 w-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                        <div className='w-[255px] mx-auto min-h-[330px]'>
                            <CalendarComponent
                                mode="single"
                                selected={tempDate || undefined}
                                onSelect={handleDateSelect}
                                className="rounded-md bg-transparent w-full pt-1 pb-0"
                                captionLayout='dropdown'
                            />
                        </div>
                        <div className="flex gap-x-4 -mt-3">
                            <Input
                                type="time"
                                value={time}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeChange(e.target.value)}
                                className="flex-2"
                            />
                            <Button
                                type="button"
                                onClick={handleDone}
                                className="flex-2"
                                size="sm"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}// Due date display component for non-focused state
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

        // For other contexts, show relative date
        const today = new Date()
        const diffTime = todoDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Tomorrow'
        if (diffDays === -1) return 'Yesterday'
        if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
        if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

        return todoDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    // Use different icon for daily context
    const icon = context === 'daily' ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {icon}
            <span>{formatRelativeDate(dueDate)}</span>
        </div>
    )
}

// Category selector for focused state
const CategorySelector = ({ value, onChange }: {
    value?: string
    onChange: (category: string) => void
}) => {
    const categories = ['Work', 'Personal', 'School', 'Health', 'Shopping', 'Other']

    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <Select value={value || 'Other'} onValueChange={onChange}>
                <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export default function FocusedEditingTodoItem({
    todo,
    listId,
    context = 'dashboard',
    onTextareaRef,
    className = ""
}: FocusedEditingTodoItemProps) {
    // Get display configuration based on context
    const displayConfig = getDisplayConfig(context)

    // State management
    const [localText, setLocalText] = useState(todo.text)
    const [isEditing, setIsEditing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()

    // Form state for editing
    const [editCategory, setEditCategory] = useState(todo.category || 'Other')
    const [editPriority, setEditPriority] = useState(typeof todo.priority === 'number' ? todo.priority : 1)
    const [editDueDate, setEditDueDate] = useState<Date | null>(
        todo.dueDate ? new Date(todo.dueDate.toString()) : null
    )

    // Sound effects
    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', { volume: 0.4 })
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', { volume: 0.3 })

    // Auto-resize textarea
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Handle click outside to close editing mode
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node

            // Don't close if clicking on a Select dropdown, Calendar popover, or their triggers
            if (target &&
                (target as Element).closest?.('[data-radix-select-trigger]') ||
                (target as Element).closest?.('[data-radix-select-content]') ||
                (target as Element).closest?.('[data-radix-popover-trigger]') ||
                (target as Element).closest?.('[data-radix-popover-content]') ||
                (target as Element).closest?.('[data-radix-popper-content-wrapper]')
            ) {
                return
            }

            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsEditing(false)
                // Only save text changes when clicking outside, 
                // select and date changes are already saved when selections are made
                if (localText.trim() !== todo.text) {
                    saveAllChanges({ text: localText })
                }
            }
        }

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isEditing, localText, todo.text]) // Include dependencies for proper comparison

    // Check if todo is overdue
    const isOverdue = (dueDate: any) => {
        if (!dueDate) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(dueDate.toString())
        due.setHours(0, 0, 0, 0)
        return due < today
    }

    const todoIsOverdue = isOverdue(todo.dueDate)

    // Create minimal state object for operations
    const state = {
        todoLists: [],
        focusedText: '',
        setFocusedText: () => { },
        setCurrentListIndex: () => { }
    }

    // Helper function to combine date and time (from add-todo-form)
    const combineDateAndTime = (date: Date | null, time: string = '12:00'): string | null => {
        if (!date) return null

        const combined = new Date(date)
        const [hours, minutes] = time.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)
        return combined.toISOString()
    }

    // Handle category change with immediate save
    const handleCategoryChange = (newCategory: string) => {
        setEditCategory(newCategory)
        // Save immediately with the new category value
        saveAllChanges({ category: newCategory })
    }

    // Handle priority change with immediate save
    const handlePriorityChange = (newPriority: number) => {
        setEditPriority(newPriority)
        // Save immediately with the new priority value
        saveAllChanges({ priority: newPriority })
    }

    // Handle date change with save after popover closes
    const handleDateChangeWithSave = (newDate: Date | null) => {
        setEditDueDate(newDate)
        // Save immediately with the new date value
        saveAllChanges({ dueDate: newDate })
    }

    // Handle date change without save (for internal updates)
    const handleDateChange = (newDate: Date | null) => {
        setEditDueDate(newDate)
        // Don't save immediately, let the popover handle when to save
    }

    console.log('todo', todo)
    // Save all changes when losing focus
    const saveAllChanges = async (overrideValues?: {
        text?: string,
        category?: string,
        priority?: number,
        dueDate?: Date | null
    }) => {
        try {
            // Use provided values or current state
            const textToSave = overrideValues?.text ?? localText
            const categoryToSave = overrideValues?.category ?? editCategory
            const priorityToSave = overrideValues?.priority ?? editPriority
            const dateToSave = overrideValues?.dueDate ?? editDueDate

            // Prepare the due date - combine date with default time if needed
            const dueDateISO = dateToSave ? combineDateAndTime(dateToSave) : todo.dueDate

            // Create updated todo object
            const updatedTodo: TodoItem = {
                ...todo,
                text: textToSave.trim(),
                dueDate: dueDateISO || '',
                priority: priorityToSave,
                category: categoryToSave,
                todoListId: listId,
            }

            // Update via API (same as add-todo-form)
            const newTodo = await clientTodo.updateTodo(updatedTodo)

            // Update React Query cache (same pattern as add-todo-form)
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData

                return oldData.map(list => {
                    if (list.id === listId) {
                        return {
                            ...list,
                            todos: list.todos.map(todo =>
                                todo.id === newTodo.id ? newTodo : todo
                            )
                        }
                    }
                    return list
                })
            })

            console.log('Successfully saved changes:', {
                text: textToSave,
                category: categoryToSave,
                priority: priorityToSave,
                dueDate: dateToSave
            })
        } catch (error) {
            console.error('Failed to save todo changes:', error)
        }

        // Also call the existing text update (for backward compatibility)
        // handleTodoBlur(listId, todo.id, localText, state, queryClient)
    }

    // Handle textarea focus - enter editing mode
    const handleTextareaFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsEditing(true)
        const textarea = e.target as HTMLTextAreaElement
        resizeTextarea(textarea)
        handleTodoFocus(listId, todo.id, state, queryClient)
    }

    // Handle textarea blur - save text changes only
    const handleTextareaBlur = () => {
        // Save text changes when textarea loses focus
        if (localText.trim() !== todo.text) {
            saveAllChanges({ text: localText })
        }
    }

    return (
        <div
            ref={containerRef}
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

                {/* Always editable textarea */}
                <textarea
                    ref={(el) => {
                        onTextareaRef?.(todo.id, el)
                        if (el) {
                            requestAnimationFrame(() => resizeTextarea(el))
                        }
                    }}
                    className={`w-full min-h-[24px] leading-normal text-[15px] bg-transparent border-none resize-none overflow-hidden transition-all duration-500 focus:outline-none ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                        } ${todoIsOverdue && !todo.completed ? 'text-red-500' : ''
                        } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                        }`}
                    placeholder="Add todo..."
                    value={localText}
                    onChange={(e) => {
                        const textarea = e.target as HTMLTextAreaElement
                        resizeTextarea(textarea)
                        setLocalText(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setIsEditing(false)
                            e.currentTarget.blur()
                        }
                        if (e.key === 'Enter' && e.ctrlKey) {
                            setIsEditing(false)
                            saveAllChanges({ text: localText })
                        }
                    }}
                    onBlur={handleTextareaBlur}
                    onFocus={handleTextareaFocus}
                    data-todo-id={todo.id}
                    disabled={todo.deleting}
                    rows={1}
                    style={{
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
                    }}
                />

                {/* Editing controls that appear on focus */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isEditing
                    ? 'opacity-100 max-h-32 mt-2'
                    : 'opacity-0 max-h-0 mt-0'
                    }`}>

                    {/* Category selector (always shown when editing) */}
                    <div className="mb-2">
                        <CategorySelector
                            value={editCategory}
                            onChange={handleCategoryChange}
                        />
                    </div>

                    {/* Date and priority row */}
                    <div className="grid grid-cols-2 gap-2">
                        <DateSelector
                            value={editDueDate}
                            onChange={handleDateChangeWithSave}
                        />
                        <PrioritySelector
                            value={editPriority}
                            onChange={handlePriorityChange}
                        />
                    </div>
                </div>

                {/* Display-only controls when not focused */}
                <div className={`transition-all duration-300 ease-in-out ${!isEditing && !todo.deleting
                    ? 'opacity-100 mt-1'
                    : 'opacity-0'
                    }`}>

                    {/* First row: Category (if shown in context) */}
                    {displayConfig.showCategory && (
                        <div className="flex items-center gap-2 mb-1">
                            <CategoryDisplay category={todo.category} />
                        </div>
                    )}

                    {/* Second row: Date and Priority */}
                    <div className="flex items-center gap-3">
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

// Export both for flexibility
export { FocusedEditingTodoItem }
