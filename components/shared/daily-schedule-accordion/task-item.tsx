'use client'
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { BareInput } from "@/components/ui/bare-bones-input"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical } from 'lucide-react'
import { TaskItemProps } from '@/types/tasks'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import SortableOutlineItem from './sortable-outline-item'

export default function TaskItem({
    task,
    isEditable,
    onToggleCompletion,
    onUpdateTitle,
    onTitleKeyDown,
    onToggleOutlineCompletion,
    onUpdateOutlineItem,
    onOutlineKeyDown,
    onOutlineBlur,
    onAddOutlineItem,
    onCloseAllAccordions,
}: TaskItemProps) {

    // Task-level sortable (for dragging entire tasks)
    const {
        attributes: taskAttributes,
        listeners: taskListeners,
        setNodeRef: setTaskNodeRef,
        transform: taskTransform,
        transition: taskTransition,
        isDragging: isTaskDragging
    } = useSortable({
        id: task.id,
        disabled: !isEditable
    })

    const taskStyle = {
        transition: taskTransition,
        transform: CSS.Transform.toString(taskTransform),
        opacity: isTaskDragging ? 0 : 1
    }

    return (
        <AccordionItem
            ref={setTaskNodeRef}
            style={taskStyle}
            value={task.id}
            className="border-none"
        >
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
                {/* Task Drag Handle */}
                <div
                    {...taskAttributes}
                    {...taskListeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggleCompletion(task.id)}
                    className='w-[22px] h-[22px]'
                />

                <BareInput
                    className={`flex-1 text-base tracking-wide font-bold ${task.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                    placeholder="Task title..."
                    value={task.title}
                    onChange={(e) => onUpdateTitle(task.id, e.target.value)}
                    onKeyDown={(e) => onTitleKeyDown(e, task.id)}
                    disabled={!isEditable}
                    readOnly={!isEditable}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                />

                <AccordionTrigger className="w-6 h-6 p-0 rounded" />
            </div>

            <AccordionContent className="px-4 pb-4" data-task-id={task.id}>
                <div className="space-y-2 mt-2 ml-7">
                    {/* Outline Items with their own SortableContext */}
                    <SortableContext
                        items={task.outlineItems.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {task.outlineItems.map(item => (
                            <SortableOutlineItem
                                key={item.id}
                                item={item}
                                taskId={task.id}
                                isEditable={isEditable}
                                onToggleOutlineCompletion={onToggleOutlineCompletion}
                                onUpdateOutlineItem={onUpdateOutlineItem}
                                onOutlineKeyDown={onOutlineKeyDown}
                                onOutlineBlur={onOutlineBlur}
                            />
                        ))}
                    </SortableContext>

                    {isEditable && (
                        <button
                            onClick={() => onAddOutlineItem(task.id)}
                            disabled={task.outlineItems.some(item => item.text.trim() === '')}
                            className={`flex items-center gap-3 text-sm ml-7 text-muted-foreground ${task.outlineItems.some(item => item.text.trim() === '')
                                ? 'cursor-not-allowed'
                                : 'hover:text-foreground'
                                }`}
                        >
                            <span>+ Add note</span>
                        </button>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>

    )
}