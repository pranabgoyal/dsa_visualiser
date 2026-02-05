
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleToastProps {
    message: string;
    isVisible: boolean;
    type?: 'success' | 'error' | 'info';
    onClose?: () => void;
}

export const SimpleToast: React.FC<SimpleToastProps> = ({ message, isVisible, type = 'info', onClose }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border backdrop-blur-md",
                        type === 'error' && "bg-destructive/10 border-destructive text-destructive",
                        type === 'success' && "bg-emerald-500/10 border-emerald-500 text-emerald-500",
                        type === 'info' && "bg-primary/10 border-primary text-primary"
                    )}>
                        {type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {type === 'info' && <Info className="w-5 h-5" />}

                        <span className="font-semibold text-sm">{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
