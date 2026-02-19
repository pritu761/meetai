import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side endpoint for Gemini Live API
 * Handles real-time audio streaming using Google's SDK
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const { audioData, instructions, sessionId } = await req.json();

        if (!audioData) {
            return NextResponse.json({ error: "Missing audio data" }, { status: 400 });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // Initialize Gemini SDK
        const genAI = new GoogleGenerativeAI(geminiApiKey);

        // Use the Live API model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-native-audio-preview-12-2025",
        });

        // Start a chat session with audio
        const chat = model.startChat({
            history: [],
            generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        // Send audio and get response
        const result = await chat.sendMessage([
            {
                inlineData: {
                    mimeType: "audio/pcm",
                    data: audioData, // Base64 encoded audio
                },
            },
            {
                text: instructions || "You are a helpful AI assistant in a video call. Respond naturally and conversationally.",
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // For now, return text response
        // TODO: Implement audio response generation
        return NextResponse.json({
            text,
            sessionId: sessionId || Date.now().toString(),
        });
    } catch (error) {
        console.error("[Gemini Live] Error:", error);
        return NextResponse.json(
            {
                error: "Failed to process audio",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
