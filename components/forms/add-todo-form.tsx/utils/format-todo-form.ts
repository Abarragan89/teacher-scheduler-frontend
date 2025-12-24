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
  formResetPrevState
}: {
  currentTodo?: TodoItem
  listId?: string
  timeSlot?: string
  todoLists: TodoList[],
  formResetPrevState?: TodoItem
}): TodoFormData {

  // Use currentTodo for editing, or formResetPrevState for form reset
  const sourceTodo = currentTodo || formResetPrevState

  const dueDate = sourceTodo?.dueDate
    ? new Date(sourceTodo?.dueDate)
    : undefined

  const time =
    sourceTodo?.dueDate && dueDate
      ? dueDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      : timeSlot || ""

  return {
    text: currentTodo?.text ?? '', // Only reset text when editing, not when resetting
    dueDate: currentTodo ? dueDate : undefined, // Only keep dueDate when editing
    time: time, // Reset time to default or timeSlot
    priority: currentTodo?.priority ?? 1, // Reset priority to default
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
