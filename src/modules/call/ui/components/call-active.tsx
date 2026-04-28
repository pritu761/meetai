"use client";
import Link from "next/link";
import Image from "next/image";
import {
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import { useState, useEffect } from "react";
import { VoiceAgentController } from "./voice-agent-controller";
import {
  MessageSquare,
  Send,
  Bot,
  X,
} from "lucide-react";

interface Props {
  onLeave: () => void;
  meetingName: string;
  agentId?: string;
  instructions?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  time: string;
  isAgent?: boolean;
}

export const CallActive = ({ onLeave, meetingName, agentId, instructions }: Props) => {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showAgentPanel, setShowAgentPanel] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        setShowChat(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender: "You",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatInput("");

    if (agentId) {
      fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          agentId,
          instructions: instructions || "You are a helpful AI assistant in a video call. Keep responses concise and natural.",
        }),
      })
        .then(res => res.json())
        .then(data => {
          const reply = data.reply || data.text || "No response";
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: reply,
            sender: "AI Agent",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAgent: true,
          }]);
        })
        .catch(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: "Failed to get response from agent",
            sender: "System",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        });
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(chatInput);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
            <Image src="/logo.svg" alt="logo" width={24} height={24} />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-white">{meetingName}</h1>
            <p className="text-xs text-white/60">Meeting in progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agentId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">AI Agent Active</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-white/80 font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 pt-16 pb-24">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>

      {/* Side Chat Panel */}
      {showChat && (
        <div className="absolute top-16 right-4 bottom-24 w-80 bg-[#141419]/95 backdrop-blur-md rounded-xl border border-white/10 z-20 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold">Chat</span>
              {agentId && <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">AI</span>}
            </div>
            <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-white/40 text-sm py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs mt-1">Type a message to get started</p>
                {agentId && <p className="text-xs mt-1 text-blue-400">AI agent will respond</p>}
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.isAgent && <Bot className="w-3 h-3 text-blue-400" />}
                  <span className="text-xs text-white/50 font-medium">{msg.sender}</span>
                  <span className="text-xs text-white/30">{msg.time}</span>
                </div>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  msg.isAgent
                    ? 'bg-blue-500/20 text-blue-100 rounded-bl-md'
                    : msg.sender === 'System'
                    ? 'bg-yellow-500/20 text-yellow-200 rounded-br-md'
                    : 'bg-white/10 text-white rounded-br-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={agentId ? "Message or ask AI..." : "Type a message..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/30 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="flex items-center justify-center pb-6 pt-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a24]/90 backdrop-blur-md rounded-2xl border border-white/10">
            <CallControls onLeave={onLeave} />
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-xl transition-all ${showChat ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            {agentId && (
              <button
                onClick={() => setShowAgentPanel(!showAgentPanel)}
                className={`p-3 rounded-xl transition-all ${showAgentPanel ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                <Bot className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voice Agent Controller */}
      {agentId && showAgentPanel && (
        <div className="absolute bottom-28 left-4 z-20">
          <VoiceAgentController
            agentId={agentId}
            instructions={instructions}
            showUI={true}
            autoStart={false}
          />
        </div>
      )}
    </div>
  );
};