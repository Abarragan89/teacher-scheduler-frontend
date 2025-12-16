'use client'
import { useReminderTodos } from '@/lib/hooks/useReminderTodos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, Flag } from 'lucide-react'
import { TodoItem as BaseTodoItem } from '@/types/todo'
import Link from 'next/link'
import TodoListItem from '@/components/shared/todo-sheet/todo-list-item'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import AddTodoForm from '@/components/forms/add-todo-form.tsx'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface ReminderTodoItem extends BaseTodoItem {
    listName?: string
}

interface TodoReminderContentProps {
    view?: string
}

export default function TodoReminderContent({ view }: TodoReminderContentProps) {
    const { todayTodos, weekTodos, monthTodos, isLoading } = useReminderTodos()
    const [showEditTodoModal, setShowEditTodoModal] = useState(false);
    const [currentTodo, setCurrentTodo] = useState<ReminderTodoItem | null>(null);
    const [listId, setListId] = useState<string>('');
    const queryClient = useQueryClient();

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
    function showEditModalHandler(todo: ReminderTodoItem) {
        setCurrentTodo(todo);
        setListId(findListIdForTodo(todo.id) || '');
        setShowEditTodoModal(true);
    }
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
                        {todayTodos.map((todo: ReminderTodoItem) => (
                            <TodoListItem
                                key={todo.id}
                                todo={todo}
                                listId={todo.todoListId || ''}
                                onEdit={() => showEditModalHandler(todo)}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    const renderWeekCard = () => (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-x-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    This Week
                    <span className="text-xs font-normal text-muted-foreground">
                        ({weekTodos.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {weekTodos.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No todos due this week"
                        description="Your week is looking clear!"
                    />
                ) : (
                    <div className="space-y-0">
                        {weekTodos.map((todo: ReminderTodoItem) => (
                            <TodoListItem
                                key={todo.id}
                                todo={todo}
                                listId={todo.todoListId || ''}
                                onEdit={() => showEditModalHandler(todo)}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    const renderMonthCard = () => (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-x-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    This Month
                    <span className="text-xs font-normal text-muted-foreground">
                        ({monthTodos.length})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className='pb-5'>
                {monthTodos.length === 0 ? (
                    <EmptyState
                        icon={Flag}
                        title="No todos due this month"
                        description="Your month ahead looks manageable!"
                    />
                ) : (
                    <div className="space-y-0">
                        {monthTodos.map((todo: ReminderTodoItem) => (
                            <TodoListItem
                                key={todo.id}
                                todo={todo}
                                listId={todo.todoListId || ''}
                                onEdit={() => showEditModalHandler(todo)}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <div className="wrapper">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Todo Reminders</h1>
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