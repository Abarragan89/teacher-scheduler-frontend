'use client'
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { BareInput } from "@/components/ui/bare-bones-input"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical, Trash } from 'lucide-react'
import { OutlineItem, TaskItemProps } from '@/types/tasks'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import { closestCorners, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
// Sortable Outline Item Component
function SortableOutlineItem({
    item,
    taskId,
    isEditable,
    onToggleOutlineCompletion,
    onUpdateOutlineItem,
    onOutlineKeyDown,
    onOutlineBlur
}: {
    item: OutlineItem
    taskId: string
    isEditable: boolean
    onToggleOutlineCompletion: (taskId: string, itemId: string) => void
    onUpdateOutlineItem: (taskId: string, itemId: string, text: string) => void
    onOutlineKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, taskId: string, itemId: string) => void
    onOutlineBlur: (taskId: string, itemId: string, text: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.id,
        disabled: !isEditable
    })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3"
        >
            {/* Drag Handle - Only this part can drag */}
            {isEditable && (
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                    style={{ marginLeft: `${item.indentLevel * 24}px` }}
                >
                    <GripVertical className="w-3 h-3" />
                </div>
            )}

            {/* Regular content - not draggable */}
            <div
                className="flex items-center gap-3 flex-1"
                style={{ marginLeft: !isEditable ? `${item.indentLevel * 24}px` : '0px' }}
            >
                <Checkbox
                    className='w-[16px] h-[17px]'
                    checked={item.completed}
                    onCheckedChange={() => onToggleOutlineCompletion(taskId, item.id)}
                />

                <BareInput
                    className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                    placeholder="Add a note..."
                    value={item.text}
                    onChange={(e) => onUpdateOutlineItem(taskId, item.id, e.target.value)}
                    onKeyDown={(e) => onOutlineKeyDown(e, taskId, item.id)}
                    onBlur={() => onOutlineBlur(taskId, item.id, item.text)}
                    data-item-id={item.id}
                    disabled={!isEditable}
                    readOnly={!isEditable}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    )
}


export default function TaskItem({
    task,
    tasksLength,
    isEditable,
    onToggleCompletion,
    onUpdateTitle,
    onDelete,
    onTitleKeyDown,
    onToggleOutlineCompletion,
    onUpdateOutlineItem,
    onOutlineKeyDown,
    onOutlineBlur,
    onAddOutlineItem,
    onReorderOutlineItems,
    onCloseAllAccordions,
}: TaskItemProps) {

    // Task-level sortable (for dragging entire tasks)
    const {
        attributes: taskAttributes,
        listeners: taskListeners,
        setNodeRef: setTaskNodeRef,
        transform: taskTransform,
        transition: taskTransition
    } = useSortable({
        id: task.id,
        disabled: !isEditable
    })

    const taskStyle = {
        transition: taskTransition,
        transform: CSS.Transform.toString(taskTransform)
    }

    const getTaskIndex = (id: string) => task.outlineItems.findIndex(item => item.id === id)

    function handleOutlineDragEnd(event: { active: any; over: any }) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const originalPos = getTaskIndex(active.id);
        const newPos = getTaskIndex(over.id);

        const reorderedItems = arrayMove(task.outlineItems, originalPos, newPos);
        onReorderOutlineItems(task.id, reorderedItems);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    )

    return (
        <AccordionItem
            ref={setTaskNodeRef}
            style={taskStyle}
            value={task.id}
            className="border-none"
        >
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
                {/* Task Drag Handle */}
                {isEditable && (
                    <div
                        {...taskAttributes}
                        {...taskListeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                        onMouseDown={() => onCloseAllAccordions()}
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}

                <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggleCompletion(task.id)}
                    className='w-[23px] h-[23px] rounded-full'
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

                {tasksLength > 1 && isEditable && (
                    <Trash
                        onClick={() => onDelete(task.id)}
                        className="w-6 h-6 p-1 text-destructive hover:border rounded cursor-pointer"
                    />
                )}

                <AccordionTrigger className="w-6 h-6 p-0 rounded" />
            </div>

            <AccordionContent className="px-4 pb-4" data-task-id={task.id}>
                <div className="space-y-2 mt-2 ml-7">
                    {/* Outline Items with their own DndContext */}
                    <DndContext
                        sensors={sensors}
                        onDragEnd={handleOutlineDragEnd}
                        collisionDetection={closestCorners}
                    >
                        <SortableContext items={task.outlineItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
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
                    </DndContext>

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