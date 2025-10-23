"use client"
import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import InstallPrompt from '@/components/install-prompt'


export default function UserActionMenu({ email }: { email: string }) {

    const router = useRouter();

    async function logoutUser(): Promise<void> {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: "POST",
                credentials: 'include'
            })
            if (response.ok) {
                router.replace("/")
            }
        } catch (error) {
            console.error('error logging out', error)
        }
    }
    return (
        <Popover>
            <PopoverTrigger className='hover:cursor-pointer'>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] flex flex-col items-center gap-y-3'>
                <p className='text-sm text-center'>{email.split('@')[0]}</p>
                {/* <InstallPrompt /> */}
                <Button onClick={logoutUser} variant={'outline'}>
                    Logout
                </Button>
            </PopoverContent>
        </Popover>
    )
}
