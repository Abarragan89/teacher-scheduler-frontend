import React from 'react';
import TodoReminderContent from './TodoReminderContent';

interface pageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TodoReminderPage({ searchParams }: pageProps) {

    const view = (await searchParams).view as string

    return (
        <TodoReminderContent view={view} />
    )
}
