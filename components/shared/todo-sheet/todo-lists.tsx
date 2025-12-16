'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useQueryClient } from "@tanstack/react-query"
import { TodoItem, TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { BareInput } from '@/components/ui/bare-bones-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, BookmarkCheckIcon, Circle } from 'lucide-react'
import { TodoState, updateTodoListTitle, handleTodoListTitleBlur, handleTodoListTitleFocus } from './utils/todo-list-operations'
import { getSortFunction, SortBy } from './utils/todo-sorting'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { clientTodoLists } from '@/lib/api/services/todos/client'
import EditListPopover from './popovers/edit-list-popover'
import TodoListItem from './todo-list-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@radix-ui/react-select'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import AddTodoListForm from '@/components/forms/add-todolist-form'
import { clientTodo } from '@/lib/api/services/todos/client'
import AddTodoForm from '@/components/forms/add-todo-form.tsx'

interface CurrentListProps {
    todoLists: TodoList[]
}

export default function TodoLists({ todoLists }: CurrentListProps) {
    const queryClient = useQueryClient()

    const [currentListIndex, setCurrentListIndex] = useState(0);
    const [focusedText, setFocusedText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [sortBy, setSortBy] = useState<'priority' | 'due-date' | 'created'>('created');
    const [showAddTodoForm, setShowAddTodoForm] = useState<boolean>(false);
    const [newTodoText, setNewTodoText] = useState<string>('');
    const [isAddingTodo, setIsAddingTodo] = useState<boolean>(false);
    const [showEditTodoModal, setShowEditTodoModal] = useState(false);
    const [currentTodo, setCurrentTodo] = useState<TodoItem | null>(null);
    const [listId, setListId] = useState<string>('');

    // Ref for managing textarea auto-resize
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
    const addTodoInputRef = useRef<HTMLInputElement>(null)

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

    const showEditModalHandler = (todo: TodoItem) => {
        setCurrentTodo(todo);
        setListId(findListIdForTodo(todo.id) || '');
        setShowEditTodoModal(true)
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

    const addTodoItem = async () => {
        if (!newTodoText.trim() || isAddingTodo) return

        setIsAddingTodo(true)
        try {
            // Create the todo using the API
            const newTodo = await clientTodo.createTodoItem(
                currentList.id,
                newTodoText.trim(),
                '', // No due date for simple add
                1   // Default priority
                
            )

            // Update React Query cache
            queryClient.setQueryData(['todos'], (oldData: TodoList[]) => {
                if (!oldData) return oldData

                return oldData.map(list => {
                    if (list.id === currentList.id) {
                        return {
                            ...list,
                            todos: [newTodo, ...list.todos] // Add to top
                        }
                    }
                    return list
                })
            })

            // Reset form and maintain focus
            setNewTodoText('')

            // Keep focus on input for continuous adding
            setTimeout(() => {
                addTodoInputRef.current?.focus()
            }, 0)
        } catch (error) {
            console.error('Failed to create todo:', error)
        } finally {
            setIsAddingTodo(false)
        }
    }

    const findListIdForTodo = (todoId: string) => {
        const todoLists = queryClient.getQueryData(['todos']) as any[]
        if (!todoLists) return null

        for (const list of todoLists) {
            if (list.todos.some((todo: any) => todo.id === todoId)) {
                return list.id
            }
        }
        return null
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
                        <Label className="text-xs text-muted-foreground">Sort by:</Label>
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


                <div className='mt-2 flex items-start gap-1 border-b pb-3 mb-2 border-dashed border-muted-foreground/40'>
                    {/* Ghost Checkbox */}
                    <div className="flex-shrink-0">
                        <Circle className="w-5 h-5 text-muted-foreground/50" />
                    </div>

                    {showAddTodoForm ? (
                        /* Expanded input form */
                        <input
                            ref={addTodoInputRef}
                            className="w-full px-2 leading-normal text-[15px] bg-transparent border-none  border-muted resize-none overflow-hidden focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
                            placeholder="Add todo..."
                            value={newTodoText}
                            onChange={(e) => setNewTodoText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setShowAddTodoForm(false)
                                    setNewTodoText('')
                                }
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    addTodoItem()
                                }
                            }}
                            onBlur={() => {
                                if (newTodoText.trim()) {
                                    addTodoItem()
                                } else {
                                    setShowAddTodoForm(false)
                                }
                            }}
                            disabled={isAddingTodo}
                            autoFocus
                        />
                    ) : (
                        /* Ghost state */
                        <p
                            className="text-[15px] w-full font-medium leading-normal rounded px-2 transition-colors text-muted-foreground/60 hover:cursor-text"
                            onClick={() => setShowAddTodoForm(true)}
                        >
                            Add todo...
                        </p>
                    )}
                </div>



                {/* Flexbox Layout for TODO Lists */}
                <ScrollArea className="h-[calc(100vh-330px)] w-full">
                    <div className="space-y-0 mr-3 transition-all duration-300 ease-in-out">
                        {/* Dont' show recurring todos in the recurring sheet */}
                        {sortedCurrentList.todos.filter(todo => !todo.isRecurring).map(todo => (
                            <TodoListItem
                                key={todo.id}
                                todo={todo}
                                context='todosheet'
                                listId={currentList.id}
                                onEdit={() => showEditModalHandler(todo)}
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