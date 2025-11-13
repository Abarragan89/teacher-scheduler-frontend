'use client'
import { BareInput } from "@/components/ui/bare-bones-input"
import { GripVertical, Square, SquareCheckBig, ChevronRight, ChevronLeft } from 'lucide-react'
import { OutlineItem } from '@/types/outline-item'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from "@dnd-kit/utilities"
import { AccordionState } from './utils/types'
import { toggleOutlineItemCompletion, updateOutlineItem, handleOutlineBlur, handleOutlineFocus, indentOutlineItem, unindentOutlineItem } from './utils/outline-operations'
import { handleOutlineKeyDown } from './utils/keyboard-handlers'
import useSound from 'use-sound'

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

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });

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
            className={`flex items-start gap-1 mb-2`}
        >
            {/* Indent/Unindent chevron buttons - temporarily visible on all screens for testing */}
            <div className="flex items-center gap-1 opacity-80 lg:hidden mt-1">
                {item.indentLevel > 0 && (
                    <button
                        onClick={() => unindentOutlineItem(taskId, item.id, state)}
                        className="flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                        title="Unindent"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
                {item.indentLevel < 1 && (
                    <button
                        onClick={() => indentOutlineItem(taskId, item.id, state)}
                        className="flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                        title="Indent"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded text-muted-foreground"
                style={{
                    marginLeft: `${item.indentLevel * 25}px`,
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent'
                }}
            >
                <GripVertical className="w-4 h-4" />
            </div>
            {/* Regular content - not draggable */}
            <div className={`flex items-start gap-2 flex-1`}>
                {/* Smaller checkboxes for indented fields */}
                {item?.indentLevel > 0 ? (
                    <p
                        onClick={() => toggleOutlineItemCompletion(taskId, item.id, state, playCompleteSound)}
                        className={`min-w-[15px] min-h-[15px] mt-[4px] rounded-full mr-1
                        ${item.completed ? 'bg-ring border border-ring' : 'border border-muted-foreground'}
                        `}
                    />
                ) : (
                    <button
                        onClick={() => toggleOutlineItemCompletion(taskId, item.id, state, playCompleteSound)}
                    >
                        {item.completed ? (
                            <SquareCheckBig className="w-5 h-5 text-ring" />
                        ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>
                )}

                <BareInput
                    className={`flex-1 text-sm
                        ${item.completed ? 'line-through text-muted-foreground' : ''} 
                        ${!isEditable ? 'cursor-default' : ''}
                        ${item.indentLevel > 0 ? 'bg-muted' : 'pl-0 border-none'}
                    `}
                    placeholder="Add Detail..."
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