"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { PanelLeftCloseIcon, PanelLeftIcon, SearchIcon } from "lucide-react"
import { DashboardCommand } from "./dasboard-command"
import { useEffect, useState } from "react"

export const DashboardNavbar = () => {
    const {state, toggleSidebar,isMobile, openMobile} = useSidebar();
    const isSidebarOpen = isMobile ? openMobile : state === 'expanded';
    const [commandOpen , setCommandopen] = useState(false);
    useEffect(() => {
        const down = (e:KeyboardEvent) => {
            if(e.key === "k" && (e.metaKey || e.ctrlKey)){
                e.preventDefault();
                setCommandopen(true);
            }
        }
        const up = (e:KeyboardEvent) => {
            if(e.key === "Escape"){
                setCommandopen(false);
            }
        }
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        }
    }, []);
    return (
        <>
            <DashboardCommand open={commandOpen} setOpen={setCommandopen} />
            <nav className="flex items-center gap-x-2 border-b bg-background px-4 py-3">
                <Button className="size-9 " variant="outline" onClick={toggleSidebar}>
                    {isSidebarOpen ? (
                        <PanelLeftCloseIcon className="size-4" />
                    ) : (
                        <PanelLeftIcon className="size-4" />
                    )}
                </Button>
                <Button
                    className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground"
                    variant="outline"
                    size="sm"
                    onClick={() => setCommandopen((open) => !open)}
                >
                    <SearchIcon className="mr-2 size-4" />
                    Search
                    <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground pointer-events-none">
                        <span className="text-xs">&#8984;K</span>
                    </kbd>
                </Button>
            </nav>
        </>
    );
};
