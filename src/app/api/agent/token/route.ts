import { NextRequest } from "next/server";

// This endpoint generates a token for the AI agent to join the call
export async function POST(req: NextRequest) {
    try {
        const { agentId, meetingId } = await req.json();

        if (!agentId || !meetingId) {
            return Response.json(
                { error: "Missing agentId or meetingId" },
                { status: 400 }
            );
        }

        // Import streamVideo here to avoid issues
        const { streamVideo } = await import("@/lib/stream-video");

        // Create agent user ID
        const agentUserId = `agent_${agentId}`;

        // Generate token for the agent
        const token = streamVideo.generateUserToken({
            user_id: agentUserId,
            validity_in_seconds: 3600, // 1 hour
        });

        return Response.json({
            token,
            userId: agentUserId,
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
        });
    } catch (error) {
        console.error("[Agent Token API] Error:", error);
        return Response.json(
            { error: "Failed to generate agent token" },
            { status: 500 }
        );
    }
}

