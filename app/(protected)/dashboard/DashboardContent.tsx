'use client'
import { useDashboardTodos } from '@/lib/hooks/useDashboardTodos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Flag } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import TodoListItem from '@/components/shared/todo-sheet/todo-list-item'
import { TodoItem as BaseTodoItem } from '@/types/todo'

interface DashboardTodoItem extends BaseTodoItem {
    listName?: string
}

export default function DashboardContent() {
    const { upcomingTodos, priorityTodos, isLoading } = useDashboardTodos()
    const queryClient = useQueryClient()

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
                            {upcomingTodos.map((todo: DashboardTodoItem) => (
                                <TodoListItem
                                    key={todo.id}
                                    todo={todo}
                                    listId={findListIdForTodo(todo.id) || ''}
                                    // showListName={true}
                                    // showPopovers={true}
                                    
                                />
                            ))}
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
                            {priorityTodos.map((todo: DashboardTodoItem) => (
                                <TodoListItem
                                    key={todo.id}
                                    todo={todo}
                                    listId={findListIdForTodo(todo.id) || ''}
                                    // showListName={true}
                                    // showPopovers={true}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}