'use client'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCalendarReminders } from '@/lib/hooks/useCalendarReminders'

export default function CalendarMonth() {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())

    // Get calendar reminders for the current month
    const { getRemindersForDate, isLoading } = useCalendarReminders(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1 // Convert to 1-indexed month
    )


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
        router.push(`/dashboard/daily/${dateString}`)
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

        if (!dayReminders || dayReminders.reminders.length === 0) {
            return null
        }

        return (
            <div className="mt-1 space-y-1 w-full">
                {/* Display todos based on new logic: all if ≤3, first 2 if >3 */}
                {dayReminders.displayReminders.map((reminder, index) => (
                    <div
                        key={reminder.id}
                        className={`text-[.65rem] sm:text-[.75rem] px-0.5 py-0.3 rounded text-left truncate ${getPriorityColor(reminder.priority)}`}
                        title={reminder.text} // Show full text on hover
                    >
                        {reminder.text}
                    </div>
                ))}

                {/* Show overflow count if there are more than 3 todos */}
                {dayReminders.overflowCount > 0 && (
                    <div className="text-xs px-1 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200 text-center">
                        +{dayReminders.overflowCount}
                    </div>
                )}
            </div>
        )
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header with navigation */}
            <div className="flex items-end justify-between mb-3">
                <h1 className=" text-xl md:text-2xl font-bold py-1">{monthYear}</h1>
                {/* Navigation Arrows */}
                <div className="flex items-end gap-2">
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
            <div className="grid grid-cols-7 md:rounded-lg border-y md:border">
                {/* Day names header */}
                {dayNames.map(day => (
                    <div
                        key={day}
                        className="p-3 text-center text-xs md:text-sm font-medium border-b"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((date, index) => (
                    <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        className={`
                            flex flex-col items-start px-2 py-1 h-24 md:h-32
                            ${index < 35 ? 'border-b' : ''} 
                            ${!isCurrentMonth(date) ? 'text-muted-foreground' : ''}
                            ${isToday(date) ? '' : ''}
                            hover:shadow-xl transition-all
                            overflow-hidden
                        `}
                    >
                        {/* Date number */}
                        <div className="text-xs md:text-sm self-end">
                            {date.getDate()}
                        </div>

                        {/* Todo reminders */}
                        {!isLoading && renderDateTodos(date)}

                    </button>
                ))}
            </div>
        </div>
    )
}