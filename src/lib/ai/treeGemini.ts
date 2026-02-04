
import { GoogleGenAI } from "@google/genai";
import { TreeType, TreeOperation, FlatTreeNode } from "@/types/tree";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Fallback messages
const TREE_FALLBACKS: Record<string, string> = {
    'INSERT': "Starting at the root, we compare the value. If smaller, we go left; if larger, right. We repeat until we find an empty spot to insert the new node.",
    'DELETE': "We find the node to delete. If it's a leaf, simply remove it. If it has one child, bypass it. If two children, replace with inorder successor.",
    'SEARCH': "We start at the root and traverse down. Smaller values go left, larger values go right. If we find the value, search is successful.",
    'INORDER': "We visit the Left subtree, then the Root node, then the Right subtree. This outputs sorted values for a BST.",
    'PREORDER': "We visit the Root node first, then the Left subtree, then the Right subtree.",
    'POSTORDER': "We visit the Left subtree, then the Right subtree, and finally the Root node.",
    'LEVEL_ORDER': "Breadth-First Search: We visit nodes level by level, from left to right, using a queue.",
    'FIND_MIN': "We start at the root and keep traversing down the left child pointers until we hit a leaf. The leftmost node is the minimum.",
    'FIND_MAX': "We start at the root and keep traversing down the right child pointers until we hit a leaf. The rightmost node is the maximum.",
    'GET_HEIGHT': "We recursively calculate the height of left and right subtrees and take the maximum of the two, plus one for the current level.",
    'CLEAR': "We recursively delete all nodes or simply remove the reference to the root node to reclaim memory.",
};

