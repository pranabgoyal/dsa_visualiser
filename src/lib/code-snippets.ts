
import { TreeType } from '@/types/tree';
import { ListKind } from '@/types/linked-list';

// --- STACK, QUEUE, SEARCH, SORT ---
export const codeSnippets: Record<string, Record<string, string>> = {
    stack: {
        c: `// Stack Implementation in C
#include <stdio.h>
#include <stdlib.h>
#define MAX 100

typedef struct Stack {
    int top;
    char items[MAX];
} Stack;

void push(Stack *s, char c) {
    if (s->top == MAX - 1) return;
    s->items[++(s->top)] = c;
}

char pop(Stack *s) {
    if (s->top == -1) return '\\0';
    return s->items[(s->top)--];
}`,
        cpp: `// Stack & Infix to Postfix in C++
#include <iostream>
#include <stack>
#include <string>
using namespace std;

string infixToPostfix(string s) {
    stack<char> st;
    string result;
    for(char c : s) {
        if((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'))
            result += c;
        else if(c == '(')
            st.push('(');
        else if(c == ')') {
            while(st.top() != '(') {
                result += st.top();
                st.pop();
            }
            st.pop();
        } else {
            while(!st.empty() && precedence(c) <= precedence(st.top())) {
                result += st.top();
                st.pop();
            }
            st.push(c);
        }
    }
    return result;
}`,
        java: `// Infix to Postfix in Java
import java.util.Stack;

class Solution {
    public static String infixToPostfix(String exp) {
        String result = new String("");
        Stack<Character> stack = new Stack<>();
        
        for (int i = 0; i<exp.length(); ++i) {
            char c = exp.charAt(i);
            
            if (Character.isLetterOrDigit(c))
                result += c;
            else if (c == '(')
                stack.push(c);
            else if (c == ')') {
                while (!stack.isEmpty() && stack.peek() != '(')
                    result += stack.pop();
                stack.pop();
            } else {
                while (!stack.isEmpty() && Prec(c) <= Prec(stack.peek())) {
                    result += stack.pop();
                }
                stack.push(c);
            }
        }
        return result;
    }
}`,
        python: `# Infix to Postfix in Python
def infix_to_postfix(expression):
    stack = []
    output = ""
    
    for char in expression:
        if char.isalnum():
            output += char
        elif char == '(':
            stack.append(char)
        elif char == ')':
            while stack and stack[-1] != '(':
                output += stack.pop()
            stack.pop()
        else:
            while stack and precedence(char) <= precedence(stack[-1]):
                output += stack.pop()
            stack.append(char)
            
    while stack:
        output += stack.pop()
    return output`
    },
    queue: {
        c: `// Round Robin Scheduling in C
void roundRobin(int processes[], int n, int bt[], int quantum) {
    int rem_bt[n];
    for (int i = 0 ; i < n ; i++) rem_bt[i] = bt[i];
    int t = 0;
    while (1) {
        int done = 1;
        for (int i = 0 ; i < n; i++) {
            if (rem_bt[i] > 0) {
                done = 0;
                if (rem_bt[i] > quantum) {
                    t += quantum;
                    rem_bt[i] -= quantum;
                } else {
                    t = t + rem_bt[i];
                    rem_bt[i] = 0;
                }
            }
        }
        if (done == 1) break;
    }
}`,
        cpp: `// Round Robin Scheduling in C++
void findWaitingTime(int processes[], int n, int bt[], int wt[], int quantum) {
    int rem_bt[n];
    for (int i = 0 ; i < n ; i++) rem_bt[i] = bt[i];
    int t = 0;
    while (1) {
        bool done = true;
        for (int i = 0 ; i < n; i++) {
            if (rem_bt[i] > 0) {
                done = false;
                if (rem_bt[i] > quantum) {
                    t += quantum;
                    rem_bt[i] -= quantum;
                } else {
                    t = t + rem_bt[i];
                    wt[i] = t - bt[i];
                    rem_bt[i] = 0;
                }
            }
        }
        if (done == true) break;
    }
}`,
        java: `// Round Robin in Java
class RoundRobin {
    static void findWaitingTime(int processes[], int n, int bt[], int wt[], int quantum) {
        int rem_bt[] = new int[n];
        for (int i = 0; i < n; i++) rem_bt[i] = bt[i];
        int t = 0;
        while (true) {
            boolean done = true;
            for (int i = 0; i < n; i++) {
                if (rem_bt[i] > 0) {
                    done = false;
                    if (rem_bt[i] > quantum) {
                        t += quantum;
                        rem_bt[i] -= quantum;
                    } else {
                        t = t + rem_bt[i];
                        wt[i] = t - bt[i];
                        rem_bt[i] = 0;
                    }
                }
            }
            if (done == true) break;
        }
    }
}`,
        python: `# Round Robin in Python
def findWaitingTime(processes, n, bt, wt, quantum):
    rem_bt = [0] * n
    for i in range(n):
        rem_bt[i] = bt[i]
    t = 0
    while(1):
        done = True
        for i in range(n):
            if (rem_bt[i] > 0) :
                done = False
                if (rem_bt[i] > quantum) :
                    t += quantum
                    rem_bt[i] -= quantum
                else:
                    t = t + rem_bt[i]
                    wt[i] = t - bt[i]
                    rem_bt[i] = 0
        if (done == True):
            break`
    },
    search: {
        c: `// Binary Search in C
int binarySearch(int arr[], int l, int r, int x) {
    if (r >= l) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == x) return mid;
        if (arr[mid] > x) return binarySearch(arr, l, mid - 1, x);
        return binarySearch(arr, mid + 1, r, x);
    }
    return -1;
}`,
        cpp: `// Binary Search in C++
int binarySearch(int arr[], int l, int r, int x) {
    if (r >= l) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == x) return mid;
        if (arr[mid] > x) return binarySearch(arr, l, mid - 1, x);
        return binarySearch(arr, mid + 1, r, x);
    }
    return -1;
}`,
        java: `// Binary Search in Java
int binarySearch(int arr[], int l, int r, int x) {
    if (r >= l) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == x) return mid;
        if (arr[mid] > x) return binarySearch(arr, l, mid - 1, x);
        return binarySearch(arr, mid + 1, r, x);
    }
    return -1;
}`,
        python: `# Binary Search in Python
def binary_search(arr, low, high, x):
    if high >= low:
        mid = (high + low) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] > x:
            return binary_search(arr, low, mid - 1, x)
        else:
            return binary_search(arr, mid + 1, high, x)
    else:
        return -1`
    },
    sorting: {
        c: `// Quick Sort in C
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
        cpp: `// Quick Sort in C++
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
        java: `// Quick Sort in Java
void sort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        sort(arr, low, pi-1);
        sort(arr, pi+1, high);
    }
}`,
        python: `# Quick Sort in Python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`
    },
    hanoi: {
        c: `// Tower of Hanoi in C
void towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 1) {
        printf("Move disk 1 from %c to %c\\n", from_rod, to_rod);
        return;
    }
    towerOfHanoi(n - 1, from_rod, aux_rod, to_rod);
    printf("Move disk %d from %c to %c\\n", n, from_rod, to_rod);
    towerOfHanoi(n - 1, aux_rod, to_rod, from_rod);
}`,
        cpp: `// Tower of Hanoi in C++
void towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 1) {
        cout << "Move disk 1 from " << from_rod << " to " << to_rod << endl;
        return;
    }
    towerOfHanoi(n - 1, from_rod, aux_rod, to_rod);
    cout << "Move disk " << n << " from " << from_rod << " to " << to_rod << endl;
    towerOfHanoi(n - 1, aux_rod, to_rod, from_rod);
}`,
        java: `// Tower of Hanoi in Java
static void towerOfHanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 1) {
        System.out.println("Move disk 1 from " + from_rod + " to " + to_rod);
        return;
    }
    towerOfHanoi(n - 1, from_rod, aux_rod, to_rod);
    System.out.println("Move disk " + n + " from " + from_rod + " to " + to_rod);
    towerOfHanoi(n - 1, aux_rod, to_rod, from_rod);
}`,
        python: `# Tower of Hanoi in Python
def TowerOfHanoi(n, from_rod, to_rod, aux_rod):
    if n == 0:
        return
    TowerOfHanoi(n-1, from_rod, aux_rod, to_rod)
    print("Move disk", n, "from rod", from_rod, "to rod", to_rod)
    TowerOfHanoi(n-1, aux_rod, to_rod, from_rod)`
    }
};

