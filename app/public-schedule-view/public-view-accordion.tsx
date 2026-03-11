"use client"
import { Task } from '@/types/tasks'
import React, { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle, ChevronsDownUp, ChevronsUpDown, Circle, Eye, Printer } from 'lucide-react'
import { Schedule } from '@/types/day'
import { clientTasks, clientOutlineItems } from '@/lib/api/services/tasks/client'
import { Button } from '@/components/ui/button'
import SchedulePrintView from '@/components/shared/daily-schedule-accordion/schedule-print-view'
import OutlineItemIndicator from '@/components/shared/daily-schedule-accordion/outline-item-indicator'
import { SingleTaskView } from '@/components/single-task-view'
import { AccordionState } from '@/components/shared/daily-schedule-accordion/utils/types'
import { formatTime } from '@/lib/utils'
import YesterdayTomorrowNav from '@/components/shared/daily-schedule-accordion/yesterday-tomorrow-nav'

export default function PublicViewAccordion({
    schedule,
    dayDate,
    userId
}: {
    schedule: Schedule
    dayDate: string
    userId: string
}) {

    const [tasks, setTasks] = useState<Task[]>(schedule.tasks || [])
    const [openAccordions, setOpenAccordions] = useState<string[]>(['1'])
    const [selectedTaskForView, setSelectedTaskForView] = useState<Task | null>(null) // Changed this


    const accordionState: AccordionState = {
        tasks,
        setTasks,
        openAccordions,
        setOpenAccordions,
        scheduleId: schedule.id
    }


    const toggleOutlineItemCompletion = async (taskId: string, outlineItemId: string) => {
        if (!schedule) return

        const item = tasks.find(t => t.id === taskId)
            ?.outlineItems.find(i => i.id === outlineItemId);

        if (!item) return

        setTasks(prev => ([
            ...prev.map(task => (
                task.id === taskId
                    ? {
                        ...task,
                        outlineItems: task.outlineItems.map(item =>
                            item.id === outlineItemId
                                ? { ...item, completed: !item.completed }
                                : item
                        )
                    }
                    : task
            ))
        ]))

        // API call to update outline item completion
        await clientOutlineItems.updateOutlineItemToggleComplete(outlineItemId, !item.completed)
    }

    const toggleTaskCompletion = async (taskId: string) => {
        if (!schedule) return

        const task = tasks.find(t => t.id === taskId);
        if (!task) return

        setTasks(prev => ([
            ...prev.map(task => (
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            ))
        ]))

        // API call to update task completion
        await clientTasks.toggleTaskComplete(taskId, !task.completed)
    }

    return (
        <>
            <SchedulePrintView
                scheduleData={schedule}
                currentDay={dayDate}
            />
            {selectedTaskForView && (
                <SingleTaskView
                    task={selectedTaskForView}
                    onClose={() => setSelectedTaskForView(null)}
                    isOpen={!!selectedTaskForView}
                    state={accordionState}
                />
            )}
            <div className="flex text-sm items-center justify-between gap-x-2 mb-2 print:hidden">
                <>
                    <YesterdayTomorrowNav
                        userId={userId}
                        dateString={dayDate}
                        isPublicView={true}
                    />
                    <>
                        <div className='flex items-center'>
                            <Printer
                                className='text-muted-foreground mr-2'
                                onClick={() => window.print()}
                                size={20}
                            />
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
                        </div>
                    </>
                </>
            </div>
            <Accordion
                type="multiple"
                className="w-full space-y-2 print:hidden"
                value={openAccordions}
                onValueChange={setOpenAccordions}
            >
                {tasks?.map((task: Task) => (
                    <AccordionItem
                        key={task.id}
                        value={task.id}
                        className="border-none mb-4 rounded-md shadow-lg"
                    >
                        <div className={`relative flex items-center gap-3 p-2 py-5 bg-muted border pr-3
                            ${openAccordions.includes(task.id) ? 'rounded-t-lg border-b-0 border' : 'rounded-md'}
                        `}>
                            {/* Task Completion Checkbox */}
                            <button
                                onClick={() => toggleTaskCompletion(task.id)}
                                className="flex-shrink-0 pl-5 rounded"
                            >
                                {task.completed ? (
                                    <CheckCircle className="w-6 h-6 text-ring" />
                                ) : (
                                    <Circle className="w-6 h-6 text-muted-foreground" />
                                )}
                            </button>


                            {task?.startTime && (
                                <div className="absolute right-3 top-[1px] italic text-[.70rem] text-muted-foreground">
                                    {formatTime(task.startTime)}
                                </div>
                            )}
                            {task?.endTime && (
                                <div className="absolute right-3 bottom-[1px] italic text-[.70rem] text-muted-foreground">
                                    {formatTime(task.endTime)}
                                </div>
                            )}

                            {/* Task Title and Accordion Trigger */}
                            <div className="flex-between w-full">
                                <p className={`text-left font-bold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title || 'Untitled Task'}
                                </p>
                                <div className='flex-center gap-x-3 md:gap-x-5'>
                                    <AccordionTrigger className="p-0" />
                                    <Eye
                                        size={20}
                                        className='text-muted-foreground'
                                        onClick={() => setSelectedTaskForView(task)}
                                    />
                                </div>
                            </div>
                        </div>

                        <AccordionContent className="px-1 pr-3 py-3 border border-t-0 rounded-b-lg">
                            <div className="space-y-2 mt-2 ml-6">
                                {task.outlineItems
                                    .filter(item => item.text.trim() !== '')
                                    .map(item => (
                                        <div key={item.id} className="flex items-start gap-2 group"
                                            style={{ paddingLeft: `${item.indentLevel * 30}px` }}>
                                            <OutlineItemIndicator
                                                indentLevel={item.indentLevel}
                                                completed={item.completed}
                                                onToggle={() => toggleOutlineItemCompletion(task.id, item.id)}
                                            />
                                            <span
                                                className={`text-sm leading-relaxed ${item.completed
                                                    ? 'line-through text-muted-foreground'
                                                    : 'text-foreground'
                                                    }`}
                                            >
                                                {item.text}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    )
}
