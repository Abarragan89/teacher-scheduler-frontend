import { OutlineItem } from './outline-item';

export interface DayData {
    dayDate: string;
    id: string;
    schedule: Schedule
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