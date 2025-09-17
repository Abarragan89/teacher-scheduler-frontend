import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import ModeToggle from './mode-toggle'
import SigninBtn from '@/components/signin-btn'

export default function GuestNavLinks() {
  return (
      <NavigationMenu>
          <NavigationMenuList className="gap-x-4">
            <ModeToggle />
            <NavigationMenuItem>
              <SigninBtn />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
  )
}
