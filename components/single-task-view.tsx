import React from 'react'
import { X, ArrowLeft, SquareCheckBig, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Task } from '@/types/tasks'
import { AccordionState } from './shared/daily-schedule-accordion/utils/types'
import { toggleOutlineItemCompletion } from './shared/daily-schedule-accordion/utils/outline-operations'
import { formatTime } from '@/lib/utils'
import useSound from 'use-sound'

interface FullScreenTaskViewProps {
    task: Task
    isOpen: boolean
    onClose: () => void
    state: AccordionState
}

export function SingleTaskView({ task, isOpen, onClose, state }: FullScreenTaskViewProps) {
    if (!isOpen) return null

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });

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
                <div className="relative py-4 border-t border-x rounded-t-md bg-muted">
                    <h1 className={`text-lg xs:text-2xl text-center font-bold leading-tight flex-1 mx-4 line-clamp-1`}>
                        {task.title}
                    </h1>
                </div>

                {/* Outline Items */}
                {task?.outlineItems && (
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

                        {task.outlineItems.length > 0 ? (
                            task.outlineItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`flex items-start gap-3 group ml-5
                        ${item.indentLevel === 0 ? `ml-3` : 'ml-14'}`}
                                >
                                    {/* Your existing checkbox and content code */}
                                    {item?.indentLevel > 0 ? (
                                        <p
                                            onClick={() => toggleOutlineItemCompletion(task.id, item.id, state, playCompleteSound)}
                                            className={`min-w-[15px] min-h-[15px] mt-[4px] rounded-full mr-1
                            ${item.completed ? 'bg-ring border border-ring' : 'border border-muted-foreground'}
                            `}
                                        />
                                    ) : (
                                        <button
                                            onClick={() => toggleOutlineItemCompletion(task.id, item.id, state, playCompleteSound)}
                                        >
                                            {item.completed ? (
                                                <SquareCheckBig className="w-5 h-5 text-ring" />
                                            ) : (
                                                <Square className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </button>
                                    )}

                                    <p
                                        className={`text-md xs:text-lg leading-relaxed ${item.completed
                                            ? 'line-through text-muted-foreground'
                                            : 'text-foreground'
                                            }`}
                                    >
                                        {item.text}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center mt-5">
                                No outline items for this task
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}