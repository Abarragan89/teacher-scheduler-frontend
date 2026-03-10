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
import AddTodoForm from '@/components/forms/add-todo-form.tsx'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from '@/components/ui/scroll-area'

export default function AuthenticatedNavLinks({ email }: { email: string }) {

    const [showAddTodoModal, setShowAddTodoModal] = useState<boolean>(false);

    return (
        <>
            <Sheet open={showAddTodoModal} onOpenChange={setShowAddTodoModal}>
                <SheetContent side="left" className='p-4'>
                    <SheetHeader>
                        <SheetTitle className='mb-3'>New Todo</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className='h-[85vh]'>
                        <AddTodoForm />
                    </ScrollArea>
                </SheetContent>
            </Sheet>


            <NavigationMenu>
                <NavigationMenuList className="gap-x-2">
                    <NavigationMenuItem>
                        <Button className='hover:cursor-pointer' variant={'ghost'} onClick={() => setShowAddTodoModal(true)}>
                            <Plus />
                        </Button>
                    </NavigationMenuItem>

                    <NavigationMenuItem className='absolute top-10 -right-2'>
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
                        <TodoSheet />
                    </NavigationMenuItem>

                    <ModeToggle />

                    <NavigationMenuItem>
                        <UserActionMenu email={email} />
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </>
    )
}
