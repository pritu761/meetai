"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { Button } from "@/components/ui/button"
import { useAgentsFilters } from "@/modules/agents/hooks/use-agents-filters"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PlusIcon, Bot, Calendar, MessageSquare } from "lucide-react"
import { useState } from "react"

import { columns } from "@/modules/agents/ui/components/columns"
import { EmptyState } from "@/components/empty-state"
import { DataPagination } from "@/modules/agents/ui/components/data-pagination"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"


interface AgentsViewProps {
    onCreateAgent?: () => void;
}

export const AgentsView = ({ onCreateAgent }: AgentsViewProps) => {
    const router = useRouter();
    const [filters, setFilters] = useAgentsFilters();
    const trpc = useTRPC()
    
    console.log("AgentsView filters:", filters);
    
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }));
    
    console.log("AgentsView data:", data);

    if (!data || !data.items || data.items.length === 0) {
        return (
            <EmptyState
                title="Create your first agent"
                description="Create an agent to join your meetings. Each agent will follow your instructions and can interact with participants during the call."
            />
        )
    }

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable 
                data={data.items} 
                columns={columns} 
                onRowClick={(row) => router.push(`/agents/${row.original.id}`)}
            />
            <DataPagination 
                page={filters.page}
                totalPages={data.totalPages}
                onChange={(page) => setFilters({page})}
            />
        </div>
    )
}

export const AgentsViewLoading = () => {
    return (
        <div className="px-4 md:px-8 pb-8">
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const AgentsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Agents"
            description="There was an error loading the agents. Please try again later."
        />
    )
}