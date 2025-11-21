'use client'
import React from 'react'
import { useDailyTodos } from '@/lib/hooks/useDailyTodos'
import AddTodoForm from '@/components/forms/add-todo-form'
import { DailyTodoItem } from '@/lib/hooks/useDailyTodos'
import { useState } from 'react'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import TodoListItem from '@/components/shared/todo-sheet/todo-list-item'

interface TodoListProps {
    dateString: string
}

export default function TodoList({ dateString }: TodoListProps) {
    const timeBlocks = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

    const { todos } = useDailyTodos(dateString)

    // Keep only the modal state for editing
    const [showEditTodoModal, setShowEditTodoModal] = useState(false);
    const [currentTodo, setCurrentTodo] = useState<DailyTodoItem | null>(null);

    function showEditModalHandler(todo: DailyTodoItem) {
        setCurrentTodo(todo);
        setShowEditTodoModal(true);
    }

    return (
        <>
            <div>
                {timeBlocks.map((time) => (
                    <div key={time} className='flex w-full border-b min-h-[60px]'>
                        <p className='text-md font-bold w-[65px] border-r pl-3 pt-1'>{time.split(" ")[0]} <span className='text-xs'>{time.split(" ")[1]}</span></p>
                        <div className="space-y-0 transition-all duration-300 ease-in-out w-full">
                            {todos.filter((todo) => {
                                // Filter todos for this time block
                                if (!todo.dueDate) return false

                                const todoDate = new Date(String(todo.dueDate))
                                let todoHour = todoDate.getHours()
                                let todoHour12: number
                                let todoPeriod: string

                                const blockHour = time.split(" ")[0]
                                const blockPeriod = time.split(" ")[1]

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

                                return todoHour12 === parseInt(blockHour) && todoPeriod === blockPeriod
                            }).map((todo) => (
                                <div
                                    key={todo.id}
                                    className="pl-3 gap-2 transition-all duration-300 ease-in-out transform-gpu overflow-hidden"
                                >
                                    <TodoListItem
                                        todo={todo}
                                        listId={todo.listId}
                                        context='daily'
                                        className="border-none pb-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {showEditTodoModal && (
                <ResponsiveDialog
                    isOpen={showEditTodoModal}
                    setIsOpen={setShowEditTodoModal}
                    title="Edit ToDo"
                >
                    <AddTodoForm
                        listId={currentTodo?.listId}
                        todoId={currentTodo?.id}
                        onComplete={() => setShowEditTodoModal(false)}
                    />
                </ResponsiveDialog>
            )}
        </>
    )
}