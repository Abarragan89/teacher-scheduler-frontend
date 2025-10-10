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
    onFocusOutline,
    onFocusTask,
    onTaskBlur,
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
            data-task-id={task.id}
        >
            <div className="flex items-center gap-2 px-3 py-3 bg-muted rounded-lg">
                {/* Task Drag Handle */}
                <div
                    {...taskAttributes}
                    {...taskListeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                    style={{
                        touchAction: 'none',           // Prevent scrolling/zooming
                        userSelect: 'none',            // Prevent text selection
                        WebkitUserSelect: 'none',      // Safari
                        WebkitTouchCallout: 'none',    // Prevent iOS context menu
                        WebkitTapHighlightColor: 'transparent' // Remove tap highlight
                    }}
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggleCompletion(task.id)}
                    className='w-[18px] h-[18px]'
                />

                <BareInput
                    className={`task-title-input flex-1 text-base tracking-wide font-bold ${task.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                    placeholder="Subject or Period..."
                    value={task.title}
                    onChange={(e) => onUpdateTitle(task.id, e.target.value)}
                    onBlur={() => onTaskBlur(task.id, task.title)}
                    onFocus={() => onFocusTask(task.id)}
                    onKeyDown={(e) => onTitleKeyDown(e, task.id)}
                    disabled={!isEditable}
                    readOnly={!isEditable}
                    // Prevent these events from bubbling up to drag handlers
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}  // Add this
                    onTouchMove={(e) => e.stopPropagation()}   // Add this
                />

                <AccordionTrigger className="w-6 h-6 p-0 rounded" />
            </div>

            <AccordionContent className="px-4 pb-4" data-task-id={task.id}>
                <div className="space-y-2 mt-2 ml-4">
                    {/* Outline Items with their own SortableContext */}
                    <SortableContext
                        items={task?.outlineItems?.length > 0 ? task.outlineItems.map(item => item.id) : []}
                        strategy={verticalListSortingStrategy}
                    >
                        {(() => {
                            // Filter items based on edit mode
                            const filteredItems = task?.outlineItems?.filter(item => {
                                // In edit mode, show all items
                                if (isEditable) return true
                                // In view mode, hide empty items
                                return item.text.trim() !== ''
                            }) || []

                            // Show "no outline items" message in edit mode when no items with content exist
                            const hasContentItems = task?.outlineItems?.some(item => item.text.trim() !== '') || false

                            if (isEditable && !hasContentItems) {
                                return (
                                    <div className="text-center pt-2">
                                        <p className="text-muted-foreground italic text-sm">no outline items</p>
                                    </div>
                                )
                            }

                            // Render filtered items
                            return filteredItems.map(item => (
                                <SortableOutlineItem
                                    key={item.id}
                                    item={item}
                                    taskId={task.id}
                                    isEditable={isEditable}
                                    onFocusOutline={onFocusOutline}
                                    onToggleOutlineCompletion={onToggleOutlineCompletion}
                                    onUpdateOutlineItem={onUpdateOutlineItem}
                                    onOutlineKeyDown={onOutlineKeyDown}
                                    onOutlineBlur={onOutlineBlur}
                                />
                            ))
                        })()}
                    </SortableContext>
                </div>
            </AccordionContent>
        </AccordionItem>

    )
}