'use client'
import { useDashboardTodos } from '@/lib/hooks/useDashboardTodos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Flag } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import TodoListItem from '@/components/todo-list-item'
import { TodoItem as BaseTodoItem } from '@/types/todo'
import { useUser } from '@/components/providers/UserProvider'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DashboardTodoItem extends BaseTodoItem {
    listName?: string
}

export default function DashboardContent() {
    const { upcomingTodos, priorityTodos, isLoading } = useDashboardTodos()
    const queryClient = useQueryClient()
    const { email } = useUser()

    const rawName = email.split('@')[0].split('.')[0]
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
    const hour = new Date().getHours()
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    if (isLoading) {
        return (
            <>
                <div className="mb-5">
                    <Skeleton className="h-7 w-52 mb-1" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            </>
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
        <>
            <div className="mb-5">
                <h1 className="text-xl font-semibold">{timeGreeting}, {displayName}</h1>
                <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s on your plate</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Upcoming Todos by Due Date */}
                <Card className="border-l-4 border-l-blue-500 p-4 px-3">
                    <CardHeader className='px-3'>
                        <CardTitle className="flex items-center gap-x-2 text-lg">
                            <div className="p-2 rounded-full bg-blue-500/10">
                                <Calendar className="w-4 h-4 text-blue-500" />
                            </div>
                            Upcoming Todos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='pr-0'>
                        <ScrollArea className="h-80 pr-6">
                            {upcomingTodos.length === 0 ? (
                                <div className="text-center text-muted-foreground py-2">
                                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No upcoming todos</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {upcomingTodos.map((todo: DashboardTodoItem) => (
                                        <TodoListItem
                                            key={todo.id}
                                            todo={todo}
                                            listId={findListIdForTodo(todo.id) || ''}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* High Priority Todos */}
                <Card className="border-l-4 border-l-red-500 p-4 px-3">
                    <CardHeader className='px-3'>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <div className="p-2 rounded-full bg-red-500/10">
                                <Flag className="w-4 h-4 text-red-500" />
                            </div>
                            Priority Todos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='pr-0'>
                        <ScrollArea className="h-80 pr-6">
                            {priorityTodos.length === 0 ? (
                                <div className="text-center text-muted-foreground py-2">
                                    <Flag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No priority todos</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {priorityTodos.map((todo: DashboardTodoItem) => (
                                        <TodoListItem
                                            key={todo.id}
                                            todo={todo}
                                            listId={findListIdForTodo(todo.id) || ''}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}