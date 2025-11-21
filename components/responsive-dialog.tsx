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
    hideDescription = false
}: {
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    description?: string;
    hideDescription?: boolean;
}) {
    const isDesktop = useMediaQuery('(min-width: 520px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} onPointerMove={(e) => e.stopPropagation()}
                    className="xs:max-w-[450px] overflow-y-hidden p-7 rounded-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription className={hideDescription ? "sr-only" : ""}>{description}</DialogDescription>
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
                    {description && <DialogDescription className={hideDescription ? "sr-only" : ""}>{description}</DialogDescription>}
                </DrawerHeader>
                {children}
            </DrawerContent>
        </Drawer>
    );
}