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


export default function UserActionMenu({ username }: { username: string }) {

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
            <PopoverContent className='w-[200px] flex flex-col items-center'>
                <p className='text-sm text-center'>{username.split('@')[0]}</p>
                <Button className='mt-3' onClick={logoutUser} variant={'link'}>
                    Logout
                </Button>
            </PopoverContent>
        </Popover>
    )
}
