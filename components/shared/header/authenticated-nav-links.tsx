import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import React from 'react'
import ModeToggle from './mode-toggle'
import { Button } from '@/components/ui/button'

export default function AuthenticatedNavLinks() {
  return (
      <NavigationMenu>
        <NavigationMenuList className="gap-x-4">
          <ModeToggle />
          <NavigationMenuItem>
           <Button>Logout</Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
  )
}
