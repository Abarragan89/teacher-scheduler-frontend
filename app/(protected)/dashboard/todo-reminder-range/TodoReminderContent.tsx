'use client'
import { useReminderTodos } from '@/lib/hooks/useReminderTodos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Circle, Calendar, Clock, Flag } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toggleTodoCompletion } from '@/components/shared/todo-sheet/utils/todo-operations'
import DueDatePopover from '@/components/shared/todo-sheet/popovers/due-date-popover'
import PriorityPopover from '@/components/shared/todo-sheet/popovers/priority-popover'
import useSound from 'use-sound'
import { TodoItem as BaseTodoItem } from '@/types/todo'
import Link from 'next/link'

interface ReminderTodoItem extends BaseTodoItem {
    listName?: string
}

interface TodoReminderContentProps {
    view?: string
}

export default function TodoReminderContent({ view }: TodoReminderContentProps) {
    const { todayTodos, weekTodos, monthTodos, isLoading } = useReminderTodos()
    const queryClient = useQueryClient()

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', {
        volume: 0.3
    });

    if (isLoading) {
        return (
            <div className="wrapper">
                <div className="mb-6">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>

                {/* Tab skeleton */}
                <div className="flex space-x-1 border-b mt-4 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24" />
                    ))}
                </div>

                {/* Single card skeleton */}
                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const findListIdForTodo = (todoId: string) => {
        const todoLists = queryClient.getQueryData(['todos']) as any[]
        if (!todoLists) return null

        for (const list of todoLists) {
            if (list.todos.some((todo: any) => todo.id === todoId)) {
                return list.id
            }
        }
        return null
    }

    const handleTodoToggle = (todoId: string) => {
        const listId = findListIdForTodo(todoId)
        if (!listId) return

        toggleTodoCompletion(
            listId,
            todoId,
            playCompleteSound,
            playTodoRemovedSound,
            queryClient
        )
    }

    const isOverdue = (dueDate: string | Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        return due < today
    }

    const renderTodoItem = (todo: ReminderTodoItem) => {
        const overdue = isOverdue(String(todo.dueDate!))

        return (
            <div
                key={todo.id}
                className={`flex items-start gap-3 border-b pb-3 transition-all duration-300 ease-in-out transform-gpu overflow-hidden ${todo.deleting
                    ? 'opacity-0 scale-95 -translate-y-1'
                    : 'opacity-100 scale-100 translate-y-0'
                    }`}
                style={{
                    height: todo.deleting ? '0px' : 'auto',
                    minHeight: todo.deleting ? '0px' : '60px',
                    paddingTop: todo.deleting ? '0px' : '4px',
                    paddingBottom: todo.deleting ? '0px' : '4px',
                    transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    transformOrigin: 'top center'
                }}
            >
                {/* Checkbox */}
                <div className={`flex-shrink-0 pt-1 transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-75 opacity-0' : 'transform scale-100 opacity-100'
                    }`}>
                    <button
                        onClick={() => handleTodoToggle(todo.id)}
                        className={`flex-shrink-0 rounded transition-all duration-300 ${todo.deleting
                            ? 'opacity-0 pointer-events-none transform scale-50'
                            : 'hover:bg-muted transform scale-100'
                            }`}
                        disabled={todo.deleting}
                    >
                        {todo.completed ? (
                            <CheckCircle className="w-5 h-5 text-ring" />
                        ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 pt-[2px] transition-all duration-300 ease-in-out ${todo.deleting ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
                    }`}>
                    <p className={`text-sm font-medium leading-normal ${todo.completed ? 'line-through text-muted-foreground opacity-75' : ''
                        } ${overdue && !todo.completed ? 'text-red-500' : ''
                        } ${todo.deleting ? 'pointer-events-none transform scale-90' : ''
                        }`}>
                        {todo.text}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        {todo.listName}
                    </p>

                    {!todo.deleting && (
                        <div className="flex justify-between text-muted-foreground opacity-70 text-xs mt-1">
                            {/* Due Date Popover */}
                            <DueDatePopover
                                todo={todo}
                                queryClient={queryClient}
                                listId={findListIdForTodo(todo.id) || ''}
                            />

                            {/* Priority Popover */}
                            <PriorityPopover
                                todo={todo}
                                queryClient={queryClient}
                                listId={findListIdForTodo(todo.id) || ''}
                            />
                        </div>
                    )}

                </div>
            </div>
        )
    }

    const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
        <div className="text-center py-8 text-muted-foreground">
            <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{title}</p>
            <p className="text-xs mt-1">{description}</p>
        </div>
    )

    const renderTodayCard = () => (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-x-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Due Today
                    <span className="text-xs font-normal text-muted-foreground">
                        ({todayTodos.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {todayTodos.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No todos due today"
                        description="You're all caught up for today!"
                    />
                ) : (
                    <div className="space-y-0">
                        {todayTodos.map(renderTodoItem)}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    const renderWeekCard = () => (
        <>
            {weekTodos.length === 0 ? (
                <EmptyState
                    icon={Clock}
                    title="No todos due this week"
                    description="Your week is looking clear!"
                />
            ) : (
                <div className="space-y-0">
                    {weekTodos.map(renderTodoItem)}
                </div>
            )}
        </>

    )

    const renderMonthCard = () => (
        <Card className="max-w-2xl">
            <CardContent className='pb-5'>
                {monthTodos.length === 0 ? (
                    <EmptyState
                        icon={Flag}
                        title="No todos due this month"
                        description="Your month ahead looks manageable!"
                    />
                ) : (
                    <div className="space-y-0">
                        {monthTodos.map(renderTodoItem)}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="wrapper">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Todo Reminders</h1>
                {/* <p className="text-muted-foreground">View your todos organized by due dates</p> */}
            </div>

            {/* Tab Navigation */}
            <div className="text- flex space-x-1 border-b mt-4 mb-6 w-fit">
                <Link
                    href={`?view=today`}
                    className={`px-4 py-2 border-b-2 transition-colors ${view === 'today'
                        ? 'border-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Today ({todayTodos.length})
                </Link>
                <Link
                    href={`?view=week`}
                    className={`px-4 py-2 border-b-2 transition-colors ${view === 'week'
                        ? 'border-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    This Week ({weekTodos.length})
                </Link>
                <Link
                    href={`?view=month`}
                    className={`px-4 py-2 border-b-2 transition-colors ${view === 'month'
                        ? 'border-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    This Month ({monthTodos.length})
                </Link>
            </div>

            {/* Content based on view */}
            <div className="mb-28">
                {view === 'today' && renderTodayCard()}
                {view === 'week' && renderWeekCard()}
                {view === 'month' && renderMonthCard()}

                {/* Default to today if no view specified */}
                {!view && renderTodayCard()}
            </div>
        </div>
    )
}