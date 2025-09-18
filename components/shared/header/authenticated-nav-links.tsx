import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import ModeToggle from './mode-toggle'
import UserActionMenu from './user-action-menu'
import Link from 'next/link'

export default function AuthenticatedNavLinks({ username }: { username: string }) {
    return (
        <NavigationMenu>
            <NavigationMenuList className="gap-x-4">
                <NavigationMenuItem>
                    <Link href="/dashboard">
                        Dashboard
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/profile">
                        Profile
                    </Link>
                </NavigationMenuItem>

                <ModeToggle />

                <NavigationMenuItem>

                    <UserActionMenu
                        username={username}
                    />

                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}
