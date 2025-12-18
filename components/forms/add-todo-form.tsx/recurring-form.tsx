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
}

type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export default function RecurringForm({
    formData,
    uiState,
    actions,
    todoLists,
    todoId,
    onCancel
}: RecurringFormProps) {

    // Destructure properties from hook
    const { text, selectedListId, recurrencePattern, dueDate } = formData
    const { isCreating, editScope } = uiState
    const {
        updateTime,
        updateSelectedListId,
        updateEditScope,
        toggleModal
    } = actions


    const [isYearlyDatePopoverOpen, setIsYearlyDatePopoverOpen] = useState<boolean>(false)
    const [isStartDatePopoverOpen, setIsStartDatePopoverOpen] = useState<boolean>(false);
    const [endDatePopoverOpen, setEndDatePopoverOpen] = useState<boolean>(false);

    const weekDays = [
        { label: 'Sun', value: 0 },
        { label: 'Mon', value: 1 },
        { label: 'Tue', value: 2 },
        { label: 'Wed', value: 3 },
        { label: 'Thu', value: 4 },
        { label: 'Fri', value: 5 },
        { label: 'Sat', value: 6 }
    ]

    function updateSelectedDaysWeekly(newDay: number) {
        // Ensure selectedDays is always an array
        const selectedDays: number[] = recurrencePattern?.daysOfWeek;
        const isSelected = selectedDays.includes(newDay);

        const newSelectedDays = isSelected
            ? selectedDays.filter(day => day !== newDay)
            : [...selectedDays, newDay];

        actions.updateRecurrencePattern({
            ...recurrencePattern,
            daysOfWeek: newSelectedDays,
        });
    }

    function addSelectedDatesMonthly(newDay: string) {
        const newDayAsNum = newDay === "last" ? -1 : parseInt(newDay)
        actions.updateRecurrencePattern({
            ...recurrencePattern,
            daysOfMonth: [...recurrencePattern?.daysOfMonth, newDayAsNum],
        });
    }

    function removeSelectedDatesMonthly(newDay: number) {
        const updatedArray: number[] = recurrencePattern.daysOfMonth?.filter(num => num !== newDay)
        actions.updateRecurrencePattern({
            ...recurrencePattern,
            daysOfMonth: updatedArray,
        });
    }


    function updatedSelectedDaysMonthlyNth(ordinal: number) {
        const updatedNthWeekday = { ...recurrencePattern, nthWeekdayOccurrence: {...recurrencePattern.nthWeekdayOccurrence, ordinal} }
        actions.updateRecurrencePattern(updatedNthWeekday);

    }

    function updatedSelectedDaysMonthlyWeekday(weekday: number) {
        const updatedNthWeekday = { ...recurrencePattern, nthWeekdayOccurrence: {...recurrencePattern.nthWeekdayOccurrence, weekday } }
        actions.updateRecurrencePattern(updatedNthWeekday);
    }

    return (
        <>
            {/* Recurrence Type */}
            <div className="mb-6">
                <Label className="pl-1 pb-1">Recurrence Pattern</Label>
                <Select
                    value={recurrencePattern?.type}
                    onValueChange={(value: RecurrenceType) => actions.updateRecurrencePattern({ ...recurrencePattern, type: value })}
                >
                    <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4" />
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Weekly Pattern - Day Selection */}
            {recurrencePattern?.type === 'WEEKLY' && (
                <div className="my-5">
                    <Label className="pl-1 pb-1">Select Days</Label>
                    <div className="grid grid-cols-7 gap-1 xs:gap-2">
                        {weekDays.map((day) => (
                            <Button
                                key={day.value}
                                type="button"
                                variant={recurrencePattern.daysOfWeek?.includes(day.value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSelectedDaysWeekly(day.value)}
                                className="w-full text-xs xs:text-sm"
                            >
                                {day.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Pattern - Day Selection */}
            {recurrencePattern?.type === 'MONTHLY' && (
                <Tabs defaultValue={recurrencePattern?.monthPatternType || 'BY_DATE'} className="p-0 m-0">
                    <TabsList className="-mt-5">
                        <TabsTrigger onClick={() => actions.updateRecurrencePattern({ ...recurrencePattern, monthPatternType: 'BY_DATE' })} value="BY_DATE">By Date</TabsTrigger>
                        <TabsTrigger onClick={() => actions.updateRecurrencePattern({ ...recurrencePattern, monthPatternType: 'BY_DAY' })} value="BY_DAY">By Day</TabsTrigger>
                    </TabsList>
                    <TabsContent value="BY_DATE">
                        <div className="mt-5 space-y-4">
                            <div className="space-y-2">
                                <Select
                                    value=""
                                    onValueChange={(value) => addSelectedDatesMonthly(value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a day to add..." />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[350px]'>
                                        <ScrollArea>
                                            {Array.from({ length: 31 }, (_, i) => i + 1)
                                                .filter(day => !recurrencePattern?.daysOfMonth?.includes(day))
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
                                                            {ordinal}
                                                        </SelectItem>
                                                    )
                                                })}
                                        </ScrollArea>
                                        {!recurrencePattern?.daysOfMonth?.includes(-1) && (
                                            <SelectItem value="last">Last Day of Month</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Selected Days Display */}
                            <div className="flex items-center gap-x-2 space-y-2">
                                {recurrencePattern?.daysOfMonth && recurrencePattern?.daysOfMonth?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {recurrencePattern?.daysOfMonth?.map((day) => (
                                            <Button
                                                key={day}
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => removeSelectedDatesMonthly(day)}
                                                className="text-xs font-bold tracking-wider"
                                            >
                                                {day === -1 ? 'Last Day' : (
                                                    day === 1 ? '1st' :
                                                        day === 2 ? '2nd' :
                                                            day === 3 ? '3rd' :
                                                                day === 21 ? '21st' :
                                                                    day === 22 ? '22nd' :
                                                                        day === 23 ? '23rd' :
                                                                            day === 31 ? '31st' :
                                                                                `${day}th`
                                                )}
                                                <span className="text-sm opacity-60">×</span>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic flex-center w-full">
                                        <p>No Days Selected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>


                    <TabsContent value="BY_DAY">
                        <div className="mt-5">
                            <Label className="text-sm mb-1 ml-1">
                                Repeat Every
                            </Label>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={recurrencePattern?.nthWeekdayOccurrence?.ordinal.toString()}
                                        onValueChange={(value) => updatedSelectedDaysMonthlyNth(parseInt(value))}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st</SelectItem>
                                            <SelectItem value="2">2nd</SelectItem>
                                            <SelectItem value="3">3rd</SelectItem>
                                            <SelectItem value="-1">Last</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={recurrencePattern?.nthWeekdayOccurrence?.weekday.toString()}
                                        onValueChange={(value) => updatedSelectedDaysMonthlyWeekday(parseInt(value))}
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
                                    {/* <Label className="text-sm whitespace-nowrap">of each month</Label> */}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            )}

            {/* Yearly Pattern - Calendar Selection */}
            {recurrencePattern?.type === 'YEARLY' && (
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
                                        endMonth={new Date(2040, 11)}
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


            {/* Common fields Time and List Selection Options and start/end dates */}
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
                            value={recurrencePattern?.timeOfDay || ''}
                            onChange={(e) => actions.updateRecurrencePattern({ ...recurrencePattern, timeOfDay: e.target.value })}
                            className="bg-background text-sm appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* List Selection */}
                <div className=" flex-1">
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


            {/* Start Date and End Date */}
            <div className="flex-center flex-wrap w-full gap-5">
                <div className='flex-1 min-w-[140px]'>
                    <Label className="pl-1 pb-1">Starts</Label>
                    <Popover open={isStartDatePopoverOpen} onOpenChange={setIsStartDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                disabled={isCreating}
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {formData.recurrencePattern.startDate ?
                                    formData.recurrencePattern.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                                    "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                            <div className="space-y-4">
                                <div className='w-[230px] mx-auto min-h-[300px]'>
                                    <Calendar
                                        mode="single"
                                        selected={formData?.recurrencePattern?.startDate}
                                        onSelect={(val) => {
                                            actions.updateRecurrencePattern({ ...recurrencePattern, startDate: val });
                                            setIsStartDatePopoverOpen(false)
                                        }}
                                        className="rounded-md bg-transparent w-full p-0"
                                        captionLayout='dropdown'
                                        endMonth={new Date(2040, 11)}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className='flex-1 min-w-[140px]'>
                    <Label className="pl-1 pb-1">Ends<span className='text-xs text-muted-foreground'>(optional)</span></Label>
                    <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                disabled={isCreating}
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {formData.recurrencePattern.endDate ?
                                    formData.recurrencePattern.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                                    "Select date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align="start">
                            <div className="space-y-4">
                                <div className='w-[230px] mx-auto min-h-[300px]'>
                                    <Calendar
                                        mode="single"
                                        selected={formData.recurrencePattern.endDate}
                                        onSelect={(val) => {
                                            actions.updateRecurrencePattern({ ...recurrencePattern, endDate: val });
                                            setEndDatePopoverOpen(false)
                                        }}
                                        className="rounded-md bg-transparent w-full p-0"
                                        captionLayout='dropdown'
                                        endMonth={new Date(2040, 11)}
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Scope Selection for Editing Recurring Todos */}
            {todoId && (
                <div className="mt-6 p-4 border border-border rounded-md bg-muted/30">
                    {/* <Label className="text-sm font-medium mb-3 block">Edit Scope</Label> */}
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <input
                                type="radio"
                                id="edit-single"
                                name="edit-scope"
                                value="single"
                                checked={editScope === 'single'}
                                onChange={(e) => updateEditScope(e.target.value as 'single' | 'future')}
                                className="mt-1"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="edit-single" className="text-sm font-medium cursor-pointer">
                                    Edit this occurrence only
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Changes will only apply to this specific todo instance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <input
                                type="radio"
                                id="edit-future"
                                name="edit-scope"
                                value="future"
                                checked={editScope === 'future'}
                                onChange={(e) => updateEditScope(e.target.value as 'single' | 'future')}
                                className="mt-1"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="edit-future" className="text-sm font-medium cursor-pointer">
                                    Edit this and all future occurrences
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Changes will apply to this todo and all upcoming instances
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        (recurrencePattern?.type === 'WEEKLY' && recurrencePattern?.daysOfWeek?.length === 0) ||
                        (recurrencePattern?.type === 'MONTHLY' && recurrencePattern?.daysOfMonth?.length === 0 && recurrencePattern.monthPatternType === "BY_DATE") ||
                        (recurrencePattern?.type === 'YEARLY' && !dueDate)}
                    className="px-6 shadow-none"
                >
                    {todoId ? (
                        isCreating ? 'Updating...' :
                            editScope === 'single' ? 'Update This Todo' : 'Update All Future'
                    ) : (
                        isCreating ? 'Creating...' : '+ Create Recurring Todo'
                    )}
                </Button>
            </div>
        </>
    )
}