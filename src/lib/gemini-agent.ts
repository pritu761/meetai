import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamVideo } from "./stream-video";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export interface AgentConfig {
    agentId: string;
    meetingId: string;
    instructions: string;
    agentName: string;
}

/**
 * Join a Stream video call with a Gemini AI agent
 * This creates a server-side agent that participates in the call
 */
export async function joinCallWithGeminiAgent(config: AgentConfig): Promise<void> {
    const { meetingId, agentId, instructions, agentName } = config;

    try {
        console.log(`[Gemini Agent] Starting agent ${agentId} for meeting ${meetingId}`);

        // Get the call instance
        const call = streamVideo.video.call("default", meetingId);

        // Create a user token for the AI agent
        const agentUserId = `agent_${agentId}`;
        const agentToken = streamVideo.generateUserToken({
            user_id: agentUserId,
            validity_in_seconds: 3600, // 1 hour
        });

        console.log(`[Gemini Agent] Generated token for agent user: ${agentUserId}`);

        // Initialize Gemini model with instructions
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: `You are an AI assistant in a video call. ${instructions}
      
Important guidelines:
- Keep responses concise and conversational
- Speak naturally as if you're in a real conversation
- Listen actively and respond appropriately to what users say
- If you don't understand something, politely ask for clarification`,
        });

        // TODO: Implement the actual call joining logic
        // This requires:
        // 1. Creating a WebRTC connection to join the Stream call
        // 2. Setting up bidirectional audio streaming
        // 3. Connecting Gemini's Live API for real-time audio processing
        // 4. Handling audio input from the call and sending to Gemini
        // 5. Receiving audio responses from Gemini and sending to the call

        // For now, we'll log that the agent is ready
        console.log(`[Gemini Agent] Agent configured and ready for meeting ${meetingId}`);
        console.log(`[Gemini Agent] Instructions: ${instructions}`);

        // Note: Full implementation requires:
        // - Stream's server-side WebRTC integration (if available)
        // - OR a client-side agent that runs in a headless browser/Node environment
        // - Gemini Live API WebSocket connection for real-time audio
        // - Audio format conversion (Stream uses Opus, Gemini uses PCM 16kHz)

    } catch (error) {
        console.error(`[Gemini Agent] Error joining call:`, error);
        throw error;
    }
}

/**
 * Leave a call and cleanup agent resources
 */
export async function leaveCall(meetingId: string, agentId: string): Promise<void> {
    try {
        console.log(`[Gemini Agent] Agent ${agentId} leaving meeting ${meetingId}`);

        // TODO: Implement cleanup logic
        // - Disconnect from Gemini Live API
        // - Leave the Stream call
        // - Clean up any resources

        console.log(`[Gemini Agent] Agent ${agentId} left meeting ${meetingId}`);
    } catch (error) {
        console.error(`[Gemini Agent] Error leaving call:`, error);
        throw error;
    }
}