// --- LINKED LIST SNIPPETS ---
export const LINKED_LIST_SNIPPETS: Record<string, Record<string, { cpp: string; python: string; c: string }>> = {
    SLL: {
        INSERT_HEAD: {
            cpp: `void insertAtHead(Node* &head, int val) {\n    Node* newNode = new Node(val);\n    newNode->next = head;\n    head = newNode;\n}`,
            python: `def insert_at_head(self, val):\n    new_node = Node(val)\n    new_node.next = self.head\n    self.head = new_node`,
            c: `void insertAtHead(struct Node** head, int val) {\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\n    newNode->data = val;\n    newNode->next = *head;\n    *head = newNode;\n}`
        },
        INSERT_TAIL: {
            cpp: `void insertAtTail(Node* &head, int val) {\n    Node* newNode = new Node(val);\n    if (!head) { head = newNode; return; }\n    Node* temp = head;\n    while (temp->next) temp = temp->next;\n    temp->next = newNode;\n}`,
            python: `def insert_at_tail(self, val):\n    new_node = Node(val)\n    if not self.head:\n        self.head = new_node\n        return\n    curr = self.head\n    while curr.next: curr = curr.next\n    curr.next = new_node`,
            c: `void insertAtTail(struct Node** head, int val) {\n    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));\n    newNode->data = val;\n    newNode->next = NULL;\n    if (*head == NULL) { *head = newNode; return; }\n    struct Node* temp = *head;\n    while (temp->next) temp = temp->next;\n    temp->next = newNode;\n}`
        },
        FIND_MIDDLE: {
            cpp: `Node* findMiddle(Node* head) {\n    Node *slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n    }\n    return slow;\n}`,
            python: `def find_middle(self):\n    slow = fast = self.head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow`,
            c: `struct Node* findMiddle(struct Node* head) {\n    struct Node *slow = head, *fast = head;\n    while (fast != NULL && fast->next != NULL) {\n        slow = slow->next;\n        fast = fast->next->next;\n    }\n    return slow;\n}`
        },
        SORT: {
            cpp: `void bubbleSort(Node* head) {\n    if (!head) return;\n    bool swapped;\n    do {\n        swapped = false;\n        Node* curr = head;\n        while (curr->next) {\n            if (curr->data > curr->next->data) {\n                swap(curr->data, curr->next->data);\n                swapped = true;\n            }\n            curr = curr->next;\n        }\n    } while (swapped);\n}`,
            python: `def bubble_sort(self):\n    if not self.head: return\n    swapped = True\n    while swapped:\n        swapped = False\n        curr = self.head\n        while curr.next:\n            if curr.data > curr.next.data:\n                curr.data, curr.next.data = curr.next.data, curr.data\n                swapped = True\n            curr = curr.next`,
            c: `void bubbleSort(struct Node* head) {\n    int swapped;\n    struct Node* ptr1;\n    if (head == NULL) return;\n    do {\n        swapped = 0;\n        ptr1 = head;\n        while (ptr1->next != NULL) {\n            if (ptr1->data > ptr1->next->data) {\n                int temp = ptr1->data;\n                ptr1->data = ptr1->next->data;\n                ptr1->next->data = temp;\n                swapped = 1;\n            }\n            ptr1 = ptr1->next;\n        }\n    } while (swapped);\n}`
        },
        SEARCH: {
            cpp: `Node* search(Node* head, int val) {\n    Node* temp = head;\n    while(temp != NULL) {\n        if(temp->data == val) return temp;\n        temp = temp->next;\n    }\n    return NULL;\n}`,
            python: `def search(self, val):\n    temp = self.head\n    while temp:\n        if temp.data == val: return temp\n        temp = temp.next\n    return None`,
            c: `struct Node* search(struct Node* head, int val) {\n    struct Node* temp = head;\n    while(temp != NULL) {\n        if(temp->data == val) return temp;\n        temp = temp->next;\n    }\n    return NULL;\n}`
        }
    }
};

