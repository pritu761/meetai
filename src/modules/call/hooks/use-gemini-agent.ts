import { useEffect, useRef, useState } from "react";

interface UseGeminiAgentProps {
    agentId: string;
    instructions: string;
    enabled: boolean;
}

export function useGeminiAgent({ agentId, instructions, enabled }: UseGeminiAgentProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (!enabled) {
            cleanup();
            return;
        }

        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!geminiApiKey) {
            setError("Gemini API key not configured");
            return;
        }

        // Initialize Gemini Live API connection
        const connectToGemini = async () => {
            try {
                console.log("[Gemini Agent] Attempting to connect to Gemini Live API...");
                console.log("[Gemini Agent] API Key present:", !!geminiApiKey);
                console.log("[Gemini Agent] API Key length:", geminiApiKey?.length);

                // Initialize Gemini Live API connection
                const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
                console.log("[Gemini Agent] Connecting to:", wsUrl.replace(geminiApiKey!, '[REDACTED]'));

                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log("[Gemini Agent] ✅ Connected to Gemini Live API");
                    setIsConnected(true);
                    setError(null);

                    // Send initial setup message
                    const setupMessage = {
                        setup: {
                            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                            generation_config: {
                                response_modalities: ["AUDIO"],
                            },
                            system_instruction: {
                                parts: [{
                                    text: `You are an AI assistant in a video call. ${instructions}
                                    
Keep responses concise and conversational. Speak naturally as if you're in a real conversation.`
                                }]
                            }
                        }
                    };

                    console.log("[Gemini Agent] Sending setup message:", setupMessage);
                    ws.send(JSON.stringify(setupMessage));
                };

                ws.onmessage = async (event) => {
                    console.log("[Gemini Agent] Received message:", event.data);

                    // Check if message is binary (Blob) or text (JSON)
                    if (event.data instanceof Blob) {
                        console.log("[Gemini Agent] Received binary audio data");
                        // Handle binary audio data
                        const arrayBuffer = await event.data.arrayBuffer();
                        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                        playAudioResponse(base64Audio);
                        return;
                    }

                    // Parse JSON message
                    try {
                        const data = JSON.parse(event.data);
                        console.log("[Gemini Agent] Parsed message:", data);

                        // Handle audio response from Gemini
                        if (data.serverContent?.modelTurn?.parts) {
                            for (const part of data.serverContent.modelTurn.parts) {
                                if (part.inlineData?.data) {
                                    // Play audio response
                                    playAudioResponse(part.inlineData.data);
                                }
                            }
                        }
                    } catch (err) {
                        console.error("[Gemini Agent] Failed to parse message:", err);
                    }
                };

                ws.onerror = (err) => {
                    console.error("[Gemini Agent] ❌ WebSocket error:", err);
                    console.error("[Gemini Agent] Error details:", {
                        type: err.type,
                        target: err.target,
                        currentTarget: err.currentTarget
                    });
                    setError("Failed to connect to Gemini - check API key and network");
                    setIsConnected(false);
                };

                ws.onclose = (event) => {
                    console.log("[Gemini Agent] Disconnected from Gemini");
                    console.log("[Gemini Agent] Close code:", event.code);
                    console.log("[Gemini Agent] Close reason:", event.reason);
                    console.log("[Gemini Agent] Was clean:", event.wasClean);
                    setIsConnected(false);

                    if (event.code !== 1000) {
                        setError(`Connection closed: ${event.reason || 'Unknown error'}`);
                    }
                };

                wsRef.current = ws;
            } catch (err) {
                console.error("[Gemini Agent] Connection error:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            }
        };

        connectToGemini();

        return () => cleanup();
    }, [enabled, agentId, instructions]);

    const playAudioResponse = async (base64Audio: string) => {
        try {
            // Decode base64 audio
            const audioData = atob(base64Audio);
            const audioArray = new Uint8Array(audioData.length);
            for (let i = 0; i < audioData.length; i++) {
                audioArray[i] = audioData.charCodeAt(i);
            }

            // Create audio context if needed
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }

            // Decode and play audio
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioArray.buffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch (err) {
            console.error("[Gemini Agent] Error playing audio:", err);
        }
    };

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                    // Convert audio to PCM 16kHz for Gemini
                    const arrayBuffer = await event.data.arrayBuffer();
                    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

                    // Send audio to Gemini
                    wsRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm",
                                data: base64Audio
                            }]
                        }
                    }));
                }
            };

            mediaRecorder.start(100); // Send chunks every 100ms
            mediaRecorderRef.current = mediaRecorder;
            setIsListening(true);
        } catch (err) {
            console.error("[Gemini Agent] Error starting microphone:", err);
            setError("Failed to access microphone");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
            setIsListening(false);
        }
    };

    const cleanup = () => {
        stopListening();
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsConnected(false);
    };

    return {
        isConnected,
        isListening,
        error,
        startListening,
        stopListening,
    };
}
