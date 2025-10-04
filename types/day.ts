export interface DayData {
    dayDate: string;
    id: string;
    schedules: Schedule[]
}

export interface Schedule {
    id: string;
    tasks: Task[];
}

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    position: number;
    outlineItems: OutlineItem[];
}

export interface OutlineItem {
    id: string;
    text: string;
    completed: boolean;
    indentLevel: number;
}