import React from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Task } from '@/types/tasks'
import { AccordionState } from './shared/daily-schedule-accordion/utils/types'
import { toggleOutlineItemCompletion } from './shared/daily-schedule-accordion/utils/outline-operations'
import { formatTime } from '@/lib/utils'

interface FullScreenTaskViewProps {
    task: Task
    isOpen: boolean
    onClose: () => void
    state: AccordionState
}

export function SingleTaskView({ task, isOpen, onClose, state }: FullScreenTaskViewProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                >
                    <X size={16} />
                </Button>
            </div>

            {/* Content */}
            <div className="wrapper h-full overflow-y-auto mx-5">
                {/* Task Title */}
                <div className="relative py-5 border-t border-x rounded-t-md bg-muted">
                    <h1 className={`text-2xl md:text-3xl text-center font-bold leading-tight flex-1 mx-3 line-clamp-1`}>
                        {task.title}
                    </h1>
                </div>

                {/* Outline Items */}
                {task?.outlineItems && task.outlineItems.length > 0 && (
                    <div className="space-y-4 px-3 py-5 border-x border-b rounded-b-md shadow-lg">
                        <div className='flex-end gap-x-1 text-sm text-muted-foreground pr-2 -mt-3'>
                            {task?.startTime && (
                                <p>{formatTime(task.startTime)}</p>
                            )}
                            {task?.endTime && (
                                <>
                                    <p>-</p>
                                    <p>{formatTime(task.endTime)}</p>
                                </>
                            )}
                        </div>
                        {task.outlineItems.slice(0, task.outlineItems.length - 1).map(item => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-3 group ml-5
                                    ${item.indentLevel === 0 ? `ml-3` : 'ml-14'}`}
                            >
                                {/* Functional Checkbox */}
                                <Checkbox
                                    className={`mt-[4px] ${item.indentLevel === 0 ?
                                        'w-[20px] h-[20px]'
                                        :
                                        'w-[16px] h-[16px] rounded-full'}`}
                                    checked={item.completed}
                                    onCheckedChange={() => toggleOutlineItemCompletion(task.id, item.id, state)}
                                />

                                {/* Content */}
                                <p
                                    className={`text-lg leading-relaxed ${item.completed
                                        ? 'line-through text-muted-foreground'
                                        : 'text-foreground'
                                        }`}
                                >
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {(!task.outlineItems || task.outlineItems.length === 0) && (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground text-center">
                            No outline items for this task
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}