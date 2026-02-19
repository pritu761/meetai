"use client";

import { useState } from "react";

interface VoiceAgentControllerProps {
    agentId?: string;
    instructions?: string;
    showUI?: boolean;
    autoStart?: boolean;
}

export const VoiceAgentController = ({
    agentId,
    instructions,
    showUI = true,
}: VoiceAgentControllerProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>("");
    const [response, setResponse] = useState<string>("");
    const [inputText, setInputText] = useState<string>("");

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        try {
            setIsProcessing(true);
            setError(null);
            setTranscript(text);

            const res = await fetch("/api/gemini/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    agentId,
                    instructions: instructions || "You are a helpful AI assistant in a video call. Keep responses concise and natural.",
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to get response from Gemini");
            }

            const data = await res.json();
            const reply = data.reply;

            setResponse(reply);

            // Speak the response
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(reply);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                window.speechSynthesis.speak(utterance);
            }

            setInputText("");
        } catch (err) {
            console.error("[Voice Agent] Error:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputText);
    };

    if (!showUI) return null;
    if (!agentId) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white shadow-lg w-96 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🤖</div>
                <div className="flex-1">
                    <div className="font-semibold">AI Agent</div>
                    <div className="text-xs text-gray-300">
                        {error ? (
                            <span className="text-red-400">⚠️ {error}</span>
                        ) : isProcessing ? (
                            <span className="text-blue-400">⏳ Processing...</span>
                        ) : (
                            <span className="text-green-400">✅ Ready</span>
                        )}
                    </div>
                </div>
            </div>

            {transcript && (
                <div className="text-xs text-gray-300 mb-2 p-2 bg-white/10 rounded">
                    <strong>You:</strong> {transcript}
                </div>
            )}

            {response && (
                <div className="text-xs text-gray-300 mb-3 p-2 bg-blue-500/20 rounded">
                    <strong>Agent:</strong> {response}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/40"
                    disabled={isProcessing}
                />
                <button
                    type="submit"
                    disabled={isProcessing || !inputText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                    {isProcessing ? "..." : "Send"}
                </button>
            </form>

            <div className="text-xs text-gray-400 mt-2">
                💡 Tip: Type your message and press Send. The agent will respond with voice!
            </div>
        </div>
    );
};
