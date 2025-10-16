import React from 'react'
import { X, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Task } from '@/types/tasks'

interface FullScreenTaskViewProps {
    task: Task
    isOpen: boolean
    onClose: () => void
}

export function SingleTaskView({ task, isOpen, onClose }: FullScreenTaskViewProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <div className="h-full overflow-y-auto p-4 pb-20">
                {/* Task Title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold leading-tight text-foreground mb-2">
                        {task.title}
                    </h1>
                    <div className="h-px bg-border" />
                </div>

                {/* Outline Items */}
                {task.outlineItems && task.outlineItems.length > 0 && (
                    <div className="space-y-4">
                        {task.outlineItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 group"
                                style={{ paddingLeft: `${item.indentLevel * 1.5}rem` }}
                            >
                                {/* Bullet or checkbox */}
                                <div className="flex-shrink-0 mt-2">
                                    {item.completed ? (
                                        <CheckCircle size={16} className="text-green-600" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-lg leading-relaxed ${
                                            item.completed
                                                ? 'line-through text-muted-foreground'
                                                : 'text-foreground'
                                        }`}
                                    >
                                        {item.text}
                                    </p>
                                </div>
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