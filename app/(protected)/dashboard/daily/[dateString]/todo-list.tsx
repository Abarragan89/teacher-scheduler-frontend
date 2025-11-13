'use client'
import React from 'react'
import { useDailyTodos } from '@/lib/hooks/useDailyTodos'
import { useDefaultTodoList } from '@/lib/hooks/useDefaultTodoList'
import { useQueryClient } from '@tanstack/react-query'
import { toggleTodoCompletion, updateTodoItem } from '@/components/shared/todo-sheet/utils/todo-operations'
import AddTodoForm from '@/components/forms/add-todo-form'
import DueDatePopover from '@/components/shared/todo-sheet/popovers/due-date-popover'
import PriorityPopover from '@/components/shared/todo-sheet/popovers/priority-popover'
import useSound from 'use-sound'
import { CheckCircle, Circle } from 'lucide-react'
import { DailyTodoItem } from '@/lib/hooks/useDailyTodos'
import { useState, useEffect, useRef } from 'react'
import { match } from 'assert'
import { ResponsiveDialog } from '@/components/responsive-dialog'

interface TodoListProps {
    dateString: string
}

export default function TodoList({ dateString }: TodoListProps) {

    const timeBlocks = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

    const { todos, isLoading, todosCount } = useDailyTodos(dateString)
    const { defaultListId } = useDefaultTodoList()
    const queryClient = useQueryClient()

    // Local state for textarea content (same as todo-sheet)
    const [localTodoTexts, setLocalTodoTexts] = useState<Record<string, string>>({})
    const [showEditTodoModal, setShowEditTodoModal] = useState(false);
    const [currentTodo, setCurrentTodo] = useState<DailyTodoItem | null>(null);


    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', {
        volume: 0.3
    });


    // Sync local todo texts when todos change (same as todo-sheet)
    useEffect(() => {
        const newLocalTexts: Record<string, string> = {}
        todos?.forEach(todo => {
            if (!localTodoTexts[todo.id]) {
                newLocalTexts[todo.id] = todo.text
            }
        })
        if (Object.keys(newLocalTexts).length > 0) {
            setLocalTodoTexts(prev => ({ ...prev, ...newLocalTexts }))
        }
    }, [todos, localTodoTexts])


    const handleTodoToggle = (todoId: string, listId: string) => {
        toggleTodoCompletion(
            listId,
            todoId,
            playCompleteSound,
            playTodoRemovedSound,
            queryClient
        )
    }

    function showEditModalHandler(todo: DailyTodoItem) {
        console.log('clicking todo item', todo)
        // Implement modal opening logic here
        setCurrentTodo(todo);
        setShowEditTodoModal(true);
    }

    const renderTodoItem = (todo: DailyTodoItem, time: string) => {
        // Extract hour and period from the time block (e.g., "10 PM" -> hour: 10, period: "PM")
        const [blockHour, blockPeriod] = time.split(" ")

        // Get the todo's due date
        const todoDate = new Date(todo.dueDate as string)
        let todoHour = todoDate.getHours()

        // Convert todo hour to 12-hour format for comparison
        let todoHour12: number
        let todoPeriod: string

        if (todoHour === 0) {
            todoHour12 = 12
            todoPeriod = "AM"
        } else if (todoHour === 12) {
            todoHour12 = 12
            todoPeriod = "PM"
        } else if (todoHour > 12) {
            todoHour12 = todoHour - 12
            todoPeriod = "PM"
        } else {
            todoHour12 = todoHour
            todoPeriod = "AM"
        }

        // Check if the todo belongs to this time block
        const matches = todoHour12 === parseInt(blockHour) && todoPeriod === blockPeriod

        return matches && (
            <div
                key={todo.id}
                className={`pl-3 gap-2 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
                    ? 'opacity-0 scale-95 -translate-y-1'
                    : 'opacity-100 scale-100 translate-y-0'
                    }`}
                style={{
                    height: todo.deleting ? '0px' : 'auto',
                    minHeight: todo.deleting ? '0px' : '10px',
                    transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    transformOrigin: 'top center'
                }}
            >
                <div className='flex items-start mt-2'>
                    {/* Checkbox */}
                    <div className={`pt-[1px] transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-75 opacity-0' : 'transform scale-100 opacity-100'
                        }`}>
                        <button
                            onClick={() => handleTodoToggle(todo.id, todo.listId)}
                            className={`rounded transition-all duration-300 ${todo.deleting
                                ? 'opacity-0 pointer-events-none transform scale-50'
                                : 'hover:bg-muted transform scale-100'
                                }`}
                            disabled={todo.deleting}
                        >
                            {todo.completed ? (
                                <CheckCircle className="w-4 h-4 text-ring" />
                            ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div
                        onClick={() => showEditModalHandler(todo)}
                        className={`ml-2 w-full  transition-all duration-300 ease-in-out 
                                ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'}`}>
                        <p
                            className={`w-full line-clamp-1 leading-normal text-sm transition-all duration-500
                                ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''} 
                                ${todo.deleting ? 'pointer-events-none transform scale-90' : ''}
                                `}
                        >
                            {localTodoTexts[todo.id] || todo.text}
                        </p>
                    </div>
                </div>

                {/* Show time underneath */}
                <div className='relative -top-2 left-6 text-[.675rem] text-muted-foreground italic'>
                    {new Date(todo.dueDate as string).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                    }).replace(/\s(AM|PM)/gi, (period) => period.toLowerCase())}
                </div>
            </div>
        )
    }


    if (showEditTodoModal) {
        return (
            <ResponsiveDialog
                isOpen={showEditTodoModal}
                setIsOpen={setShowEditTodoModal}
                title="Edit ToDo"
            >
                <AddTodoForm 
                    listId={currentTodo?.listId}
                    todoId={currentTodo?.id}
                />
            </ResponsiveDialog>
        )
    }


    return (

        <div className='w-full mx-auto border-t mt-12 mb-36'>
            {timeBlocks.map((time) => (
                <div key={time} className='flex w-full border-b min-h-[60px]'>
                    <p className='text-md font-bold w-[65px] border-r pl-3 pt-1'>{time.split(" ")[0]} <span className='text-xs'>{time.split(" ")[1]}</span></p>
                    <div className="space-y-0 transition-all duration-300 ease-in-out w-full">
                        {todos.map((todo) => renderTodoItem(todo, time))}
                    </div>
                </div>
            ))}
        </div>
    )
}
