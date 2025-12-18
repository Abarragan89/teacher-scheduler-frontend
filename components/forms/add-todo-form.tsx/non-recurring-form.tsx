'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, ChevronDown, Clock, Flag, Plus } from 'lucide-react'
import { Label } from '../../ui/label'
import { TodoFormData, TodoFormUIState, TodoFormActions } from './hooks/useTodoForm'
import { TodoList } from '@/types/todo'

interface NonRecurringFormProps {
    formData: TodoFormData
    uiState: TodoFormUIState
    actions: TodoFormActions
    todoLists: TodoList[]
    todoId?: string
    onCancel?: () => void
    formatDisplayDate: (date: Date) => string
    isFormValid: () => boolean
}

export default function NonRecurringForm({
    formData,
    uiState,
    actions,
    todoLists,
    todoId,
    onCancel,
    formatDisplayDate,
    isFormValid
}: NonRecurringFormProps) {

    return (
        <div className="space-y-4">
            {/* Due Date and Priority Row */}
            <div className="flex-between flex-wrap gap-5 xs:gap-x-8  text-sm">
                {/* Due Date */}
                <div className="w-full min-w-[180px] flex-2">
                    <Label className='pl-1 pb-1'>Due Date <span className='text-xs opacity-60'>(optional)</span></Label>
                    <Popover open={uiState.isDatePopoverOpen} onOpenChange={actions.toggleDatePopover}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                disabled={uiState.isCreating}
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {formData.dueDate ? formatDisplayDate(formData.dueDate) : "Select date"}
                                <ChevronDown className="ml-auto h-4 w-4" />
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
                                            actions.toggleDatePopover(false)
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

                {/* Time Selection */}
                <div className="w-full min-w-[120px] flex-1">
                    <Label htmlFor="time-picker" className="pl-1 pb-1">
                        Time <span className='text-xs opacity-60'>(optional)</span>
                    </Label>
                    <div className="relative flex gap-x-1">
                        <Input
                            type="time"
                            id="time-picker"
                            value={formData.dueDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) || ''}
                            onChange={(e) => actions.updateTime(e.target.value)}
                            className="bg-background text-sm appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* List and Priority Selection */}
            <div className="flex-between flex-wrap gap-5 xs:gap-x-8 text-sm">
                {/* List Selection */}
                <div className="w-full min-w-[140px] flex-2">
                    <Label className="pl-1 pb-1">List</Label>
                    <Select value={formData.selectedListId} onValueChange={actions.updateSelectedListId} disabled={uiState.isCreating}>
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
                                onClick={() => actions.toggleModal(true)}
                            >
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New List
                                </div>
                            </button>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority */}
                <div className="w-full min-w-[120px] flex-1 text-sm">
                    <Label className="pl-1 pb-1">Priority <span className='text-xs opacity-60'>(optional)</span></Label>
                    <Popover open={uiState.isPriorityPopoverOpen} onOpenChange={actions.togglePriorityPopover}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full gap-0 justify-start text-left p-0"
                                disabled={uiState.isCreating}
                            >
                                <Flag
                                    className={`mr-2 w-4 h-4 ${formData.priority === 4 ? 'text-red-500' :
                                        formData.priority === 3 ? 'text-yellow-500' :
                                            formData.priority === 2 ? 'text-blue-500' :
                                                'text-muted-foreground'
                                        }`}
                                />
                                {formData.priority === 4 ? 'High' :
                                    formData.priority === 3 ? 'Medium' :
                                        formData.priority === 2 ? 'Low' : 'None'}
                                <ChevronDown className="ml-auto h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="space-y-2" align="start">
                            <div className="space-y-1">
                                {[
                                    { level: 4, label: 'High', color: 'text-red-500', bgColor: 'hover:bg-red-50' },
                                    { level: 3, label: 'Medium', color: 'text-yellow-600', bgColor: 'hover:bg-yellow-50' },
                                    { level: 2, label: 'Low', color: 'text-blue-500', bgColor: 'hover:bg-blue-50' },
                                    { level: 1, label: 'None', color: 'text-muted-foreground', bgColor: 'hover:bg-muted/50' }
                                ].map(({ level, label, color, bgColor }) => (
                                    <Button
                                        key={level}
                                        type="button"
                                        variant="ghost"
                                        className={`w-full justify-start space-x-2 ${bgColor} ${color}`}
                                        onClick={() => {
                                            actions.updatePriority(level)
                                            actions.togglePriorityPopover(false)
                                        }}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Flag className={`w-4 h-4 ${level === 4 ? 'text-red-500' :
                                                level === 3 ? 'text-yellow-500' :
                                                    level === 2 ? 'text-blue-500' :
                                                        'text-muted-foreground'
                                                }`} />
                                            {label}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Submit Button */}
            <div className={`flex justify-start gap-5 mt-7`}>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={uiState.isCreating}
                        className='shadow-none'
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={!isFormValid()}
                    className="px-6 shadow-none"
                >
                    {todoId ?
                        uiState.isCreating ? 'Saving...' : 'Save'
                        :
                        uiState.isCreating ? 'Adding...' : '+ Add Todo'
                    }
                </Button>
            </div>
        </div>
    )
}