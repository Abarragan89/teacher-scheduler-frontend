import { RecurrencePattern, TodoItem, TodoList } from "@/types/todo"
import { TodoFormData } from "../hooks/useTodoForm"


export const defaultRecurrencePattern = (pastState?: TodoItem): RecurrencePattern => ({
  type: pastState?.recurrencePattern?.type || 'DAILY',
  daysOfWeek: [1],
  daysOfMonth: [],
  nthWeekdayOccurrence: pastState?.recurrencePattern?.nthWeekdayOccurrence || { weekday: 1, ordinal: 1 },
  yearlyDate: undefined,
  timeOfDay: "07:00",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  startDate: new Date(),
  endDate: undefined,
  monthPatternType: pastState?.recurrencePattern?.monthPatternType || 'BY_DATE',
})

export function toTodoFormData({
  currentTodo,
  listId,
  timeSlot,
  todoLists,
  formResetPrevState,
  defaultDueDate,
}: {
  currentTodo?: TodoItem
  listId?: string
  timeSlot?: string
  todoLists: TodoList[],
  formResetPrevState?: TodoItem
  defaultDueDate?: Date
}): TodoFormData {

  // Use currentTodo for editing, or formResetPrevState for form reset
  const sourceTodo = currentTodo || formResetPrevState

  const dueDate = sourceTodo?.dueDate
    ? new Date(sourceTodo?.dueDate)
    : undefined

  const defaultDueDateTime = defaultDueDate
    ? defaultDueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : ""

  const time =
    sourceTodo?.dueDate && dueDate
      ? dueDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      : timeSlot || defaultDueDateTime || ""

  return {
    text: currentTodo?.text ?? '', // Only reset text when editing, not when resetting
    dueDate: currentTodo ? dueDate : defaultDueDate, // Pre-fill with defaultDueDate when creating
    time: time, // Reset time to default or timeSlot
    priority: currentTodo?.priority ?? 1, // Reset priority to default
    editScope: currentTodo?.editScope ?? 'single', // Default to 'single' for new todos, or keep existing scope when editing
    selectedListId:
      listId ??
      sourceTodo?.todoListId ??
      todoLists[0]?.id ??
      '',
    isRecurring: sourceTodo?.isRecurring ?? false,
    recurrencePattern:
      currentTodo?.recurrencePattern
        ? {
          ...currentTodo.recurrencePattern,
          timeOfDay: currentTodo.recurrencePattern.timeOfDay ?? "07:00",
          startDate: currentTodo.recurrencePattern.startDate ? new Date(currentTodo.recurrencePattern.startDate) : new Date(),
          endDate: currentTodo.recurrencePattern.endDate ? new Date(currentTodo.recurrencePattern.endDate) : undefined,
        }
        : defaultRecurrencePattern(formResetPrevState),
  }
}
