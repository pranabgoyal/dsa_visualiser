
"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CodeViewer } from "@/components/ui/code-viewer";
import { infixToPostfix, Step } from "@/lib/algorithms/stack";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, ChevronRight, ChevronLeft, Square, Layers, ArrowRight } from "lucide-react";

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceControl } from '@/components/ui/voice-control';

export default function StackPage() {
    const [expression, setExpression] = useState("A + B * ( C - D )");
    const [steps, setSteps] = useState<Step[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    useEffect(() => {
        const { steps } = infixToPostfix(expression);
        setSteps(steps);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        cancel(); // Reset voice
    }, [expression, cancel]);

    // Cleanup
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isPlaying && currentStepIndex < steps.length - 1) {
            const currentDescription = steps[currentStepIndex]?.description || "";
            // If voice is enabled, calculate delay based on text length (approx 80ms per char) + base buffer
            // Otherwise default to 1000ms
            const delay = isEnabled
                ? Math.max(2500, currentDescription.length * 80)
                : 1000;

            timeout = setTimeout(() => {
                setCurrentStepIndex((prev) => prev + 1);
            }, delay);
        } else if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }

        return () => clearTimeout(timeout);
    }, [isPlaying, currentStepIndex, steps, isEnabled]);

    const currentStep = steps[currentStepIndex] || { stack: [], output: "", description: "Start..." };

    // Speak description when step changes
    useEffect(() => {
        if (currentStep.description) {
            speak(currentStep.description);
        }
    }, [currentStep.description, speak]);

    return (
        <div className="flex flex-col gap-6 h-full font-sans">
            <div className="flex items-start justify-between">
                <PageHeader
                    title="Stack Data Structure"
                    description="Visualize Infix to Postfix conversion using Stacks."
                />
                <VoiceControl
                    isEnabled={isEnabled}
                    isSpeaking={isSpeaking}
                    onToggle={toggleVoice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Control Panel & Visualization */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
                        {/* Stack Visual */}
                        <Card className="flex flex-col">
                            <CardHeader className="py-3 border-b">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" /> Stack Memory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 bg-muted/20 flex flex-col-reverse items-center p-8 gap-2 min-h-[300px] overflow-hidden relative">
                                {/* Grid Background */}
                                <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{
                                    backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
                                    backgroundSize: '24px 24px'
                                }}></div>

                                <AnimatePresence mode="popLayout">
                                    {currentStep.stack.map((item, idx) => (
                                        <motion.div
                                            key={`${idx}-${item}`}
                                            initial={{ opacity: 0, y: -50, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                            layout
                                            className="w-24 h-12 flex items-center justify-center bg-card border border-primary/50 rounded-lg shadow-sm text-xl font-bold font-mono z-10"
                                        >
                                            {item}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div className="w-32 h-2 bg-muted-foreground/30 rounded-full mt-2" />
                            </CardContent>
                        </Card>

                        {/* Output Visual */}
                        <Card className="flex flex-col">
                            <CardHeader className="py-3 border-b">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-primary" /> Postfix Output
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex items-center justify-center p-8 bg-muted/20 relative">
                                <div className="text-3xl font-mono tracking-widest break-all bg-card/50 p-6 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm">
                                    {currentStep.output.split('').map((char, idx) => (
                                        <motion.span
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="inline-block text-primary"
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                    <span className="inline-block w-3 h-8 bg-primary/50 animate-pulse ml-1 align-middle mb-1" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls */}
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-base">Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 py-4">
                            <div className="flex gap-4">
                                <Input
                                    value={expression}
                                    onChange={(e) => setExpression(e.target.value)}
                                    placeholder="Enter Infix Expression (e.g. A+B)"
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const { steps } = infixToPostfix(expression);
                                        setSteps(steps);
                                        setCurrentStepIndex(0);
                                    }}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                                </Button>
                            </div>

                            <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-border/50">
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))} disabled={currentStepIndex === 0}>
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                </Button>

                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded border">
                                        Step {currentStepIndex + 1} / {steps.length}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant={isPlaying ? "destructive" : "default"}
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Square className="fill-current w-3 h-3 mr-2" /> : <Play className="fill-current w-3 h-3 mr-2" />}
                                        {isPlaying ? "Stop" : "Auto Play"}
                                    </Button>
                                </div>

                                <Button variant="ghost" size="sm" onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))} disabled={currentStepIndex === steps.length - 1}>
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>

                            <div className="p-4 bg-primary/5 text-primary text-center font-medium rounded-lg text-sm border border-primary/10 transition-all">
                                {isSpeaking && <span className="text-xs font-bold mr-2 animate-pulse">[Voice]</span>}
                                {currentStep.description}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Code Sidebar */}
                <div className="h-full min-h-[500px] flex flex-col">
                    <CodeViewer
                        title="Algorithm Logic"
                        algorithm="stack"
                    />
                </div>
            </div>
        </div>
    );
}
