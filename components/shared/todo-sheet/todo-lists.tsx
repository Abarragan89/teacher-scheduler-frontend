'use client'
import React, { useState, useEffect } from 'react'
import { TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { BareInput } from '@/components/ui/bare-bones-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Circle, Trash2Icon, Plus, EllipsisVertical, BookmarkCheckIcon, Bookmark } from 'lucide-react'
import { TodoState, deleteTodoList, ensureEmptyTodoItem, updateTodoListTitle, handleTodoListTitleBlur, handleTodoListTitleFocus, setDefaultTodoList } from './utils/todo-list-operations'
import {
    updateTodoItem,
    handleTodoFocus,
    handleTodoBlur,
    handleTodoKeyDown,
    toggleTodoCompletion
} from './utils/todo-operations'
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { ResponsiveDialog } from '@/components/responsive-dialog'
import { clientTodoLists } from '@/lib/api/services/todos/client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import { BsFillBookmarkFill } from "react-icons/bs";

interface CurrentListProps {
    lists: TodoList[]
    setLists: React.Dispatch<React.SetStateAction<TodoList[]>>
}

export default function TodoLists({ lists, setLists }: CurrentListProps) {

    const [currentListIndex, setCurrentListIndex] = useState(0);
    const [focusedText, setFocusedText] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [confirmDeleteList, setConfirmDeleteList] = useState<boolean>(false)
    const [isPopOverOpen, setIsPopoverOpen] = useState(false);

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
                    {lists.map((list, index) => (
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

            <Separator className='my-5' />

            {/* Current List Table */}
            <div>
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
                    <Popover open={isPopOverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger>
                            <EllipsisVertical size={16} className="text-muted-foreground cursor-pointer" />
                        </PopoverTrigger>
                        {confirmDeleteList ? (
                            <PopoverContent className="flex flex-col gap-y-2 mr-5 px-5 z-50 bg-background border shadow-lg rounded-lg">
                                <p className="text-sm text-destructive mb-4">Are you sure you want to delete this list?</p>
                                <div className="flex-center gap-x-5 mb-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmDeleteList(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            deleteTodoList(currentList.id, state, currentListIndex)
                                            setConfirmDeleteList(false)
                                            setIsPopoverOpen(false)
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </PopoverContent>
                        ) : (
                            <PopoverContent className="w-fit flex flex-col gap-y-1 p-3 px-6 mr-5 z-50 bg-background border shadow-lg rounded-lg">
                                <Button
                                    onClick={() => setDefaultTodoList(currentList.id, state)}
                                    variant={"ghost"}
                                >
                                    <Bookmark /> Make Default
                                </Button>
                                <Button
                                    variant='ghost'
                                    className='text-destructive hover:text-destructive'
                                    onClick={() => setConfirmDeleteList(true)}
                                >
                                    <Trash2Icon size={14} /> Delete
                                </Button>
                            </PopoverContent>
                        )}
                    </Popover>
                </div>

                {/* Table Row Data (TODO Lists) */}
                <Table className='mt-4'>
                    <TableBody>
                        {currentList.todos.map(todo => (
                            <TableRow key={todo.id}>
                                <TableCell className="pt-[5px] w-5 align-top">
                                    <button
                                        onClick={() => toggleTodoCompletion(currentList.id, todo.id, state)}
                                        className="flex-shrink-0 rounded transition-colors"
                                    >
                                        {todo.completed ? (
                                            <CheckCircle className="w-5 h-5 text-ring" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </button>
                                </TableCell>
                                <TableCell className="p-1 align-top">
                                    <BareInput
                                        className={`w-full text-md bg-transparent border-none p-0
                                            ${todo.completed ? 'line-through text-muted-foreground' : ''} 
                                        `}
                                        placeholder="Add todo..."
                                        value={todo.text}
                                        onChange={(e) => updateTodoItem(currentList.id, todo.id, e.target.value, state)}
                                        onKeyDown={(e) => handleTodoKeyDown(e, currentList.id, todo.id, state)}
                                        onBlur={() => handleTodoBlur(currentList.id, todo.id, todo.text, todo.completed, todo.priority, state)}
                                        onFocus={() => handleTodoFocus(currentList.id, todo.id, state)}
                                        data-todo-id={todo.id}
                                    />
                                    {!todo.id.startsWith("temp-") && (
                                        <div className="flex-between text-muted-foreground opacity-70 text-xs my-1">
                                            {/* Due Date Popover */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <p
                                                        className="h-auto p-0 text-xs font-normal text-muted-foreground hover:cursor-pointer hover:text-foreground"
                                                    >
                                                        Due: 12/4/10 @ 1:45pm
                                                    </p>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[290px] p-2 mr-7" align="start">
                                                    <div className="space-y-1">
                                                        <Calendar
                                                            mode="single"
                                                            selected={new Date()}
                                                            onSelect={(date) => {
                                                                // TODO: Handle date selection
                                                                console.log('Selected date:', date)
                                                            }}
                                                            captionLayout='dropdown'
                                                            className="w-full bg-transparent pt-1"
                                                        />
                                                        <div className="flex-center mx-auto gap-x-4">
                                                            <Input
                                                                id="time"
                                                                type="time"
                                                                aria-label='Set due time'
                                                                defaultValue="13:45"
                                                                className="w-fit my-3"
                                                            />
                                                            <Button size="sm">
                                                                Set Due Date
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                            {/* Priority Popover */}
                                            <Popover>
                                                <PopoverTrigger asChild>

                                                    <BsFillBookmarkFill
                                                        className='hover:text-foreground cursor-pointer'
                                                        size={15} />
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48" align="end">
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm mb-3">Set Priority</h4>
                                                        <div className="space-y-1">
                                                            {[
                                                                { level: 'high', label: 'High Priority', color: 'text-red-500', bgColor: 'hover:bg-red-50' },
                                                                { level: 'medium', label: 'Medium Priority', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50' },
                                                                { level: 'low', label: 'Low Priority', color: 'text-blue-500', bgColor: 'hover:bg-blue-50' },
                                                                { level: 'none', label: 'No Priority', color: 'text-muted-foreground', bgColor: 'hover:bg-muted/50' }
                                                            ].map(({ level, label, color, bgColor }) => (
                                                                <Button
                                                                    key={level}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className={`w-full justify-start ${bgColor} ${color}`}
                                                                    onClick={() => {
                                                                        // TODO: Handle priority selection
                                                                        console.log('Selected priority:', level)
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${level === 'high' ? 'bg-red-500' :
                                                                            level === 'medium' ? 'bg-yellow-500' :
                                                                                level === 'low' ? 'bg-blue-500' :
                                                                                    'bg-muted-foreground'
                                                                            }`} />
                                                                        {label}
                                                                    </div>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
