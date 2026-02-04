"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeViewer } from "@/components/ui/code-viewer";
import { solveHanoi, HanoiStep } from "@/lib/algorithms/hanoi";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Zap, Square } from "lucide-react";
import { Input } from "@/components/ui/input";

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceControl } from '@/components/ui/voice-control';

export default function HanoiPage() {
    const [numDiscs, setNumDiscs] = useState<number | "">(3);
    const [steps, setSteps] = useState<HanoiStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState("Set number of discs and start.");

    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    // Initial State
    const [currentRods, setCurrentRods] = useState<{ A: number[], B: number[], C: number[] }>({ A: [3, 2, 1], B: [], C: [] });

    const reset = React.useCallback(() => {
        const d = numDiscs === "" ? 3 : numDiscs;
        const initialA = Array.from({ length: d }, (_, i) => d - i);
        setCurrentRods({ A: initialA, B: [], C: [] });
        setSteps([]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        setMessage(`Ready with ${d} discs.`);
        cancel();
    }, [numDiscs, cancel]);

    // Generate initial state on mount or change
    useEffect(() => {
        reset();
    }, [reset]);

    // Cleanup
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    // DEMO
    const loadDemo = () => {
        setNumDiscs(4);
        cancel();
    };

    const handleSolve = () => {
        const d = numDiscs === "" ? 3 : numDiscs;
        const { steps: solutionSteps } = solveHanoi(d);
        setSteps(solutionSteps);
        setCurrentStepIndex(0);
        setIsPlaying(true);
        setMessage("Solving Tower of Hanoi...");
        cancel();
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isPlaying && currentStepIndex < steps.length - 1) {
            const currentDescription = steps[currentStepIndex]?.description || "";
            // Calculate delay: 80ms per char for voice, or default speed (800ms)
            const delay = isEnabled
                ? Math.max(2500, currentDescription.length * 80)
                : 800;

            timeout = setTimeout(() => {
                setCurrentStepIndex((prev) => prev + 1);
            }, delay);
        } else if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }

        return () => clearTimeout(timeout);
    }, [isPlaying, currentStepIndex, steps, isEnabled]);

    // Update displayed rods based on current step
    useEffect(() => {
        if (steps.length > 0 && steps[currentStepIndex]) {
            const s = steps[currentStepIndex];
            setCurrentRods({ A: s.rodA, B: s.rodB, C: s.rodC });
            setMessage(s.description);
        }
    }, [currentStepIndex, steps]);

    // Speak message updates
    useEffect(() => {
        if (message) {
            speak(message);
        }
    }, [message, speak]);

    const renderRod = (name: string, discs: number[]) => (
        <div className="flex flex-col items-center justify-end h-[350px] w-1/3">
            {/* Stage Area: Holds Rod, Base, Discs */}
            <div className="relative w-full flex-1 flex flex-col items-center justify-end">
                {/* Rod Pole */}
                <div className="absolute bottom-2 w-2 h-[280px] bg-foreground/30 rounded-t-md z-0"></div>

                {/* Rod Base */}
                <div className="absolute bottom-0 w-32 h-2 bg-foreground/50 rounded-md z-0 transition-colors duration-300"></div>

                {/* Discs Container */}
                <div className="absolute bottom-2 w-full flex flex-col-reverse items-center z-10 gap-1 pb-1">
                    <AnimatePresence>
                        {discs.map((discVal) => (
                            <motion.div
                                key={discVal}
                                layoutId={`disc-${discVal}`}
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="h-6 rounded-md bg-primary shadow-sm border border-primary-foreground/20 text-xs flex items-center justify-center text-primary-foreground font-bold z-20"
                                style={{
                                    width: `${30 + discVal * 15}px`,
                                    backgroundColor: `hsl(var(--primary) / ${0.5 + (discVal / (typeof numDiscs === "number" ? numDiscs : 3)) * 0.5})`
                                } as React.CSSProperties}
                            >
                                {discVal}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Label - Static Block Below Stage */}
            <div className="mt-4 text-center font-bold text-primary text-base uppercase tracking-wider">{name}</div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 h-full font-sans">
            <div className="flex items-start justify-between">
                <PageHeader
                    title="Tower of Hanoi"
                    description="Recursive solution visualization."
                />
                <VoiceControl
                    isEnabled={isEnabled}
                    isSpeaking={isSpeaking}
                    onToggle={toggleVoice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Discs:</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={8}
                                        value={numDiscs}
                                        onChange={(e) => setNumDiscs(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-20"
                                    />
                                </div>
                                <Button variant="outline" onClick={reset} disabled={isPlaying}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
                                {/* DEMO BUTTON */}
                                <Button variant="secondary" onClick={loadDemo} disabled={isPlaying}><Zap className="w-4 h-4 mr-2" /> Demo</Button>
                                {isPlaying ? (
                                    <Button onClick={() => setIsPlaying(false)} variant="destructive">
                                        <Square className="w-4 h-4 mr-2" /> Stop
                                    </Button>
                                ) : (
                                    <Button onClick={handleSolve}>
                                        <Play className="w-4 h-4 mr-2" /> Solve
                                    </Button>
                                )}
                            </div>
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-center font-medium transition-all">
                                {isSpeaking && <span className="text-xs font-bold mr-2 animate-pulse">[Voice]</span>}
                                {message}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <CardHeader><CardTitle>Visualization</CardTitle></CardHeader>
                        <CardContent className="flex items-end justify-between p-8 pb-20 h-full min-h-[350px]">
                            {renderRod("Source (A)", currentRods.A)}
                            {renderRod("Aux (B)", currentRods.B)}
                            {renderRod("Dest (C)", currentRods.C)}
                        </CardContent>
                    </Card>
                </div>

                <div className="h-full min-h-[400px]">
                    <CodeViewer
                        title="Recursive Solution"
                        algorithm="hanoi"
                    />
                </div>
            </div>
        </div>
    );
}
