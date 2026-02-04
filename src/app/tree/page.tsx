
"use client";

import { PageHeader } from "@/components/ui/page-header";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TreeVisualizer from '@/components/tree/TreeVisualizer';
import TreeControlPanel from '@/components/tree/TreeControlPanel';
import { CodeViewer } from "@/components/ui/code-viewer";
import { TreeType, TreeOperation, FlatTreeNode, TreeStats } from '@/types/tree';
import {
    bstInsert, avlInsert, heapInsert,
    bstDelete, avlDelete, extractHeapRoot,
    searchTree,
    inorderTraversal, preorderTraversal, postorderTraversal, levelOrderTraversal,
    findMinNode, findMaxNode,
    treeToFlat, flatToTree, getTreeStats
} from '@/lib/algorithms/tree';
import { getTreeOperationExplanation, getTreeComplexityInfo } from '@/lib/ai/treeGemini';
import { getTreeSnippet } from '@/lib/code-snippets';
import { Network, Info, BarChart3, AlertCircle } from 'lucide-react';

import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceControl } from '@/components/ui/voice-control';

export default function TreePage() {
    // State
    const [treeType, setTreeType] = useState<TreeType>('BST');
    const [nodes, setNodes] = useState<FlatTreeNode[]>([]);
    const [traversalPath, setTraversalPath] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [speechText, setSpeechText] = useState(''); // New state for voiceover
    const [lastOperation, setLastOperation] = useState<TreeOperation | null>(null);
    const [codeLang, setCodeLang] = useState<"c" | "cpp" | "java" | "python">("cpp");

    // Voiceover Hook
    const { speak, cancel, isSpeaking, isEnabled, toggleVoice } = useTextToSpeech();

    // Speak explanation when it updates
    useEffect(() => {
        if (speechText && !isProcessing) {
            speak(speechText);
            setSpeechText(''); // Clear after queuing to avoid repeat
        }
    }, [speechText, isProcessing, speak]);

    // Cleanup
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    // Default Stats
    const stats: TreeStats = React.useMemo(() => {
        const tree = flatToTree(nodes);
        return getTreeStats(tree);
    }, [nodes]);

    // Current Code Snippet
    const codeSnippet = React.useMemo(() => {
        if (!lastOperation) return "// Select an operation to view code...";
        return getTreeSnippet(treeType, lastOperation, codeLang as any);
    }, [treeType, lastOperation, codeLang]);

    // Cleanup on unmount or type change
    useEffect(() => {
        setNodes([]);
        setTraversalPath([]);
        setExplanation('');
        setLastOperation(null);
        cancel();
    }, [treeType, cancel]);

    // Handle Operations
    const handleOperation = async (op: TreeOperation, value?: number) => {
        if (isProcessing) return;
        cancel(); // Stop speaking
        setIsProcessing(true);
        setLastOperation(op);
        setTraversalPath([]);

        try {
            const currentRoot = flatToTree(nodes);
            let newRoot = currentRoot;
            let currentNodes = [...nodes];
            let newNodes: FlatTreeNode[] = [];
            let traversalResult: number[] = [];

            switch (op) {
                case 'INSERT':
                    if (value === undefined) break;
                    if (treeType === 'BST') {
                        newRoot = bstInsert(currentRoot, value);
                        newNodes = treeToFlat(newRoot);
                    } else if (treeType === 'AVL') {
                        newRoot = avlInsert(currentRoot, value);
                        newNodes = treeToFlat(newRoot);
                    } else if (treeType === 'MAX_HEAP') {
                        newNodes = heapInsert(currentNodes, value, true);
                    } else if (treeType === 'MIN_HEAP') {
                        newNodes = heapInsert(currentNodes, value, false);
                    }
                    break;

                case 'DELETE':
                    if (value === undefined) break;
                    if (treeType === 'BST') {
                        newRoot = bstDelete(currentRoot, value);
                        newNodes = treeToFlat(newRoot);
                    } else if (treeType === 'AVL') {
                        newRoot = avlDelete(currentRoot, value);
                        newNodes = treeToFlat(newRoot);
                    }
                    break;

                case 'EXTRACT_ROOT':
                    if (treeType === 'MAX_HEAP') {
                        newNodes = extractHeapRoot(currentNodes, true);
                    } else if (treeType === 'MIN_HEAP') {
                        newNodes = extractHeapRoot(currentNodes, false);
                    }
                    break;

                case 'CLEAR':
                    newNodes = [];
                    break;

                case 'INORDER':
                    traversalResult = inorderTraversal(currentRoot);
                    newNodes = nodes;
                    break;
                case 'PREORDER':
                    traversalResult = preorderTraversal(currentRoot);
                    newNodes = nodes;
                    break;
                case 'POSTORDER':
                    traversalResult = postorderTraversal(currentRoot);
                    newNodes = nodes;
                    break;
                case 'LEVEL_ORDER':
                    traversalResult = levelOrderTraversal(currentRoot);
                    newNodes = nodes;
                    break;

                case 'SEARCH':
                    if (value !== undefined) {
                        const found = searchTree(currentRoot, value);
                        newNodes = nodes.map(n => ({
                            ...n,
                            status: n.value === value ? 'found' : 'idle'
                        }));
                        setTimeout(() => {
                            setNodes(ns => ns.map(n => ({ ...n, status: 'idle' })));
                        }, 2000);
                        if (!found && value) console.log(`Value ${value} not found!`);
                    } else {
                        newNodes = nodes;
                    }
                    break;

                case 'FIND_MIN':
                    if (currentRoot) {
                        const minNode = findMinNode(currentRoot);
                        newNodes = nodes.map(n => ({ ...n, status: n.value === minNode.value ? 'found' : 'idle' }));
                        setTimeout(() => setNodes(ns => ns.map(n => ({ ...n, status: 'idle' }))), 2000);
                    } else newNodes = nodes;
                    break;

                case 'FIND_MAX':
                    if (currentRoot) {
                        const maxNode = findMaxNode(currentRoot);
                        newNodes = nodes.map(n => ({ ...n, status: n.value === maxNode.value ? 'found' : 'idle' }));
                        setTimeout(() => setNodes(ns => ns.map(n => ({ ...n, status: 'idle' }))), 2000);
                    } else newNodes = nodes;
                    break;

                case 'GET_HEIGHT':
                    newNodes = nodes;
                    break;

                case 'HEAPIFY':
                    newNodes = nodes;
                    break;

                default:
                    newNodes = nodes;
            }

            setNodes(newNodes);
            if (traversalResult.length > 0) {
                setTraversalPath(traversalResult.map(String));
            }

            // Gemini Explanation
            const { ui, voice } = await getTreeOperationExplanation(op, value || null, newNodes, treeType);
            setExplanation(ui);
            setSpeechText(voice);

        } catch (error) {
            console.error("Operation failed:", error);
            setExplanation("An error occurred during the operation.");
        } finally {
            setIsProcessing(false);
        }
    };

    const complexity = lastOperation ? getTreeComplexityInfo(lastOperation as any, treeType) : null;

    return (
        <div className="flex flex-col gap-6 h-full font-sans">
            <div className="flex items-start justify-between">
                <PageHeader
                    title="Tree Data Structures"
                    description="Visualize standard (BST, AVL) and heap-based tree structures efficiently."
                />
                <VoiceControl
                    isEnabled={isEnabled}
                    isSpeaking={isSpeaking}
                    onToggle={toggleVoice}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column: Controls and Visualizer */}
                <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                    {/* Visualizer Card (Primary Focus) */}
                    <Card className="flex-1 flex flex-col min-h-[500px]">
                        <CardHeader className="py-3 border-b">
                            <CardTitle className="text-sm flex items-center justify-between">
                                <span className="flex items-center gap-2"><Network className="w-4 h-4 text-primary" /> Visualization Canvas</span>
                                <span className="text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">{treeType.replace('_', ' ')}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative bg-muted/20">
                            <TreeVisualizer
                                nodes={nodes}
                                treeType={treeType}
                                traversalPath={traversalPath}
                            />
                        </CardContent>
                    </Card>

                    {/* Controls Card */}
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-base">Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="py-4">
                            <TreeControlPanel
                                onOperation={handleOperation}
                                isProcessing={isProcessing}
                                treeType={treeType}
                                onTreeTypeChange={setTreeType}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Code & Analysis */}
                <div className="flex flex-col gap-6 h-full overflow-y-auto">
                    {/* Stats */}
                    <Card>
                        <CardHeader className="py-3 bg-muted/30">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Live Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4">
                            <div className="bg-card border p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase">Nodes</p>
                                <p className="text-2xl font-bold text-primary">{stats.nodeCount}</p>
                            </div>
                            <div className="bg-card border p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase">Height</p>
                                <p className="text-2xl font-bold text-primary">{stats.height}</p>
                            </div>
                            {treeType !== 'MAX_HEAP' && treeType !== 'MIN_HEAP' && (
                                <div className={`col-span-2 border p-2 rounded-lg flex items-center justify-center gap-2 ${stats.isBalanced ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                                    <Info className="w-4 h-4" />
                                    <span className="text-xs font-bold">{stats.isBalanced ? 'Balanced' : 'Unbalanced'}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Complexity */}
                    {complexity && (
                        <Card>
                            <CardHeader className="py-3 bg-muted/30">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Complexity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time:</span>
                                    <span className="font-mono font-bold text-foreground">{complexity.time}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Space:</span>
                                    <span className="font-mono font-bold text-foreground">{complexity.space}</span>
                                </div>
                                <p className="text-xs text-muted-foreground border-t pt-2">{complexity.description}</p>
                            </CardContent>
                        </Card>
                    )}

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

                    {/* Standardized Code Viewer */}
                    <div className="h-full min-h-[300px]">
                        <CodeViewer
                            title={`${treeType.replace('_', ' ')} • ${lastOperation ? lastOperation.replace('_', ' ') : 'Select Op'}`}
                            customCode={codeSnippet}
                            onLanguageChange={(lang) => setCodeLang(lang)}
                            defaultLanguage="cpp"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
