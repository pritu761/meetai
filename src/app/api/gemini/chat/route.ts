import { NextRequest } from "next/server";

/**
 * Server-side proxy for Gemini Live API
 * This handles the WebSocket connection to Gemini on the server side
 * and provides a simpler HTTP streaming interface for the client
 */

export async function POST(req: NextRequest) {
    try {
        const { text, agentId, instructions } = await req.json();

        if (!text) {
            return Response.json({ error: "Missing text input" }, { status: 400 });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // Use the standard Gemini API (not Live API) for now
        // This is more reliable and works from the browser
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `${instructions}\n\nUser: ${text}`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("[Gemini Proxy] API error:", error);
            return Response.json(
                { error: "Gemini API request failed", details: error },
                { status: response.status }
            );
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

        return Response.json({ reply });
    } catch (error) {
        console.error("[Gemini Proxy] Error:", error);
        return Response.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
