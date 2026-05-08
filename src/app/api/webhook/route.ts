import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
    CallRecordingReadyEvent,
    CallSessionStartedEvent,
} from "@stream-io/node-sdk";

import { and, eq } from "drizzle-orm"
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { NextRequest } from "next/server";
import { joinCallWithGeminiAgent, leaveCall } from "@/lib/gemini-agent";

function verifySignaturewithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    const signature = req.headers.get("x-signature")
    const apiKey = req.headers.get("x-api-key")

    if (!signature || !apiKey) {
        return new Response("Missing signature or api key", { status: 400 });
    }

    const body = await req.text();

    if (!verifySignaturewithSDK(body, signature)) {
        return new Response("Invalid signature", { status: 401 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body);
    } catch (error) {
        console.error("Failed to parse webhook payload", error);
        return new Response("Invalid payload", { status: 400 });
    }

    const eventType = (payload as
        Record<string, unknown>).type;

    // Handle call session started event
    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;

        // Type-safe access to custom fields
        const customData = event.call.custom as Record<string, unknown> | undefined;
        const meetingId = customData?.meetingId as string | undefined;
        const agentId = customData?.agentId as string | undefined;

        if (!meetingId || !agentId) {
            console.error("Missing meetingId or agentId in webhook payload", customData);
            return new Response("Missing meetingId or agentId", { status: 400 });
        }

        // Verify meeting exists and is in upcoming status
        const [existingMeeting] = await db.select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id, meetingId),
                    eq(meetings.status, "upcoming")
                )
            );

        if (!existingMeeting) {
            console.error(`Meeting not found or not in upcoming status: ${meetingId}`);
            return new Response("Meeting not found or not ready to start", { status: 404 });
        }

        // Update meeting status to active
        await db.update(meetings).set({
            status: "active",
            updatedAt: new Date(),
        }).where(eq(meetings.id, meetingId));

        // Get agent details
        const [existingAgent] = await db.select()
            .from(agents)
            .where(eq(agents.id, agentId));

        if (!existingAgent) {
            console.error(`Agent not found: ${agentId}`);
            return new Response("Agent not found", { status: 404 });
        }

        // Update agent status to active
        await db.update(agents).set({
            status: "active",
            updatedAt: new Date(),
        }).where(eq(agents.id, agentId));

        // Join the call with Gemini agent
        try {
            await joinCallWithGeminiAgent({
                agentId,
                meetingId,
                instructions: existingAgent.instructions,
                agentName: existingAgent.name,
            });
            console.log(`[Webhook] Gemini agent ${agentId} joined meeting ${meetingId}`);
        } catch (error) {
            console.error(`[Webhook] Failed to join agent to call:`, error);
            // Update agent status to error
            await db.update(agents).set({
                status: "error",
                updatedAt: new Date(),
            }).where(eq(agents.id, agentId));
            return new Response("Failed to join agent to call", { status: 500 });
        }
    }

    // Handle call session ended event
    if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const customData = event.call.custom as Record<string, unknown> | undefined;
        const meetingId = customData?.meetingId as string | undefined;
        const agentId = customData?.agentId as string | undefined;

        if (meetingId) {
            console.log(`[Webhook] Call session ended for meeting ${meetingId}`);

            // Update meeting status to completed
            await db.update(meetings).set({
                status: "completed",
                updatedAt: new Date(),
            }).where(eq(meetings.id, meetingId));

            // Update agent status to idle if agentId is available
            if (agentId) {
                await db.update(agents).set({
                    status: "idle",
                    updatedAt: new Date(),
                }).where(eq(agents.id, agentId));

                // Cleanup agent resources
                try {
                    await leaveCall(meetingId, agentId);
                } catch (error) {
                    console.error(`[Webhook] Error during agent cleanup:`, error);
                }
            }
        }
    }

    // Handle participant left event
    if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;

        // Note: We need to get custom data from the call using call_cid
        // For now, we'll check if the participant user matches our agent pattern
        const participantUserId = event.participant.user.id;

        if (participantUserId.startsWith("agent_")) {
            const agentId = participantUserId.replace("agent_", "");
            console.log(`[Webhook] Agent ${agentId} left the call`);

            await db.update(agents).set({
                status: "idle",
                updatedAt: new Date(),
            }).where(eq(agents.id, agentId));
        }
    }

    // Handle recording ready event
    if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;

        // Extract meeting ID from call_cid (format: "default:meetingId")
        const callCid = event.call_cid;
        const meetingId = callCid.split(":")[1];

        if (meetingId && event.call_recording?.url) {
            console.log(`[Webhook] Recording ready for meeting ${meetingId}`);

            await db.update(meetings).set({
                recordingUrl: event.call_recording.url,
                updatedAt: new Date(),
            }).where(eq(meetings.id, meetingId));
        }
    }

    // Handle transcription ready event
    if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;

        // Extract meeting ID from call_cid (format: "default:meetingId")
        const callCid = event.call_cid;
        const meetingId = callCid.split(":")[1];

        if (meetingId && event.call_transcription?.url) {
            console.log(`[Webhook] Transcription ready for meeting ${meetingId}`);

            await db.update(meetings).set({
                transcriptUrl: event.call_transcription.url,
                updatedAt: new Date(),
            }).where(eq(meetings.id, meetingId));
        }
    }

    return new Response("Webhook processed successfully", { status: 200 });
}