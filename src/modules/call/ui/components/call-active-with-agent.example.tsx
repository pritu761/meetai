/**
 * Example: How to integrate Gemini AI Agent into your call
 * 
 * This file shows how to add the Gemini agent to your existing call UI.
 * Copy the relevant parts into your actual call-active.tsx component.
 */

import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { useState, useEffect } from "react";
import { useGeminiAgent } from "@/modules/call/hooks/use-gemini-agent";

interface Props {
    meetingName: string;
    meetingId: string;
    agentId?: string;
    agentInstructions?: string;
    onLeave: () => void;
}

export const CallActiveWithAgent = ({
    meetingName,
    meetingId,
    agentId,
    agentInstructions,
    onLeave
}: Props) => {
    const call = useCall();

    // Initialize Gemini agent if agentId is provided
    const agent = useGeminiAgent({
        agentId: agentId || "",
        instructions: agentInstructions || "You are a helpful AI assistant in a video call.",
        enabled: !!agentId, // Only enable if agent is assigned
    });

    // Auto-start agent when call begins (optional)
    useEffect(() => {
        if (agentId && agent.isConnected && !agent.isListening) {
            // Automatically start the agent
            agent.startListening();
        }
    }, [agentId, agent.isConnected]);

    return (
        <StreamTheme className="h-full w-full">
            <div className="call-container">
                {/* Your existing call UI components */}
                <div className="video-grid">
                    {/* Video participants */}
                </div>

                {/* Agent Status Indicator */}
                {agentId && (
                    <div className="agent-status-bar">
                        {agent.isConnected ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>🤖 AI Agent: {agent.isListening ? "Listening..." : "Ready"}</span>

                                {/* Toggle button */}
                                <button
                                    onClick={agent.isListening ? agent.stopListening : agent.startListening}
                                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                    {agent.isListening ? "Mute Agent" : "Unmute Agent"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                <span>🤖 AI Agent: Connecting...</span>
                            </div>
                        )}

                        {/* Error display */}
                        {agent.error && (
                            <div className="text-red-500 mt-2">
                                ⚠️ Agent Error: {agent.error}
                            </div>
                        )}
                    </div>
                )}

                {/* Call controls */}
                <div className="call-controls">
                    <button onClick={onLeave} className="leave-button">
                        Leave Call
                    </button>
                </div>
            </div>
        </StreamTheme>
    );
};

/**
 * ALTERNATIVE: Minimal Integration
 * 
 * If you just want to add agent support without changing your UI much:
 */

export const MinimalAgentIntegration = ({ agentId, agentInstructions }: {
    agentId?: string;
    agentInstructions?: string;
}) => {
    const agent = useGeminiAgent({
        agentId: agentId || "",
        instructions: agentInstructions || "",
        enabled: !!agentId,
    });

    // Auto-start and hide - agent runs in background
    useEffect(() => {
        if (agentId && agent.isConnected) {
            agent.startListening();
        }
        return () => agent.stopListening();
    }, [agentId, agent.isConnected]);

    // Render nothing - agent works silently
    return null;
};

/**
 * USAGE in your existing call-active.tsx:
 * 
 * 1. Import the hook:
 *    import { useGeminiAgent } from "@/modules/call/hooks/use-gemini-agent";
 * 
 * 2. Add to your component:
 *    const agent = useGeminiAgent({
 *        agentId: meetingData.agentId,
 *        instructions: meetingData.agentInstructions,
 *        enabled: !!meetingData.agentId,
 *    });
 * 
 * 3. Add UI elements (optional):
 *    {agent.isConnected && <div>🤖 Agent Active</div>}
 * 
 * That's it! The agent will now listen and respond during your calls.
 */
