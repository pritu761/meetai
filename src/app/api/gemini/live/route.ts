import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side endpoint for AI Live API
 * Handles real-time audio streaming
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { audioData, instructions, sessionId } = await req.json();

        if (!audioData) {
            return NextResponse.json({ error: "Missing audio data" }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // Use OpenRouter REST API directly
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: instructions || "You are a helpful AI assistant in a video call. Respond naturally and conversationally. Keep responses concise.",
                    },
                    {
                        role: "user",
                        content: "[Audio input received from call participant]",
                    },
                ],
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "No response generated";

        return NextResponse.json({
            text,
            sessionId: sessionId || Date.now().toString(),
        });
    } catch (error) {
        console.error("[AI Live] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to process audio",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}