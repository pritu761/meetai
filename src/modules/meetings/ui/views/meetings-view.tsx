"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

import { columns } from "../components/columns"
import { EmptyState } from "@/components/empty-state"
import { DataPagination } from "../components/data-pagination"
import { useRouter } from "next/navigation"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"
import { DataTable } from "@/components/data-table"

interface MeetingsViewProps {
    onCreateMeeting?: () => void;
}

export const MeetingsView = ({ onCreateMeeting }: MeetingsViewProps) => {
    const router = useRouter();
    const [filters, setFilters] = useMeetingsFilters();
    const trpc = useTRPC()
    
    console.log("MeetingsView filters:", filters);
    
    const {data} = useSuspenseQuery(trpc.meetings.getMany.queryOptions({
        ...filters
    }));
    
    console.log("MeetingsView data:", data);

    if (!data || !data.items || data.items.length === 0) {
        return (
            <EmptyState
                title="Create your first meeting"
                description="Schedule a meeting with an agent to get started. Your agent will join and follow the instructions you provide."
            />
        )
    }

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable 
                data={data.items} 
                columns={columns} 
                onRowClick={(row) => router.push(`/meetings/${row.original.id}`)}
            />
            <DataPagination 
                page={filters.page}
                totalPages={data.totalPages}
                onChange={(page) => setFilters({page})}
            />
        </div>
    )
}

export const MeetingsViewLoading = () => {
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

export const MeetingsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meetings"
            description="There was an error loading the meetings. Please try again later."
        />
    )
}

export default MeetingsView