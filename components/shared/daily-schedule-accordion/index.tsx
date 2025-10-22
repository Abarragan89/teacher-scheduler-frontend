'use client'
import React, { useState } from 'react'
import { Accordion } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Task } from '@/types/tasks'
import { OutlineItem } from '@/types/outline-item'
import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import {
    DndContext,
    KeyboardSensor,
    TouchSensor,
    MouseSensor,
    useSensor,
    useSensors,
    useDroppable,
    pointerWithin,
    DragOverlay
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronsUpDown, Trash2 } from 'lucide-react'
import { Schedule } from '@/types/day'
import YesterdayTomorrowNav from './yesterday-tomorrow-nav'
import { useRouter } from 'next/navigation'
import { ChevronsDownUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccordionState } from './utils/types'
import { addNewTask } from './utils/task-operations'
import { handleDragStart, handleDragEnd } from './utils/drag-drop-handlers'
import MoveSchedulePopover from './move-schedule-popover'
import SchedulePrintView from './schedule-print-view'
import SharableLink from './sharable-link'

// Make TaskItem dynamic since it uses useSortable hooks and causes hydration errors
const DynamicTaskItem = dynamic(() => import('./task-item'), {
    ssr: false,
    loading: () => (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-3 rounded" />
                <Skeleton className="h-6 flex-1" />
            </div>
        </div>
    )
})


export default function DailyScheduleAccordion({
    scheduleData,
    currentDay,
    dayId
}: {
    scheduleData: Schedule,
    currentDay: string,
    dayId: string
}) {

    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>(() => {
        return scheduleData?.tasks?.map(task => {
            const taskWithClient = {
                ...task,
                clientKey: `client-${task.id}`
            }
            // Ensure each task has exactly one empty outline item at the end
            const outlineItems = [...taskWithClient.outlineItems]
            const lastItem = outlineItems[outlineItems.length - 1]
            const isLastItemEmpty = lastItem && lastItem.text.trim() === ''

            if (!isLastItemEmpty) {
                outlineItems.push({
                    id: `temp-outline-${task.id}-${Date.now()}`,
                    text: '',
                    completed: false,
                    indentLevel: 0,
                    position: outlineItems.length,
                })
            }

            taskWithClient.outlineItems = outlineItems
            return taskWithClient
        }) || []
    })

    const [openAccordions, setOpenAccordions] = useState<string[]>(['0'])
    const [isEditable, setIsEditable] = useState<boolean>(true)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [draggedItemType, setDraggedItemType] = useState<'task' | 'outline' | null>(null)
    const [activeItem, setActiveItem] = useState<Task | OutlineItem | null>(null)
    const [focusedText, setFocusedText] = useState<string>('')
    const [focusedIndentLevel, setFocusedIndentLevel] = useState<number>(0)

    // Create state object for utility functions
    const accordionState: AccordionState = {
        tasks,
        setTasks,
        openAccordions,
        setOpenAccordions,
        focusedText,
        setFocusedText,
        focusedIndentLevel,
        setFocusedIndentLevel,
        scheduleId: scheduleData.id
    }

    const sensors = useSensors(
        // Separate mouse and touch sensors for better control
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,        // Shorter delay - prevents phone lookup
                tolerance: 8,      // Allow small movements before canceling
            },
        }),
        useSensor(KeyboardSensor)
    )

    // Circular Trash Drop Zone Component - Fixed position at top center
    function TrashDropZone() {
        const { setNodeRef, isOver } = useDroppable({
            id: 'trash-zone',
        })

        return (
            <div
                ref={setNodeRef}
                className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-50 w-16 h-16 rounded-full border-2 border-dashed transition-all duration-200 flex items-center justify-center shadow-lg ${isOver
                    ? 'bg-destructive/20 border-destructive scale-110 shadow-destructive/50'
                    : 'bg-muted/90 border-muted-foreground/60 hover:border-destructive hover:bg-destructive/10'
                    }`}
                style={{ backdropFilter: 'blur(8px)' }}
            >
                <Trash2
                    className={`w-6 h-6 transition-colors ${isOver ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                />
            </div>
        )
    }

    function goToYesterday() {
        const yesterday = new Date(currentDay)
        yesterday.setDate(yesterday.getDate() - 1)
        const formattedDate = yesterday.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}`)
    }

    function goToTomorrow() {
        const tomorrow = new Date(currentDay)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const formattedDate = tomorrow.toISOString().split('T')[0]
        router.push(`/dashboard/daily/${formattedDate}`)
    }


    return (
        <div>
            <SchedulePrintView
                scheduleData={scheduleData}
                currentDay={currentDay}
            />

            <MoveSchedulePopover
                scheduleId={scheduleData.id}
            />

            <div className="print:!hidden flex-between mb-3 mr-3">
                <YesterdayTomorrowNav
                    goToTomorrow={goToTomorrow}
                    goToYesterday={goToYesterday}
                />
                <div className="flex text-sm items-center justify-end gap-x-2">
                    <Button title="Close all tasks" onClick={() => setOpenAccordions([])} variant={'ghost'}>
                        <ChevronsDownUp
                            size={19}
                            strokeWidth={2.5}
                            className="text-muted-foreground"
                        />
                    </Button>
                    <Button
                        title="Expand all tasks"
                        onClick={() => setOpenAccordions(tasks.map(tasks => tasks.id))} variant={'ghost'}>
                        <ChevronsUpDown
                            size={19}
                            strokeWidth={2.5}
                            className="text-muted-foreground"
                        />
                    </Button>

                    <SharableLink
                        dayId={dayId}
                    />

                    <span>View</span>
                    <Switch
                        checked={isEditable}
                        onCheckedChange={setIsEditable}
                    />
                    <span>Edit</span>
                </div>
            </div>
            <DndContext
                sensors={sensors}
                onDragStart={(event) => handleDragStart(event, accordionState, setIsDragging, setDraggedItemType, setActiveItem)}
                onDragEnd={(event) => handleDragEnd(event, accordionState, draggedItemType, setIsDragging, setDraggedItemType, setActiveItem)}
                collisionDetection={pointerWithin}
            >
                <SortableContext
                    items={tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Accordion
                        type="multiple"
                        className="w-full space-y-2 print:hidden"
                        value={openAccordions}
                        onValueChange={setOpenAccordions}
                    >
                        {tasks.map(task => (
                            <DynamicTaskItem
                                key={task.clientKey}
                                task={task}
                                isEditable={isEditable}
                                state={accordionState}
                            />
                        ))}
                    </Accordion>
                </SortableContext>

                {/* Fixed position circular trash icon */}
                {isDragging && isEditable && <TrashDropZone />}

                {/* DragOverlay for smooth drag preview outside accordion */}
                <DragOverlay>
                    {activeItem ? (
                        <div className="bg-background border rounded-lg p-3 shadow-lg opacity-90 max-w-md">
                            {'title' in activeItem ? (
                                // Task preview
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                    <div className="font-medium text-foreground">
                                        {activeItem.title || 'Untitled Task'}
                                    </div>
                                </div>
                            ) : (
                                // Outline item preview
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                    <div className="text-muted-foreground">
                                        {activeItem.text || 'Empty note'}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>

                {isEditable && (
                    <button
                        onClick={() => addNewTask(accordionState)}
                        className="print:hidden w-full mt-4 mb-14 p-2 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 hover:bg-border hover:text-ring"
                    >
                        <span className="text-lg">+</span>
                        <span>Add Task</span>
                    </button>
                )}
            </DndContext>


        </div >
    )
}
