import * as React from 'react';

// import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';

import { useMediaQuery } from '@/hooks/user-media-query';

export function ResponsiveDialog({
    children,
    isOpen,
    setIsOpen,
    title,
    description,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    description?: string;
}) {
    const isDesktop = useMediaQuery('(min-width: 575px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} onPointerMove={(e) => e.stopPropagation()}
                    className="sm:max-w-[450px] overflow-y-hidden p-4 rounded-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription className="sr-only">{description}</DialogDescription>
                        )}
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
            <DrawerContent tabIndex={0} className='px-8 pb-10'>
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DrawerHeader>
                {children}
            </DrawerContent>
        </Drawer>
    );
}