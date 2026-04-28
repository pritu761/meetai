import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const text = body.text;
        const instructions = body.instructions || "You are a helpful AI assistant in a video call. Keep responses concise and natural.";

        if (!text || typeof text !== "string") {
            return Response.json({ error: "Missing text input" }, { status: 400 });
        }

        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterApiKey) {
            return Response.json({ error: "API key not configured" }, { status: 500 });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterApiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                    "X-Title": "MeetAI",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-001",
                    messages: [
                        {
                            role: "system",
                            content: instructions,
                        },
                        {
                            role: "user",
                            content: text,
                        },
                    ],
                    max_tokens: 1024,
                    temperature: 0.7,
                }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("[AI Chat] API error:", response.status, errorBody);
            return Response.json(
                { error: "AI service unavailable", details: errorBody },
                { status: response.status }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I could not generate a response.";

        return Response.json({ reply });
    } catch (error) {
        console.error("[AI Chat] Error:", error);
        return Response.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}