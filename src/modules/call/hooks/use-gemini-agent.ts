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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const openRouterApiKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            cleanup();
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
        if (!apiKey) {
            setError("OpenRouter API key not configured");
            return;
        }

        openRouterApiKeyRef.current = apiKey;
        setIsConnected(true);

        return () => cleanup();
    }, [enabled, agentId, instructions]);

    const playAudioResponse = async (text: string) => {
        try {
            // Use Web Speech API for text-to-speech
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                utterance.lang = 'en-US';

                window.speechSynthesis.speak(utterance);
            }
        } catch (err) {
            console.error("[OpenRouter Agent] Error playing audio:", err);
        }
    };

    const processAudioWithOpenRouter = async (audioBlob: Blob) => {
        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            const base64Audio = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    resolve(base64data.split(',')[1]);
                };
                reader.onerror = reject;
            });

            // Send to OpenRouter API
            const response = await fetch("/api/openrouter/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: "", // We'll need to implement speech-to-text first
                    audioData: base64Audio,
                    instructions,
                    agentId
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.text || "I couldn't generate a response.";

            // Play the response
            playAudioResponse(reply);

        } catch (err) {
            console.error("[OpenRouter Agent] Error processing audio:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    };

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });

            let audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                if (audioBlob.size > 0) {
                    await processAudioWithOpenRouter(audioBlob);
                }
                audioChunks = [];

                // Restart for continuous listening if still enabled
                if (isListening) {
                    setTimeout(() => startListening(), 100);
                }
            };

            // Record in 3-second chunks
            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 3000);

            mediaRecorderRef.current = mediaRecorder;
            setIsListening(true);
        } catch (err) {
            console.error("[OpenRouter Agent] Error starting microphone:", err);
            setError("Failed to access microphone");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }
        setIsListening(false);
    };

    const cleanup = () => {
        stopListening();
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
