
import { TreeNode, FlatTreeNode, TreeType, TreeStats } from '@/types/tree';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Create a new tree node
export const createTreeNode = (value: number): TreeNode => ({
    id: generateId(),
    value,
    left: null,
    right: null,
    parent: null,
    height: 1,
    x: 0,
    y: 0,
    status: 'new'
});

// AVL Helper: Get height
const getHeight = (node: TreeNode | null): number => {
    if (!node) return 0;
    return node.height;
};

// AVL Helper: Get balance factor
const getBalance = (node: TreeNode | null): number => {
    if (!node) return 0;
    return getHeight(node.left) - getHeight(node.right);
};

// AVL Helper: Update height
const updateHeight = (node: TreeNode): void => {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
};

// AVL: Right rotation
const rightRotate = (y: TreeNode): TreeNode => {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    if (T2) T2.parent = y;
    x.parent = y.parent;
    y.parent = x;

    updateHeight(y);
    updateHeight(x);

    return x;
};

// AVL: Left rotation
const leftRotate = (x: TreeNode): TreeNode => {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    if (T2) T2.parent = x;
    y.parent = x.parent;
    x.parent = y;

    updateHeight(x);
    updateHeight(y);

    return y;
};

// BST Insert
export const bstInsert = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) {
        return createTreeNode(value);
    }

    if (value < root.value) {
        const newLeft = bstInsert(root.left, value);
        root.left = newLeft;
        newLeft.parent = root;
    } else if (value > root.value) {
        const newRight = bstInsert(root.right, value);
        root.right = newRight;
        newRight.parent = root;
    }

    return root;
};

// AVL Insert
export const avlInsert = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) {
        return createTreeNode(value);
    }

    if (value < root.value) {
        const newLeft = avlInsert(root.left, value);
        root.left = newLeft;
        newLeft.parent = root;
    } else if (value > root.value) {
        const newRight = avlInsert(root.right, value);
        root.right = newRight;
        newRight.parent = root;
    } else {
        return root; // Duplicate values not allowed
    }

    updateHeight(root);

    const balance = getBalance(root);

    // Left Left Case
    if (balance > 1 && value < root.left!.value) {
        return rightRotate(root);
    }

    // Right Right Case
    if (balance < -1 && value > root.right!.value) {
        return leftRotate(root);
    }

    // Left Right Case
    if (balance > 1 && value > root.left!.value) {
        root.left = leftRotate(root.left!);
        return rightRotate(root);
    }

    // Right Left Case
    if (balance < -1 && value < root.right!.value) {
        root.right = rightRotate(root.right!);
        return leftRotate(root);
    }

    return root;
};

// Heap Insert (Max or Min)
export const heapInsert = (nodes: FlatTreeNode[], value: number, isMaxHeap: boolean): FlatTreeNode[] => {
    const newNode: FlatTreeNode = {
        id: generateId(),
        value,
        leftId: null,
        rightId: null,
        parentId: null,
        height: 1,
        x: 0,
        y: 0,
        status: 'new',
        level: 0
    };

    const newNodes = [...nodes, newNode];
    const newIndex = newNodes.length - 1;

    // Set parent connection
    if (newIndex > 0) {
        const parentIndex = Math.floor((newIndex - 1) / 2);
        newNode.parentId = newNodes[parentIndex].id;

        if (newIndex % 2 === 1) {
            newNodes[parentIndex].leftId = newNode.id;
        } else {
            newNodes[parentIndex].rightId = newNode.id;
        }
    }

    // Bubble up
    return heapifyUp(newNodes, newIndex, isMaxHeap);
};

// Heapify up operation
const heapifyUp = (nodes: FlatTreeNode[], index: number, isMaxHeap: boolean): FlatTreeNode[] => {
    let currentIndex = index;
    const newNodes = [...nodes];

    while (currentIndex > 0) {
        const parentIndex = Math.floor((currentIndex - 1) / 2);
        const shouldSwap = isMaxHeap
            ? newNodes[currentIndex].value > newNodes[parentIndex].value
            : newNodes[currentIndex].value < newNodes[parentIndex].value;

        if (shouldSwap) {
            // Swap values
            const temp = newNodes[currentIndex].value;
            newNodes[currentIndex].value = newNodes[parentIndex].value;
            newNodes[parentIndex].value = temp;
            currentIndex = parentIndex;
        } else {
            break;
        }
    }

    return newNodes;
};

