import { RecurrencePattern, TodoItem, TodoList } from "@/types/todo"
import { TodoFormData } from "../hooks/useTodoForm"

export const DEFAULT_TIME = '07:00'

export const defaultRecurrencePattern = (time: string = DEFAULT_TIME): RecurrencePattern => ({
  type: 'DAILY',
  daysOfWeek: [1],
  daysOfMonth: [],
  nthWeekdayOccurrence: { weekday: 1, ordinal: 1 },
  yearlyDate: null,
  timeOfDay: time,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  startDate: new Date(),
  endDate: undefined,
  monthPatternType: 'BY_DATE',

})

export function toTodoFormData({
  currentTodo,
  listId,
  timeSlot,
  todoLists,
}: {
  currentTodo?: TodoItem
  listId?: string
  timeSlot?: string
  todoLists: TodoList[]
}): TodoFormData {
  const dueDate = currentTodo?.dueDate
    ? new Date(currentTodo?.dueDate)
    : undefined

  const time =
    currentTodo?.dueDate && dueDate
      ? dueDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      : timeSlot || ""

  return {
    text: currentTodo?.text ?? '',
    dueDate,
    time,
    priority: currentTodo?.priority ?? 1,
    selectedListId:
      listId ??
      currentTodo?.todoListId ??
      todoLists[0]?.id ??
      '',
    isRecurring: currentTodo?.isRecurring ?? false,
    recurrencePattern:
      currentTodo?.recurrencePattern
        ? {
          ...currentTodo.recurrencePattern,
          timeOfDay: currentTodo.recurrencePattern.timeOfDay ?? "07:00",
          startDate: currentTodo.recurrencePattern.startDate ? new Date(currentTodo.recurrencePattern.startDate) : new Date(),
          endDate: currentTodo.recurrencePattern.endDate ? new Date(currentTodo.recurrencePattern.endDate) : undefined,
        }
        : defaultRecurrencePattern(time),
  }
}
