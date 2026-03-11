'use client'
import { Square, SquareCheckBig } from 'lucide-react'

interface OutlineItemIndicatorProps {
    indentLevel: number
    completed: boolean
    onToggle?: () => void
}

export default function OutlineItemIndicator({ indentLevel, completed, onToggle }: OutlineItemIndicatorProps) {
    if (indentLevel >= 2) {
        return (
            <span className="min-w-[9px] mt-[5px] text-muted-foreground text-base leading-none select-none">
                •
            </span>
        )
    }

    if (indentLevel === 1) {
        return (
            <p
                onClick={onToggle}
                className={`min-w-[15px] min-h-[15px] mt-[4px] rounded-full mr-1 cursor-pointer
                    ${completed ? 'bg-ring border border-ring' : 'border border-muted-foreground'}
                `}
            />
        )
    }

    // indentLevel === 0
    return (
        <button onClick={onToggle}>
            {completed ? (
                <SquareCheckBig className="w-5 h-5 text-ring" />
            ) : (
                <Square className="w-5 h-5 text-muted-foreground" />
            )}
        </button>
    )
}
