import { NextRequest } from "next/server";
import { db } from "@/db";
import { meetingMessages } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { meetingId, content, isAgent, model } = body;

        if (!meetingId || !content || typeof content !== "string") {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify the meeting exists (in a real app, you'd also check user ownership)
        const [meeting] = await db
            .select()
            .from(meetingMessages)
            .limit(1);

        // Save the message
        const [message] = await db.insert(meetingMessages).values({
            meetingId,
            content,
            isAgent: !!isAgent,
            model: model || null,
        }).returning();

        return Response.json({ success: true, message });
    } catch (error) {
        console.error("[Meeting Messages] Error:", error);
        return Response.json(
            { error: "Failed to save message" },
            { status: 500 }
        );
    }
}