'use client'
import React, { useEffect, useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { BareInput } from '@/components/ui/bare-bones-input'
import { Button } from '@/components/ui/button'
import { TodoList } from '@/types/todo'
import { TodoState } from './utils/todo-list-operations'
import {
    addNewTodoList,
    deleteTodoList,
    updateTodoListTitle,
    handleTodoListTitleBlur,
    handleTodoListTitleFocus
} from './utils/todo-list-operations'
import TodoItem from './todo-input'
import { Trash2, Plus } from 'lucide-react'
import { clientTodoLists } from '@/lib/api/services/todos/client'
import { todo } from 'node:test'
import { CurrentList } from './current-list'

export function TodoAccordion() {
    // Initialize with one empty list
    const [todoLists, setTodoLists] = useState<TodoList[]>([
        {
            id: `temp-list-${Date.now()}`,
            listName: 'Untitled List',
            todos: [{
                id: `temp-todo-${Date.now()}`,
                text: '',
                completed: false,
            }],
        }
    ])

    useEffect(() => {
        async function fetchTodoLists() {
            const lists = await clientTodoLists.getTodoLists();
            if (lists.length > 0) {
                setTodoLists(lists);
            }
        }
        fetchTodoLists();
    }, [])

    const [openAccordions, setOpenAccordions] = useState<string[]>([todoLists[0]?.id].filter(Boolean))
    const [focusedText, setFocusedText] = useState<string>('')

    const state: TodoState = {
        todoLists,
        setTodoLists,
        openAccordions,
        setOpenAccordions,
        focusedText,
        setFocusedText,
    }

    return (
        <div className="w-full">
            {/* Add New List Button */}
            <Button
                onClick={() => addNewTodoList(state)}
                variant="link"
                className="absolute top-0 right-0 mt-2 mr-2"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add New List
            </Button>
            <div className='grid grid-cols-3 gap-2'>
                {todoLists.map(list => (
                    <Button>
                        {list.listName}
                    </Button>
                ))}
            </div>
            
            <CurrentList 
                list={todoLists[0]}
            />


            {/* <Accordion
                type="multiple"
                className="w-full"
                value={openAccordions}
                onValueChange={setOpenAccordions}
            >
                {todoLists.map(list => (
                    <AccordionItem
                        key={list.id}
                        value={list.id}
                    >
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                                <BareInput
                                    className="text-left font-bold bg-transparent border-none p-0 flex-1"
                                    value={list.listName}
                                    onChange={(e) => updateTodoListTitle(list.id, e.target.value, state)}
                                    onBlur={() => handleTodoListTitleBlur(list.id, list.listName, state)}
                                    onFocus={() => handleTodoListTitleFocus(list.id, state)}
                                    placeholder="List Title"
                                    onClick={(e) => e.stopPropagation()}
                                />

                                <Trash2
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteTodoList(list.id, state)
                                    }}
                                    className="w-4 h-4 text-muted-foreground hover:text-destructive"
                                />
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="pb-4">
                            <div className="space-y-2">
                                {list.todos.map(todo => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        listId={list.id}
                                        state={state}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion> */}
        </div>
    )
}
