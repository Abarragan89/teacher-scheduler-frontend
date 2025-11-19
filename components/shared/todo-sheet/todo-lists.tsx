'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useQueryClient } from "@tanstack/react-query"
import { TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { BareInput } from '@/components/ui/bare-bones-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Circle, Plus, BookmarkCheckIcon, Flag, CalendarIcon, ChevronDown } from 'lucide-react'
import { TodoState, updateTodoListTitle, handleTodoListTitleBlur, handleTodoListTitleFocus } from './utils/todo-list-operations'
import { getSortFunction, SortBy } from './utils/todo-sorting'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { clientTodoLists } from '@/lib/api/services/todos/client'
import { clientTodo } from '@/lib/api/services/todos/client'
import EditListPopover from './popovers/edit-list-popover'
import TodoListItem from './todo-list-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import useSound from 'use-sound';
import { Separator } from '@radix-ui/react-select'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import AddTodoListForm from '@/components/forms/add-todolist-form'

interface CurrentListProps {
    todoLists: TodoList[]
}

// Ghost Todo Item Component for Adding New Todos
interface AddTodoItemProps {
    listId: string
    todoLists: TodoList[]
}

function AddTodoItem({ listId, todoLists }: AddTodoItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [newTodoText, setNewTodoText] = useState('')
    const [newTodoPriority, setNewTodoPriority] = useState(1)
    const [newTodoDueDate, setNewTodoDueDate] = useState<Date | null>(null)
    const [newTodoCategory, setNewTodoCategory] = useState(listId)
    const [isSaving, setIsSaving] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [time, setTime] = useState<string>('07:00')
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState<boolean>(false)
    const queryClient = useQueryClient()

    // Helper function to combine date and time
    function combineDateAndTime(date: Date | null, time: string): string | null {
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

    // Auto-resize textarea
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node

            // Don't close if clicking on dropdowns/popovers
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
                handleCancel()
            }
        }

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isExpanded])

    // Scroll into view when expanded (mobile friendly)
    useEffect(() => {
        if (isExpanded && containerRef.current) {
            const isMobile = window.innerWidth < 768

            if (isMobile) {
                setTimeout(() => {
                    const buttonsContainer = containerRef.current?.querySelector('.flex.gap-2.justify-end') as HTMLElement
                    if (buttonsContainer) {
                        buttonsContainer.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        })
                        window.scrollBy(0, 100)
                    }
                }, 200)
            }
        }
    }, [isExpanded])

    const handleSave = async () => {
        if (!newTodoText.trim()) return

        setIsSaving(true)
        try {
            // Helper function to combine date and time
            const combineDateAndTime = (date: Date | null): string | null => {
                if (!date) return null
                const combined = new Date(date)
                combined.setHours(12, 0, 0, 0) // Default to noon
                return combined.toISOString()
            }

            const dueDateISO = combineDateAndTime(newTodoDueDate)

            // Create the todo using the same API as TodoListItem
            const newTodo = await clientTodo.createTodoItem(
                newTodoCategory,
                newTodoText.trim(),
                dueDateISO || '',
                newTodoPriority
            )

            // Update React Query cache
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData

                return oldData.map(list => {
                    if (list.id === newTodoCategory) {
                        return {
                            ...list,
                            todos: [newTodo, ...list.todos] // Add to top
                        }
                    }
                    return list
                })
            })

            // Reset form but keep it expanded
            setNewTodoText('')
            setNewTodoPriority(1)
            setNewTodoDueDate(null)
            setTime('07:00')
            setIsDatePopoverOpen(false)
            // Keep category as current listId and form expanded
            setNewTodoCategory(listId)

            // Focus textarea for next todo
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 100)
        } catch (error) {
            console.error('Failed to create todo:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setIsExpanded(false)
        setNewTodoText('')
        setNewTodoPriority(1)
        setNewTodoDueDate(null)
        setNewTodoCategory(listId)
    }

    const handleExpand = () => {
        setIsExpanded(true)
        // Focus textarea after it becomes visible
        setTimeout(() => {
            textareaRef.current?.focus()
        }, 100)
    }

    return (
        <div
            ref={containerRef}
            className=" mt-2 flex items-start gap-1 border-b pb-3 mb-2 border-dashed border-muted-foreground/40"
        >
            {/* Ghost Checkbox */}
            <div className="flex-shrink-0 pt-1">
                <Circle className="w-5 h-5 text-muted-foreground/50" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-[2px]">
                {isExpanded ? (
                    /* Expanded form - similar to TodoListItem editing mode */
                    <textarea
                        ref={textareaRef}
                        className="w-full min-h-[24px] px-2 ml-1 leading-normal text-[15px] bg-transparent border-b-2 border-muted py-1 pb-[2px] resize-none overflow-hidden transition-all duration-500 focus:outline-none focus:ring-0 focus:ring-ring placeholder:text-muted-foreground/60"
                        placeholder="Add todo..."
                        value={newTodoText}
                        onChange={(e) => {
                            const textarea = e.target as HTMLTextAreaElement
                            resizeTextarea(textarea)
                            setNewTodoText(e.target.value)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                handleCancel()
                            }
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSave()
                            }
                        }}
                        rows={1}
                        style={{
                            lineHeight: '1.5',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap'
                        }}
                        autoFocus
                    />
                ) : (
                    /* Ghost state - looks like a todo */
                    <p
                        className="text-sm font-medium leading-normal hover:bg-muted/50 rounded px-2 py-1 -my-1 transition-colors text-muted-foreground/60 cursor-pointer"
                        onClick={handleExpand}
                    >
                        Add todo...
                    </p>
                )}

                {/* Expanded controls - same as TodoListItem */}
                {isExpanded && (
                    <div className="transition-all duration-300 ease-in-out opacity-100 max-h-[350px] mt-2">
                        {/* Category selector */}
                        <div className="mb-2">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Category</label>
                                <Select value={newTodoCategory} onValueChange={setNewTodoCategory}>
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
                        </div>

                        {/* Date and priority row */}
                        <div className="flex flex-wrap gap-4 mb-3">
                            {/* Date selector with calendar popup */}
                            <div className="space-y-1 min-w-[170px] flex-2">
                                <label className="text-xs text-muted-foreground">Due Date</label>
                                <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full h-8 justify-start text-left font-normal text-xs"
                                            type="button"
                                        >
                                            <CalendarIcon className="h-3 w-3 mr-2" />
                                            {newTodoDueDate ? formatDisplayDate(newTodoDueDate, true) : "Select date"}
                                            <ChevronDown className="ml-auto h-3 w-3" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-4" align="start">
                                        <div className="space-y-4">
                                            <div className='w-[255px] mx-auto min-h-[330px]'>
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={newTodoDueDate || undefined}
                                                    onSelect={(date) => setNewTodoDueDate(date || null)}
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
                                                    size="sm"
                                                >
                                                    Done
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Priority selector */}
                            <div className="space-y-1 min-w-[125px] flex-1">
                                <label className="text-xs text-muted-foreground">Priority</label>
                                <Select value={newTodoPriority.toString()} onValueChange={(val) => setNewTodoPriority(Number(val))}>
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue placeholder="Select priority..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            <div className="flex items-center gap-2">
                                                <Flag className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">No Priority</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="2">
                                            <div className="flex items-center gap-2">
                                                <Flag className="w-3 h-3 text-blue-500" />
                                                <span className="text-blue-500">Low</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="3">
                                            <div className="flex items-center gap-2">
                                                <Flag className="w-3 h-3 text-yellow-500" />
                                                <span className="text-yellow-500">Medium</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="4">
                                            <div className="flex items-center gap-2">
                                                <Flag className="w-3 h-3 text-red-500" />
                                                <span className="text-red-500">High</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Save and Cancel buttons */}
                        <div className="flex gap-2 justify-end my-4">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!newTodoText.trim() || isSaving}
                            >
                                {isSaving ? 'Adding...' : 'Add Todo'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function TodoLists({ todoLists }: CurrentListProps) {
    const queryClient = useQueryClient()

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', {
        volume: 0.3
    });

    const [currentListIndex, setCurrentListIndex] = useState(0);
    const [focusedText, setFocusedText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newTodoText, setNewTodoText] = useState('');
    const [localTodoTexts, setLocalTodoTexts] = useState<Record<string, string>>({});
    const [sortBy, setSortBy] = useState<'priority' | 'due-date' | 'created'>('created');
    const newTodoTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [showAddTodoForm, setShowAddTodoForm] = useState(false);

    // Ref for managing textarea auto-resize
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

    // Auto-resize function for textareas
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Ensure current index is within bounds
    useEffect(() => {
        if (currentListIndex >= todoLists.length && todoLists.length > 0) {
            setCurrentListIndex(0)
        }
    }, [todoLists.length, currentListIndex])

    const currentList = todoLists[currentListIndex]

    // Use the memoized sort function from utils
    const sortFunction = useMemo(() => getSortFunction(sortBy as SortBy), [sortBy])

    // Memoize the sorted current list
    const sortedCurrentList = useMemo(() => {
        if (!currentList) return currentList
        return {
            ...currentList,
            todos: sortFunction(currentList.todos)
        }
    }, [currentList, sortFunction])


    // Create state object for todo operations
    const state: TodoState = {
        todoLists,
        focusedText,
        setFocusedText,
        setCurrentListIndex
    }

    const handleListSelect = (index: number) => {
        setCurrentListIndex(index)
    }

    const handleCreateList = async () => {
        if (!newListName.trim()) return

        setIsCreating(true)
        try {
            // Create list on backend
            const newList = await clientTodoLists.createTodoList(newListName.trim())

            // Update React Query cache
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return [newList]
                return [...oldData, newList]
            })

            // Select the new list
            setCurrentListIndex(todoLists.length)

            // Close modal and reset form
            setIsModalOpen(false)
            setNewListName('')
        } catch (error) {
            console.error('Failed to create todo list:', error)
            // You might want to show a toast notification here
        } finally {
            setIsCreating(false)
        }
    }

    if (!currentList || todoLists.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground space-y-4">
                <p>No todo lists available</p>
                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First List
                </Button>
                <ResponsiveDialog
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    title="Create New List"
                    description="Enter a name for your new todo list."
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="listName">List Name</Label>
                            <Input
                                id="listName"
                                placeholder="Enter list name..."
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newListName.trim()) {
                                        handleCreateList()
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsModalOpen(false)
                                    setNewListName('')
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateList}
                                disabled={!newListName.trim() || isCreating}
                            >
                                {isCreating ? 'Creating...' : 'Create List'}
                            </Button>
                        </div>
                    </div>
                </ResponsiveDialog>
            </div>
        )
    }

    const handleListCreated = (newListIndex: number) => {
        setCurrentListIndex(newListIndex)
    }

    return (
        <div className="space-y-4 mt-4">

            <div className="w-full">
                {/* The Carousel itself */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                        skipSnaps: true,
                        dragFree: true,
                        slidesToScroll: 2,
                    }}
                >
                    <CarouselContent>
                        {todoLists.sort((a: TodoList, b: TodoList) => {
                            if (a.isDefault && !b.isDefault) return -1
                            if (!a.isDefault && b.isDefault) return 1
                            return 0  // Preserve existing order if both have same isDefault value
                        }).map((list, index) => (
                            <CarouselItem
                                key={index}
                                className="basis-auto"
                            >
                                <Button
                                    key={list.id}
                                    variant={currentListIndex === index ? "default" : "secondary"}
                                    size="sm"
                                    onClick={() => handleListSelect(index)}
                                    className="text-sm border shrink-0"
                                >
                                    {list.listName}
                                    {list.isDefault && <BookmarkCheckIcon className="w-4 h-4" />}
                                </Button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {/* Buttons Underneath, Right-Aligned */}
                    <div className="flex-between mt-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-sm border-dashed text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            New List
                        </Button>
                        <div className='space-x-5'>
                            <CarouselPrevious className="static translate-y-0 translate-x-0" />
                            <CarouselNext className="static translate-y-0 translate-x-0" />
                        </div>
                    </div>
                </Carousel>
            </div>

            <Separator />
            {/* Current List Table */}
            <div className='mt-9'>
                <div className="flex-between">
                    <BareInput
                        className="font-bold text-lg md:text-xl bg-transparent border-none p-0"
                        value={currentList.listName}
                        onChange={(e) => updateTodoListTitle(currentList.id, e.target.value, state, queryClient)}
                        onBlur={() => handleTodoListTitleBlur(currentList.id, currentList.listName, state, queryClient)}
                        onFocus={() => handleTodoListTitleFocus(currentList.id, state)}
                        placeholder="List Name"
                    />

                    {/* Popover for editing the list */}
                    <EditListPopover
                        currentListId={currentList.id}
                        currentListIndex={currentListIndex}
                        state={state}
                        queryClient={queryClient}
                    />
                </div>

                {/* Sort Buttons */}
                <div className="flex-between">
                    <div className='flex items-center gap-x-3'>
                        <Label className="text-sm text-muted-foreground">Sort by:</Label>
                        <Button
                            onClick={() => setSortBy('created')}
                            className={`hover:cursor-pointer p-0 font-bold
                            ${sortBy === 'created' ? '' : 'text-muted-foreground'}    
                        `}
                            variant={'link'}
                        >
                            Newest
                        </Button>
                        <Button
                            onClick={() => setSortBy('priority')}
                            className={`hover:cursor-pointer p-0 font-bold
                            ${sortBy === 'priority' ? '' : 'text-muted-foreground'}    
                        `}
                            variant={'link'}
                        >
                            Priority
                        </Button>
                        <Button
                            onClick={() => setSortBy('due-date')}
                            className={`hover:cursor-pointer p-0 font-bold
                            ${sortBy === 'due-date' ? '' : 'text-muted-foreground'}    
                        `}
                            variant={'link'}
                        >
                            Due Date
                        </Button>
                    </div>
                </div>

                {/* Add Todo Item - Ghost Todo Style */}
                <AddTodoItem
                    listId={currentList.id}
                    todoLists={todoLists}
                />




                {/* Flexbox Layout for TODO Lists */}
                <ScrollArea className="h-[calc(100vh-330px)] w-full">
                    <div className="space-y-0 transition-all duration-300 ease-in-out">
                        {sortedCurrentList.todos.map(todo => (
                            <TodoListItem
                                key={todo.id}
                                todo={todo}
                                context='todosheet'
                                listId={currentList.id}
                                onTextareaRef={(todoId, el) => {
                                    textareaRefs.current[todoId] = el
                                }}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>
            {/* Add Todo List Form */}
            <AddTodoListForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onListCreated={handleListCreated}
                todoListsLength={todoLists.length}
            />
        </div>
    )
}

// {/* Make a simple form to add another todo to this list */}
// <div className="flex items-stretch gap-3 my-3 rounded-lg shadow-lg">
//     {/* Input that matches textarea styling */}
//     <div className="flex-1 flex min-w-0 rounded-tl-lg ">
//         <Input
//             className=" w-full p-2 px-4 h-auto text-md leading-normal bg-transparent border rounded-none rounded-tl-lg rounded-bl-lg border-r-0 resize-none overflow-hidden focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
//             placeholder="Add new todo..."
//             value={newTodoText}
//             style={{
//                 wordWrap: 'break-word',
//                 whiteSpace: 'pre-wrap'
//             }}
//             onKeyDown={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault()
//                     addTodoItem(currentList.id, newTodoText, '', 1, queryClient, setNewTodoText, newTodoTextareaRef)
//                 }
//             }}
//             onChange={(e) => {
//                 setNewTodoText(e.target.value)
//             }}
//         />

//         <Button
//             onClick={() => addTodoItem(currentList.id, newTodoText, '', 1, queryClient, setNewTodoText, newTodoTextareaRef)}
//             className='h-auto rounded-l-none flex-shrink-0 shadow-none'
//             variant={'outline'}
//         >
//             <SendHorizonal />
//         </Button>
//     </div>
// </div>
