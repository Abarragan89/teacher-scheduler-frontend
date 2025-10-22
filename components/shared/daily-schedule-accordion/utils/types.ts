import { Task } from '@/types/tasks'

// Reference object containing all the state and setters needed by utility functions
export interface AccordionState {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    openAccordions: string[]
    setOpenAccordions: React.Dispatch<React.SetStateAction<string[]>>
    focusedText?: string
    setFocusedText?: React.Dispatch<React.SetStateAction<string>>
    focusedIndentLevel?: number
    setFocusedIndentLevel?: React.Dispatch<React.SetStateAction<number>>
    scheduleId: string
}