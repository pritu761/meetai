import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MeetingIdView, MeetingIdViewError } from "@/modules/meetings/ui/views/meeting-id-view";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props{
    params : Promise<{meetingId : string}>
}

const Page = async ({params}: Props) => {
    const {meetingId} = await params;

    const session = await auth.api.getSession({
        headers : await headers(),
    })

    if(!session){
        redirect("/sign-up")
    }

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
