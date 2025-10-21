"use client"
import { Task } from '@/types/tasks'
import React, { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle, Circle } from 'lucide-react'
import { Schedule } from '@/types/day'
import { clientTasks, clientOutlineItems } from '@/lib/api/services/tasks/client'

export default function PublicViewAccordion({ schedule }: { schedule: Schedule }) {

    const [scheduleData, setScheduleData] = useState<Schedule>(schedule)
    const [openAccordions, setOpenAccordions] = useState<string[]>(['1']) // Start with first task open

    const toggleOutlineItemCompletion = async (taskId: string, outlineItemId: string) => {
        if (!scheduleData) return

        const item = scheduleData.tasks
            .find(t => t.id === taskId)
            ?.outlineItems.find(i => i.id === outlineItemId);

        if (!item) return

        setScheduleData(prev => ({
            ...prev!,
            tasks: prev!.tasks.map(task =>
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
            )
        }))

        // API call to update outline item completion
        await clientOutlineItems.updateOutlineItem(outlineItemId, item.text, item.position, item.indentLevel, !item.completed)
    }

    const toggleTaskCompletion = async (taskId: string) => {
        if (!scheduleData) return
        const task = scheduleData.tasks.find(t => t.id === taskId);
        if (!task) return

        setScheduleData(prev => ({
            ...prev!,
            tasks: prev!.tasks.map(task =>
                task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
            )
        }))

        // API call to update task completion
        await clientTasks.updateTask(taskId, task.title, task.position, !task.completed)
    }

    return (
        <Accordion
            type="multiple"
            className="w-full space-y-2"
            value={openAccordions}
            onValueChange={setOpenAccordions}
        >
            {scheduleData?.tasks?.map((task: Task) => (
                <AccordionItem
                    key={task.id}
                    value={task.id}
                    className="border-none my-4 rounded-md shadow-lg"
                >
                <div className={`relative flex items-center gap-3 p-2 py-4 bg-muted border pr-3
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

                        {/* Task Title and Accordion Trigger */}
                        <div className="flex-between w-full">
                            <p className={`text-left font-bold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title || 'Untitled Task'}
                            </p>
                            <AccordionTrigger className="p-0" />
                        </div>
                    </div>

                    <AccordionContent className="px-1 py-3 border border-t-0 rounded-b-lg">
                        <div className="space-y-2 mt-2 ml-6">
                            {task.outlineItems
                                .filter(item => item.text.trim() !== '')
                                .map(item => (
                                    <div key={item.id} className="flex items-start gap-3 group"
                                    style={{ paddingLeft: `${item.indentLevel * 20}px` }}>
                                        <Checkbox
                                            onClick={() => toggleOutlineItemCompletion(task.id, item.id)}
                                            checked={item.completed}
                                            className="w-4 h-4 mt-[3px]"
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
    )
}
