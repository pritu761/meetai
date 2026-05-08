"use client"

import { CommandResponsiveDialog, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup, CommandSeparator } from "@/components/ui/command";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, Home, Loader2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface Props{
    open: boolean;
    setOpen:Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({open,setOpen}:Props) => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const trpc = useTRPC();

    const { data: agents, isLoading } = useQuery({
        ...trpc.agents.getMany.queryOptions({
            search,
            page: 1,
            pageSize: 5
        }),
        enabled: open && search.length > 0
    });

    const handleSelect = (callback: () => void) => {
        setOpen(false);
        callback();
    };

    return (
        <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
            <CommandInput 
                placeholder="Search for pages, agents..." 
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => handleSelect(() => router.push("/"))}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => handleSelect(() => router.push("/agents"))}>
                        <Bot className="mr-2 h-4 w-4" />
                        <span>Agents</span>
                    </CommandItem>
                </CommandGroup>

                {search && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Agents">
                            {isLoading && (
                                <CommandItem disabled>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Searching agents...</span>
                                </CommandItem>
                            )}
                            {agents?.items && agents.items.length > 0 && agents.items.map((agent: any) => (
                                <CommandItem 
                                    key={agent.id}
                                    onSelect={() => handleSelect(() => router.push(`/agents?search=${encodeURIComponent(agent.name)}`))}
                                >
                                    <Bot className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{agent.name}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {agent.instructions}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandResponsiveDialog>
    );
}