import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import ModeToggle from './mode-toggle'
import UserActionMenu from './user-action-menu'
import Link from 'next/link'
import { CalendarDays, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TodoSheet } from '../todo-sheet'

export default function AuthenticatedNavLinks({ email }: { email: string }) {
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
                   <TodoSheet />
                </NavigationMenuItem>

                <ModeToggle />
                
                <NavigationMenuItem>
                    <UserActionMenu email={email} />
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
