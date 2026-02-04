
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TreeNode, FlatTreeNode, TreeType } from '@/types/tree';
import { flatToTree, calculateNodePositions, calculateHeapPositions } from '@/lib/algorithms/tree';
import { ZoomIn, ZoomOut, Maximize2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    nodes: FlatTreeNode[];
    treeType: TreeType;
    traversalPath: string[];
}

const NODE_RADIUS = 28;

const TreeVisualizer: React.FC<Props> = ({ nodes, treeType, traversalPath }) => {
    const isHeap = treeType === 'MAX_HEAP' || treeType === 'MIN_HEAP';

    // Transform state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate content dimensions
    const treeHeight = nodes.length > 0 ? Math.floor(Math.log2(nodes.length)) + 1 : 0;
    const contentWidth = Math.max(1200, Math.pow(2, treeHeight) * 80);
    const contentHeight = Math.max(400, treeHeight * 120 + 200);

    // Calculate positions for nodes
    const positionedNodes = React.useMemo(() => {
        if (nodes.length === 0) return [];

        if (isHeap) {
            return calculateHeapPositions([...nodes], contentWidth);
        } else {
            const tree = flatToTree(nodes);
            if (tree) {
                calculateNodePositions(tree, contentWidth);
                // Collect positions from tree back to flat array
                const collectPositions = (node: TreeNode | null, result: Map<string, { x: number; y: number }>) => {
                    if (!node) return;
                    result.set(node.id, { x: node.x, y: node.y });
                    collectPositions(node.left, result);
                    collectPositions(node.right, result);
                };
                const posMap = new Map<string, { x: number; y: number }>();
                collectPositions(tree, posMap);

                return nodes.map(n => ({
                    ...n,
                    x: posMap.get(n.id)?.x || 0,
                    y: posMap.get(n.id)?.y || 0
                }));
            }
        }
        return nodes;
    }, [nodes, isHeap, contentWidth]);

    // Create a map for easy lookup
    const nodeMap = React.useMemo(() => {
        const map = new Map<string, FlatTreeNode>();
        positionedNodes.forEach(n => map.set(n.id, n));
        return map;
    }, [positionedNodes]);

    // Fit to screen handler
    const handleFitToScreen = useCallback(() => {
        if (!containerRef.current) return;
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const newScale = Math.min(scaleX, scaleY, 1) * 0.85;

        // Center visual
        const scaledWidth = contentWidth * newScale;
        const scaledHeight = contentHeight * newScale;
        const x = (containerWidth - scaledWidth) / 2;
        const y = (containerHeight - scaledHeight) / 2;

        setScale(newScale);
        setPosition({ x, y });
    }, [contentWidth, contentHeight]);

    useEffect(() => {
        if (nodes.length > 0) {
            handleFitToScreen();
        }
    }, [nodes.length, handleFitToScreen]);

    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(s => Math.min(Math.max(0.1, s * delta), 5));
        }
    };

    const getStatusStyles = (status: FlatTreeNode['status']) => {
        // Using HSL variables for theme awareness
        switch (status) {
            case 'searching': return { fill: 'hsl(var(--accent))', stroke: 'hsl(var(--primary))', text: 'hsl(var(--accent-foreground))', glow: 'rgba(var(--primary), 0.5)', label: 'Scanning', labelTextColor: 'hsl(var(--primary-foreground))' };
            case 'found': return { fill: 'hsl(var(--primary))', stroke: 'hsl(var(--primary))', text: 'hsl(var(--primary-foreground))', glow: 'rgba(var(--primary), 0.5)', label: 'Found', labelTextColor: 'hsl(var(--primary-foreground))' };
            case 'processing': return { fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--secondary-foreground))', text: 'hsl(var(--secondary-foreground))', glow: 'rgba(var(--secondary), 0.5)', label: 'Active', labelTextColor: 'hsl(var(--background))' };
            case 'new': return { fill: 'hsl(var(--muted))', stroke: 'hsl(var(--foreground))', text: 'hsl(var(--foreground))', glow: 'rgba(var(--muted), 0.5)', label: 'New', labelTextColor: 'hsl(var(--background))' };
            default: return { fill: 'hsl(var(--card))', stroke: 'hsl(var(--primary))', text: 'hsl(var(--foreground))', glow: 'transparent', labelTextColor: 'hsl(var(--foreground))' };
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-background rounded-b-xl relative overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{
                backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button size="icon" variant="secondary" onClick={() => setScale(s => Math.min(s * 1.2, 5))} title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="secondary" onClick={handleFitToScreen} title="Fit">
                    <Maximize2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Traversal Order Display */}
            {traversalPath.length > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order: </span>
                    <span className="text-sm font-bold text-primary font-mono ml-2">
                        {traversalPath.join(' → ')}
                    </span>
                </div>
            )}

            {nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground space-y-4 animate-in fade-in zoom-in pointer-events-none">
                    <div className="p-6 rounded-full bg-muted/50 border border-border">
                        <Network className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold tracking-tight">Tree is Empty</p>
                        <p className="text-sm text-muted-foreground">Insert values to visualize {treeType.replace('_', ' ')}</p>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                    className="w-full h-full origin-top-left"
                >
                    <svg width={contentWidth} height={contentHeight} className="drop-shadow-sm">
                        <defs>
                            <marker id="treeArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <path d="M0,0 L8,3 L0,6 Z" fill="hsl(var(--muted-foreground))" />
                            </marker>
                        </defs>

                        {/* Draw edges */}
                        {positionedNodes.map(node => {
                            const edges = [];
                            const drawEdge = (left: boolean) => {
                                const targetNode = nodeMap.get(left ? node.leftId! : node.rightId!);
                                if (!targetNode) return null;
                                return (
                                    <line
                                        key={`edge-${left ? 'left' : 'right'}-${node.id}`}
                                        x1={node.x}
                                        y1={node.y + NODE_RADIUS}
                                        x2={targetNode.x}
                                        y2={targetNode.y - NODE_RADIUS}
                                        stroke="hsl(var(--border))"
                                        strokeWidth="3"
                                        className="transition-all duration-300"
                                    />
                                );
                            }
                            if (node.leftId) edges.push(drawEdge(true));
                            if (node.rightId) edges.push(drawEdge(false));
                            return edges;
                        })}

                        {/* Draw nodes */}
                        {positionedNodes.map((node, index) => {
                            const styles = getStatusStyles(node.status);
                            const isRoot = !node.parentId;

                            return (
                                <g key={node.id} className="transition-all duration-500 cursor-pointer hover:scale-105">
                                    {/* Node glow */}
                                    {node.status !== 'idle' && (
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={NODE_RADIUS + 8}
                                            fill={styles.glow}
                                            className="animate-pulse"
                                        />
                                    )}

                                    {/* Node circle */}
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={NODE_RADIUS}
                                        fill={styles.fill}
                                        stroke={styles.stroke}
                                        strokeWidth="3"
                                        className="transition-all duration-300"
                                    />

                                    {/* Node value */}
                                    <text
                                        x={node.x}
                                        y={node.y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="text-sm font-bold font-mono"
                                        fill={styles.text}
                                    >
                                        {node.value}
                                    </text>

                                    {/* Status badge */}
                                    {styles.label && (
                                        <g transform={`translate(${node.x}, ${node.y - NODE_RADIUS - 16})`}>
                                            <rect x="-28" y="-8" width="56" height="16" rx="4" fill={styles.stroke} />
                                            <text textAnchor="middle" dy="3" className="text-[7px] font-extrabold uppercase tracking-wider" fill={styles.labelTextColor}>
                                                {styles.label}
                                            </text>
                                        </g>
                                    )}

                                    {isRoot && (
                                        <g transform={`translate(${node.x}, ${node.y - NODE_RADIUS - 35})`}>
                                            <text textAnchor="middle" className="text-[9px] font-black fill-primary uppercase tracking-widest">ROOT</text>
                                        </g>
                                    )}

                                    {/* Height for AVL */}
                                    {treeType === 'AVL' && (
                                        <g transform={`translate(${node.x + NODE_RADIUS + 8}, ${node.y})`}>
                                            <text className="text-[9px] font-bold fill-muted-foreground">h={node.height}</text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            )}
        </div>
    );
};

export default TreeVisualizer;
