'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useQueryClient } from "@tanstack/react-query"
import { TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { BareInput } from '@/components/ui/bare-bones-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Circle, Plus, BookmarkCheckIcon, SendHorizonal } from 'lucide-react'
import { TodoState, updateTodoListTitle, handleTodoListTitleBlur, handleTodoListTitleFocus } from './utils/todo-list-operations'
import {
    updateTodoItem,
    handleTodoFocus,
    handleTodoBlur,
    toggleTodoCompletion,
    addTodoItem
} from './utils/todo-operations'
import { getSortFunction, SortBy } from './utils/todo-sorting'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { clientTodoLists } from '@/lib/api/services/todos/client'
import EditListPopover from './popovers/edit-list-popover'
import DueDatePopover from './popovers/due-date-popover'
import PriorityPopover from './popovers/priority-popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import useSound from 'use-sound';
import { Separator } from '@radix-ui/react-select'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

interface CurrentListProps {
    todoLists: TodoList[]
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

                {/* Make a simple form to add another todo to this list */}
                <div className="flex items-stretch gap-3 my-3 rounded-lg shadow-lg">
                    {/* Input that matches textarea styling */}
                    <div className="flex-1 flex min-w-0 rounded-tl-lg ">
                        <textarea
                            className=" w-full p-2 px-4 h-auto text-md leading-normal bg-transparent border rounded-tl-lg rounded-bl-lg border-r-0 resize-none overflow-hidden focus:outline-none placeholder:text-muted-foreground/60"
                            placeholder="Add new todo..."
                            rows={1}
                            value={newTodoText}
                            ref={newTodoTextareaRef}
                            style={{
                                wordWrap: 'break-word',
                                whiteSpace: 'pre-wrap'
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    addTodoItem(currentList.id, newTodoText, '', 1, queryClient, setNewTodoText, newTodoTextareaRef)
                                }
                            }}
                            onChange={(e) => {
                                setNewTodoText(e.target.value)
                                const textarea = e.target as HTMLTextAreaElement
                                textarea.style.height = `${textarea.scrollHeight + 2}px`
                            }}
                        />

                        <Button
                            onClick={() => addTodoItem(currentList.id, newTodoText, '', 1, queryClient, setNewTodoText, newTodoTextareaRef)}
                            className='h-auto rounded-l-none flex-shrink-0 shadow-none'
                            variant={'outline'}
                        >
                            <SendHorizonal />
                        </Button>
                    </div>
                </div>

                {/* Flexbox Layout for TODO Lists */}
                <ScrollArea className="h-[calc(100vh-330px)] w-full">
                    <div className="space-y-0 transition-all duration-300 ease-in-out ml-1 mr-3">
                        {sortedCurrentList.todos.map(todo => (
                            <div
                                key={todo.id}
                                className={`flex items-start border-b gap-3 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
                                    ? 'opacity-0 scale-95 -translate-y-1'
                                    : todo.isNew
                                        ? 'animate-slide-in-from-top'
                                        : todo.slideDown
                                            ? 'animate-slide-down'
                                            : 'opacity-100 scale-100 translate-y-0'
                                    }`}
                                style={{
                                    // Remove fixed height, let content determine height
                                    height: todo.deleting ? '0px' : 'auto',
                                    minHeight: todo.deleting ? '0px' : '60px',
                                    paddingTop: todo.deleting ? '0px' : '4px',
                                    paddingBottom: todo.deleting ? '0px' : '4px',
                                    transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    transformOrigin: 'top center',
                                    // Animation for new items
                                    ...(todo.isNew && {
                                        animation: 'slideInFromTop 300ms ease-out forwards'
                                    }),
                                    // Animation for existing items sliding down
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
                                        onClick={() => toggleTodoCompletion(currentList.id, todo.id, playCompleteSound, playTodoRemovedSound, queryClient)}
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
                                            updateTodoItem(currentList.id, todo.id, currentText, queryClient)
                                            handleTodoBlur(currentList.id, todo.id, currentText, state, queryClient)
                                        }}
                                        onFocus={(e) => {
                                            const textarea = e.target as HTMLTextAreaElement
                                            resizeTextarea(textarea)
                                            handleTodoFocus(currentList.id, todo.id, state, queryClient)
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
                                    {!todo.id.startsWith("temp-") && !todo.deleting && (
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
                        ))}
                    </div>
                </ScrollArea>
            </div>
            {/* Responsive Dialog for Creating New List */}
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
