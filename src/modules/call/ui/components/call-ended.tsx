import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Video, FileText, CalendarPlus, Home, CheckCircle2 } from "lucide-react";

export const CallEnded = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
      <div className="w-full max-w-md mx-auto px-4 flex flex-col items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Meet AI" width={32} height={32} />
          <span className="text-xl font-semibold text-white">Meet AI</span>
        </Link>

        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">Call Ended</h2>
            <p className="text-sm text-white/50 mt-1">Meeting summary will be available shortly</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Video className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Recording</p>
              <p className="text-xs text-white/50">Processing — will be available in a few minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Transcript</p>
              <p className="text-xs text-white/50">AI-generated transcript will be ready soon</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button asChild className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Link href="/meetings">
              <CalendarPlus className="mr-2 w-5 h-5" />
              Back to Meetings
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-white">
            <Link href="/">
              <Home className="mr-2 w-5 h-5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};