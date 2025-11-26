'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Clock, Plus, Repeat } from 'lucide-react'
import { TodoList } from '@/types/todo'
import { Label } from '../../ui/label'
import { TodoFormData, TodoFormUIState, TodoFormActions } from './hooks/useTodoForm'
import { TabsContent } from '@radix-ui/react-tabs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RecurringFormProps {
    formData: TodoFormData
    uiState: TodoFormUIState
    actions: TodoFormActions
    todoLists: TodoList[]
    todoId?: string
    onCancel?: () => void
    isFormValid: () => boolean
}

type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function RecurringForm({
    formData,
    uiState,
    actions,
    todoLists,
    todoId,
    onCancel,
    isFormValid
}: RecurringFormProps) {
    // Destructure properties from hook
    const { text, time, selectedListId } = formData
    const { isCreating, isModalOpen } = uiState
    const {
        updateTime,
        updateSelectedListId,
        toggleModal
    } = actions

    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily')
    const [selectedDays, setSelectedDays] = useState<number[]>([1]) // 0=Sunday, 1=Monday, etc.
    const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]) // Days of month (1-31, -1 for last day)
    const [nthWeekday, setNthWeekday] = useState<{ nth: number, weekday: number }>({ nth: 1, weekday: 1 }) // 1st Monday
    const [isYearlyDatePopoverOpen, setIsYearlyDatePopoverOpen] = useState<boolean>(false)

    const weekDays = [
        { label: 'Sun', value: 0 },
        { label: 'Mon', value: 1 },
        { label: 'Tue', value: 2 },
        { label: 'Wed', value: 3 },
        { label: 'Thu', value: 4 },
        { label: 'Fri', value: 5 },
        { label: 'Sat', value: 6 }
    ]

    const handleDayToggle = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        )
    }

    const handleMonthDayToggle = (day: number) => {
        setSelectedMonthDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort((a, b) => {
                    // Sort with -1 (last day) at the end
                    if (a === -1) return 1
                    if (b === -1) return -1
                    return a - b
                })
        )
    }

    return (
        <>
            {/* Recurrence Type */}
            <div className="mb-6">
                <Label className="pl-1 pb-1">Recurrence Pattern</Label>
                <Select value={recurrenceType} onValueChange={(value: RecurrenceType) => setRecurrenceType(value)}>
                    <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Weekly Pattern - Day Selection */}
            {recurrenceType === 'weekly' && (
                <div className="my-5">
                    <Label className="pl-1 pb-1">Select Days</Label>
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => (
                            <Button
                                key={day.value}
                                type="button"
                                variant={selectedDays.includes(day.value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleDayToggle(day.value)}
                                className="w-full"
                            >
                                {day.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Pattern - Day Selection */}
            {recurrenceType === 'monthly' && (
                <Tabs defaultValue="date" className="p-0 m-0">
                    <TabsList className="-mt-5">
                        <TabsTrigger value="date">By Date</TabsTrigger>
                        <TabsTrigger value="day">By Day</TabsTrigger>
                    </TabsList>
                    <TabsContent value="date">
                        <div className="mt-5 space-y-4">
                            <div className="space-y-2">
                                <Label className="pl-1 pb-1">Add Days of Month</Label>
                                <Select
                                    value=""
                                    onValueChange={(value) => {
                                        const dayValue = value === "last" ? -1 : parseInt(value)
                                        if (!selectedMonthDays.includes(dayValue)) {
                                            handleMonthDayToggle(dayValue)
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a day to add..." />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[350px]'>
                                        <ScrollArea>
                                            {Array.from({ length: 31 }, (_, i) => i + 1)
                                                .filter(day => !selectedMonthDays.includes(day))
                                                .map((day) => {
                                                    const ordinal = day === 1 ? '1st' :
                                                        day === 2 ? '2nd' :
                                                            day === 3 ? '3rd' :
                                                                day === 21 ? '21st' :
                                                                    day === 22 ? '22nd' :
                                                                        day === 23 ? '23rd' :
                                                                            day === 31 ? '31st' :
                                                                                `${day}th`
                                                    return (
                                                        <SelectItem key={day} value={day.toString()}>
                                                            The {ordinal}
                                                        </SelectItem>
                                                    )
                                                })}
                                        </ScrollArea>
                                        {!selectedMonthDays.includes(-1) && (
                                            <SelectItem value="last">Last Day of Month</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Days Display */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Selected Days:</Label>
                                {selectedMonthDays.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {selectedMonthDays.map((day) => (
                                            <Button
                                                key={day}
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleMonthDayToggle(day)}
                                                className="h-7 px-2 text-xs"
                                            >
                                                {day === -1 ? 'Last Day' : (
                                                    day === 1 ? 'The 1st' :
                                                        day === 2 ? 'The 2nd' :
                                                            day === 3 ? 'The 3rd' :
                                                                day === 21 ? 'The 21st' :
                                                                    day === 22 ? 'The 22nd' :
                                                                        day === 23 ? 'The 23rd' :
                                                                            day === 31 ? 'The 31st' :
                                                                                `The ${day}th`
                                                )}
                                                <span className="ml-1 text-xs opacity-60">×</span>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">None</div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="day">
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm whitespace-nowrap">Every</Label>
                                    <Select
                                        value={nthWeekday.nth.toString()}
                                        onValueChange={(value) => setNthWeekday(prev => ({ ...prev, nth: parseInt(value) }))}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st</SelectItem>
                                            <SelectItem value="2">2nd</SelectItem>
                                            <SelectItem value="3">3rd</SelectItem>
                                            <SelectItem value="4">4th</SelectItem>
                                            <SelectItem value="-1">Last</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Select
                                        value={nthWeekday.weekday.toString()}
                                        onValueChange={(value) => setNthWeekday(prev => ({ ...prev, weekday: parseInt(value) }))}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Sunday</SelectItem>
                                            <SelectItem value="1">Monday</SelectItem>
                                            <SelectItem value="2">Tuesday</SelectItem>
                                            <SelectItem value="3">Wednesday</SelectItem>
                                            <SelectItem value="4">Thursday</SelectItem>
                                            <SelectItem value="5">Friday</SelectItem>
                                            <SelectItem value="6">Saturday</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Label className="text-sm whitespace-nowrap">of each month</Label>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}

            {/* Yearly Pattern - Calendar Selection */}
            {recurrenceType === 'yearly' && (
                <div className="my-5">
                    <Label className="pl-1 pb-1">Select Date for Yearly Recurrence</Label>
                    <Popover open={isYearlyDatePopoverOpen} onOpenChange={setIsYearlyDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                disabled={isCreating}
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {formData.dueDate ? formData.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                            <div className="space-y-4">
                                <div className='w-[230px] mx-auto min-h-[300px]'>
                                    <Calendar
                                        mode="single"
                                        selected={formData.dueDate}
                                        onSelect={(val) => {
                                            actions.updateDueDate(val);
                                            setIsYearlyDatePopoverOpen(false)
                                        }}
                                        className="rounded-md bg-transparent w-full p-0"
                                        captionLayout='dropdown'
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {formData.dueDate && (
                        <div className="text-sm text-muted-foreground text-center mt-3 bg-muted/30 p-3 rounded-md">
                            <strong>Preview:</strong> Every year on {formData.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                    )}
                </div>
            )}


            <div className="flex-center flex-wrap my-5 gap-5">
                {/* Time Selection */}
                <div className=" flex-1">
                    <Label htmlFor="recurring-time-picker" className="pl-1 pb-1">
                        Time
                    </Label>
                    <div className="relative">
                        <Input
                            type="time"
                            id="recurring-time-picker"
                            required
                            value={time}
                            onChange={(e) => updateTime(e.target.value)}
                            className="bg-background text-sm appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* List Selection */}
                <div className=" flex-2">
                    <Label className="pl-1 pb-1">List</Label>
                    <Select value={selectedListId} onValueChange={updateSelectedListId} disabled={isCreating}>
                        <Button variant='outline' asChild>
                            <SelectTrigger className="w-full justify-between text-left">
                                <SelectValue placeholder="Select a list..." />
                            </SelectTrigger>
                        </Button>
                        <SelectContent>
                            {todoLists.map((list) => (
                                <SelectItem key={list.id} value={list.id}>
                                    {list.listName}
                                </SelectItem>
                            ))}
                            <button
                                className="text-ring w-full rounded-md text-sm p-1 hover:bg-accent hover:cursor-pointer"
                                onClick={() => toggleModal(true)}
                            >
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New List
                                </div>
                            </button>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Submit Button */}
            <div className={`flex justify-start gap-5 mt-7`}>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isCreating}
                        className='shadow-none'
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={!text.trim() || isCreating || !selectedListId ||
                        (recurrenceType === 'weekly' && selectedDays.length === 0) ||
                        (recurrenceType === 'monthly' && selectedMonthDays.length === 0) ||
                        (recurrenceType === 'yearly' && !formData.dueDate)}
                    className="px-6 shadow-none"
                >
                    {todoId ?
                        isCreating ? 'Saving...' : 'Save Recurring Todo'
                        :
                        isCreating ? 'Creating...' : '+ Create Recurring Todo'
                    }
                </Button>
            </div>
        </>
    )
}