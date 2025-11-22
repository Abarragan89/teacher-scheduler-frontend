"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import { toast } from 'sonner';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Printer, Share } from 'lucide-react';

export default function SharableLink({
    dayId
}: {
    dayId: string
}) {


    const handleCopyClick = async () => {
        try {
            await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/public-schedule-view/${dayId}`);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Share
                    size={20}
                    className='hover:text-ring hover:cursor-pointer text-muted-foreground print:hidden ml-2 mr-3'
                />
            </PopoverTrigger>
            <PopoverContent className='print:hidden flex flex-col gap-2 w-fit p-3 px-5 mr-10'>
                <Button onClick={handleCopyClick} variant={'ghost'}>
                    Copy Link
                </Button>
                <Button
                    onClick={() => window.print()}
                    variant={'ghost'}
                    className='print:hidden'
                >
                    <Printer /> Print
                </Button>
            </PopoverContent>
        </Popover>
    )
}
