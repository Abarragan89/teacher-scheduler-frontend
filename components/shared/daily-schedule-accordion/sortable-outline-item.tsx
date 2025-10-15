'use client'
import { BareInput } from "@/components/ui/bare-bones-input"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical } from 'lucide-react'
import { OutlineItem } from '@/types/outline-item'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"

// Import utility functions
import { AccordionState } from './utils/types'
import { toggleOutlineItemCompletion, updateOutlineItem, handleOutlineBlur } from './utils/outline-operations'
import { handleOutlineKeyDown } from './utils/keyboard-handlers'

// Outline focus handler
const handleOutlineFocus = (taskId: string, itemId: string, state: AccordionState) => {
    const { tasks, setFocusedText } = state
    const task = tasks.find(t => t.id === taskId)
    const item = task?.outlineItems.find(i => i.id === itemId)
    if (item) {
        setFocusedText(item.text) // Just store the text
    }
}

interface SortableOutlineItemProps {
    item: OutlineItem
    taskId: string
    isEditable: boolean
    state: AccordionState
}

export default function SortableOutlineItem({
    item,
    taskId,
    isEditable,
    state
}: SortableOutlineItemProps) {
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
        opacity: isDragging ? 0 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-start gap-3"
        >

            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                style={{
                    marginLeft: `${item.indentLevel * 20}px`,
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent'
                }}
            >
                <GripVertical className="w-3 h-3" />
            </div>

            {/* Regular content - not draggable */}
            <div
                className="flex items-start gap-3 flex-1"
            >
                <Checkbox
                    className='w-[15px] h-[16px] rounded-full mt-[2px]'
                    checked={item.completed}
                    onCheckedChange={() => toggleOutlineItemCompletion(taskId, item.id, state)}
                />

                <BareInput
                    className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                    placeholder="Add Talking Point..."
                    value={item.text}
                    onChange={(e) => updateOutlineItem(taskId, item.id, e.target.value, state)}
                    onKeyDown={(e) => handleOutlineKeyDown(e, taskId, item.id, state)}
                    onBlur={() => handleOutlineBlur(taskId, item.id, item.text, item.position, item.indentLevel, item.completed, state)}
                    data-item-id={item.id}
                    onFocus={() => handleOutlineFocus(taskId, item.id, state)}
                    disabled={!isEditable}
                    readOnly={!isEditable}
                    // Prevent these events from bubbling up to drag handlers
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}  // Add this
                    onTouchMove={(e) => e.stopPropagation()}   // Add this
                />
            </div>
        </div>
    )
}