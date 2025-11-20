'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useSound from 'use-sound'
import { CheckCircle, Circle, Calendar, Clock, Flag } from 'lucide-react'
import { TodoItem, TodoList } from '@/types/todo'
import { toggleTodoCompletion } from './utils/todo-operations'
import AddTodoForm from '@/components/forms/add-todo-form'

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

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flag className={`w-3 h-3 ${level === 4 ? 'text-red-500' : level === 3 ? 'text-yellow-500' : 'text-blue-500'}`} />
        </div>
    )
}

// Category display component
const CategoryDisplay = ({ category }: { category?: string }) => {
    // Always show a category, default to 'Unlisted' if not set
    const displayCategory = category || 'Unlisted'

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
        <div className="space-y-1 flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground">Priority</label>
            <Select value={value.toString()} onValueChange={(val) => onChange(Number(val))}>
                <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                    {priorityOptions.map(option => (
                        <SelectItem key={option.level} value={option.level.toString()}>
                            <div className="flex items-center gap-2">
                                <Flag className={`w-3 h-3 ${option.level === 4 ? 'text-red-500' :
                                    option.level === 3 ? 'text-yellow-500' :
                                        option.level === 2 ? 'text-blue-500' :
                                            'text-muted-foreground'
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
        <div className="space-y-1 min-w-[175px] flex-1">
            <label className="text-xs text-muted-foreground">Due Date</label>
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-8 justify-start text-left font-normal text-xs"
                    >
                        <CalendarIcon className="h-3 w-3" />
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
        <div className="flex items-center text-xs gap-x-1 text-muted-foreground">
            {icon}
            <span>{formatRelativeDate(dueDate)}</span>
        </div>
    )
}

// Category selector for focused state
const CategorySelector = ({ value, onChange, todoLists }: {
    value?: string
    onChange: (listId: string) => void
    todoLists: TodoList[]
}) => {
    // Find the current list by matching the value (which should be a list ID)
    const currentList = todoLists.find(list => list.id === value)
    const currentValue = currentList?.id || todoLists[0]?.id || ''

    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <Select value={currentValue} onValueChange={onChange}>
                <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                    {todoLists.map(list => (
                        <SelectItem key={list.id} value={list.id}>
                            {list.listName}
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
    const [isEditing, setIsEditing] = useState(false)
    const queryClient = useQueryClient()

    // Sound effects
    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', { volume: 0.4 })
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', { volume: 0.3 })
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', { volume: 0.3 })

    // Auto-resize textarea
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Handle click outside to close editing mode
    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         const target = event.target as Node

    //         // Don't close if clicking on a Select dropdown, Calendar popover, or their triggers
    //         if (target &&
    //             (target as Element).closest?.('[data-radix-select-trigger]') ||
    //             (target as Element).closest?.('[data-radix-select-content]') ||
    //             (target as Element).closest?.('[data-radix-popover-trigger]') ||
    //             (target as Element).closest?.('[data-radix-popover-content]') ||
    //             (target as Element).closest?.('[data-radix-popper-content-wrapper]')
    //         ) {
    //             return
    //         }

    //         // Don't close if clicking on the container div itself (the outermost todo item div)
    //         if (target === containerRef.current) {
    //             return
    //         }

    //         if (containerRef.current && !containerRef.current.contains(target)) {
    //             // Just cancel editing without saving when clicking outside
    //             handleCancelChanges()
    //         }
    //     }

    //     if (isEditing) {
    //         document.addEventListener('mousedown', handleClickOutside)
    //         return () => document.removeEventListener('mousedown', handleClickOutside)
    //     }
    // }, [isEditing])

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

    // Helper function to combine date and time (from add-todo-form)
    const combineDateAndTime = (date: Date | null, time: string = '12:00'): string | null => {
        if (!date) return null

        const combined = new Date(date)
        const [hours, minutes] = time.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)
        return combined.toISOString()
    }

    // Handle category change without immediate save
    const handleCategoryChange = (newListId: string) => {
        setEditCategoryId(newListId)
        // Don't save immediately anymore
    }

    // Handle priority change without immediate save
    const handlePriorityChange = (newPriority: number) => {
        setEditPriority(newPriority)
        // Don't save immediately anymore
    }

    // Handle date change without save (for internal updates)
    const handleDateChange = (newDate: Date | null) => {
        setEditDueDate(newDate)
        // Don't save immediately, let the save button handle it
    }

    // Manual save function for the save button
    const handleSaveChanges = async () => {
        setIsSaving(true)
        try {
            await saveAllChanges({
                text: localText,
                category: editCategoryId,
                priority: editPriority,
                dueDate: editDueDate
            })
            setIsEditing(false)
        } finally {
            setIsSaving(false)
        }
    }

    // Cancel editing function
    const handleCancelChanges = () => {
        // Reset all values to original
        setLocalText(todo.text)
        setEditCategoryId(listId)
        setEditPriority(typeof todo.priority === 'number' ? todo.priority : 1)
        setEditDueDate(todo.dueDate ? new Date(todo.dueDate.toString()) : null)
        setIsEditing(false)
    }


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
            const categoryListId = overrideValues?.category ?? editCategoryId
            const priorityToSave = overrideValues?.priority ?? editPriority
            const dateToSave = overrideValues?.dueDate ?? editDueDate

            // Prepare the due date - combine date with default time if needed
            const dueDateISO = dateToSave ? combineDateAndTime(dateToSave) : todo.dueDate

            // Check if category is actually changing
            const isCategoryChanging = categoryListId !== listId

            // Create updated todo object
            const updatedTodo: TodoItem = {
                ...todo,
                text: textToSave.trim(),
                dueDate: dueDateISO || '',
                priority: priorityToSave,
                // Only change todoListId if category is actually changing
                todoListId: editCategoryId
            }

            // Update via API
            const newTodo = await clientTodo.updateTodo(updatedTodo)

            // Update React Query cache
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData

                if (isCategoryChanging) {
                    // Moving between lists - remove from old, add to new
                    return oldData.map(list => {
                        // Remove from old list
                        if (list.id === listId) {
                            return {
                                ...list,
                                todos: list.todos.filter(t => t.id !== todo.id)
                            }
                        }
                        // Add to new list
                        if (list.id === categoryListId) {
                            return {
                                ...list,
                                todos: [...list.todos, newTodo]
                            }
                        }
                        return list
                    })
                } else {
                    // Just updating in place - maintain position in list
                    return oldData.map(list => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                todos: list.todos.map(t => t.id === todo.id ? newTodo : t)
                            }
                        }
                        return list
                    })
                }
            })
        } catch (error) {
            console.error('Failed to save todo changes:', error)
        }
    }

    return (
        <div
            ref={containerRef}
            className={`flex items-start gap-1 border-b pb-3 mt-1 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
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
            <div
                className={`flex-1 min-w-0 transition-all duration-300 ease-in-out cursor-pointer ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
                    }`}
                onClick={() => !todo.deleting && !isEditing && setIsEditing(true)}
            >

                {isEditing ? (
                    /* Editing mode - use AddTodoForm */
                    <div className="mt-2">
                        <AddTodoForm
                            listId={listId}
                            todoId={todo.id}
                            onComplete={() => setIsEditing(false)}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                        <textarea
                            ref={(el) => {
                                onTextareaRef?.(todo.id, el)
                                if (el) {
                                    requestAnimationFrame(() => {
                                        resizeTextarea(el)
                                        // Position cursor at end of text when entering edit mode
                                        const length = el.value.length
                                        el.setSelectionRange(length, length)
                                        el.focus()
                                    })
                                }
                            }}
                            className={`w-full min-h-[24px] px-2 ml-1 leading-normal text-[15px] bg-transparent border-b-2 sh border-muted py-1 pb-[2px] resize-none overflow-hidden transition-all duration-500 focus:outline-none focus:ring-0 focus:ring-ring ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
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
                                    setLocalText(todo.text) // Reset to original text
                                }
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleSaveChanges()
                                }
                            }}
                            data-todo-id={todo.id}
                            disabled={todo.deleting}
                            rows={1}
                            style={{
                                lineHeight: '1.5',
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            autoFocus
                        />
                    </div>
                ) : (
                    /* Display mode - paragraph */
                    <p className={`text-[15px] ml-1 font-medium leading-normal hover:bg-muted/50 rounded px-2 py-1 transition-colors ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                        } ${todoIsOverdue && !todo.completed ? 'text-red-500' : ''
                        } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                        }`}>
                        {todo.text}
                    </p>
                )}

                {/* Editing controls that appear on focus */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isEditing
                    ? 'opacity-100 max-h-[350px]'
                    : 'opacity-0 max-h-0 mt-0'
                    }`}>

                    {/* Category selector (always shown when editing) */}
                    <div className="mb-2 mx-1">
                        <CategorySelector
                            value={editCategoryId}
                            onChange={handleCategoryChange}
                            todoLists={todoLists}
                        />
                    </div>

                    {/* Date and priority row */}
                    <div className="flex flex-wrap gap-3 mb-3 mx-1">
                        <DateSelector
                            value={editDueDate}
                            onChange={handleDateChange}
                        />
                        <PrioritySelector
                            value={editPriority}
                            onChange={handlePriorityChange}
                        />
                    </div>

                    {/* Save and Cancel buttons */}
                    <div className="flex gap-2 justify-end my-4 mx-1">
                        <Button
                            variant="outline"
                            onClick={handleCancelChanges}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            disabled={!localText.trim() || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>


                {/* Display-only controls when not focused */}
                <div className={`transition-all duration-300 ease-in-out ${!isEditing && !todo.deleting
                    ? 'opacity-100 mt-1'
                    : 'hidden'
                    }`}>

                    <div className="flex items-center gap-3 ml-3">
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

// Export both for flexibility
export { FocusedEditingTodoItem }
