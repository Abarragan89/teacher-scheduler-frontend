'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCalendarReminders } from '@/lib/hooks/useCalendarReminders'
import { clientDays } from '@/lib/api/services/days/client'
import { useRecurringTodos } from '@/lib/hooks/useRecurringTodos'
import { TodoItem } from '@/types/todo'
import { toLocalDateString } from '@/lib/utils/date-formater'

interface CalendarGridProps {
    date: Date
}

const getPriorityColor = (priority: number) => {
    switch (priority) {
        case 4: return 'bg-red-100 text-red-800 border-red-200'
        case 3: return 'bg-orange-100 text-orange-800 border-orange-200'
        case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarGrid({ date }: CalendarGridProps) {
    const router = useRouter()

    const [today] = useState<Date>(() => new Date())
    const [holidays, setHolidays] = useState<Array<{ date: string; name: string; emoji?: string }>>([])


    const { getRemindersForDate, isLoading } = useCalendarReminders(
        date.getFullYear(),
        date.getMonth() + 1
    )

    const { getRecurringTodoForDate } = useRecurringTodos({
        startDate: toLocalDateString(new Date(date.getFullYear(), date.getMonth(), 1)),
        endDate: toLocalDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    })

    useEffect(() => {
        async function fetchHolidays() {
            try {
                const holidayData = await clientDays.getHoliaysForMonth(
                    date.getFullYear(),
                    date.getMonth() + 1
                )
                setHolidays(holidayData || [])
            } catch {
                setHolidays([])
            }
        }
        fetchHolidays()
    }, [date])

    const getHolidayForDate = (d: Date) => {
        const dateString = toLocalDateString(d)
        return holidays.find(h => h.date === dateString) || null
    }

    const generateCalendarDays = () => {
        const days = []
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }
        return days
    }

    const days = generateCalendarDays()
    const firstDayOfWeek = new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const isToday = (d: Date) => {
        if (!today) return false
        return d.toDateString() === today.toDateString()
    }

    const handleDateClick = (d: Date) => {
        const dateString = toLocalDateString(d)
        router.push(`/dashboard/daily/${dateString}?view=todos`)
    }

    const renderDateTodos = (d: Date) => {
        const dateString = toLocalDateString(d)
        const dayReminders = getRemindersForDate(dateString)
        const dayRecurring = getRecurringTodoForDate(dateString)

        const existingPatternIds = new Set(
            (dayReminders?.reminders || [])
                .map((t: TodoItem) => t.patternId)
                .filter(Boolean)
        )

        const uniqueRecurring = dayRecurring.filter(
            (todo: TodoItem) => !existingPatternIds.has(todo.patternId)
        )

        const allReminders = [...(dayReminders?.reminders || []), ...uniqueRecurring]
        if (!allReminders.length) return null

        const shouldShowOverflow = allReminders.length > 3
        const displayReminders = shouldShowOverflow ? allReminders.slice(0, 2) : allReminders.slice(0, 3)
        const overflowCount = shouldShowOverflow ? allReminders.length - 2 : 0

        return (
            <div className="mt-1 space-y-1 w-full">
                {displayReminders.map((reminder: TodoItem) => (
                    <div
                        key={reminder.id}
                        className={`text-[.65rem] sm:text-[.70rem] px-0.5 py-0.3 rounded text-left relative overflow-hidden whitespace-nowrap ${getPriorityColor(reminder.priority)} ${reminder.completed ? 'line-through opacity-50' : ''}`}
                        title={reminder.text}
                        style={{
                            maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                        }}
                    >
                        {reminder.text}
                    </div>
                ))}
                {overflowCount > 0 && (
                    <div className="text-sm pt-px text-ring text-center">+{overflowCount}</div>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-7 border-y sm:border rounded-none sm:rounded-sm">
            {/* Day names header */}
            {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-md font-medium border-b border-l bg-card">
                    {day}
                </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="h-28 md:h-32 border-b" />
            ))}

            {/* Calendar days */}
            {days.map((d, index) => {
                const holiday = getHolidayForDate(d)
                return (
                    <button
                        key={index}
                        onClick={() => handleDateClick(d)}
                        className={`
                            flex flex-col items-start px-1 py-1 h-28 md:h-32
                            ${index < 35 ? 'border-b' : ''}
                            hover:shadow-xl transition-all
                            overflow-hidden relative
                        `}
                        title={holiday ? holiday.name : undefined}
                    >
                        <div className={`self-center flex items-center justify-center relative
                            ${isToday(d) ? 'bg-ring text-accent rounded-full w-6 h-6' : ''}
                        `}>
                            {d.getDate()}
                            {holiday?.emoji && (
                                <span className="absolute top-1 -right-6 text-xs">{holiday.emoji}</span>
                            )}
                        </div>
                        {!isLoading && renderDateTodos(d)}
                    </button>
                )
            })}
        </div>
    )
}
