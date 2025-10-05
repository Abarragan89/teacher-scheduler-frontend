'use client'
import { BareInput } from "@/components/ui/bare-bones-input"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical } from 'lucide-react'
import { OutlineItem } from '@/types/tasks'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"

interface SortableOutlineItemProps {
    item: OutlineItem
    taskId: string
    isEditable: boolean
    onToggleOutlineCompletion: (taskId: string, itemId: string) => void
    onUpdateOutlineItem: (taskId: string, itemId: string, text: string) => void
    onOutlineKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, taskId: string, itemId: string) => void
    onOutlineBlur: (taskId: string, itemId: string, text: string, position: number, indentation: number) => void
}

export default function SortableOutlineItem({
    item,
    taskId,
    isEditable,
    onToggleOutlineCompletion,
    onUpdateOutlineItem,
    onOutlineKeyDown,
    onOutlineBlur
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
            className="flex items-center gap-3"
        >

            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                style={{ marginLeft: `${item.indentLevel * 20}px` }}
            >
                <GripVertical className="w-3 h-3" />
            </div>

            {/* Regular content - not draggable */}
            <div
                className="flex items-center gap-3 flex-1"
                style={{ marginLeft: !isEditable ? `${item.indentLevel * 20}px` : '0px' }}
            >
                <Checkbox
                    className='w-[15px] h-[16px] rounded-full'
                    checked={item.completed}
                    onCheckedChange={() => onToggleOutlineCompletion(taskId, item.id)}
                />

                <BareInput
                    className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''} ${!isEditable ? 'cursor-default' : ''}`}
                    placeholder="Add an outline item..."
                    value={item.text}
                    onChange={(e) => onUpdateOutlineItem(taskId, item.id, e.target.value)}
                    onKeyDown={(e) => onOutlineKeyDown(e, taskId, item.id)}
                    onBlur={() => onOutlineBlur(taskId, item.id, item.text, 0, item.indentLevel)}
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