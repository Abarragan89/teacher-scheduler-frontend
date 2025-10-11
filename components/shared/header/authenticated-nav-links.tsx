import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import ModeToggle from './mode-toggle'
import UserActionMenu from './user-action-menu'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InstallPrompt from '@/components/install-prompt'

export default function AuthenticatedNavLinks({ username }: { username: string }) {
    return (
        <NavigationMenu>
            <NavigationMenuList className="gap-x-3">
                <NavigationMenuItem>
                    <Link href="/dashboard">
                        <Button variant={"ghost"} className='hover:cursor-pointer'>
                            <CalendarDays />
                        </Button>
                    </Link>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                    <Link href={`/dashboard/daily/${new Date().toISOString().split('T')[0]}`}>
                        Today
                    </Link>
                </NavigationMenuItem> */}
                <ModeToggle />
                <NavigationMenuItem>
                    <UserActionMenu username={username} />
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <InstallPrompt />
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
