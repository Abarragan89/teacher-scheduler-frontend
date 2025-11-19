'use client'

import React, { useState, useEffect } from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DateTimePickerProps {
    value?: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    label?: string
    className?: string
    disabled?: boolean
}

export default function DateTimePicker({
    value,
    onChange,
    placeholder = "Select date",
    label,
    className = "space-y-1 min-w-[175px] flex-1",
    disabled = false
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [tempDate, setTempDate] = useState<Date | null>(value || null)
    const [time, setTime] = useState<string>(() => {
        if (value) {
            return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
        }
        return '7:00 AM'
    })

    // Update temp date and time when prop changes
    useEffect(() => {
        setTempDate(value || null)
        if (value) {
            setTime(value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }))
        }
    }, [value])

    // Helper function to convert 12-hour time to 24-hour time
    const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ')
        let [hours, minutes] = time.split(':')

        if (hours === '12') {
            hours = '00'
        }

        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString()
        }

        return `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    // Generate 12-hour time options (every 30 minutes)
    const generateTimeOptions = () => {
        const options = []
        for (let hour = 1; hour <= 12; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const displayHour = hour.toString()
                const displayMinute = minute.toString().padStart(2, '0')
                options.push(`${displayHour}:${displayMinute} AM`)
                options.push(`${displayHour}:${displayMinute} PM`)
            }
        }
        return options
    }

    const formatDisplayDate = (date: Date, includeTime: boolean = false): string => {
        if (includeTime) {
            return `${date.toLocaleDateString()} at ${time}`
        }
        return date.toLocaleDateString()
    }

    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) {
            setTempDate(null)
            return
        }

        // Combine with current time
        const combined = new Date(newDate)
        const timeValue = convertTo24Hour(time)
        const [hours, minutes] = timeValue.split(':').map(Number)
        combined.setHours(hours, minutes, 0, 0)
        setTempDate(combined)
    }

    const handleTimeChange = (newTime: string) => {
        setTime(newTime)
        if (tempDate) {
            // Update the temp date with the new time
            const combined = new Date(tempDate)
            const timeValue = convertTo24Hour(newTime)
            const [hours, minutes] = timeValue.split(':').map(Number)
            combined.setHours(hours, minutes, 0, 0)
            setTempDate(combined)
        }
    }

    const handleDone = () => {
        setIsOpen(false)
        onChange(tempDate)
    }

    return (
        <div className={className}>
            {label && <label className="text-xs text-muted-foreground">{label}</label>}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full h-8 justify-start text-left font-normal text-xs"
                        disabled={disabled}
                    >
                        <CalendarIcon className="h-3 w-3 mr-2" />
                        {tempDate ? formatDisplayDate(tempDate, true) : value ? formatDisplayDate(value, true) : placeholder}
                        <ChevronDown className="ml-auto h-3 w-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                        <div className='w-[255px] mx-auto min-h-[330px]'>
                            <CalendarComponent
                                mode="single"
                                selected={tempDate || undefined}
                                onSelect={handleDateSelect}
                                className="rounded-md bg-transparent w-full pt-1 pb-0"
                                captionLayout='dropdown'
                            />
                        </div>
                        <div className="flex gap-x-4 -mt-3">
                            <Select value={time} onValueChange={handleTimeChange}>
                                <SelectTrigger className="flex-2">
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent className="max-h-48">
                                    {generateTimeOptions().map((timeOption) => (
                                        <SelectItem key={timeOption} value={timeOption}>
                                            {timeOption}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                onClick={handleDone}
                                className="flex-2"
                                size="sm"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}