'use client'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

interface TodoList {
    id: string
    listName: string
    todos: any[]
}

interface PrefetchTodoListsProps {
    children: React.ReactNode
    initialData: TodoList[]
}

export default function PrefetchTodoLists({
    children,
    initialData
}: PrefetchTodoListsProps) {
    const queryClient = useQueryClient()

    useEffect(() => {
        // Prefill React Query cache with server data
        queryClient.setQueryData(['todos'], initialData)
    }, [initialData, queryClient])

    return <>{children}</>
}