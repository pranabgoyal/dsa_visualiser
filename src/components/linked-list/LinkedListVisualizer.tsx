
import React, { useRef, useEffect, useState } from 'react';
import { ListNode, ListKind, DatasetType } from '@/types/linked-list';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, CornerDownRight, RotateCcw, Plus } from 'lucide-react';

interface Props {
    nodes: ListNode[];
    datasetType: DatasetType;
    listKind: ListKind;
}

const LinkedListVisualizer: React.FC<Props> = ({ nodes, datasetType, listKind }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Auto-scroll to track active nodes would go here, keep it simple for now

    return (
        <div ref={containerRef} className="w-full h-full overflow-x-auto overflow-y-hidden p-10 bg-muted/20 relative flex items-center">
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{
                backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }}></div>

            <div className="flex items-center mx-auto min-w-max px-20">
                <AnimatePresence mode='popLayout'>
                    {nodes.map((node, index) => {
                        const isHead = index === 0;
                        const isTail = index === nodes.length - 1;

                        // New dynamic theme colors
                        let borderColor = 'border-primary';
                        let bgColor = 'bg-card';
                        let textColor = 'text-foreground';
                        let shadow = 'shadow-md';

                        if (node.status === 'new') {
                            borderColor = 'border-emerald-500';
                            bgColor = 'bg-emerald-500/10';
                            shadow = 'shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                        } else if (node.status === 'processing' || node.status === 'runner') {
                            borderColor = 'border-amber-500';
                            bgColor = 'bg-amber-500/10';
                            shadow = 'shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                        } else if (node.status === 'searching') {
                            borderColor = 'border-indigo-500';
                            bgColor = 'bg-indigo-500/10';
                        } else if (node.status === 'found') {
                            borderColor = 'border-emerald-500';
                            bgColor = 'bg-emerald-500';
                            textColor = 'text-white';
                            shadow = 'shadow-[0_0_20px_rgba(16,185,129,0.6)]';
                        }

                        // Circular reference Line
                        const showCircularLine = isTail && (listKind === 'CSLL' || listKind === 'CDLL');

                        return (
                            <motion.div
                                key={node.id}
                                layout
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -20, transition: { duration: 0.2 } }}
                                className="relative flex items-center group"
                            >
                                {/* The Node */}
                                <div className={`
                                    relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center 
                                    text-xl font-bold font-mono transition-colors duration-300 z-10
                                    ${borderColor} ${bgColor} ${textColor} ${shadow}
                                `}>
                                    {node.value}

                                    {/* Index Badge */}
                                    <div className="absolute -bottom-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Idx: {index}
                                    </div>

                                    {/* Head/Tail Indicators */}
                                    {isHead && (
                                        <div className={`absolute -top-10 flex flex-col items-center animate-in slide-in-from-bottom-2 z-20 ${isTail ? '-left-4 items-end' : 'left-1/2 -translate-x-1/2'}`}>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-full mb-1 border border-rose-500/20 shadow-sm backdrop-blur-[1px]">Head</span>
                                            <div className={`w-px h-3 bg-rose-500 ${isTail ? 'mr-4' : ''}`}></div>
                                        </div>
                                    )}
                                    {isTail && (
                                        <div className={`absolute -top-10 flex flex-col items-center animate-in slide-in-from-bottom-2 z-20 ${isHead ? '-right-4 items-start' : 'left-1/2 -translate-x-1/2'}`}>
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full mb-1 border border-blue-500/20 shadow-sm backdrop-blur-[1px]">Tail</span>
                                            <div className={`w-px h-3 bg-blue-500 ${isHead ? 'ml-4' : ''}`}></div>
                                        </div>
                                    )}

                                    {/* Pointers Logic */}
                                    {/* Null Pointer */}
                                    {isTail && !listKind.startsWith('C') && (
                                        <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center animate-in fade-in zoom-in duration-300">
                                            {/* Connection Line */}
                                            <div className="w-4 h-0.5 bg-muted-foreground/30"></div>
                                            {/* Null Badge */}
                                            <div className="bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/20 text-[9px] font-bold text-muted-foreground shadow-sm">
                                                NULL
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Link Arrow */}
                                {!isTail && (
                                    <div className="w-16 flex items-center justify-center text-muted-foreground/40 relative">
                                        {/* Forward Link */}
                                        <div className="h-0.5 w-full bg-current absolute top-1/2 -translate-y-1/2"></div>
                                        <ChevronRight className="w-5 h-5 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1" />

                                        {/* Back Link for Doubly Linked */}
                                        {(listKind === 'DLL' || listKind === 'CDLL') && (
                                            <>
                                                <div className="h-0.5 w-full bg-current absolute top-1/2 translate-y-2 opacity-50"></div>
                                                <ChevronRight className="w-5 h-5 absolute left-0 top-1/2 translate-y-2 -translate-x-1 rotate-180 opacity-50" />
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Circular Line Drawing */}
                                {showCircularLine && (
                                    <div className="absolute top-1/2 left-1/2 w-[100vw] h-32 pointer-events-none -z-10">
                                        {/* Simple SVG curve to loop back to head - strictly visual decoration for now */}
                                        <svg className="absolute top-0 left-0 w-full h-full overflow-visible">
                                            <path
                                                d={`M 0 0 C 100 100, -${index * 140} 100, -${index * 140 + 80} 10`}
                                                fill="none"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth="2"
                                                strokeDasharray="5 5"
                                                className="opacity-20"
                                            />
                                        </svg>
                                    </div>
                                )}

                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {nodes.length === 0 && (
                    <div className="text-center text-muted-foreground opacity-50 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="border-2 border-dashed border-muted-foreground w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">List Empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedListVisualizer;
