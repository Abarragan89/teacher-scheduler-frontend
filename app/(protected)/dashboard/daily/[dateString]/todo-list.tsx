'use client'
import { useDailyTodos } from '@/lib/hooks/useDailyTodos'
import { DailyTodoItem } from '@/lib/hooks/useDailyTodos'
import { useState, useEffect } from 'react'
import TodoListItem from '@/components/shared/todo-sheet/todo-list-item'
import { clientDays } from '@/lib/api/services/days/client'

interface TodoListProps {
    dateString: string
}

export default function TodoList({ dateString }: TodoListProps) {
    const timeBlocks = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];

    const { todos } = useDailyTodos(dateString)
    const [holiday, setHoliday] = useState<{ date: string, name: string, emoji?: string } | null>(null)


    // Keep only the modal state for editing
    const [showEditTodoModal, setShowEditTodoModal] = useState(false);
    const [currentTodo, setCurrentTodo] = useState<DailyTodoItem | null>(null);

    // Fetch holiday for this specific date
    useEffect(() => {
        async function fetchHolidayForDate() {
            try {
                const date = new Date(dateString)
                const holidays = await clientDays.getHoliaysForMonth(
                    date.getFullYear(),
                    date.getMonth() + 1
                )
                const todayHoliday = holidays?.find((h: any) => h.date === dateString) || null
                setHoliday(todayHoliday)
            } catch (error) {
                console.error('Failed to fetch holiday for date:', error)
                setHoliday(null)
            }
        }

        fetchHolidayForDate()
    }, [dateString])

    function showEditModalHandler(todo: DailyTodoItem) {
        setCurrentTodo(todo);
        setShowEditTodoModal(true);
    }

    function convertTo24Hour(time12h: string) {
        const [time, modifier] = time12h.split(' ');

        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }
        return `${hours.toString().padStart(2, '0')}:00`;
    }

    return (
        <>
            {/* Holiday Banner */}
            {holiday && (
                <div className="mb-6  ml-2 bg-gradient-to-r rounded-lg">
                    <div className="flex items-center gap-3">
                        {holiday.emoji && (
                            <span className="text-2xl">{holiday.emoji}</span>
                        )}
                        <div>
                            <h3 className="font-semibold text-ring">{holiday.name}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className='mt-4'>
                {timeBlocks.map((time) => (
                    <div key={time} className='flex w-full border-b min-h-[60px]'>
                        <p
                            className='hover:cursor-pointer hover:text-ring text-md font-bold w-[65px] border-r pl-3 pt-1'>{time.split(" ")[0]} <span className='text-xs'>{time.split(" ")[1]}</span></p>
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
                                        onEdit={() => showEditModalHandler(todo)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}