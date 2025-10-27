'use client'
import React, { useState, useEffect } from 'react'
import { TodoList } from "@/types/todo"
import { Button } from "@/components/ui/button"
import { BareInput } from '@/components/ui/bare-bones-input'
import { CheckCircle, Circle, Trash2Icon } from 'lucide-react'
import { TodoState, deleteTodoList, ensureEmptyTodoItem } from './utils/todo-list-operations'
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
import { clientTodo, clientTodoLists } from '@/lib/api/services/todos/client'

interface CurrentListProps {
    lists: TodoList[]
    setLists: React.Dispatch<React.SetStateAction<TodoList[]>>
}

export default function TodoLists({ lists, setLists }: CurrentListProps) {
    const [currentListIndex, setCurrentListIndex] = useState(0)
    // const [lists, setLists] = useState<TodoList[]>(todoLists)
    const [focusedText, setFocusedText] = useState<string>('')

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
        openAccordions: [], // Not used in single list view
        setOpenAccordions: () => { }, // Not used in single list view
        focusedText,
        setFocusedText
    }

    const handleListSelect = (index: number) => {
        setCurrentListIndex(index)
    }

    if (!currentList || lists.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <p>No todo lists available</p>
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
                            variant={currentListIndex === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleListSelect(index)}
                            className="text-sm"
                        >
                            {list.listName}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Current List Table */}
            <div>
                {/* <h4 className="mt-5 mb-2 font-bold text-center">{currentList.listName}</h4> */}
                <Trash2Icon
                    onClick={() => deleteTodoList(currentList.id, state)}
                />

                <Table className='mt-4'>
                    <TableBody>
                        {currentList.todos.map(todo => (
                            <TableRow key={todo.id}>
                                <TableCell className="w-[20px]">
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
                                <TableCell className="p-2">
                                    <BareInput
                                        className={`w-full text-sm bg-transparent border-none p-0
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
                                </TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
