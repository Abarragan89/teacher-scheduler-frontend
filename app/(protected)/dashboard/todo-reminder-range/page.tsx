import React from 'react';
import TodoReminderContent from './TodoReminderContent';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { serverTodoLists } from '@/lib/api/services/todos/server';
import { serverFetch } from '@/lib/api/server';

interface pageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TodoReminderPage({ searchParams }: pageProps) {

    const view = (await searchParams).view as string

    const initialTodos = await serverTodoLists.getTodoLists()
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['todos'],
        queryFn: () => initialTodos,
        staleTime: 5 * 60 * 1000,
        initialData: initialTodos
    });


    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TodoReminderContent view={view} />
        </HydrationBoundary>
    )
}
