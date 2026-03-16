"use client";
import React from 'react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch';
import { SunMedium, MoonIcon } from 'lucide-react';

export default function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const isDark = theme === 'dark' || theme === 'system'

    return (
        <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-2 text-sm">
                {isDark ? <MoonIcon className="w-4 h-4" /> : <SunMedium className="w-4 h-4" />}
                <span>{isDark ? 'Dark' : 'Light'}</span>
            </div>
            <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
        </div>
    )
}
