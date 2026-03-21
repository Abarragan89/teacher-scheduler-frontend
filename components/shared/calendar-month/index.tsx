'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useEmblaCarousel from 'embla-carousel-react'
import { useQueryClient } from '@tanstack/react-query'
import { clientTodo } from '@/lib/api/services/todos/client'
import CalendarGrid from './CalendarGrid'
import { toLocalDateString } from '@/lib/utils/date-formater'

export default function CalendarMonth({ initialMonth }: { initialMonth?: string }) {
    const pathname = usePathname()

    const parseInitialDate = () => {
        if (initialMonth) {
            const [y, m] = initialMonth.split('-').map(Number)
            if (y && m) return new Date(y, m - 1, 1)
        }
        const now = new Date()
        console.log('parseInitialDate called:', now.toString(), 'day:', now.getDay())
        return now
    }

    const [currentDate, setCurrentDate] = useState(parseInitialDate)
    const [displayDate, setDisplayDate] = useState(parseInitialDate)
    const queryClient = useQueryClient()

    // Derive 5 slides: -2, -1, 0, +1, +2 months relative to currentDate
    const slides = [-2, -1, 0, 1, 2].map(
        offset => new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    )

    const [emblaRef, emblaApi] = useEmblaCarousel({
        startIndex: 2,
        loop: false,
        dragFree: false,
        align: 'center',
    })

    // Sync URL without triggering a Next.js server re-render
    const syncUrl = useCallback((date: Date) => {
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        window.history.replaceState(null, '', `${pathname}?month=${month}`)
    }, [pathname])

    // Track whether we're resetting to center silently (to avoid re-triggering onSettle)
    const isResetting = useRef(false)

    // onSelect fires the moment the snap changes (mid-drag) — update header immediately
    const onSelect = useCallback(() => {
        if (!emblaApi || isResetting.current) return
        const index = emblaApi.selectedScrollSnap()
        const offset = index - 2
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
        setDisplayDate(newDate)
        syncUrl(newDate)
    }, [emblaApi, currentDate, syncUrl])

    // onSettle triggers the invisible slide reset — no need to syncUrl again
    const onSettle = useCallback(() => {
        if (!emblaApi || isResetting.current) return
        const index = emblaApi.selectedScrollSnap()
        if (index === 2) return // Already centered, do nothing

        isResetting.current = true
        const offset = index - 2
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
        setCurrentDate(newDate)
    }, [emblaApi, currentDate])

    // After currentDate changes (slides re-render), silently reset to center slide
    useEffect(() => {
        if (!emblaApi) return
        const raf = requestAnimationFrame(() => {
            emblaApi.scrollTo(2, true) // true = instant (no animation)
            setTimeout(() => { isResetting.current = false }, 50)
        })
        return () => cancelAnimationFrame(raf)
    }, [currentDate, emblaApi])

    // Background-prefetch recurring todos for months just outside the rendered window (±3)
    useEffect(() => {
        ;[-3, 3].forEach(offset => {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
            const startDate = toLocalDateString(new Date(d.getFullYear(), d.getMonth(), 1))
            const endDate = toLocalDateString(new Date(d.getFullYear(), d.getMonth() + 1, 0))
            queryClient.prefetchQuery({
                queryKey: ['recurringTodos', startDate, endDate],
                queryFn: () => clientTodo.getRecurringTodosInRange(startDate, endDate),
                staleTime: 1000 * 60 * 5,
            })
        })
    }, [currentDate, queryClient])

    useEffect(() => {
        if (!emblaApi) return
        emblaApi.on('select', onSelect)
        emblaApi.on('settle', onSettle)
        return () => {
            emblaApi.off('select', onSelect)
            emblaApi.off('settle', onSettle)
        }
    }, [emblaApi, onSelect, onSettle])

    const updateMonth = (date: Date) => {
        setCurrentDate(date)
        setDisplayDate(date)
        syncUrl(date)
    }

    const goToPreviousMonth = () => {
        updateMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const goToNextMonth = () => {
        updateMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const currentYear = displayDate.getFullYear()
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

    const handleMonthSelect = (value: string) => {
        const newDate = new Date(displayDate.getFullYear(), parseInt(value), 1)
        updateMonth(newDate)
    }

    const handleYearSelect = (value: string) => {
        const newDate = new Date(parseInt(value), displayDate.getMonth(), 1)
        updateMonth(newDate)
    }

    return (
        <div className="mt-10">
            {/* Header */}
            <div className="flex items-end justify-between mb-1 mx-3 sm:mx-1 pt-4">
                <div className="flex items-center gap-2">
                    <Select value={String(displayDate.getMonth())} onValueChange={handleMonthSelect}>
                        <SelectTrigger className="border-none shadow-none text-2xl md:text-3xl font-bold p-0 h-auto focus:ring-0 w-auto gap-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((month, i) => (
                                <SelectItem key={i} value={String(i)}>{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(displayDate.getFullYear())} onValueChange={handleYearSelect}>
                        <SelectTrigger className="border-none shadow-none text-sm text-muted-foreground p-0 h-auto focus:ring-0 w-auto gap-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <div className="mt-2 text-center">
                        <Button variant="ghost" onClick={() => updateMonth(new Date())}>
                            Today
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={goToPreviousMonth}
                        className="p-2 text-ring rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={goToNextMonth}
                        className="p-2 text-ring rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Embla swipe container */}
            <div
                ref={emblaRef}
                className="overflow-hidden"
                style={{ touchAction: 'pan-y' }}
            >
                <div className="flex">
                    {slides.map((slideDate, i) => (
                        <div key={i} className="flex-[0_0_100%] min-w-0">
                            <CalendarGrid date={slideDate} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}