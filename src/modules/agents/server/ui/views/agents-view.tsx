"use client"

import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PlusIcon, Bot, Calendar, MessageSquare } from "lucide-react"
import { useState } from "react"


interface AgentsViewProps {
    onCreateAgent?: () => void;
}

export const AgentsView = ({ onCreateAgent }: AgentsViewProps) => {
    const trpc = useTRPC()
    const {data} = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-center">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Get started with AI-powered conversations.
                    </p>
                    <Button onClick={onCreateAgent}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Agent
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 md:px-8 pb-8">
            <div className="space-y-3">
                {data.map((agent: any) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                                {agent.avatar ? (
                                    <span className="text-lg">{agent.avatar}</span>
                                ) : (
                                    <Bot className="h-5 w-5 text-gray-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">{agent.name}</h3>
                                <p className="text-sm text-gray-500">{agent.instructions}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MessageSquare className="h-4 w-4" />
                            <span>{agent.meetingCount || 0} meetings</span>
                        </div>
                    </div>
                ))}
            </div>
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
