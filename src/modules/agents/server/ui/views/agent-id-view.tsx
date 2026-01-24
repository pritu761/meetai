"use client"
import { ErrorState } from "@/components/error-state"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { AgentIdViewHeader } from "@/modules/agents/ui/components/agent-id-view-header"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { VideoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useConfirm } from "@/hooks/use-confirm"
import { UpdateAgentDialog } from "@/modules/agents/ui/components/update-agent-dialog"
import { useState } from "react"

interface Props {
    agentId: string
}

export const AgentIdView = ({agentId}: Props) => {
    const trpc = useTRPC()
    const router = useRouter();
    const queryClient = useQueryClient();
    const {data} = useSuspenseQuery(trpc.agents.getOne.queryOptions({id: agentId}))
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

    const removeAgent = useMutation(trpc.agents.remove.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
            router.push("/agents");
            //INVALIDATE FREE USER USAGE
            router.push("/agents")
        },
        onError: (error) => {
            toast.error(error.message);
        }

    }))

    const [RemoveConfirmation, confirmRemove] = useConfirm("Delete Agent", "Are you sure you want to delete this agent? This action cannot be undone."); 

    const handleRemoveAgent =  async () => {
        const ok = await confirmRemove();
        if(!ok){
          return
        }
        await removeAgent.mutateAsync({id: agentId})
    }

    const handleEditAgent = () => {
        setIsUpdateDialogOpen(true);
    }

    return (
        <>
        <RemoveConfirmation />
        <UpdateAgentDialog 
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
            initialValues={{
                id: data.id,
                name: data.name,
                instructions: data.instructions
            }}
        />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <AgentIdViewHeader
                agentId={agentId}
                agentName={data.name}
                onEditAgent={handleEditAgent}
                onDeleteAgent={handleRemoveAgent}
                />
            </div>
            <div className="bg-white rounded-lg border">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex items-center gap-4">
                        <GeneratedAvatar
                            variant="bottts"
                            seed = {data.name}
                            className="size-10" />
                            <h2 className="text-2xl font-medium"> {data.name}</h2>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4">
                        <VideoIcon className="text-blue-700" />   {data.meetingCount} {data.meetingCount === 1 ? "Meeting" : "Meetings"}
                    </Badge>
                    <div className="flex flex-col gap-y-4">
                        <p className="tetx-lg font-medium ">Instructions</p>
                        <p className="tetx-neutral-800">{data.instructions}</p>

                    </div>
                </div>
            </div>
                            </>
    )
}
export const AgentsIdViewLoading = () => {
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

export const AgentsIdViewError = () => {
    return (
        <ErrorState
            title="Error Loading Agents"
            description="There was an error loading the agents. Please try again later."
        />
    )
}