export const getSnippet = (kind: ListKind, op: string, lang: 'c' | 'cpp' | 'python') => {
    return LINKED_LIST_SNIPPETS[kind]?.[op]?.[lang] || LINKED_LIST_SNIPPETS['SLL']?.[op]?.[lang] || "// Operation implementation visual for " + op;
};

// --- TREE SNIPPETS ---
export const TREE_CODE_SNIPPETS: Record<string, Record<string, { cpp: string; python: string; c: string }>> = {
    BST: {
        INSERT: {
            cpp: `TreeNode* insert(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val)
        root->left = insert(root->left, val);
    else if (val > root->val)
        root->right = insert(root->right, val);
    return root;
}`,
            python: `def insert(self, root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = self.insert(root.left, val)
    elif val > root.val:
        root.right = self.insert(root.right, val)
    return root`,
            c: `struct TreeNode* insert(struct TreeNode* root, int val) {
    if (root == NULL) {
        struct TreeNode* node = malloc(sizeof(struct TreeNode));
        node->val = val;
        node->left = node->right = NULL;
        return node;
    }
    if (val < root->val)
        root->left = insert(root->left, val);
    else if (val > root->val)
        root->right = insert(root->right, val);
    return root;
}`
        },
        DELETE: {
            cpp: `TreeNode* deleteNode(TreeNode* root, int key) {
    if (!root) return nullptr;
    if (key < root->val)
        root->left = deleteNode(root->left, key);
    else if (key > root->val)
        root->right = deleteNode(root->right, key);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        TreeNode* minNode = findMin(root->right);
        root->val = minNode->val;
        root->right = deleteNode(root->right, minNode->val);
    }
    return root;
}`,
            python: `def delete_node(self, root, key):
    if not root:
        return None
    if key < root.val:
        root.left = self.delete_node(root.left, key)
    elif key > root.val:
        root.right = self.delete_node(root.right, key)
    else:
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        min_node = self.find_min(root.right)
        root.val = min_node.val
        root.right = self.delete_node(root.right, min_node.val)
    return root`,
            c: `struct TreeNode* deleteNode(struct TreeNode* root, int key) {
    if (!root) return NULL;
    if (key < root->val)
        root->left = deleteNode(root->left, key);
    else if (key > root->val)
        root->right = deleteNode(root->right, key);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        struct TreeNode* minNode = findMin(root->right);
        root->val = minNode->val;
        root->right = deleteNode(root->right, minNode->val);
    }
    return root;
}`
        },
        SEARCH: {
            cpp: `TreeNode* search(TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    if (val < root->val)
        return search(root->left, val);
    return search(root->right, val);
}`,
            python: `def search(self, root, val):
    if not root or root.val == val:
        return root
    if val < root.val:
        return self.search(root.left, val)
    return self.search(root.right, val)`,
            c: `struct TreeNode* search(struct TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    if (val < root->val)
        return search(root->left, val);
    return search(root->right, val);
}`
        }
    }
};

export const getTreeSnippet = (type: TreeType, op: string, lang: 'c' | 'cpp' | 'python'): string => {
    const typeSnippet = TREE_CODE_SNIPPETS[type]?.[op]?.[lang];
    if (typeSnippet) return typeSnippet;
    const bstSnippet = TREE_CODE_SNIPPETS['BST']?.[op]?.[lang];
    if (bstSnippet) return bstSnippet;
    return `// ${op} implementation for ${type} in ${lang}`;
};
