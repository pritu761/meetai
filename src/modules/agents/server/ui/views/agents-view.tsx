"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"



export const AgentsView = () => {
    const trpc = useTRPC()
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions());



    return(
        <div>
            <ResponsiveDialog
                title=""
                description=""
                open
                onOpenChange={() => {}}
            >
                <div className="flex flex-col items-center justify-center">
                    <p className="mb-2 text-center text-lg font-semibold">Additional Text Here</p>
                    <p className="mb-4 text-center text-sm text-muted-foreground">More descriptive text can go here.</p>
                    <Button>
                        Some Action
                    </Button>
                </div>
            </ResponsiveDialog>
            {JSON.stringify(data, null, 2)}

        </div>
    )
}

export const AgentsViewLoading = () => {
    return <LoadingState 
    title="Loading "
    description="This may take a few moments"/>
}

export const AgentsViewError = () => {
    return (
        <ErrorState
            title="Error Loading Agents"
            description="There was an error loading the agents. Please try again later."
        />
    )
}
