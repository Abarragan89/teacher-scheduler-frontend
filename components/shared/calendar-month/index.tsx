'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCalendarReminders } from '@/lib/hooks/useCalendarReminders'
import { clientDays } from '@/lib/api/services/days/client'
import { useRecurringTodos } from '@/lib/hooks/useRecurringTodos'
import { TodoItem } from '@/types/todo'

export default function CalendarMonth() {

    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [holidays, setHolidays] = useState<Array<{ date: string, name: string, emoji?: string }>>([])

    // Get calendar reminders for the current month
    const { getRemindersForDate, isLoading } = useCalendarReminders(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1 // Convert to 1-indexed month
    )

    const { getRecurringTodoForDate } = useRecurringTodos({
        startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
    })


    async function fetchHolidays() {
        try {
            const holidayData = await clientDays.getHoliaysForMonth(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1
            )
            setHolidays(holidayData || [])
        } catch (error) {
            console.error('Failed to fetch holidays:', error)
            setHolidays([])
        }
    }

    // Helper function to get holiday for a specific date
    const getHolidayForDate = (date: Date): { date: string, name: string, emoji?: string } | null => {
        const dateString = date.toISOString().split('T')[0]
        return holidays.find(holiday => holiday.date === dateString) || null
    }

    useEffect(() => {
        fetchHolidays()
    }, [currentDate])


    // Get the first day of the current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    // Get the starting date for the calendar (might be from previous month)
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()) // Go back to Sunday

    // Generate 42 days (6 rows × 7 days) for the calendar grid
    const generateCalendarDays = () => {
        const days = []
        const currentCalendarDate = new Date(startDate)

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentCalendarDate))
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
        }
        return days
    }

    const days = generateCalendarDays()
    const today = new Date()

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    // Handle date click - navigate to daily view
    const handleDateClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0] // Format: YYYY-MM-DD
        router.push(`/dashboard/daily/${dateString}?view=todos`)
    }

    // Helper function to check if date is in current month
    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth()
    }

    // Helper function to check if date is today
    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString()
    }

    // Format month/year display
    const monthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    // Helper function to get priority color class
    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 4: return 'bg-red-100 text-red-800 border-red-200' // High
            case 3: return 'bg-orange-100 text-orange-800 border-orange-200' // Medium
            case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200' // Low
            default: return 'bg-blue-100 text-blue-800 border-blue-200' // None
        }
    }

    // Helper function to render todos for a specific date
    const renderDateTodos = (date: Date) => {
        const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
        const dayReminders = getRemindersForDate(dateString)

        const recurringTodosForDate = getRecurringTodoForDate(dateString)
        const allReminders = [...dayReminders?.reminders || [], ...recurringTodosForDate ?? []]

        if (!allReminders || allReminders.length === 0) {
            return null
        }

        const shouldShowOverflow = allReminders.length > 3
        const displayReminders = shouldShowOverflow ? allReminders.slice(0, 2) : allReminders.slice(0, 3)
        const overflowCount = shouldShowOverflow ? allReminders.length - 2 : 0

        return (
            <div className="mt-1 space-y-1 w-full">
                {/* Display todos based on new logic: all if ≤3, first 2 if >3 */}
                {displayReminders.map((reminder: TodoItem) => (
                    <div
                        key={reminder.id}
                        className={`text-[.65rem] sm:text-[.70rem] px-0.5 py-0.3 rounded text-left relative overflow-hidden whitespace-nowrap ${getPriorityColor(reminder.priority)}`}
                        title={reminder.text} // Show full text on hover
                        style={{
                            maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
                        }}
                    >
                        {reminder.text}
                    </div>
                ))}

                {/* Show overflow count if there are more than 3 todos */}
                {overflowCount > 0 && (
                    <div className="text-sm pt-[1px] text-ring text-center">
                        +{overflowCount}
                    </div>
                )}
            </div>
        )
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header with navigation */}
            <div className="flex items-end justify-between mb-1 mx-2 sm:mx-6 pt-4">
                <h1 className=" text-2xl md:text-3xl font-bold py-1">{monthYear.split(" ")[0]}
                    <span className='text-sm text-muted-foreground ml-3'>{monthYear.split(" ")[1]}</span>
                </h1>
                {/* Navigation Arrows */}
                <div className="flex items-end">
                    {/* Today shortcut button */}
                    <div className="mt-2 text-center">
                        <Button
                            variant={'ghost'}
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Today
                        </Button>
                    </div>

                    <Button
                        variant={'ghost'}
                        onClick={goToPreviousMonth}
                        className="p-2 text-ring rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant={'ghost'}
                        onClick={goToNextMonth}
                        className="p-2 text-ring rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 sm:rounded-lg border-y sm:border sm:mx-5">
                {/* Day names header */}
                {dayNames.map(day => (
                    <div
                        key={day}
                        className="p-3 text-center text-md font-medium border-b"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((date, index) => {
                    const holiday = getHolidayForDate(date)

                    return (
                        <button
                            key={index}
                            onClick={() => handleDateClick(date)}
                            className={`
                                flex flex-col items-start px-1 py-1 h-28 md:h-32
                                ${index < 35 ? 'border-b' : ''} 
                                ${!isCurrentMonth(date) ? 'text-muted-foreground' : ''}
                                ${isToday(date) ? '' : ''}
                                hover:shadow-xl transition-all
                                overflow-hidden relative
                            `}
                            title={holiday ? holiday.name : undefined}
                        >
                            {/* Date number with holiday emoji */}
                            <div className={`self-center flex items-center justify-center relative
                                ${isToday(date) ? 'bg-ring text-accent rounded-full w-6 h-6' : ''}
                            `}>
                                {date.getDate()}
                                {holiday?.emoji && (
                                    <span className="absolute top-1 -right-6 text-xs">
                                        {holiday.emoji}
                                    </span>
                                )}
                            </div>

                            {/* Todo reminders */}
                            {!isLoading && renderDateTodos(date)}

                        </button>
                    )
                })}
            </div>
        </div>
    )
}