// Explanation of specific tree operations
export const getTreeOperationExplanation = async (
    operation: TreeOperation,
    value: number | null,
    nodes: FlatTreeNode[],
    treeType: TreeType,
    hasSpokenLogic: boolean = false
): Promise<{ ui: string; voice: string }> => {
    // Fallback (No API Key)
    if (!apiKey) {
        const uiText = TREE_FALLBACKS[operation] || `Performing ${operation}.`;

        // Voice: If we haven't spoken logic yet, speak full. Else, speak short.
        const voiceText = hasSpokenLogic
            ? `${operation} ${value ?? ''}`
            : `${uiText} Now performing ${operation} ${value ?? ''}.`;

        // Actually, user wants "Logic done once". 
        // Simpler: Voice is ALWAYS short specific action in fallback mode.
        // The "Logic Breakdown" in UI handles the theory.
        const shortVoice = `Performing ${operation} ${value !== null ? value : ''}.`;

        return {
            ui: uiText,
            voice: shortVoice
        };
    }

    // AI Generation
    const nodeValues = nodes.map(n => n.value).join(', ');
    const prompt = `
    I am performing a "${operation}" operation ${value !== null ? `with value "${value}"` : ''} on a ${treeType} tree.
    The current tree contains these values: [${nodeValues || 'Empty'}].
    
    1. Provide a concise, 1-sentence summary of the SPECIFIC visual action taken (e.g. "Compared with 5, smaller, went left. Inserted 3."). Label this "VOICE:".
    2. Provide a detailed step-by-step explanation of the logic. Label this "UI:".
    
    Return the response in this format:
    VOICE: [Short Sentence]
    UI: [Detailed Logic]
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt,
        });
        const text = response.text || "";

        // Regex adapted for ES2017 compatibility (removed 's' flag, used [\s\S] for dotAll)
        const voiceMatch = text.match(/VOICE:\s*([\s\S]+?)(?=\n|UI:|$)/);
        const uiMatch = text.match(/UI:\s*([\s\S]+?)(?=$)/);

        return {
            voice: voiceMatch ? voiceMatch[1].trim() : `Performed ${operation} ${value}.`,
            ui: uiMatch ? uiMatch[1].trim() : text
        };

    } catch (error) {
        console.error("Gemini Tree Error:", error);
        return {
            ui: "AI Tutor unavailable.",
            voice: `Operation ${operation} complete.`
        };
    }
};

// Get complexity information for tree operations
export const getTreeComplexityInfo = (operation: TreeOperation, treeType: TreeType): { time: string; space: string; description: string } => {
    const complexities: Record<TreeType, Record<string, { time: string; space: string; description: string }>> = {
        BST: {
            INSERT: { time: 'O(h)', space: 'O(h)', description: 'Where h is the height. Worst case O(n) for skewed trees.' },
            DELETE: { time: 'O(h)', space: 'O(h)', description: 'May need to find inorder successor which takes O(h) time.' },
            SEARCH: { time: 'O(h)', space: 'O(h)', description: 'Binary search property gives logarithmic performance for balanced trees.' },
            INORDER: { time: 'O(n)', space: 'O(h)', description: 'Visits all nodes exactly once.' },
            PREORDER: { time: 'O(n)', space: 'O(h)', description: 'Visits all nodes exactly once.' },
            POSTORDER: { time: 'O(n)', space: 'O(h)', description: 'Visits all nodes exactly once.' },
            LEVEL_ORDER: { time: 'O(n)', space: 'O(n)', description: 'Uses a queue that can hold up to n/2 nodes at the deepest level.' },
            FIND_MIN: { time: 'O(h)', space: 'O(1)', description: 'Keep going left until leaf node.' },
            FIND_MAX: { time: 'O(h)', space: 'O(1)', description: 'Keep going right until leaf node.' },
            GET_HEIGHT: { time: 'O(n)', space: 'O(h)', description: 'Must visit all nodes to compute height.' },
            CLEAR: { time: 'O(n)', space: 'O(1)', description: 'Simply remove reference to root.' },
        },
        AVL: {
            INSERT: { time: 'O(log n)', space: 'O(log n)', description: 'Self-balancing ensures logarithmic height.' },
            DELETE: { time: 'O(log n)', space: 'O(log n)', description: 'Includes rebalancing rotations.' },
            SEARCH: { time: 'O(log n)', space: 'O(log n)', description: 'Guaranteed logarithmic due to balanced structure.' },
            INORDER: { time: 'O(n)', space: 'O(log n)', description: 'Stack depth is always logarithmic.' },
            PREORDER: { time: 'O(n)', space: 'O(log n)', description: 'Stack depth is always logarithmic.' },
            POSTORDER: { time: 'O(n)', space: 'O(log n)', description: 'Stack depth is always logarithmic.' },
            LEVEL_ORDER: { time: 'O(n)', space: 'O(n)', description: 'Queue holds multiple levels.' },
            FIND_MIN: { time: 'O(log n)', space: 'O(1)', description: 'Balanced tree ensures logarithmic path.' },
            FIND_MAX: { time: 'O(log n)', space: 'O(1)', description: 'Balanced tree ensures logarithmic path.' },
            GET_HEIGHT: { time: 'O(1)', space: 'O(1)', description: 'Height is stored in each node.' },
            CLEAR: { time: 'O(n)', space: 'O(1)', description: 'Simply remove reference to root.' },
        },
        MAX_HEAP: {
            INSERT: { time: 'O(log n)', space: 'O(1)', description: 'Bubble up from last position.' },
            EXTRACT_ROOT: { time: 'O(log n)', space: 'O(1)', description: 'Heapify down from root.' },
            HEAPIFY: { time: 'O(n)', space: 'O(1)', description: 'Build heap from array.' },
            FIND_MAX: { time: 'O(1)', space: 'O(1)', description: 'Max is always at root.' },
            CLEAR: { time: 'O(1)', space: 'O(1)', description: 'Reset heap array.' },
            SEARCH: { time: 'O(n)', space: 'O(1)', description: 'Linear search required as heaps are not ordered like BST.' },
            INORDER: { time: 'O(n)', space: 'O(h)', description: 'Same as binary tree.' },
            PREORDER: { time: 'O(n)', space: 'O(h)', description: 'Same as binary tree.' },
            POSTORDER: { time: 'O(n)', space: 'O(h)', description: 'Same as binary tree.' },
            LEVEL_ORDER: { time: 'O(n)', space: 'O(n)', description: 'Same as binary tree.' },
            FIND_MIN: { time: 'O(n / 2)', space: 'O(1)', description: 'Leaves must be checked.' },
            GET_HEIGHT: { time: 'O(log n)', space: 'O(1)', description: 'Calculated from size for complete tree.' },
        },
        MIN_HEAP: {
            INSERT: { time: 'O(log n)', space: 'O(1)', description: 'Bubble up from last position.' },
            EXTRACT_ROOT: { time: 'O(log n)', space: 'O(1)', description: 'Heapify down from root.' },
            HEAPIFY: { time: 'O(n)', space: 'O(1)', description: 'Build heap from array.' },
            FIND_MIN: { time: 'O(1)', space: 'O(1)', description: 'Min is always at root.' },
            CLEAR: { time: 'O(1)', space: 'O(1)', description: 'Reset heap array.' },
            SEARCH: { time: 'O(n)', space: 'O(1)', description: 'Linear search.' },
            INORDER: { time: 'O(n)', space: 'O(h)', description: 'Same as binary tree.' },
            PREORDER: { time: 'O(n)', space: 'O(h)', description: 'Same as binary tree.' },
            POSTORDER: { time: 'O(n)', space: 'O(h)', description: 'Same as binary tree.' },
            LEVEL_ORDER: { time: 'O(n)', space: 'O(n)', description: 'Same as binary tree.' },
            FIND_MAX: { time: 'O(n / 2)', space: 'O(1)', description: 'Leaves must be checked.' },
            GET_HEIGHT: { time: 'O(log n)', space: 'O(1)', description: 'Calculated from size for complete tree.' },
        }
    };

    return complexities[treeType]?.[operation] || { time: 'O(?)', space: 'O(?)', description: 'Complexity varies.' };
};
