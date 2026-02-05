
"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CodeViewer } from "@/components/ui/code-viewer";
import { bubbleSort, mergeSort, quickSort, SortingStep } from "@/lib/algorithms/sorting";
import { motion } from "framer-motion";
import { Play, RotateCcw, BarChart3, Zap, Square, Info } from "lucide-react";

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceControl } from '@/components/ui/voice-control';

export default function SortingPage() {
    const [array, setArray] = useState<number[]>([]);
    const [steps, setSteps] = useState<SortingStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [algorithm, setAlgorithm] = useState<"bubble" | "merge" | "quick">("bubble");
    const [speed, setSpeed] = useState(100);
    const [message, setMessage] = useState("Select an algorithm and start sorting.");

    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    const generateArray = useCallback(() => {
        const size = 20;
        const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 50) + 5);
        setArray(newArr);
        setSteps([]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        setMessage("New array generated.");
        cancel();
    }, [cancel]);

    useEffect(() => {
        generateArray();
    }, [generateArray]);

    // Cleanup
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    const loadDemo = () => {
        const demoArr = [40, 10, 30, 5, 25, 45, 15, 35, 20, 50, 12, 8, 42, 28, 6];
        setArray(demoArr);
        setSteps([]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        setMessage("Demo array loaded.");
        cancel();
    };

    const handleSort = () => {
        let result;
        if (algorithm === "bubble") result = bubbleSort(array);
        else if (algorithm === "merge") result = mergeSort(array);
        else result = quickSort(array);

        setSteps(result.steps);
        setCurrentStepIndex(0);
        setIsPlaying(true);
        setMessage(`Running ${algorithm} sort...`);
        cancel();
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isPlaying && currentStepIndex < steps.length) {
            const currentDescription = steps[currentStepIndex]?.description || "";

            const nextStep = () => {
                setCurrentStepIndex((prev) => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            };

            if (isEnabled) {
                // Drive animation by voice completion
                // We pass nextStep as callback. 
                // Note: If user stops (isPlaying -> false), cleanup triggers cancel(), 
                // which might trigger onEnd, prompting one last step update, which is acceptable logic flow.
                speak(currentDescription, nextStep);
            } else {
                // Drive animation by timer
                timeout = setTimeout(nextStep, speed);
            }
        } else if (currentStepIndex >= steps.length && isPlaying) {
            setIsPlaying(false);
        }

        return () => {
            clearTimeout(timeout);
            if (isEnabled) cancel();
        };
    }, [isPlaying, currentStepIndex, steps, speed, isEnabled, speak, cancel]);

    // Derived current step (Moved render logic up or kept inline)
    const currentStep = steps[currentStepIndex] || {
        array: array,
        highlightIndices: [],
        sortedIndices: [],
        description: message,
        type: 'overwrite'
    };

    return (
        <div className="flex flex-col gap-6 h-full font-sans">
            <div className="flex items-start justify-between">
                <PageHeader
                    title="Sorting Algorithms"
                    description="Visualize Bubble, Merge, and Quick Sort in real-time."
                />
                <VoiceControl
                    isEnabled={isEnabled}
                    isSpeaking={isSpeaking}
                    onToggle={toggleVoice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column: Visuals & Controls */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Visualization */}
                    <Card className="flex-1 min-h-[400px] flex flex-col">
                        <CardHeader className="py-3 border-b">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Array Visualizer</span>
                                <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full capitalize">{algorithm} Sort</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-end justify-center p-8 bg-muted/20 relative gap-[2px]">
                            {/* Grid Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{
                                backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }}></div>

                            {currentStep.array.map((val, idx) => {
                                const isHighlighted = currentStep.highlightIndices.includes(idx);
                                const isSorted = currentStep.sortedIndices?.includes(idx);

                                let bgColor = 'hsl(var(--muted-foreground))';
                                let opacity = 0.5;

                                if (isSorted) {
                                    bgColor = 'hsl(var(--primary))'; // Greenish usually if primary is configured well, or just use explicit if needed
                                    opacity = 1;
                                } else if (isHighlighted) {
                                    opacity = 1;
                                    switch (currentStep.type) {
                                        case 'compare': bgColor = '#eab308'; break; // Amber
                                        case 'swap': bgColor = '#ef4444'; break; // Red
                                        case 'overwrite': bgColor = '#3b82f6'; break; // Blue
                                        case 'pivot': bgColor = '#a855f7'; break; // Purple
                                        default: bgColor = '#06b6d4'; // Cyan
                                    }
                                }

                                return (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={false}
                                        animate={{
                                            height: `${Math.max(val * 5, 10)}px`,
                                            backgroundColor: bgColor,
                                            opacity: opacity
                                        }}
                                        className="w-full max-w-[24px] rounded-t-sm transition-colors"
                                    >
                                    </motion.div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Controls */}
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-base">Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 py-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 items-center justify-between flex-wrap">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Algorithm</label>
                                        <div className="flex bg-muted p-1 rounded-lg">
                                            {(['bubble', 'merge', 'quick'] as const).map(algo => (
                                                <button
                                                    key={algo}
                                                    onClick={() => setAlgorithm(algo)}
                                                    className={`px-3 py-1 text-xs font-bold capitalize rounded-md transition-all ${algorithm === algo
                                                        ? 'bg-background text-primary shadow-sm'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    {algo}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 items-center self-end">
                                        <Button variant="outline" size="sm" onClick={generateArray}><RotateCcw className="w-4 h-4 mr-2" /> Randomize</Button>
                                        <Button variant="secondary" size="sm" onClick={loadDemo}><Zap className="w-4 h-4 mr-2" /> Demo</Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Animation Speed</label>
                                        <span className="text-xs font-mono text-muted-foreground">{speed}ms</span>
                                    </div>
                                    <Slider
                                        min={10}
                                        max={1000}
                                        step={10}
                                        value={speed}
                                        onChange={(e) => setSpeed(Number(e.target.value))}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-t pt-4">
                                {isPlaying ? (
                                    <Button onClick={() => setIsPlaying(false)} variant="destructive" className="w-full">
                                        <Square className="w-4 h-4 mr-2" /> Stop
                                    </Button>
                                ) : (
                                    <Button onClick={handleSort} className="w-full">
                                        <Play className="w-4 h-4 mr-2" /> Start Visualization
                                    </Button>
                                )}
                            </div>

                            <div className="p-3 bg-muted/50 rounded-lg text-sm text-center font-medium border border-border/50 min-h-[3rem] flex items-center justify-center transition-all">
                                {isSpeaking && <span className="text-xs font-bold mr-2 animate-pulse">[Voice]</span>}
                                {currentStep.description}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Code */}
                <div className="h-full min-h-[400px]">
                    <CodeViewer
                        title={`${algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort Logic`}
                        algorithm="sorting"
                    />
                </div>
            </div>
        </div>
    );
}
