'use client'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React, { useState } from 'react'
import ModeToggle from './mode-toggle'
import UserActionMenu from './user-action-menu'
import Link from 'next/link'
import { CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TodoSheet } from '../todo-sheet'
import InstallPrompt from '@/components/install-prompt'
import { useTodoLists } from '@/lib/hooks/useTodoLists'
import { ResponsiveDialog } from '@/components/responsive-dialog'
import AddTodoForm from '@/components/forms/add-todo-form'

export default function AuthenticatedNavLinks({ email }: { email: string }) {

    const { data: todoLists, isLoading } = useTodoLists()
    const [showAddTodoModal, setShowAddTodoModal] = useState<boolean>(false);

    if (isLoading) {
        return (
            <NavigationMenu>
                <NavigationMenuList className="gap-x-2">
                    <NavigationMenuItem className='absolute top-10 left-[105px]'>
                        <InstallPrompt />
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="/dashboard">
                            <Button variant={"ghost"} className='hover:cursor-pointer'>
                                <CalendarDays size={18} />
                            </Button>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    </NavigationMenuItem>
                    <ModeToggle />
                    <NavigationMenuItem>
                        <UserActionMenu email={email} />
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        )
    }

    if (showAddTodoModal) {
        return (
            <ResponsiveDialog
                title='Add New Todo'
                isOpen={showAddTodoModal}
                setIsOpen={setShowAddTodoModal}
            >
                <AddTodoForm />
            </ResponsiveDialog>
        )
    }

    return (
        <NavigationMenu>
            <NavigationMenuList className="gap-x-2">
                <NavigationMenuItem>
                    <Button variant={'ghost'} onClick={() => setShowAddTodoModal(true)}>
                        <Plus />
                    </Button>
                </NavigationMenuItem>

                <NavigationMenuItem className='absolute top-10 left-[105px]'>
                    <InstallPrompt />
                </NavigationMenuItem>
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
                        todoLists={todoLists || []}
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