// Heapify down operation
export const heapifyDown = (nodes: FlatTreeNode[], index: number, isMaxHeap: boolean): FlatTreeNode[] => {
    const newNodes = [...nodes];
    const size = newNodes.length;
    let currentIndex = index;

    while (true) {
        let targetIndex = currentIndex;
        const leftIndex = 2 * currentIndex + 1;
        const rightIndex = 2 * currentIndex + 2;

        if (leftIndex < size) {
            const shouldSwapLeft = isMaxHeap
                ? newNodes[leftIndex].value > newNodes[targetIndex].value
                : newNodes[leftIndex].value < newNodes[targetIndex].value;
            if (shouldSwapLeft) targetIndex = leftIndex;
        }

        if (rightIndex < size) {
            const shouldSwapRight = isMaxHeap
                ? newNodes[rightIndex].value > newNodes[targetIndex].value
                : newNodes[rightIndex].value < newNodes[targetIndex].value;
            if (shouldSwapRight) targetIndex = rightIndex;
        }

        if (targetIndex !== currentIndex) {
            const temp = newNodes[currentIndex].value;
            newNodes[currentIndex].value = newNodes[targetIndex].value;
            newNodes[targetIndex].value = temp;
            currentIndex = targetIndex;
        } else {
            break;
        }
    }

    return newNodes;
};

// Extract root from heap
export const extractHeapRoot = (nodes: FlatTreeNode[], isMaxHeap: boolean): FlatTreeNode[] => {
    if (nodes.length === 0) return [];
    if (nodes.length === 1) return [];

    const newNodes = [...nodes];
    newNodes[0].value = newNodes[newNodes.length - 1].value;

    // Remove last node
    const lastNode = newNodes.pop()!;

    // Update parent reference
    if (newNodes.length > 0) {
        const lastIndex = newNodes.length;
        const parentIndex = Math.floor((lastIndex - 1) / 2);
        if (lastIndex % 2 === 1) {
            newNodes[parentIndex].leftId = null;
        } else {
            newNodes[parentIndex].rightId = null;
        }
    }

    return heapifyDown(newNodes, 0, isMaxHeap);
};

// Find minimum value node in BST
export const findMinNode = (node: TreeNode): TreeNode => {
    let current = node;
    while (current.left) {
        current = current.left;
    }
    return current;
};

// Find maximum value node in BST
export const findMaxNode = (node: TreeNode): TreeNode => {
    let current = node;
    while (current.right) {
        current = current.right;
    }
    return current;
};

// BST Delete
export const bstDelete = (root: TreeNode | null, value: number): TreeNode | null => {
    if (!root) return null;

    if (value < root.value) {
        root.left = bstDelete(root.left, value);
        if (root.left) root.left.parent = root;
    } else if (value > root.value) {
        root.right = bstDelete(root.right, value);
        if (root.right) root.right.parent = root;
    } else {
        // Node found
        if (!root.left) {
            const temp = root.right;
            if (temp) temp.parent = root.parent;
            return temp;
        } else if (!root.right) {
            const temp = root.left;
            if (temp) temp.parent = root.parent;
            return temp;
        }

        // Node with two children
        const temp = findMinNode(root.right);
        root.value = temp.value;
        root.id = temp.id;
        root.right = bstDelete(root.right, temp.value);
        if (root.right) root.right.parent = root;
    }

    return root;
};

// AVL Delete
export const avlDelete = (root: TreeNode | null, value: number): TreeNode | null => {
    if (!root) return null;

    if (value < root.value) {
        root.left = avlDelete(root.left, value);
        if (root.left) root.left.parent = root;
    } else if (value > root.value) {
        root.right = avlDelete(root.right, value);
        if (root.right) root.right.parent = root;
    } else {
        if (!root.left || !root.right) {
            const temp = root.left ? root.left : root.right;
            if (!temp) {
                return null;
            } else {
                temp.parent = root.parent;
                return temp;
            }
        }

        const temp = findMinNode(root.right);
        root.value = temp.value;
        root.right = avlDelete(root.right, temp.value);
        if (root.right) root.right.parent = root;
    }

    updateHeight(root);

    const balance = getBalance(root);

    // Left Left Case
    if (balance > 1 && getBalance(root.left) >= 0) {
        return rightRotate(root);
    }

    // Left Right Case
    if (balance > 1 && getBalance(root.left) < 0) {
        root.left = leftRotate(root.left!);
        return rightRotate(root);
    }

    // Right Right Case
    if (balance < -1 && getBalance(root.right) <= 0) {
        return leftRotate(root);
    }

    // Right Left Case
    if (balance < -1 && getBalance(root.right) > 0) {
        root.right = rightRotate(root.right!);
        return leftRotate(root);
    }

    return root;
};

// Search in tree
export const searchTree = (root: TreeNode | null, value: number): TreeNode | null => {
    if (!root || root.value === value) return root;
    if (value < root.value) return searchTree(root.left, value);
    return searchTree(root.right, value);
};

// Tree traversals
export const inorderTraversal = (root: TreeNode | null): number[] => {
    const result: number[] = [];
    const traverse = (node: TreeNode | null) => {
        if (!node) return;
        traverse(node.left);
        result.push(node.value);
        traverse(node.right);
    };
    traverse(root);
    return result;
};

