"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeViewer } from "@/components/ui/code-viewer";
import { linearSearch, binarySearch, SearchStep } from "@/lib/algorithms/search";
import { motion } from "framer-motion";
import { Search, Play, RotateCcw, Square } from "lucide-react";
import { VoiceControl } from "@/components/ui/voice-control";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function SearchPage() {
    const [array, setArray] = useState<number[]>([]);
    const [target, setTarget] = useState<number | "">("");
    const [steps, setSteps] = useState<SearchStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(800);
    const [mode, setMode] = useState<"linear" | "binary">("linear");
    const [message, setMessage] = useState("Select a search mode and start.");


    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    // Speak message when it updates
    useEffect(() => {
        if (message) {
            speak(message);
        }
    }, [message, speak]);

    // Stop speaking when unmounting
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    const generateArray = React.useCallback(() => {
        const size = 15;
        const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
        if (mode === "binary") {
            newArr.sort((a, b) => a - b);
        }
        setArray(newArr);
        setSteps([]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        setMessage("New array generated.");
    }, [mode]);

    // Generate random array
    useEffect(() => {
        generateArray();
    }, [generateArray]);

    const handleSearch = () => {
        let result;
        const searchTarget = target === "" ? 0 : target;
        if (mode === "linear") {
            result = linearSearch(array, searchTarget);
        } else {
            result = binarySearch(array, searchTarget);
        }
        setSteps(result.steps);
        setCurrentStepIndex(0);
        setIsPlaying(true);
        setMessage(`Running ${mode} search for ${searchTarget}...`);
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isPlaying && currentStepIndex < steps.length - 1) {
            const currentDescription = steps[currentStepIndex]?.description || "";

            // If voice is enabled, ensure delay is long enough for speech
            let delay = speed;
            if (isEnabled) {
                const voiceDuration = Math.max(1500, currentDescription.length * 80);
                delay = Math.max(speed, voiceDuration);
            }

            timeout = setTimeout(() => {
                setCurrentStepIndex((prev) => prev + 1);
            }, delay);
        } else if (currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }

        return () => clearTimeout(timeout);
    }, [isPlaying, currentStepIndex, steps, speed, isEnabled]);

    const currentStep = steps[currentStepIndex] || {
        array: array,
        highlightIndices: [],
        foundIndex: null,
        description: message,
        range: { start: 0, end: array.length - 1 }
    };

    // Update message when step changes to trigger voiceover
    useEffect(() => {
        if (isPlaying && steps[currentStepIndex]?.description) {
            setMessage(steps[currentStepIndex].description);
        }
    }, [currentStepIndex, isPlaying, steps]);

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-start justify-between">
                <PageHeader
                    title="Search Algorithms"
                    description="Compare Linear Search vs. Binary Search."
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
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 flex-wrap items-center justify-between">
                                    <div className="flex gap-4 items-center">
                                        <div className="flex bg-muted p-1 rounded-lg">
                                            <Button
                                                variant={mode === "linear" ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setMode("linear")}
                                            >Linear</Button>
                                            <Button
                                                variant={mode === "binary" ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setMode("binary")}
                                            >Binary</Button>
                                        </div>

                                        <Button variant="outline" onClick={generateArray}><RotateCcw className="w-4 h-4 mr-2" /> Randomize</Button>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="number"
                                            value={target}
                                            onChange={(e) => setTarget(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="Target"
                                            className="w-24"
                                            disabled={isPlaying}
                                        />
                                        {isPlaying ? (
                                            <Button onClick={() => setIsPlaying(false)} variant="destructive">
                                                <Square className="w-4 h-4 mr-2" /> Stop
                                            </Button>
                                        ) : (
                                            <Button onClick={handleSearch}>
                                                <Search className="w-4 h-4 mr-2" /> Find
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border/50">
                                    <span className="text-sm font-medium whitespace-nowrap">Speed: {speed}ms</span>
                                    <Slider
                                        min={100}
                                        max={1500}
                                        step={50}
                                        value={speed}
                                        onChange={(e) => setSpeed(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-center font-medium">
                                {currentStep.description}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 overflow-hidden">
                        <CardHeader><CardTitle>Visualization</CardTitle></CardHeader>
                        <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {currentStep.array.map((val, idx) => {
                                    const isHighlighted = currentStep.highlightIndices.includes(idx);
                                    const isFound = currentStep.foundIndex === idx;
                                    const inRange = mode === "binary" && currentStep.range ? (idx >= currentStep.range.start && idx <= currentStep.range.end) : true;

                                    return (
                                        <motion.div
                                            key={`${idx}-${val}`} // Key needs to be stable but unique enough
                                            animate={{
                                                scale: isHighlighted || isFound ? 1.2 : 1,
                                                opacity: inRange ? 1 : 0.3,
                                                backgroundColor: isFound ? 'hsl(var(--primary))' : (isHighlighted ? 'hsl(var(--accent))' : 'hsl(var(--muted))'),
                                                color: isFound || isHighlighted ? 'white' : 'inherit'
                                            }}
                                            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-md border text-sm font-bold shadow-sm transition-colors"
                                        >
                                            {val}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="h-full min-h-[400px]">
                    <CodeViewer
                        title={mode === "linear" ? "Linear Search" : "Binary Search"}
                        algorithm="search"
                    />
                </div>
            </div>
        </div>
    );
}
