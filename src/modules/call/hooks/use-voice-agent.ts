import { useEffect, useRef, useState, useCallback } from "react";

interface UseVoiceAgentProps {
    agentId?: string;
    instructions?: string;
    enabled: boolean;
}

export function useVoiceAgent({ agentId, instructions, enabled }: UseVoiceAgentProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const processAudioChunk = async (audioBlob: Blob) => {
        try {
            setIsSpeaking(true);

            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];

                // Send to our server endpoint
                const response = await fetch("/api/gemini/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: "Please transcribe and respond to this audio",
                        agentId,
                        instructions: instructions || "You are a helpful AI assistant in a video call. Keep responses concise and natural.",
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to get response from Gemini");
                }

                const data = await response.json();
                const reply = data.reply;

                setTranscript(reply);
                speakText(reply);
            };
        } catch (err) {
            console.error("[Voice Agent] Error processing audio:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
            setIsSpeaking(false);
        }
    };

    const speakText = (text: string) => {
        if (!window.speechSynthesis) {
            setError("Speech synthesis not supported");
            setIsSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
            console.log("[Voice Agent] Finished speaking");
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error("[Voice Agent] Speech synthesis error:", event);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size > 0) {
                    processAudioChunk(audioBlob);
                }
                audioChunksRef.current = [];
            };

            // Record in 5-second chunks
            mediaRecorder.start();
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                    if (isListening) {
                        // Restart for continuous listening
                        setTimeout(() => startListening(), 100);
                    }
                }
            }, 5000);

            setIsListening(true);
            setError(null);
            console.log("[Voice Agent] Started listening");
        } catch (err) {
            console.error("[Voice Agent] Error starting microphone:", err);
            setError("Failed to access microphone. Please allow microphone access.");
        }
    }, [isListening, agentId, instructions]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsListening(false);
        console.log("[Voice Agent] Stopped listening");
    }, []);

    const stopSpeaking = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
            stopSpeaking();
        };
    }, []);

    return {
        isListening,
        isSpeaking,
        error,
        transcript,
        startListening,
        stopListening,
        stopSpeaking,
    };
}
