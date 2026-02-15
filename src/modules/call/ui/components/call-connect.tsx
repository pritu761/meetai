import {
    Call,
    CallingState,
    StreamCall,
    StreamVideo,
    StreamVideoClient,

} from "@stream-io/video-react-sdk";
import { LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface Props {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string;
}
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useTRPC } from "@/trpc/client";
import { CallUI } from "./call-ui";

export const CallConnect = ({ meetingId, meetingName, userId, userName, userImage }: Props) => {
    const trpc = useTRPC();
    const { mutateAsync: generateToken } = useMutation(trpc.meetings.generateToken.mutationOptions());

    const [token, setToken] = useState<string>();
    const [client, setClient] = useState<StreamVideoClient>();


    useEffect(() => {
        const client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage,
            },
            tokenProvider: generateToken,
        });
        setClient(client);

        return () => {
            client.disconnectUser();
            setClient(undefined);
        };
    }, [meetingId, generateToken, userId, userName, userImage]);

    const [call, setCall] = useState<Call>();
    useEffect(() => {
        if (!client)
            return;

        const _call = client.call("default", meetingId);
        _call.camera.disable();
        _call.microphone.disable();
        setCall(_call);

        return () => {
            if (_call.state.callingState !== CallingState.LEFT) {
                _call.leave();
            }
            setCall(undefined);
        }
    }, [client, meetingId])

    if (!client || !call) {
        return (
            <div className="flex items-center justify-center h-screen bg-radial from-sidebar-accent-background">
                <LoaderIcon className="animate-spin" />
            </div>
        )
    }
    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <CallUI meetingName={meetingName} />
            </StreamCall>
        </StreamVideo>
    )
}