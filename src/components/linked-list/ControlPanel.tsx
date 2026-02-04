
import React, { useState } from 'react';
import { ListOperation, DatasetType, ListKind } from '@/types/linked-list';
import { ArrowUp, ArrowDown, Plus, Eraser, Trash2, Shuffle, ArrowDown01, Search, Target, Trash, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
    onOperation: (op: ListOperation, value: string | number, index?: number) => void;
    isProcessing: boolean;
    datasetType: DatasetType;
    onDatasetTypeChange: (type: DatasetType) => void;
    listKind: ListKind;
    onListKindChange: (kind: ListKind) => void;
}

const ControlPanel: React.FC<Props> = ({ onOperation, isProcessing, datasetType, onDatasetTypeChange, listKind, onListKindChange }) => {
    const [val, setVal] = useState<string>('');
    const [idx, setIdx] = useState<string>('');

    const handleOp = (op: ListOperation) => {
        const numIdx = parseInt(idx);
        const noValueOps: ListOperation[] = ['DELETE_HEAD', 'DELETE_TAIL', 'REVERSE', 'SORT', 'FIND_MIDDLE', 'CLEAR'];

        if (!val.trim() && !noValueOps.includes(op)) {
            if (op === 'INSERT_AT' && isNaN(numIdx)) return;
            if (op !== 'INSERT_AT') return;
        }

        const finalValue = datasetType === 'numbers' ? parseInt(val) : val;

        onOperation(op, finalValue, isNaN(numIdx) ? undefined : numIdx);
        setVal('');
        setIdx('');
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-20">Mode</span>
                        <div className="flex bg-muted p-1 rounded-lg w-full">
                            {(['SLL', 'DLL', 'CSLL', 'CDLL'] as ListKind[]).map((kind) => (
                                <button
                                    key={kind}
                                    onClick={() => onListKindChange(kind)}
                                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${listKind === kind
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {kind}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-20">Data</span>
                        <div className="flex bg-muted p-1 rounded-lg w-full">
                            {(['numbers', 'characters'] as DatasetType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onDatasetTypeChange(type)}
                                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-md capitalize transition-all ${datasetType === type
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type={datasetType === 'numbers' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        placeholder="Value..."
                        className="font-mono text-sm"
                    />
                    <Input
                        type="number"
                        value={idx}
                        onChange={(e) => setIdx(e.target.value)}
                        placeholder="Index..."
                        className="font-mono text-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Modifications</h4>
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleOp('INSERT_HEAD')} disabled={isProcessing} className="w-full">
                        <ArrowUp className="w-4 h-4 mr-2" /> Add Head
                    </Button>
                    <Button onClick={() => handleOp('INSERT_TAIL')} disabled={isProcessing} className="w-full">
                        <ArrowDown className="w-4 h-4 mr-2" /> Add Tail
                    </Button>
                    <Button variant="secondary" onClick={() => handleOp('INSERT_AT')} disabled={isProcessing} className="col-span-2">
                        <Plus className="w-4 h-4 mr-2" /> Insert at Index
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => handleOp('DELETE_HEAD')} disabled={isProcessing} className="hover:text-destructive">
                        <Eraser className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleOp('DELETE_TAIL')} disabled={isProcessing} className="hover:text-destructive">
                        <Eraser className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleOp('DELETE_VALUE')} disabled={isProcessing} className="hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="col-span-3 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold text-center">
                        <span>Head</span>
                        <span>Tail</span>
                        <span>Value</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b pb-1">Algorithms</h4>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleOp('REVERSE')} disabled={isProcessing}><Shuffle className="w-3 h-3 mr-2" /> Reverse</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleOp('SORT')} disabled={isProcessing}><ArrowDown01 className="w-3 h-3 mr-2" /> Sort</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleOp('FIND_MIDDLE')} disabled={isProcessing} className="col-span-2"><Target className="w-3 h-3 mr-2" /> Find Middle</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleOp('SEARCH')} disabled={isProcessing} className="col-span-2"><Search className="w-3 h-3 mr-2" /> Search Value</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOp('CLEAR')} disabled={isProcessing} className="col-span-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash className="w-3 h-3 mr-2" /> Clear List</Button>
                </div>
            </div>

        </div>
    );
};

export default ControlPanel;
