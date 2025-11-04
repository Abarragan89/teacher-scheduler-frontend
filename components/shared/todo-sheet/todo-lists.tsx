'use client'
import React, { useState, useEffect } from 'react'
import { useQueryClient } from "@tanstack/react-query"
import { TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { BareInput } from '@/components/ui/bare-bones-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Circle, Plus, BookmarkCheckIcon } from 'lucide-react'
import { TodoState, ensureEmptyTodoItem, updateTodoListTitle, handleTodoListTitleBlur, handleTodoListTitleFocus } from './utils/todo-list-operations'
import {
    updateTodoItem,
    handleTodoFocus,
    handleTodoBlur,
    handleTodoKeyDown,
    toggleTodoCompletion
} from './utils/todo-operations'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { clientTodoLists } from '@/lib/api/services/todos/client'
import EditListPopover from './popovers/edit-list-popover'
import DueDatePopover from './popovers/due-date-popover'
import PriorityPopover from './popovers/priority-popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import useSound from 'use-sound';

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
    const [lists, setLists] = useState<TodoList[]>(todoLists);

    // Sync local state with React Query updates
    useEffect(() => {
        setLists(todoLists);
    }, [todoLists]);

    // Ensure current index is within bounds
    useEffect(() => {
        if (currentListIndex >= lists.length && lists.length > 0) {
            setCurrentListIndex(0)
        }
    }, [lists.length, currentListIndex])

    const currentList = lists[currentListIndex]

    // Ensure there's always an empty todo at the end of the current list
    useEffect(() => {
        if (currentList) {
            const updatedTodos = [...currentList.todos]
            ensureEmptyTodoItem(updatedTodos)

            if (updatedTodos.length !== currentList.todos.length) {
                setLists(prev =>
                    prev.map(list =>
                        list.id === currentList.id
                            ? { ...list, todos: updatedTodos }
                            : list
                    )
                )
            }
        }
    }, [currentList?.todos.length, currentList?.id])

    // Create state object for todo operations
    const state: TodoState = {
        todoLists: lists,
        setTodoLists: setLists,
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

            // Update local state
            setLists(prev => [...prev, newList])

            // Select the new list
            setCurrentListIndex(lists.length)

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

    if (!currentList || lists.length === 0) {
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
        <div className="space-y-4">
            {/* List Selection Buttons */}
            <div className="space-y-2 mt-5">
                <div className="flex flex-wrap gap-2">
                    {lists.sort((a: TodoList, b: TodoList) => {
                        if (a.isDefault && !b.isDefault) return -1
                        if (!a.isDefault && b.isDefault) return 1
                        return 0  // Preserve existing order if both have same isDefault value
                    }).map((list, index) => (
                        <Button
                            key={list.id}
                            variant={currentListIndex === index ? "default" : "secondary"}
                            size="sm"
                            onClick={() => handleListSelect(index)}
                            className="text-sm border"
                        >
                            {list.listName}
                            {list.isDefault && <BookmarkCheckIcon className="w-4 h-4 ml-1" />}
                        </Button>
                    ))}

                    {/* Add New List Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-sm border-dashed text-muted-foreground hover:text-foreground"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        New List
                    </Button>
                </div>
            </div>

            {/* Current List Table */}
            <div className='mt-6'>
                <div className="flex-between">
                    <BareInput
                        className="font-bold text-lg md:text-xl bg-transparent border-none p-0"
                        value={currentList.listName}
                        onChange={(e) => updateTodoListTitle(currentList.id, e.target.value, state)}
                        onBlur={() => handleTodoListTitleBlur(currentList.id, currentList.listName, state)}
                        onFocus={() => handleTodoListTitleFocus(currentList.id, state)}
                        placeholder="List Name"
                    />

                    {/* Popover for editing the list */}
                    <EditListPopover
                        currentListId={currentList.id}
                        currentListIndex={currentListIndex}
                        state={state}
                    />
                </div>
                {/* <form>
                    <Label htmlFor="listName">New Todo</Label>
                </form> */}
                {/* Flexbox Layout for TODO Lists */}
                <ScrollArea className="h-[calc(100vh-250px)] w-full">
                    <div className="mt-4 space-y-0 transition-all duration-300 ease-in-out ml-1 mr-2">
                        {currentList.todos.map(todo => (
                            <div
                                key={todo.id}
                                className={`flex items-start border-b gap-3 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
                                    ? 'opacity-0 scale-95 -translate-y-1'
                                    : 'opacity-100 scale-100 translate-y-0'
                                    }`}
                                style={{
                                    // Remove fixed height, let content determine height
                                    height: todo.deleting ? '0px' : 'auto',
                                    minHeight: todo.deleting ? '0px' : '60px',
                                    paddingTop: todo.deleting ? '0px' : '8px',
                                    paddingBottom: todo.deleting ? '0px' : '8px',
                                    transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                                    transformOrigin: 'top center'
                                }}
                            >
                                {/* Checkbox */}
                                <div className={`flex-shrink-0 pt-1 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-75 opacity-0' : 'transform scale-100 opacity-100'
                                    }`}>
                                    <button
                                        onClick={() => toggleTodoCompletion(currentList.id, todo.id, state, playCompleteSound, playTodoRemovedSound, queryClient)}
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
                                <div className={`flex-1 min-w-0 py-1 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
                                    }`}>
                                    <textarea
                                        ref={(textarea) => {
                                            if (textarea) {
                                                // Auto-resize on mount/render
                                                textarea.style.height = 'auto'
                                                textarea.style.height = `${textarea.scrollHeight}px`
                                            }
                                        }}
                                        className={`w-full text-[15px] bg-transparent border-none resize-none overflow-hidden transition-all duration-500 focus:outline-none ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                                            } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                                            }`}
                                        placeholder="Add todo..."
                                        value={todo.text}
                                        onChange={(e) => {
                                            // Auto-resize the textarea
                                            const target = e.target as HTMLTextAreaElement
                                            target.style.height = 'auto'
                                            target.style.height = `${target.scrollHeight}px`

                                            updateTodoItem(currentList.id, todo.id, e.target.value, state)
                                        }}
                                        onKeyDown={(e) => handleTodoKeyDown(e, currentList.id, todo.id, state)}
                                        onBlur={() => handleTodoBlur(currentList.id, todo.id, todo.text, todo.completed, todo.priority, state, queryClient)}
                                        onFocus={(e) => {
                                            // Auto-resize on focus too
                                            const target = e.target as HTMLTextAreaElement
                                            target.style.height = 'auto'
                                            target.style.height = `${target.scrollHeight}px`

                                            handleTodoFocus(currentList.id, todo.id, state)
                                        }}
                                        data-todo-id={todo.id}
                                        disabled={todo.deleting}
                                        rows={1}
                                        style={{
                                            minHeight: 'fit-content',
                                            lineHeight: '1.25',
                                        }}
                                    />
                                    {!todo.id.startsWith("temp-") && !todo.deleting && (
                                        <div className="flex justify-between text-muted-foreground opacity-70 text-xs">
                                            {/* Due Date Popover */}
                                            <DueDatePopover
                                                todo={todo}
                                                state={state}
                                            />

                                            {/* Priority Popover */}
                                            <PriorityPopover
                                                todo={todo}
                                                state={state}
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
