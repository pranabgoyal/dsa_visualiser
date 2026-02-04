import { useState, useEffect, useCallback, useRef } from 'react';

interface TextToSpeechHook {
    speak: (text: string, onEnd?: () => void) => void;
    cancel: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
    isEnabled: boolean;
    toggleVoice: () => void;
}

export const useTextToSpeech = (): TextToSpeechHook => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true); // Default to enabled, or load from local storage
    const synth = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synth.current = window.speechSynthesis;
            setIsSupported(true);
        }
    }, []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!synth.current || !isEnabled || !text) {
            if (onEnd) onEnd();
            return;
        }

        // Cancel current speech to avoid queue buildup for fast interactions
        if (synth.current.speaking) {
            synth.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Attempt to find a "natural" or "premium" voice if possible
        const voices = synth.current.getVoices();
        // Prefer Google US English or Microsoft David/Zira if available, else first English
        const preferredVoice = voices.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Microsoft Zira') ||
            v.lang.startsWith('en-US')
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        synth.current.speak(utterance);
    }, [isEnabled]);

    const cancel = useCallback(() => {
        if (synth.current) {
            synth.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    const toggleVoice = useCallback(() => {
        setIsEnabled(prev => {
            const newState = !prev;
            if (!newState && synth.current) {
                synth.current.cancel();
            }
            return newState;
        });
    }, []);

    return {
        speak,
        cancel,
        isSpeaking,
        isSupported,
        isEnabled,
        toggleVoice
    };
};
