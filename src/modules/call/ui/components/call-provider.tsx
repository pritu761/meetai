"use client";

import { useTRPC } from "@/trpc/client";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { generateAvatarUri } from "@/lib/create-avatar";
import { Loader2Icon, LoaderIcon } from "lucide-react";
import { CallConnect } from "./call-connect";

interface Props {
    meetingId: string;
    meetingName: string;
}

export const CallProvider = ({ meetingId, meetingName }: Props) => {
    const {data, isPending} = authClient.useSession();

    if(!data || isPending) {
        return (
            <div className="flex items-center justify-center h-screen bg-radial from-sidebar-accent-background">
                <LoaderIcon className="animate-spin" />
            </div>
        )
    }

    return (
        <CallConnect
            meetingId={meetingId}
            meetingName={meetingName}
            userId={data.user.id}
            userName={data.user.name ?? "User"}
            userImage={
                data.user.image ??
                generateAvatarUri({
                    seed: data.user.name ?? data.user.id,
                    variant: "initials",
                })
            }
        />
    );
};
