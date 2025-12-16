export interface TodoItem {
    id: string
    text: string
    completed: boolean
    priority: number
    category?: string    // Optional category field
    todoListId?: string
    dueDate: String | null
    isRecurring: boolean
    recurrencePattern: RecurrencePattern
    createdAt?: string   // For sorting by creation date
    deleting?: boolean  // For smooth deletion animation
    isNew?: boolean      // For new item slide-in animation
    slideDown?: boolean  // For existing items slide-down animation
}

export interface TodoList {
    id: string
    listName: string
    isDefault: boolean
    todos: TodoItem[]
}

interface BaseRecurrence {
    startDate: Date, 
    endDate: Date, 
    timeOfDay: string,
    timeZone: string
}

export interface DailyRecurrence extends BaseRecurrence {
    type: 'DAILY'
}

export interface WeeklyRecurrence extends BaseRecurrence {
    type: 'WEEKLY'
    daysOfWeek: number[]   // 0=Sunday, 1=Monday, etc.
}

export interface MonthlyByDateRecurrence extends BaseRecurrence {
  type: 'MONTHLY'
  monthPatternType: 'BY_DATE'
  daysOfMonth: number[] // [1, 15, -1]
}

export interface MonthlyByDayRecurrence extends BaseRecurrence {
  type: 'MONTHLY'
  monthPatternType: 'BY_DAY'
  ordinal: number // 1, 2, 3, -1
  weekday: number // 0-6
}

export interface YearlyRecurrence extends BaseRecurrence {
  type: 'YEARLY'
  yearlyDate: string // "MM-DD"
}

export type RecurrencePattern =
  | DailyRecurrence
  | WeeklyRecurrence
  | MonthlyByDateRecurrence
  | MonthlyByDayRecurrence
  | YearlyRecurrence


// export interface RecurrencePattern {
//     type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
//     daysOfWeek: number[]           // For weekly recurrence (0=Sunday, 1=Monday, etc.)
//     daysOfMonth: number[]      // For monthly recurrence (1-31, -1 for last day)
//     nthWeekdayDay?: number               // For monthly recurrence (e.g., 1st, 2nd, etc.)
//     nthWeekdayOccurrence?: number        // For monthly recurrence (e.g., Monday=1, Tuesday=2, etc.)
//     timeOfDay: string                   // Time of the recurring todo
//     yearlyDate: string | null              // For yearly recurrence
//     timeZone: string               // Time zone for the recurrence
//     startDate: Date | undefined,
//     endDate: Date | undefined,
//     monthPatternType: 'BY_DAY' | 'BY_DATE' // For monthly recurrence
// }