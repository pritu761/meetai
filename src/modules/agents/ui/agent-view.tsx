import { useSuspenseQuery } from "@tanstack/react-query"

import { useTRPC } from "@/trpc/client"
import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { EmptyState } from "@/components/empty-state"

interface Agent {
  id: number;
  name: string;
}

const mockData: Agent[] = [
    {
        id: 1,
        name: "Agent 1",
    },
    {
        id: 2,
        name: "Agent 2",
    },
    {
        id: 3,
        name: "Agent 3",
    },
    {
        id: 4,
        name: "Agent 4",
    },
    {
        id: 5,
        name: "Agent 5",
    },
    {
        id: 6,
        name: "Agent 6",
    },
    {
        id: 7,
        name: "Agent 7",
    },
    {
        id: 8,
        name: "Agent 8",
    },
    {
        id: 9,
        name: "Agent 9",
    },
]       
export const AgentView = () => {
    const trpc = useTRPC()
    const {data} = useSuspenseQuery({
        queryKey: ["agents.getMany"],
        queryFn: async () => {
            // Replace this with your actual trpc call
            // For example: return trpc.agents.getMany.query();
            return mockData;
        },
    })

    if (!data || data.length === 0) {
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
            <DataTable columns={columns} data={data} />
        </div>
    )
}
