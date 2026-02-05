
"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LinkedListVisualizer from '@/components/linked-list/LinkedListVisualizer';
import ControlPanel from '@/components/linked-list/ControlPanel';
import { CodeViewer } from "@/components/ui/code-viewer";
import { ListNode, ListOperation, DatasetType, ListKind } from '@/types/linked-list';
import { getOperationExplanation } from '@/lib/ai/gemini';
import { Link as LinkIcon, AlertCircle, BarChart3 } from 'lucide-react';
import { getSnippet } from '@/lib/code-snippets';

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceControl } from '@/components/ui/voice-control';
import { SimpleToast } from '@/components/ui/simple-toast';

const LinkedListPage = () => {
    const [nodes, setNodes] = useState<ListNode[]>([]);
    const [datasetType, setDatasetType] = useState<DatasetType>('numbers');
    const [listKind, setListKind] = useState<ListKind>('SLL');
    const [isProcessing, setIsProcessing] = useState(false);
    const [explanation, setExplanation] = useState<string>('');
    const [lastOp, setLastOp] = useState<ListOperation | null>(null);
    const [history, setHistory] = useState<ListNode[][]>([]);
    const [codeLang, setCodeLang] = useState<"c" | "cpp" | "java" | "python">("cpp");

    // Toast State
    const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' | 'info' }>({
        message: '',
        visible: false,
        type: 'info'
    });

    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, visible: true, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    // Speak explanation when it updates
    useEffect(() => {
        if (explanation && !isProcessing) {
            speak(explanation);
        }
    }, [explanation, isProcessing, speak]);

    // Stop speaking when navigating away or changing operations
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    const clearStatuses = useCallback((updatedNodes: ListNode[]) => {
        return updatedNodes.map(node => ({ ...node, status: 'idle' as const }));
    }, []);

    const handleOperation = async (op: ListOperation, value: string | number, index?: number) => {
        cancel(); // Stop any current speech
        setIsProcessing(true);
        setLastOp(op);
        setHistory(prev => [...prev, nodes]);
        setExplanation('');

        getOperationExplanation(op, value === null ? null : value, nodes, listKind).then(setExplanation);

        let nextNodes: ListNode[] = nodes.map(n => ({ ...n, status: 'idle' as ListNode['status'] }));
        const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

        try {
            switch (op) {
                case 'CLEAR':
                    nextNodes = [];
                    break;

                case 'INSERT_HEAD': {
                    const id = Math.random().toString();
                    const newNode: ListNode = { id, value, nextId: null, status: 'new' };
                    nextNodes = [newNode, ...nextNodes];
                    setNodes([...nextNodes]);
                    await sleep(500);
                    break;
                }

                case 'INSERT_TAIL': {
                    const id = Math.random().toString();
                    const newNode: ListNode = { id, value, nextId: null, status: 'new' };
                    nextNodes = [...nextNodes, newNode];
                    setNodes([...nextNodes]);
                    await sleep(500);
                    break;
                }

                case 'INSERT_AT': {
                    const p = index || 0;
                    const id = Math.random().toString();
                    const newNode: ListNode = { id, value, nextId: null, status: 'new' };

                    if (p <= 0) {
                        nextNodes = [newNode, ...nextNodes];
                    } else if (p >= nextNodes.length) {
                        nextNodes = [...nextNodes, newNode];
                    } else {
                        // Visualize traversal
                        for (let i = 0; i < p; i++) {
                            nextNodes[i].status = 'processing';
                            setNodes([...nextNodes]);
                            await sleep(300);
                            nextNodes[i].status = 'idle';
                        }
                        nextNodes = [...nextNodes.slice(0, p), newNode, ...nextNodes.slice(p)];
                    }
                    setNodes([...nextNodes]);
                    await sleep(500);
                    break;
                }

                case 'DELETE_HEAD':
                    if (nextNodes.length) {
                        nextNodes[0].status = 'processing';
                        setNodes([...nextNodes]);
                        await sleep(500);
                        nextNodes.shift();
                    }
                    break;

                case 'DELETE_TAIL':
                    if (nextNodes.length) {
                        nextNodes[nextNodes.length - 1].status = 'processing';
                        setNodes([...nextNodes]);
                        await sleep(500);
                        nextNodes.pop();
                    }
                    break;

                case 'DELETE_VALUE': {
                    const idx = nextNodes.findIndex(n => n.value == value);
                    if (idx !== -1) {
                        // Traversal
                        for (let i = 0; i < idx; i++) {
                            nextNodes[i].status = 'searching';
                            setNodes([...nextNodes]);
                            await sleep(300);
                            nextNodes[i].status = 'idle';
                        }
                        nextNodes[idx].status = 'processing'; // Mark for deletion
                        setNodes([...nextNodes]);
                        await sleep(600);
                        nextNodes.splice(idx, 1);
                    } else {
                        showToast(`Value ${value} not found for deletion`, 'error');
                    }
                    break;
                }

                case 'SEARCH': {
                    let found = false;
                    for (let i = 0; i < nextNodes.length; i++) {
                        nextNodes[i].status = 'searching';
                        setNodes([...nextNodes]);
                        await sleep(500);

                        if (nextNodes[i].value == value) {
                            nextNodes[i].status = 'found';
                            setNodes([...nextNodes]);
                            await sleep(1000);
                            found = true;
                            showToast(`Value ${value} found at index ${i}`, 'success');
                            break;
                        }
                        nextNodes[i].status = 'idle';
                    }
                    if (!found) {
                        showToast(`Value ${value} not found in the list`, 'error');
                    }
                    break;
                }

                case 'REVERSE': {
                    // Simple animation for reverse: highlight all, then flip
                    const reversed = [...nextNodes].reverse();
                    for (let i = 0; i < nextNodes.length; i++) {
                        nextNodes[i].status = 'processing';
                    }
                    setNodes([...nextNodes]);
                    await sleep(800);
                    nextNodes = reversed;
                    break;
                }

                case 'SORT': {
                    if (datasetType === 'numbers') {
                        nextNodes.sort((a, b) => (a.value as number) - (b.value as number));
                    } else {
                        nextNodes.sort((a, b) => String(a.value).localeCompare(String(b.value)));
                    }
                    // Flash effect
                    const flashed = nextNodes.map(n => ({ ...n, status: 'found' as const }));
                    setNodes(flashed);
                    await sleep(800);
                    nextNodes = nextNodes.map(n => ({ ...n, status: 'idle' as const }));
                    break;
                }

                case 'FIND_MIDDLE': {
                    if (nextNodes.length === 0) break;
                    let slow = 0;
                    let fast = 0;
                    while (fast < nextNodes.length && fast + 1 < nextNodes.length) {
                        nextNodes[slow].status = 'searching'; // Slow pointer
                        nextNodes[fast].status = 'runner'; // Fast pointer
                        setNodes([...nextNodes]);
                        await sleep(800);

                        nextNodes[slow].status = 'idle';
                        nextNodes[fast].status = 'idle';
                        slow++;
                        fast += 2;
                    }
                    // Highlight middle
                    nextNodes[slow].status = 'found';
                    setNodes([...nextNodes]);
                    await sleep(1000);
                    break;
                }
            }
            setNodes(clearStatuses(nextNodes));
        } catch (e) {
            console.error("Operation failed", e);
        }

        setIsProcessing(false);
    };

    return (
        <div className="flex flex-col gap-6 h-full font-sans relative">
            <SimpleToast
                message={toast.message}
                isVisible={toast.visible}
                type={toast.type}
            />

            <div className="flex items-start justify-between">
                <PageHeader
                    title="Linked List Visualizer"
                    description="Explore Singly, Doubly, and Circular Linked Lists with interactive animations."
                />
                <VoiceControl
                    isEnabled={isEnabled}
                    isSpeaking={isSpeaking}
                    onToggle={toggleVoice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                    {/* Visualizer */}
                    <Card className="flex-1 flex flex-col min-h-[500px]">
                        <CardHeader className="py-3 border-b">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" /> Visualizer</span>
                                <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">{listKind} Structure</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative overflow-hidden bg-muted/20">
                            <LinkedListVisualizer nodes={nodes} datasetType={datasetType} listKind={listKind} />
                        </CardContent>
                    </Card>

                    {/* Controls */}
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-base">Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4">
                            <ControlPanel
                                onOperation={handleOperation} isProcessing={isProcessing}
                                datasetType={datasetType} onDatasetTypeChange={setDatasetType}
                                listKind={listKind} onListKindChange={setListKind}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6 h-full overflow-y-auto">
                    {/* Stats */}
                    <Card>
                        <CardHeader className="py-3 bg-muted/30">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Properties
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="bg-card border p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase">Length</p>
                                <p className="text-2xl font-bold text-primary">{nodes.length}</p>
                            </div>
                            <div className="bg-card border p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase">Typology</p>
                                <p className="text-sm font-bold text-primary pt-1">{listKind}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Explanation */}
                    <Card className="flex-1 min-h-[200px]">
                        <CardHeader className="py-3 bg-muted/30">
                            <CardTitle className="text-sm transition-colors duration-300 flex items-center justify-between">
                                <span>Logic Breakdown</span>
                                {isSpeaking && <span className="text-xs text-primary animate-pulse">Narrating...</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 h-full overflow-y-auto max-h-[300px] text-sm text-muted-foreground scrollbar-thin">
                            {explanation ? (
                                <div className="space-y-2">
                                    {explanation.split('\n').map((line, i) => (
                                        <p key={i} className="pl-2 border-l-2 border-primary/50">{line}</p>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                                    <AlertCircle className="w-8 h-8 mb-2" />
                                    <p>Perform an operation to see AI explanation.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Code Display - Unified CodeViewer */}
                    <div className="h-full min-h-[300px]">
                        <CodeViewer
                            title={`${listKind} • ${lastOp ? lastOp.replace('_', ' ') : 'Select Op'}`}
                            customCode={getSnippet(listKind, lastOp || 'INSERT_HEAD', codeLang as any)}
                            onLanguageChange={(lang) => setCodeLang(lang)}
                            defaultLanguage="cpp"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkedListPage;
