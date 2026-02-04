"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeViewer } from "@/components/ui/code-viewer";
import { simulateRoundRobin, Process, SchedulerState } from "@/lib/algorithms/queue";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Plus, Trash2, Cpu, Square } from "lucide-react";

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceControl } from '@/components/ui/voice-control';

export default function QueuePage() {
    const [processes, setProcesses] = useState<Process[]>([
        { id: "P1", burstTime: 5, arrivalTime: 0, remainingTime: 5, color: "bg-blue-500" },
        { id: "P2", burstTime: 3, arrivalTime: 1, remainingTime: 3, color: "bg-green-500" },
        { id: "P3", burstTime: 6, arrivalTime: 2, remainingTime: 6, color: "bg-purple-500" },
    ]);
    const [timeQuantum, setTimeQuantum] = useState<number | "">(2);
    const [steps, setSteps] = useState<SchedulerState[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // New process inputs
    const [newBurst, setNewBurst] = useState<number | "">(4);
    const [newArrival, setNewArrival] = useState<number | "">(0);

    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    useEffect(() => {
        const quantum = timeQuantum === "" ? 2 : timeQuantum;
        const { steps } = simulateRoundRobin(processes, quantum);
        setSteps(steps);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        cancel();
    }, [processes, timeQuantum, cancel]);

    // Cleanup
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (isPlaying && currentStepIndex < steps.length - 1) {
            const currentDescription = steps[currentStepIndex]?.description || "";
            // If voice is enabled, calculate delay based on text length (approx 80ms per char)
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

    const addProcess = () => {
        const id = `P${processes.length + 1}`;
        const colors = ["bg-red-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500"];
        const color = colors[processes.length % colors.length];
        const burst = newBurst === "" ? 4 : newBurst;
        const arrival = newArrival === "" ? 0 : newArrival;
        setProcesses([...processes, { id, burstTime: burst, arrivalTime: arrival, remainingTime: burst, color }]);
    };

    const currentStep = steps[currentStepIndex] || {
        time: 0,
        readyQueue: [],
        runningProcess: null,
        completedProcesses: [],
        ganttChart: [],
        description: "Start..."
    };

    // Speak description when step changes
    useEffect(() => {
        if (currentStep.description) {
            speak(currentStep.description);
        }
    }, [currentStep.description, speak]);

    const getProcessColor = (id: string) => processes.find(p => p.id === id)?.color || "bg-gray-500";

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-start justify-between">
                <PageHeader
                    title="Queue: CPU Scheduling"
                    description="Round Robin Scheduling using a Ready Queue."
                />
                <VoiceControl
                    isEnabled={isEnabled}
                    isSpeaking={isSpeaking}
                    onToggle={toggleVoice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Controls & Queue */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4 items-end">
                                <div className="w-24">
                                    <label className="text-xs text-muted-foreground">Quantum</label>
                                    <Input type="number" value={timeQuantum} onChange={(e) => setTimeQuantum(e.target.value === "" ? "" : Number(e.target.value))} />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-muted-foreground">Burst Time</label>
                                    <Input type="number" value={newBurst} onChange={(e) => setNewBurst(e.target.value === "" ? "" : Number(e.target.value))} />
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-muted-foreground">Arrival</label>
                                    <Input type="number" value={newArrival} onChange={(e) => setNewArrival(e.target.value === "" ? "" : Number(e.target.value))} />
                                </div>
                                <Button onClick={addProcess}><Plus className="w-4 h-4 mr-1" /> Add Process</Button>
                                <Button variant="outline" onClick={() => setProcesses([])}><Trash2 className="w-4 h-4 mr-1" /> Clear</Button>
                            </div>

                            <div className="flex gap-2 flex-wrap mt-4">
                                {processes.map(p => (
                                    <div key={p.id} className={`px-2 py-1 rounded text-xs text-white ${p.color}`}>
                                        {p.id} (B:{p.burstTime}, A:{p.arrivalTime})
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg mt-4">
                                <Button variant="ghost" onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))} disabled={currentStepIndex === 0}>Prev</Button>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant={isPlaying ? "destructive" : "default"}
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Square className="fill-current w-4 h-4" /> : <Play className="fill-current w-4 h-4" />}
                                    </Button>
                                    <span className="text-sm font-mono text-muted-foreground">T = {currentStep.time}</span>
                                </div>
                                <Button variant="ghost" onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))} disabled={currentStepIndex === steps.length - 1}>Next</Button>
                            </div>
                            <div className="p-2 bg-primary/10 border border-primary/20 rounded text-center text-primary text-sm transition-all">
                                {isSpeaking && <span className="text-xs font-bold mr-2 animate-pulse">[Voice]</span>}
                                {currentStep.description}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ready Queue Visual */}
                        <Card>
                            <CardHeader><CardTitle>Ready Queue</CardTitle></CardHeader>
                            <CardContent className="min-h-[150px] flex items-center p-4 overflow-x-auto gap-2 bg-muted/10 rounded-md">
                                <AnimatePresence>
                                    {currentStep.readyQueue.map((pid) => (
                                        <motion.div
                                            key={pid}
                                            layoutId={pid}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold shadow-lg ${getProcessColor(pid)}`}
                                        >
                                            {pid}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {currentStep.readyQueue.length === 0 && <span className="text-muted-foreground text-sm w-full text-center">Empty</span>}
                            </CardContent>
                        </Card>

                        {/* CPU Visual */}
                        <Card>
                            <CardHeader><CardTitle>CPU Execution</CardTitle></CardHeader>
                            <CardContent className="min-h-[150px] flex items-center justify-center p-4 bg-muted/10 rounded-md relative">
                                <Cpu className={`w-32 h-32 transition-colors duration-500 ${currentStep.runningProcess ? 'text-primary animate-pulse' : 'text-muted'}`} />
                                <AnimatePresence>
                                    {currentStep.runningProcess && (
                                        <motion.div
                                            key={currentStep.runningProcess}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`absolute inset-0 flex items-center justify-center`}
                                        >
                                            <div className={`w-16 h-16 flex items-center justify-center rounded-lg text-white font-bold text-xl shadow-[0_0_20px_currentColor] ${getProcessColor(currentStep.runningProcess)}`}>
                                                {currentStep.runningProcess}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gantt Chart */}
                    <Card>
                        <CardHeader><CardTitle>Gantt Chart</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <div className="flex h-16 w-full min-w-max">
                                {currentStep.ganttChart.map((block, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: (block.endTime - block.startTime) * 40, opacity: 1 }}
                                        className={`h-full flex flex-col justify-center items-center text-white text-xs border-r border-background/20 relative ${getProcessColor(block.processId)}`}
                                    >
                                        <span>{block.processId}</span>
                                        <span className="absolute bottom-1 right-1 text-[10px] opacity-70">{block.endTime}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Code View */}
                <div className="h-full min-h-[500px]">
                    <CodeViewer
                        title="Round Robin Logic"
                        algorithm="queue"
                    />
                </div>
            </div>
        </div>
    );
}
