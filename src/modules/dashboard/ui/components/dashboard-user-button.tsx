import { Avatar } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { GeneratedAvatar } from "@/components/generated-avatar";
import {ChevronDownIcon, CreditCardIcon, LogOutIcon} from "lucide-react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";


export const DashboardUserButton = () => {
    const router = useRouter();
    const isMobile = useIsMobile();
    
    const OnLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-");
                },
                onError: (error) => {
                    console.error("Logout failed:", error);
                },
            }
        });
        
    }
    const {data,isPending} = authClient.useSession();
    if(isPending || !data?.user){
        return null;
    }

    if (isMobile) {
        return(
            <Drawer>
                <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
                    {data.user.image?(
                    <Avatar>
                        <AvatarImage src={data.user.image || undefined} alt={data.user.name || "User Avatar"} />
                    </Avatar>
                ) : (
                    <GeneratedAvatar
                    seed={data.user.name }
                    variant="initials"
                    />
                )}
                <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0 ml-2">
                    <p className="text-sm truncate w-full">
                        {data.user.name || "User"}
                    </p>
                    <p className="text-xs truncate w-full">
                        {data.user.email || "No Email"}
                    </p>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-sidebar-foreground" />
                    
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>
                            {data.user.name}
                        </DrawerTitle>
                        <DrawerDescription>
                            {data.user.email }
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button
                        variant="outline"
                        onClick={() => {}}
                        >
                            Billing
                            <CreditCardIcon className="size-4 ml-2" />
                        </Button>
                        <Button
                        variant="outline"
                    onClick={() => OnLogout()}>
                            Sign Out
                            <LogOutIcon className="size-4 ml-2" />
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
            {data.user.image?(
                <Avatar>
                    <AvatarImage src={data.user.image || undefined} alt={data.user.name || "User Avatar"} />
                </Avatar>
            ) : (
                <GeneratedAvatar
                seed={data.user.name }
                variant="initials"
                />
            )}
            <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0 ml-2">
                <p className="text-sm truncate w-full">
                    {data.user.name || "User"}
                </p>
                <p className="text-xs truncate w-full">
                    {data.user.email || "No Email"}
                </p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-sidebar-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-72">
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium truncate">
                            {data.user.name || "User"}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground truncate">
                            {data.user.email || "No Email"}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex items-cenetr justify-between">
                    Billing
                    <CreditCardIcon className="size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-cenetr justify-between"onClick={() => OnLogout()}>
                    Sign Out
                    <LogOutIcon className="size-4" />
                </DropdownMenuItem>
                
            </DropdownMenuContent>    
        </DropdownMenu>
    );
}
