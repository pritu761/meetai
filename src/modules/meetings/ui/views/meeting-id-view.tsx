"use client"
import { ErrorState } from "@/components/error-state"
import { GeneratedAvatar } from "@/components/generated-avatar"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { CalendarIcon, Clock, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useConfirm } from "@/hooks/use-confirm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface Props {
    meetingId: string
}

export const MeetingIdView = ({meetingId}: Props) => {
    const trpc = useTRPC()
    const router = useRouter();
    const queryClient = useQueryClient();
    const {data} = useSuspenseQuery(trpc.meetings.getOne.queryOptions({id: meetingId}))

    const removeMeeting = useMutation(trpc.meetings.remove.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            toast.success("Meeting deleted successfully");
            router.push("/meetings");
        },
        onError: (error) => {
            toast.error("Failed to delete meeting");
        }
    }))

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Delete Meeting", 
        "Are you sure you want to delete this meeting? This action cannot be undone."
    ); 

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();
        if(!ok){
          return
        }
        await removeMeeting.mutateAsync({id: meetingId})
    }

    const statusColors = {
        upcoming: "bg-blue-100 text-blue-700 border-blue-200",
        active: "bg-yellow-100 text-yellow-700 border-yellow-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
        processing: "bg-gray-100 text-gray-700 border-gray-200",
    }

    return (
        <>
            <RemoveConfirmation />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <GeneratedAvatar
                            variant="bottts"
                            seed={data.name}
                            className="size-12" 
                        />
                        <div>
                            <h1 className="text-2xl font-bold">{data.name}</h1>
                            <Badge 
                                variant="outline" 
                                className={statusColors[data.status as keyof typeof statusColors]}
                            >
                                {data.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/meetings")}>
                            Back
                        </Button>
                        <Button variant="destructive" onClick={handleRemoveMeeting}>
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Meeting Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Meeting Details</CardTitle>
                        <CardDescription>Information about this meeting</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Start Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(data.startDate), "PPP 'at' p")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">End Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(data.endDate), "PPP 'at' p")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Instructions</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {data.instructions}
                            </p>
                        </div>

                        {data.summary && (
                            <div>
                                <p className="text-sm font-medium mb-2">Summary</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {data.summary}
                                </p>
                            </div>
                        )}

                        {(data.recordingUrl || data.transcriptUrl) && (
                            <div className="flex gap-2">
                                {data.recordingUrl && (
                                    <Button variant="outline" asChild>
                                        <a href={data.recordingUrl} target="_blank" rel="noopener noreferrer">
                                            <Video className="mr-2 size-4" />
                                            View Recording
                                        </a>
                                    </Button>
                                )}
                                {data.transcriptUrl && (
                                    <Button variant="outline" asChild>
                                        <a href={data.transcriptUrl} target="_blank" rel="noopener noreferrer">
                                            View Transcript
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export const MeetingIdViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meeting"
            description="There was an error loading the meeting details. Please try again later."
        />
    )
}
