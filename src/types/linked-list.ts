
export type DatasetType = 'numbers' | 'characters' | 'colors' | 'emojis';
export type ListKind = 'SLL' | 'DLL' | 'CSLL' | 'CDLL';

export interface ListNode {
    id: string;
    value: string | number;
    nextId: string | null;
    prevId?: string | null;
    status: 'idle' | 'searching' | 'found' | 'processing' | 'new' | 'runner';
}

export type ListOperation =
    | 'INSERT_HEAD' | 'INSERT_TAIL' | 'INSERT_AT'
    | 'DELETE_HEAD' | 'DELETE_TAIL' | 'DELETE_VALUE'
    | 'SEARCH' | 'REVERSE' | 'SORT' | 'FIND_MIDDLE' | 'CLEAR';

export interface HistoryItem {
    operation: ListOperation;
    nodes: ListNode[];
    description: string;
    timestamp: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
