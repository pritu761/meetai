import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview
} from "@stream-io/video-react-sdk";
import { LogInIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { generateAvatarUri } from "@/lib/create-avatar";
import { useState, useEffect } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";

interface Props {
  onJoin: () => void;
}

const DisabledVideoPreview = () => {
  const { data } = authClient.useSession();
  return (
    <DefaultVideoPlaceholder
      participant={{
        name: data?.user?.name || "User",
        image: generateAvatarUri(data?.user?.name || "User"),
      } as StreamVideoParticipant}
    />
  );
};

export const CallLobby = ({ onJoin }: Props) => {
  const { hasBrowserPermission: hasMicPermission } = useCallStateHooks().useMicrophoneState();
  const { hasBrowserPermission: hasCamPermission } = useCallStateHooks().useCameraState();

  const [countdown, setCountdown] = useState<number | null>(null);

  const handleJoin = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onJoin();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onJoin]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
      <div className="w-full max-w-md mx-auto px-4 flex flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <Image src="/logo.svg" alt="Meet AI" width={32} height={32} />
          <span className="text-xl font-semibold text-white">Meet AI</span>
        </Link>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1a1a24] border border-white/10 shadow-2xl">
          <VideoPreview
            DisabledVideoPreview={
              hasCamPermission && hasMicPermission
                ? DisabledVideoPreview
                : () => (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-white/60">
                      <ShieldCheck className="w-10 h-10" />
                      <p className="text-sm text-center px-4">
                        Please grant camera and microphone permissions to preview
                      </p>
                    </div>
                  )
            }
          />
        </div>

        <div className="flex items-center gap-4">
          <ToggleAudioPreviewButton />
          <ToggleVideoPreviewButton />
        </div>

        {countdown !== null ? (
          <div className="w-full py-3.5 bg-blue-600 rounded-xl text-center">
            <span className="text-lg font-bold text-white">Joining in {countdown}...</span>
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <Button asChild variant="outline" className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white">
              <Link href="/meetings">Cancel</Link>
            </Button>
            <Button onClick={handleJoin} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base">
              <LogInIcon className="mr-2 w-5 h-5" />
              Join Now
            </Button>
          </div>
        )}

        <p className="text-xs text-white/40 text-center">
          Make sure your camera and microphone are working before joining
        </p>
      </div>
    </div>
  );
};