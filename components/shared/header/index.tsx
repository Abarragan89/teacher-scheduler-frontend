import { Button } from '@/components/ui/button'
import React from 'react'
import ModeToggle from './modeToggle'
import {
  NavigationMenu,
  // NavigationMenuContent,
  // NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // NavigationMenuTrigger,
  // NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import SigninBtn from '@/components/signinBtn'

export default function Index() {
  return (
    <header className="p-6 flex justify-end">
      <NavigationMenu>
        <NavigationMenuList className="gap-x-4">
          <ModeToggle />
          <NavigationMenuItem>
            <SigninBtn />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>


    </header>
  )
}