export const preorderTraversal = (root: TreeNode | null): number[] => {
    const result: number[] = [];
    const traverse = (node: TreeNode | null) => {
        if (!node) return;
        result.push(node.value);
        traverse(node.left);
        traverse(node.right);
    };
    traverse(root);
    return result;
};

export const postorderTraversal = (root: TreeNode | null): number[] => {
    const result: number[] = [];
    const traverse = (node: TreeNode | null) => {
        if (!node) return;
        traverse(node.left);
        traverse(node.right);
        result.push(node.value);
    };
    traverse(root);
    return result;
};

export const levelOrderTraversal = (root: TreeNode | null): number[] => {
    if (!root) return [];
    const result: number[] = [];
    const queue: TreeNode[] = [root];

    while (queue.length > 0) {
        const node = queue.shift()!;
        result.push(node.value);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }

    return result;
};

// Convert tree to flat array for visualization
export const treeToFlat = (root: TreeNode | null): FlatTreeNode[] => {
    if (!root) return [];

    const result: FlatTreeNode[] = [];
    const queue: { node: TreeNode; level: number }[] = [{ node: root, level: 0 }];

    while (queue.length > 0) {
        const { node, level } = queue.shift()!;
        result.push({
            id: node.id,
            value: node.value,
            leftId: node.left?.id || null,
            rightId: node.right?.id || null,
            parentId: node.parent?.id || null,
            height: node.height,
            x: node.x,
            y: node.y,
            status: node.status,
            level
        });

        if (node.left) queue.push({ node: node.left, level: level + 1 });
        if (node.right) queue.push({ node: node.right, level: level + 1 });
    }

    return result;
};

// Convert flat array back to tree (for BST/AVL)
export const flatToTree = (nodes: FlatTreeNode[]): TreeNode | null => {
    if (nodes.length === 0) return null;

    const nodeMap = new Map<string, TreeNode>();

    // Create all nodes
    nodes.forEach(n => {
        nodeMap.set(n.id, {
            id: n.id,
            value: n.value,
            left: null,
            right: null,
            parent: null,
            height: n.height,
            x: n.x,
            y: n.y,
            status: n.status
        });
    });

    // Connect nodes
    nodes.forEach(n => {
        const node = nodeMap.get(n.id)!;
        if (n.leftId) node.left = nodeMap.get(n.leftId) || null;
        if (n.rightId) node.right = nodeMap.get(n.rightId) || null;
        if (n.parentId) node.parent = nodeMap.get(n.parentId) || null;
    });

    // Find root (node without parent)
    const rootNode = nodes.find(n => !n.parentId);
    return rootNode ? nodeMap.get(rootNode.id) || null : null;
};

// Calculate tree height
export const calculateTreeHeight = (root: TreeNode | null): number => {
    if (!root) return 0;
    return 1 + Math.max(calculateTreeHeight(root.left), calculateTreeHeight(root.right));
};

// Check if tree is balanced
export const isTreeBalanced = (root: TreeNode | null): boolean => {
    if (!root) return true;
    const balance = Math.abs(calculateTreeHeight(root.left) - calculateTreeHeight(root.right));
    return balance <= 1 && isTreeBalanced(root.left) && isTreeBalanced(root.right);
};

// Get tree statistics
export const getTreeStats = (root: TreeNode | null): TreeStats => {
    const countNodes = (node: TreeNode | null): number => {
        if (!node) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
    };

    return {
        nodeCount: countNodes(root),
        height: calculateTreeHeight(root),
        isBalanced: isTreeBalanced(root),
        minValue: root ? findMinNode(root).value : null,
        maxValue: root ? findMaxNode(root).value : null
    };
};

// Calculate positions for tree visualization
export const calculateNodePositions = (root: TreeNode | null, width: number, startY: number = 80): void => {
    if (!root) return;

    const height = calculateTreeHeight(root);
    const levelHeight = 100;

    const assignPositions = (node: TreeNode | null, level: number, left: number, right: number) => {
        if (!node) return;

        const x = (left + right) / 2;
        const y = startY + level * levelHeight;

        node.x = x;
        node.y = y;

        const mid = (left + right) / 2;
        assignPositions(node.left, level + 1, left, mid);
        assignPositions(node.right, level + 1, mid, right);
    };

    assignPositions(root, 0, 100, width - 100);
};

// Calculate positions for heap visualization (complete binary tree)
export const calculateHeapPositions = (nodes: FlatTreeNode[], width: number, startY: number = 80): FlatTreeNode[] => {
    const levelHeight = 100;
    const newNodes = [...nodes];

    newNodes.forEach((node, index) => {
        const level = Math.floor(Math.log2(index + 1));
        const positionInLevel = index - (Math.pow(2, level) - 1);
        const nodesInLevel = Math.pow(2, level);
        const levelWidth = width - 200;
        const spacing = levelWidth / (nodesInLevel + 1);

        node.x = 100 + spacing * (positionInLevel + 1);
        node.y = startY + level * levelHeight;
        node.level = level;
    });

    return newNodes;
};
