'use client'
import { useDashboardTodos } from '@/lib/hooks/useDashboardTodos'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Circle, Calendar, Flag } from 'lucide-react'

export default function DashboardContent() {
    const { upcomingTodos, priorityTodos, isLoading } = useDashboardTodos()

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

    const getPriorityBadge = (priority: number) => {
        switch (priority) {
            case 4:
                return <Badge variant="destructive" className="text-xs">High</Badge>
            case 3:
                return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
            case 2:
                return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Low</Badge>
            default:
                return <Badge variant="outline" className="text-xs">None</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Upcoming Todos by Due Date */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
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
                        <div className="space-y-3">
                            {upcomingTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                >
                                    <button className="mt-0.5 flex-shrink-0">
                                        {todo.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                                            {todo.text}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                Due: {formatDate(todo.dueDate!)}
                                            </span>
                                            {getPriorityBadge(todo.priority)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {todo.listName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* High Priority Todos */}
            <Card>
                <CardHeader className="pb-4">
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
                        <div className="space-y-3">
                            {priorityTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                >
                                    <button className="mt-0.5 flex-shrink-0">
                                        {todo.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                                            {todo.text}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getPriorityBadge(todo.priority)}
                                            {todo.dueDate && (
                                                <span className="text-xs text-muted-foreground">
                                                    Due: {formatDate(todo.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {todo.listName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}