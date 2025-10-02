import { KeyboardEvent } from "react";

export interface TaskItemProps {
    task: Task
    tasksLength: number
    isEditable: boolean
    isDragging: boolean
    onToggleCompletion: (taskId: string) => void
    onUpdateTitle: (taskId: string, title: string) => void
    onTitleKeyDown: (e: KeyboardEvent<HTMLInputElement>, taskId: string) => void
    onToggleOutlineCompletion: (taskId: string, itemId: string) => void
    onUpdateOutlineItem: (taskId: string, itemId: string, text: string) => void
    onOutlineKeyDown: (e: KeyboardEvent<HTMLInputElement>, taskId: string, itemId: string) => void
    onOutlineBlur: (taskId: string, itemId: string, text: string) => void
    onTaskBlur: (taskId: string, text: string) => void
    onAddOutlineItem: (taskId: string) => void
    onCloseAllAccordions: () => void
}

export interface OutlineItem {
    id: string
    text: string
    completed: boolean
    indentLevel: number
}

export interface Task {
    id: string
    title: string
    completed: boolean
    outlineItems: OutlineItem[]
}