"use client";

import { useState } from "react";
import { Bot, Send, Loader2 } from "lucide-react";

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

      if (!res.ok) throw new Error(`Failed to get response: ${res.status}`);

      const data = await res.json();
      const reply = data.reply || data.text || "No response received";
      setResponse(reply);

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
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!showUI || !agentId) return null;

  return (
    <div className="w-80 bg-[#141419]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Agent</div>
            <div className="text-xs text-white/50">
              {error ? (
                <span className="text-red-400">Error</span>
              ) : isProcessing ? (
                <span className="text-blue-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Thinking...
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
        {transcript && (
          <div className="text-xs text-white/70 p-2 bg-white/5 rounded-lg">
            <span className="text-blue-400 font-medium">You: </span>{transcript}
          </div>
        )}
        {response && (
          <div className="text-xs text-white/70 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className="text-emerald-400 font-medium">Agent: </span>{response}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 text-xs text-red-400 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/30 rounded-lg transition-colors text-white"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-2 text-center">
          Type a message and the agent will respond with voice
        </p>
      </form>
    </div>
  );
};