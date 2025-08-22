"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PlusIcon, Bot, Calendar } from "lucide-react"

export const AgentsView = () => {
    const trpc = useTRPC()
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Create your first agent to get started with AI-powered conversations.
                    </p>
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Your First Agent
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-8 pb-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.map((agent: any) => (
                    <Card key={agent.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                {agent.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                                {agent.instructions?.substring(0, 100) || 'No instructions available'}
                                {agent.instructions && agent.instructions.length > 100 && '...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
    {new Date(agent.createdAt).toLocaleDateString('en-US')}
</span>

                                </div>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export const AgentsViewLoading = () => {
    return <LoadingState 
    title="Loading Agents"
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
