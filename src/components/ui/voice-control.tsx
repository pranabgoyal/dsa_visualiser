import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceControlProps {
    isEnabled: boolean;
    isSpeaking: boolean;
    onToggle: () => void;
    className?: string;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
    isEnabled,
    isSpeaking,
    onToggle,
    className
}) => {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className={cn(
                "relative transition-all duration-300 gap-2",
                isEnabled ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" : "text-muted-foreground",
                className
            )}
            title={isEnabled ? "Mute Narrator" : "Enable Narrator"}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isEnabled ? 'on' : 'off'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isEnabled ? (
                        <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
                    ) : (
                        <VolumeX className="w-4 h-4" />
                    )}
                </motion.div>
            </AnimatePresence>
            <span className="text-xs font-semibold">
                {isEnabled ? (isSpeaking ? "Speaking..." : "Voice On") : "Voice Off"}
            </span>
        </Button>
    );
};
