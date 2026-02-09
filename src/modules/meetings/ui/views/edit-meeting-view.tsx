"use client"
import { ErrorState } from "@/components/error-state"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { MeetingForm } from "../components/meeting-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Props {
    meetingId: string
}

export const EditMeetingView = ({meetingId}: Props) => {
    const trpc = useTRPC()
    const router = useRouter();
    const {data} = useSuspenseQuery(trpc.meetings.getOne.queryOptions({id: meetingId}))

    const handleSuccess = () => {
        router.push(`/meetings/${meetingId}`);
    }

    const handleCancel = () => {
        router.push(`/meetings/${meetingId}`);
    }

    return (
        <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/meetings/${meetingId}`)}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Meeting</h1>
                    <p className="text-sm text-muted-foreground">
                        Update the details of your meeting
                    </p>
                </div>
            </div>

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Meeting Details</CardTitle>
                    <CardDescription>
                        Update the information about this meeting
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MeetingForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                        initialValues={{
                            id: data.id,
                            name: data.name,
                            agentId: data.agentId,
                            instructions: data.instructions,
                            startDate: new Date(data.startDate),
                            endDate: new Date(data.endDate),
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export const EditMeetingViewError = () => {
    return (
        <ErrorState
            title="Error Loading Meeting"
            description="There was an error loading the meeting details for editing. Please try again later."
        />
    )
}
