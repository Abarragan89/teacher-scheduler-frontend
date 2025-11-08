'use client'
import { useDashboardTodos } from '@/lib/hooks/useDashboardTodos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Circle, Calendar, Flag } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toggleTodoCompletion } from '@/components/shared/todo-sheet/utils/todo-operations'
import DueDatePopover from '@/components/shared/todo-sheet/popovers/due-date-popover'
import PriorityPopover from '@/components/shared/todo-sheet/popovers/priority-popover'
import useSound from 'use-sound'
import { TodoItem as BaseTodoItem } from '@/types/todo'

interface DashboardTodoItem extends BaseTodoItem {
    listName?: string
}

export default function DashboardContent() {
    const { upcomingTodos, priorityTodos, isLoading } = useDashboardTodos()
    const queryClient = useQueryClient()

    const [playCompleteSound] = useSound('/sounds/todoWaterClick.wav', {
        volume: 0.4
    });
    const [playTodoRemovedSound] = useSound('/sounds/todoRemoved.wav', {
        volume: 0.3
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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

    const handleTodoToggle = async (todoId: string) => {
        const listId = findListIdForTodo(todoId)
        if (!listId) return

        await toggleTodoCompletion(
            listId,
            todoId,
            playCompleteSound,
            playTodoRemovedSound,
            queryClient
        )
    }

    const renderTodoItem = (todo: DashboardTodoItem) => (
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
                        />

                        {/* Priority Popover */}
                        <PriorityPopover
                            todo={todo}
                            queryClient={queryClient}
                        />
                    </div>
                )}

            </div>
        </div>
    )

    return (
        <div className="wrapper grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-28">
            {/* Upcoming Todos by Due Date */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-x-2 text-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Upcoming Todos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingTodos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No upcoming todos with due dates</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {upcomingTodos.map(renderTodoItem)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* High Priority Todos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Flag className="w-5 h-5 text-red-500" />
                        Priority Todos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {priorityTodos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No priority todos found</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {priorityTodos.map(renderTodoItem)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}