'use client'
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { BareInput } from "@/components/ui/bare-bones-input"
import { CheckCircle, Circle, GripVertical } from 'lucide-react'
import { Task } from '@/types/tasks'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import SortableOutlineItem from './sortable-outline-item'
import EditTaskPopover from "./edit-task-popover"
import { AccordionState } from './utils/types'
import { toggleTaskCompletion, updateTaskTitle, handleTaskBlur, handleTaskFocus } from './utils/task-operations'
import { handleTaskTitleKeyDown } from './utils/keyboard-handlers'
import { TimePicker } from "./time-picker"
import { formatTime } from "@/lib/utils"
import useSound from 'use-sound'


interface TaskItemProps {
    task: Task
    isEditable: boolean
    state: AccordionState
}

export default function TaskItem({
    task,
    isEditable,
    state
}: TaskItemProps) {

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });

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

    const isThisAccordionOpen = state.openAccordions.includes(task.id)

    return (
        <AccordionItem
            ref={setTaskNodeRef}
            style={taskStyle}
            value={task.id}
            className={`border-none my-4 rounded-md shadow-lg
                ${isThisAccordionOpen ? 'shadow-lg' : ''}
                `}
            data-task-id={task.id}
        >
            <div className={`relative flex items-center gap-x-[8px] p-2 py-5 bg-muted border pr-3
                ${isThisAccordionOpen ? 'rounded-t-lg border-b-0 border' : 'rounded-md'}
                `}>

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
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Task Completion Checkbox */}
                <button
                    onClick={() => toggleTaskCompletion(task.id, state, playCompleteSound)}
                    className="flex-shrink-0 pl-0 rounded"
                >
                    {task.completed ? (
                        <CheckCircle className="w-6 h-6 text-ring" />
                    ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                </button>


                <BareInput
                    className={`task-title-input flex-1 mr-2 font-bold ${task.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                    placeholder="Activity..."
                    value={task?.title || ''}
                    onChange={(e) => updateTaskTitle(task.id, e.target.value, state)}
                    onBlur={() => handleTaskBlur(task.id, task.title, state)}
                    onFocus={() => handleTaskFocus(task.id, state)}
                    onKeyDown={(e) => handleTaskTitleKeyDown(e, task.id, state)}
                    disabled={!isEditable}
                    readOnly={!isEditable}
                    // Prevent these events from bubbling up to drag handlers
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}  // Add this
                    onTouchMove={(e) => e.stopPropagation()}
                    style={{ fontSize: '17px' }}  // Add this
                />

                {/* Open Close Accordion */}
                <AccordionTrigger className="w-6 h-6 p-0" />

                {/* Pick Time and Edit Menu */}
                {isEditable && (
                    <>
                        <TimePicker
                            setTasks={state.setTasks}
                            taskId={task.id}
                            initialStartTime={task.startTime}
                            initialEndTime={task.endTime}
                        />
                        <EditTaskPopover
                            task={task}
                            setTasks={state.setTasks}
                            state={state}
                        />
                    </>
                )}

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
            </div>

            <AccordionContent className="px-1 pr-3 py-3 border border-t-0 rounded-b-lg" data-task-id={task.id}>
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

                            if (!isEditable && !hasContentItems) {
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
                                    state={state}
                                />
                            ))
                        })()}
                    </SortableContext>
                </div>
            </AccordionContent>
        </AccordionItem>

    )
}