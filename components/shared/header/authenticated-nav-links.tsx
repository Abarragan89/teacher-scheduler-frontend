import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import ModeToggle from './mode-toggle'
import UserActionMenu from './user-action-menu'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TodoSheet } from '../todo-sheet'
import { serverTodoLists } from '@/lib/api/services/todos/server'

export default async function AuthenticatedNavLinks({ email }: { email: string }) {

    const todoLists = await serverTodoLists.getTodoLists();

    return (
        <NavigationMenu>
            <NavigationMenuList className="gap-x-2">
                <NavigationMenuItem>
                    <Link href="/dashboard">
                        <Button variant={"ghost"} className='hover:cursor-pointer'>
                            <CalendarDays
                                size={18}
                            />
                        </Button>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <TodoSheet
                        todoLists={todoLists}
                    />
                </NavigationMenuItem>

                <ModeToggle />

                <NavigationMenuItem>
                    <UserActionMenu email={email} />
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
