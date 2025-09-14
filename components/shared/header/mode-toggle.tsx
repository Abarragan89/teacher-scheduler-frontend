"use client";
import React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button';
import { SunMedium, MoonIcon } from 'lucide-react';
import {
    // NavigationMenuContent,
    NavigationMenuItem,
    // NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function ModeToggle() {

    const { theme, setTheme } = useTheme()

    function renderThemeIcon() {
        switch (theme) {
            case 'dark':
                return <MoonIcon />
            case 'light':
                return <SunMedium />
            default:
                return <SunMedium />
        }
    }

    return (
        <NavigationMenuItem>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost">{renderThemeIcon()}</Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                    <ul>
                        <li>
                            <Button variant={"ghost"} asChild onClick={() => setTheme("light")} className='hover:cursor-pointer'>
                                <span className={theme === "light" ? "text-ring" : ""}>
                                    <SunMedium /> Light
                                </span>
                            </Button>
                        </li>
                        <li>
                            <Button variant={"ghost"} asChild onClick={() => setTheme("dark")} className='hover:cursor-pointer'>
                                <span className={theme === "dark" ? "text-ring" : ""}>
                                    <MoonIcon /> Dark
                                </span>
                            </Button>
                        </li>
                    </ul>
                </PopoverContent>
            </Popover>
        </NavigationMenuItem>
    )
}
