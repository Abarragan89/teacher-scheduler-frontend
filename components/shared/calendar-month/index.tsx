'use client'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function CalendarMonth() {
    const router = useRouter()
    const [currentDate, setCurrentDate] = useState(new Date())

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

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header with navigation */}
            <div className="flex items-end justify-between mb-3">
                <h1 className=" text-xl md:text-2xl font-bold py-1">{monthYear}</h1>
                {/* Navigation Arrows */}
                <div className="flex items-end gap-2">
                    {/* Today shortcut button */}
                    <div className="mt-4 text-center">
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
            <div className="grid grid-cols-7 rounded-lg border">
                {/* Day names header */}
                {dayNames.map(day => (
                    <div
                        key={day}
                        className="p-3 text-center text-xs md:text-sm font-medium  border-b"
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
               flex flex-col items-end h-16 md:h-18 lg:h-20 pr-1 border-b border-r
              ${!isCurrentMonth(date) ? 'text-muted-foreground' : ''}
              ${isToday(date) ? 'bg-accent' : ''}
              hover:shadow-xl shadow-ring hover:scale-[1.02] transition-all
            `}
                    >
                        <div className="text-xs md:text-sm">
                            {date.getDate()}
                        </div>

                        {/* Space for future features like task indicators */}
                        <div className="mt-1 space-y-1">
                            {/* You can add task indicators here later */}
                        </div>

                    </button>
                ))}
            </div>
        </div>
    )
}