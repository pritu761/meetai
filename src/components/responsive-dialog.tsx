import{
    Dialog,
    DialogTitle,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';


import { useIsMobile } from '@/hooks/use-mobile';

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerTrigger,
    DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface ResponsiveDialogProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ResponsiveDialog = ({
    title,  
    description,
    children,
    open,
    onOpenChange
}: ResponsiveDialogProps) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        {description && <DrawerDescription className="bg-yellow-200 text-black">{description}</DrawerDescription>}
                    </DrawerHeader>
                    <div className='p-4 overflow-auto flex-1'>
                        {children}
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription className="bg-yellow-200 text-black">{description}</DialogDescription>}
            <DialogContent>{children}</DialogContent>
        </Dialog>
    );
}
