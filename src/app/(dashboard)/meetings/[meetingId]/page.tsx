import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MeetingIdView, MeetingIdViewError } from "@/modules/meetings/ui/views/meeting-id-view";

interface Props{
    params : Promise<{meetingId : string}>
}

const Page = async ({params}: Props) => {
    const {meetingId} = await params;

    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({id: meetingId}))

    return(
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorBoundary fallback={<MeetingIdViewError />}>
                    <MeetingIdView meetingId={meetingId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page
