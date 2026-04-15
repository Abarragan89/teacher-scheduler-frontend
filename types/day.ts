import { Task } from './tasks';
import { Descendant } from 'slate';

export interface DayData {
    dayDate: string;
    id: string;
    schedule: Schedule;
    notes?: Descendant[] | null;
}

export interface Schedule {
    id: string;
    tasks: Task[];
}