'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import useEmblaCarousel from 'embla-carousel-react'
import CalendarGrid from './CalendarGrid'

export default function CalendarMonth({ initialMonth }: { initialMonth?: string }) {
    const pathname = usePathname()

    const parseInitialDate = () => {
        if (initialMonth) {
            const [y, m] = initialMonth.split('-').map(Number)
            if (y && m) return new Date(y, m - 1, 1)
        }
        return new Date()
    }

    const [currentDate, setCurrentDate] = useState(parseInitialDate)

    // Derive prev/current/next month dates from currentDate
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    const slides = [prevMonth, currentDate, nextMonth]

    const [emblaRef, emblaApi] = useEmblaCarousel({
        startIndex: 1,
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

    const onSettle = useCallback(() => {
        if (!emblaApi || isResetting.current) return
        const index = emblaApi.selectedScrollSnap()
        if (index === 1) return // Already centered, do nothing

        isResetting.current = true
        const newDate = index === 0 ? prevMonth : nextMonth
        setCurrentDate(newDate)
        syncUrl(newDate)
    }, [emblaApi, prevMonth, nextMonth, syncUrl])

    // After currentDate changes (slides re-render), silently reset to center slide
    useEffect(() => {
        if (!emblaApi) return
        // Use requestAnimationFrame to wait for the DOM to settle after re-render
        const raf = requestAnimationFrame(() => {
            emblaApi.scrollTo(1, true) // true = instant (no animation)
            // Give Embla a tick to finish reInit before unlocking
            setTimeout(() => { isResetting.current = false }, 50)
        })
        return () => cancelAnimationFrame(raf)
    }, [currentDate, emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        emblaApi.on('settle', onSettle)
        return () => { emblaApi.off('settle', onSettle) }
    }, [emblaApi, onSettle])

    const updateMonth = (date: Date) => {
        setCurrentDate(date)
        syncUrl(date)
    }

    const goToPreviousMonth = () => {
        updateMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const goToNextMonth = () => {
        updateMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const monthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-end justify-between mb-1 mx-2 sm:mx-6 pt-4">
                <h1 className="text-2xl md:text-3xl font-bold py-1">
                    {monthYear.split(' ')[0]}
                    <span className="text-sm text-muted-foreground ml-3">{monthYear.split(' ')[1]}</span>
                </h1>
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
                className="overflow-hidden sm:mx-5"
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