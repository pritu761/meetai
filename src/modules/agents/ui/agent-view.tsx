import { useSuspenseQuery } from "@tanstack/react-query"

import { useTRPC } from "@/trpc/client"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { EmptyState } from "@/components/empty-state"

interface Agent {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  instructions: string;
  meetingCount: number;
}

const mockData: Agent[] = [
    {
        id: "1",
        name: "Agent 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 1",
        meetingCount: 5,
    },
    {
        id: "2",
        name: "Agent 2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 2",
        meetingCount: 3,
    },
    {
        id: "3",
        name: "Agent 3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 3",
        meetingCount: 8,
    },
    {
        id: "4",
        name: "Agent 4",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 4",
        meetingCount: 2,
    },
    {
        id: "5",
        name: "Agent 5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 5",
        meetingCount: 12,
    },
    {
        id: "6",
        name: "Agent 6",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 6",
        meetingCount: 1,
    },
    {
        id: "7",
        name: "Agent 7",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 7",
        meetingCount: 7,
    },
    {
        id: "8",
        name: "Agent 8",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 8",
        meetingCount: 4,
    },
    {
        id: "9",
        name: "Agent 9",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "user1",
        instructions: "Default instructions for Agent 9",
        meetingCount: 6,
    },
]       
export const AgentView = () => {
    const trpc = useTRPC()
    const {data} = useSuspenseQuery(
        trpc.agents.getMany.queryOptions({
            
        })
    )

    if (!data || data.items.length === 0) {
        return (
            <div>
                <EmptyState 
                    title="Create Your First Agent"
                    description="Create an agent to join in your meetitngs. Each agent can have its own unique instructions and personality."
                />
            </div>
        )
    }

    return (
        <div>
            <DataTable columns={columns} data={data.items} />
        </div>
    )
}
