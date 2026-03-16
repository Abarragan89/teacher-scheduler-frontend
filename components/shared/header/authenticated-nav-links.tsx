'use client'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import UserActionMenu from './user-action-menu'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TodoSheet } from '../todo-sheet'

export default function AuthenticatedNavLinks({ email }: { email: string }) {

    return (
        <>
            <NavigationMenu>
                <NavigationMenuList className="gap-x-5">
                    <NavigationMenuItem>
                        <Link href="/dashboard">
                            <Button variant={"ghost"} className='hover:cursor-pointer flex flex-col items-center gap-0 h-auto py-1.5 px-2'>
                                <LayoutDashboard size={18} />
                                <span className="text-xs leading-none">Dashboard</span>
                            </Button>
                        </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <TodoSheet />
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <UserActionMenu email={email} />
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </>
    )
}
