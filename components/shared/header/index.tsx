import React from 'react'
import ModeToggle from './mode-toggle'
import Image from 'next/image'
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
import SigninBtn from '@/components/signin-btn'
import Link from 'next/link'

export default function Index() {
  return (
    <header className="p-6 flex-between">
      <Link
        href={"/"}
        className='flex justify-center items-end'
      >
        <Image
          src={'/images/logo.png'}
          height={50}
          width={50}
          alt="Company Logo"
        />
        <div className='text-xs ml-2 mb-1 text-primary tracking-wider'>
          <p className='font-bold'>Teacher</p>
          <p>Scheduler</p>
        </div>
      </Link>
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
