"use client"

import { Button } from "@/components/ui/button"
import { CircleXIcon, PlusIcon } from "lucide-react"
import { NewMeetingDialog } from "./new-meeting-dialog"
import { useState } from "react"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"
import { SearchFilter } from "./meetings-search-filter"
import { DEFAULT_PAGE } from "@/constants"
import { StatusFilter } from "./status-filter"
import { AgentsFilter as AgentIdFilter } from "./agent-id-filter"

export const MeetingsListHeader = () => {
    const [filters, setFilters] = useMeetingsFilters()
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isAnyFilterModified = !!(filters.search || filters.status || filters.agentId)
    

    const onClearFilters = () => {
        setFilters({
            search : "",
            page : DEFAULT_PAGE,
            status: null,
            agentId: "",
        })
    }
    return (
        <>
        <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between">
                <h5 className="font-medium text-xl">My Meetings</h5>
                <div className="flex items-center justify-end">
                    <Button size="icon" className="rounded-full" onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-1 sm:flex-row sm:items-center sm:gap-x-2">
              <SearchFilter />
              <StatusFilter />
              <AgentIdFilter />
              {isAnyFilterModified && (
                <Button variant="outline" className="w-full sm:w-auto sm:ml-auto" onClick={onClearFilters}>
                    <CircleXIcon className="size-4" />
                    Clear
                </Button>
              )}
            </div>
        </div>
        </>
    )
}
