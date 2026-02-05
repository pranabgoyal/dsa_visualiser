
import { GoogleGenAI, Type } from "@google/genai";
import { ListNode, ListKind } from "@/types/linked-list";

// We'll define types locally to avoid circular deps if types aren't set up yet, 
// but ideally they should be in @/types
// For now, I'll assume decent flexibility or I'll define interfaces here if needed to compile.
// Actually, I'll just use 'any' or defined interfaces to be safe for now, then refine.

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback messages for when API Key is missing
const FALLBACK_EXPLANATIONS: Record<string, string> = {
  'INSERT_HEAD': "A new node is created and its 'next' pointer is set to the current head. The head pointer is then updated to this new node, making it the first element. This is an O(1) operation.",
  'INSERT_TAIL': "We traverse to the end of the list to find the last node. Its 'next' pointer is updated to point to the new node. If the list was empty, the new node becomes the head. This is O(n) without a tail pointer.",
  'INSERT_AT': "We traverse the list to the index just before the insertion point. We adjust pointers: new node points to the current node at that index, and the previous node points to the new node.",
  'DELETE_HEAD': "The head pointer is simply moved to the second node (head.next). The original first node is then removed from memory (garbage collected). This is an O(1) operation.",
  'DELETE_TAIL': "We traverse to the second-to-last node. We update its 'next' pointer to null, effectively removing the last node. If there's only one node, head becomes null.",
  'DELETE_VALUE': "We traverse the list searching for the value. Once found, we bypass it by updating the previous node's 'next' pointer to skip to the node after the target.",
  'SEARCH': "We iterate through the list node by node, comparing each value with the target. If a match is found, we stop; otherwise, we return not found. This is linear search, O(n).",
  'REVERSE': "We iterate through the list, changing each node's 'next' pointer to point to its previous node. We keep track of 'prev', 'current', and 'next' nodes during the process.",
  'SORT': "The list is sorted, often using Merge Sort which works well for linked lists as it doesn't require random access. Pointers are rearranged to order elements by value.",
  'FIND_MIDDLE': "We use the 'Tortoise and Hare' algorithm. Two pointers move: slow (1 step) and fast (2 steps). When fast reaches the end, slow will be at the middle.",
};

// Explanation of specific linked list operations using pointer logic
export const getOperationExplanation = async (operation: string, value: string | number | null, nodes: any[], kind: string) => {
  if (!apiKey) {
    // Return a helpful static explanation instead of an error
    return FALLBACK_EXPLANATIONS[operation] || `Performing ${operation} on the ${kind}. Watch the pointers update as the operation proceeds.`;
  }

  const nodeSummary = nodes.map(n => n.value).join(' -> ');
  const prompt = `
    I am performing a "${operation}" operation ${value !== null ? `with value "${value}"` : ''} on a ${kind} (Linked List).
    The current list structure contains: [${nodeSummary || 'Empty'}].
    
    Explain step-by-step how this operation works specifically for a ${kind} structure. 
    Focus on pointer manipulation (next, prev, head, tail).
    Keep it concise, professional, and educational. Use clear bullet points.
    Return only the explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI tutor is currently unavailable to explain this move.";
  }
};

// Real-time chat with an AI tutor about linked list concepts
export const chatWithTutor = async (messages: ChatMessage[], nodes: any[]) => {
  if (!apiKey) return "AI Tutor unavailable (Missing API Key).";

  const nodeSummary = nodes.length > 0 ? nodes.map(n => n.value).join(' -> ') : 'Empty';

  // Format history for Gemini API: map 'assistant' role to 'model'
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: contents,
      config: {
        systemInstruction: `You are Nodey, a friendly and expert computer science tutor specializing in Linked Lists.
        The user is interacting with a linked list visualizer.
        The current list state is: [${nodeSummary}].
        Explain linked list concepts, pointer manipulation, and complexity analysis.
        Keep answers educational, concise, and professional.`,
      },
    });
    return response.text || "I'm sorry, I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "The AI tutor is currently experiencing technical difficulties.";
  }
};
