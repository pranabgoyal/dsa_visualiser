
import React, { useState } from 'react';
import { TreeType, TreeOperation } from '@/types/tree';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Badge import removed
import {
    Plus,
    Trash2,
    Search,
    ArrowUpDown,
    RotateCw,
    Eraser,
    Settings2,
    ArrowUp,
    ChevronDown,
    List
} from 'lucide-react';
// Select imports removed

// Since I'm not sure if Select/Badge are available in the list earlier, 
// I will check the file list again. Step 294 showed Button, Card, CodeViewer, Input, Slider, ThemeToggle.
// Select and Badge were NOT in Step 294. I should avoid them or use standard HTML/Tailwind for dropdowns/badges.

interface Props {
    onOperation: (op: TreeOperation, value?: number) => void;
    isProcessing: boolean;
    treeType: TreeType;
    onTreeTypeChange: (type: TreeType) => void;
}

const TreeControlPanel: React.FC<Props> = ({
    onOperation,
    isProcessing,
    treeType,
    onTreeTypeChange
}) => {
    const [val, setVal] = useState<string>('');

    const handleOp = (op: TreeOperation) => {
        const numVal = parseInt(val);
        const noValueOps: TreeOperation[] = [
            'INORDER', 'PREORDER', 'POSTORDER', 'LEVEL_ORDER',
            'FIND_MIN', 'FIND_MAX', 'GET_HEIGHT', 'CLEAR', 'EXTRACT_ROOT', 'HEAPIFY'
        ];

        if (!noValueOps.includes(op) && (isNaN(numVal) || val.trim() === '')) {
            return;
        }

        onOperation(op, noValueOps.includes(op) ? undefined : numVal);
        setVal('');
    };

    const isHeap = treeType === 'MAX_HEAP' || treeType === 'MIN_HEAP';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Tree Type:</span>
                    <div className="flex bg-muted p-1 rounded-lg w-full">
                        {(['BST', 'AVL', 'MAX_HEAP', 'MIN_HEAP'] as TreeType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => onTreeTypeChange(type)}
                                className={`flex-1 text-[10px] sm:text-xs font-bold py-1.5 px-2 rounded-md transition-all ${treeType === type
                                    ? 'bg-background text-primary shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Input
                        type="number"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleOp('INSERT'); }}
                        placeholder="Value..."
                        className="font-mono text-sm"
                    />
                    <Button onClick={() => handleOp('INSERT')} disabled={isProcessing} className="bg-primary text-primary-foreground min-w-[80px]">
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Essential</h4>
                <div className="grid grid-cols-2 gap-2">
                    {isHeap ? (
                        <Button variant="secondary" onClick={() => handleOp('EXTRACT_ROOT')} disabled={isProcessing} className="col-span-2">
                            <ArrowUp className="w-4 h-4 mr-2" /> Extract Root
                        </Button>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => handleOp('DELETE')} disabled={isProcessing}>
                                <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                            </Button>
                            <Button variant="secondary" onClick={() => handleOp('SEARCH')} disabled={isProcessing}>
                                <Search className="w-4 h-4 mr-2 text-blue-500" /> Search
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" className="col-span-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleOp('CLEAR')}>
                        <Eraser className="w-4 h-4 mr-2" /> Clear Tree
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Traversals</h4>
                <div className="grid grid-cols-2 gap-2">
                    {['INORDER', 'PREORDER', 'POSTORDER', 'LEVEL_ORDER'].map(t => (
                        <Button
                            key={t}
                            variant="outline"
                            size="sm"
                            onClick={() => handleOp(t as TreeOperation)}
                            disabled={isProcessing}
                            className="text-[10px] font-mono"
                        >
                            {t.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Stats</h4>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOp('FIND_MIN')} disabled={isProcessing}>Min</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOp('FIND_MAX')} disabled={isProcessing}>Max</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOp('GET_HEIGHT')} disabled={isProcessing}>Height</Button>
                </div>
            </div>
        </div>
    );
};

export default TreeControlPanel;
