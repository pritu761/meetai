/**
 * Gemini AI Agent Component
 * 
 * This component handles the Gemini AI agent for voice interaction in calls.
 * It automatically connects to Gemini Live API and enables voice conversation.
 * 
 * Usage:
 * Import this component in your call-active.tsx and add it to your JSX:
 * 
 * import { GeminiAgentController } from "./gemini-agent-controller";
 * 
 * // In your component:
 * <GeminiAgentController 
 *   agentId={meeting.agentId}
 *   instructions={meeting.instructions}
 *   showUI={true}  // Set to false to hide UI
 * />
 */

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

    // Auto-start agent when connected
    useEffect(() => {
        if (autoStart && agent.isConnected && agentId && !agent.isListening) {
            agent.startListening();
        }
    }, [autoStart, agent.isConnected, agentId, agent.isListening, agent.startListening]);

    // If no agent assigned, don't render anything
    if (!agentId) {
        return null;
    }

    // If UI is hidden, render nothing (agent works in background)
    if (!showUI) {
        return null;
    }

    // Render agent status UI
    return (
        <div className="fixed bottom-20 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border border-white/10 z-50">
            <div className="flex items-center gap-3">
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                    {agent.isConnected ? (
                        <>
                            <div className={`w-2 h-2 rounded-full ${agent.isListening ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                            <span className="text-sm font-medium">
                                🤖 AI Agent: {agent.isListening ? "Listening..." : "Ready"}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 bg-gray-500 rounded-full" />
                            <span className="text-sm font-medium">🤖 AI Agent: Connecting...</span>
                        </>
                    )}
                </div>

                {/* Toggle Button */}
                {agent.isConnected && (
                    <button
                        onClick={agent.isListening ? agent.stopListening : agent.startListening}
                        className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
                    >
                        {agent.isListening ? "Mute" : "Unmute"}
                    </button>
                )}
            </div>

            {/* Error Display */}
            {agent.error && (
                <div className="mt-2 text-xs text-red-400">
                    ⚠️ {agent.error}
                </div>
            )}
        </div>
    );
};
