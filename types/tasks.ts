import { KeyboardEvent } from "react";
import { OutlineItem } from './outline-item';

export interface TaskItemProps {
    task: Task;
    tasksLength: number;
    isEditable: boolean;
    isDragging: boolean;
    onToggleCompletion: (taskId: string) => void;
    onUpdateTitle: (taskId: string, title: string) => void;
    onTitleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>, taskId: string) => void;
    onToggleOutlineCompletion: (taskId: string, itemId: string) => void;
    onUpdateOutlineItem: (taskId: string, itemId: string, text: string) => void;
    onOutlineKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>, taskId: string, itemId: string) => void;
    onOutlineBlur: (taskId: string, itemId: string, text: string, position: number, indentation: number, compeleted: boolean) => void;
    onTaskBlur: (taskId: string, text: string) => void;
    onCloseAllAccordions: () => void;
    onFocusTask: (taskId: string) => void;
    onFocusOutline: (taskId: string, itemId: string) => void;
}

export interface Task {
    id: string;
    title: string;
    clientKey?: string;
    position: number;
    completed: boolean;
    startTime?: string;
    endTime?: string;
    outlineItems: OutlineItem[];
}