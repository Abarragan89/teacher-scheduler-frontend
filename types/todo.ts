export interface TodoItem {
    id: string
    text: string
    completed: boolean
    priority: number
    category?: string    // Optional category field
    todoListId?: string
    dueDate: string | null
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

export interface RecurrencePattern {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    daysOfWeek: number[]           // For weekly recurrence (0=Sunday, 1=Monday, etc.)
    daysOfMonth: number[]      // For monthly recurrence (1-31, -1 for last day)
    nthWeekdayOccurrence: { ordinal: number, weekday: number }        // For monthly recurrence (e.g., Monday=1, Tuesday=2, etc.)
    timeOfDay: string                   // Time of the recurring todo
    yearlyDate: string | null              // For yearly recurrence
    timeZone: string               // Time zone for the recurrence
    startDate: Date | undefined,
    endDate: Date | undefined,
    monthPatternType: 'BY_DAY' | 'BY_DATE' // For monthly recurrence
}


export function createDefaultRecurrencePattern(
  time: string
): RecurrencePattern {
  return {
    type: 'DAILY',
    daysOfWeek: [1],
    daysOfMonth: [],
    nthWeekdayOccurrence: { ordinal: 1, weekday: 1 },
    yearlyDate: null,
    timeOfDay: time,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    startDate: new Date(),
    endDate: undefined,
    monthPatternType: 'BY_DATE',
  };
}