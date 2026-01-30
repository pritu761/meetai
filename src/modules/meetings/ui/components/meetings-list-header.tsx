"use client"

import { Button } from "@/components/ui/button"
import { CircleIcon, PlusIcon } from "lucide-react"
import { NewMeetingDialog } from "./new-meeting-dialog"
import { useState } from "react"
import { useMeetingsFilters } from "../../hooks/use-meetings-filters"
import {  SearchFilter } from "./meetings-search-filter"
import { DEFAULT_PAGE } from "@/constants"

export const MeetingsListHeader = () => {
    const [filters, setFilters] = useMeetingsFilters()
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isAnyFilterModified = !!(filters.search)
    

    const onClearFilters = () => {
        setFilters({
            search : "",
            page : DEFAULT_PAGE,
        })
    }
    return (
        <>
        <NewMeetingDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <h5 className="font-medium text-xl">My Meetings</h5>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-x-1 p-1">
              <SearchFilter />
              {isAnyFilterModified && (
                <Button variant="outline" size="sm" className="ml-auto" onClick={onClearFilters}>
                    <CircleIcon/>
                    Clear filters
                </Button>
              )}
            </div>
        </div>
        </>
    )
}