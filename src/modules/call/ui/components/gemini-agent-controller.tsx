"use client";

import { useEffect } from "react";
import { useGeminiAgent } from "@/modules/call/hooks/use-gemini-agent";

interface GeminiAgentControllerProps {
  agentId?: string;
  instructions?: string;
  showUI?: boolean;
  autoStart?: boolean;
}

export const GeminiAgentController = ({
  agentId,
  instructions,
  showUI = true,
  autoStart = true,
}: GeminiAgentControllerProps) => {
  const agent = useGeminiAgent({
    agentId: agentId || "",
    instructions: instructions || "You are a helpful AI assistant in a video call.",
    enabled: !!agentId,
  });

  useEffect(() => {
    if (autoStart && agent.isConnected && agentId && !agent.isListening) {
      agent.startListening();
    }
  }, [autoStart, agent.isConnected, agentId, agent.isListening]);

  if (!agentId) return null;
  if (!showUI) return null;

  return (
    <div className="fixed bottom-20 right-4 bg-[#141419]/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-lg border border-white/10 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {agent.isConnected ? (
            <>
              <div className={`w-2 h-2 rounded-full ${agent.isListening ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
              <span className="text-sm font-medium">
                AI Agent: {agent.isListening ? "Listening..." : "Ready"}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-500 rounded-full" />
              <span className="text-sm font-medium">AI Agent: Connecting...</span>
            </>
          )}
        </div>

        {agent.isConnected && (
          <button
            onClick={agent.isListening ? agent.stopListening : agent.startListening}
            className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            {agent.isListening ? "Mute" : "Unmute"}
          </button>
        )}
      </div>

      {agent.error && (
        <div className="mt-2 text-xs text-red-400">Error: {agent.error}</div>
      )}
    </div>
  );
};