import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface Props {
  meetingId: string;
  meetingName: string;
  agentId?: string;
  instructions?: string;
  userId: string;
  userName: string;
  userImage: string;
}

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useTRPC } from "@/trpc/client";
import { CallUI } from "./call-ui";

export const CallConnect = ({
  meetingId, meetingName, agentId, instructions, userId, userName, userImage,
}: Props) => {
  const trpc = useTRPC();
  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions()
  );

  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setConnectionError(null);
    try {
      const videoClient = new StreamVideoClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
        user: { id: userId, name: userName, image: userImage },
        tokenProvider: generateToken,
      });
      setClient(videoClient);
      return () => { videoClient.disconnectUser(); setClient(undefined); };
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : "Failed to initialize video client");
    }
  }, [meetingId, generateToken, userId, userName, userImage]);

  useEffect(() => {
    if (!client) return;
    const _call = client.call("default", meetingId);
    _call.camera.disable();
    _call.microphone.disable();
    setCall(_call);
    return () => {
      if (_call.state.callingState !== CallingState.LEFT) _call.leave();
      setCall(undefined);
    };
  }, [client, meetingId]);

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a12] text-white gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-2xl">&#9888;</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Connection Error</h2>
          <p className="text-sm text-white/50 mt-1">{connectionError}</p>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12] text-white gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <p className="text-sm text-white/60">Connecting to meeting...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI meetingName={meetingName} agentId={agentId} instructions={instructions} />
      </StreamCall>
    </StreamVideo>
  );
};