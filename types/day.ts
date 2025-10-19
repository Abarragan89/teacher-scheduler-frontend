import { OutlineItem } from './outline-item';
import { Task } from './tasks';
export interface DayData {
    dayDate: string;
    id: string;
    schedule: Schedule
}

export interface Schedule {
    id: string;
    tasks: Task[];
}