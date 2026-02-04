
export type TreeType = 'BST' | 'AVL' | 'MAX_HEAP' | 'MIN_HEAP';
export type TraversalType = 'INORDER' | 'PREORDER' | 'POSTORDER' | 'LEVEL_ORDER';

export type TreeOperation =
    | 'INSERT' | 'DELETE' | 'SEARCH'
    | 'INORDER' | 'PREORDER' | 'POSTORDER' | 'LEVEL_ORDER'
    | 'FIND_MIN' | 'FIND_MAX' | 'GET_HEIGHT'
    | 'CLEAR' | 'EXTRACT_ROOT' | 'HEAPIFY';

export interface TreeNode {
    id: string;
    value: number;
    left: TreeNode | null;
    right: TreeNode | null;
    parent: TreeNode | null;
    height: number; // For AVL
    x: number;
    y: number;
    status: 'idle' | 'searching' | 'found' | 'processing' | 'new' | 'visited' | 'comparing';
}

export interface FlatTreeNode {
    id: string;
    value: number;
    leftId: string | null;
    rightId: string | null;
    parentId: string | null;
    height: number;
    x: number;
    y: number;
    status: 'idle' | 'searching' | 'found' | 'processing' | 'new' | 'visited' | 'comparing';
    level: number;
}

export interface TreeHistoryItem {
    operation: TreeOperation;
    nodes: FlatTreeNode[];
    description: string;
    timestamp: number;
}

export interface TreeStats {
    nodeCount: number;
    height: number;
    isBalanced: boolean;
    minValue: number | null;
    maxValue: number | null;
}
