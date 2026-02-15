import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";



interface Props {
    meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
    const call = useCall();
    const [show, setShow] = useState<"lobby" | "call" | "ended" | "">("lobby");

    const handleJoin = async () => {
        if (!call) return;
        try {
            await call.join();
            setShow("call");
        } catch (error) {
            console.error("Failed to join call:", error);
            // Show error to user
            alert("Failed to join the call. Please check your connection and try again.");
        }
    }

    const handleLeave = async () => {
        if (!call) return;
        try {
            await call.leave();
            setShow("ended");
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <StreamTheme className="h-full w-full">
            {show === "lobby" && <CallLobby onJoin={handleJoin} />}
            {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} />}
            {show === "ended" && <CallEnded />}

        </StreamTheme>
    )
}