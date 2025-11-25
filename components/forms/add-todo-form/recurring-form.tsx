'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Plus, Repeat } from 'lucide-react'
import { TodoList } from '@/types/todo'
import { Label } from '../../ui/label'
import { TodoFormData, TodoFormUIState, TodoFormActions } from './hooks/useTodoForm'

interface RecurringFormProps {
    formData: TodoFormData
    uiState: TodoFormUIState
    actions: TodoFormActions
    todoLists: TodoList[]
    todoId?: string
    onCancel?: () => void
    isFormValid: () => boolean
}

type RecurrenceType = 'daily' | 'weekly' | 'monthly'

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

            {/* Monthly Pattern - Placeholder */}
            {recurrenceType === 'monthly' && (
                <div className="space-y-3">
                    <Label className="pl-1 pb-1 text-muted-foreground">Monthly options coming soon...</Label>
                </div>
            )}


            <div className="flex-center my-5 gap-x-7">
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
                    disabled={!text.trim() || isCreating || !selectedListId || (recurrenceType === 'weekly' && selectedDays.length === 0)}
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