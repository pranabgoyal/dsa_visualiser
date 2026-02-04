export type SortingStep = {
    array: number[];
    highlightIndices: number[]; // Indices currently being compared/swapped
    sortedIndices: number[]; // Indices already sorted
    description: string;
    type: 'compare' | 'swap' | 'overwrite' | 'pivot'; // New field for visualization type
};

// --- BUBBLE SORT ---
export function bubbleSort(initialArray: number[]): { steps: SortingStep[] } {
    const array = [...initialArray];
    const steps: SortingStep[] = [];
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({
                array: [...array],
                highlightIndices: [j, j + 1],
                sortedIndices: [],
                description: `Comparing ${array[j]} and ${array[j + 1]}`,
                type: 'compare'
            });

            if (array[j] > array[j + 1]) {
                const temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
                steps.push({
                    array: [...array],
                    highlightIndices: [j, j + 1],
                    sortedIndices: [],
                    description: `Swapped ${array[j]} and ${array[j + 1]}`,
                    type: 'swap'
                });
            }
        }
    }
    steps.push({
        array: [...array],
        highlightIndices: [],
        sortedIndices: Array.from({ length: n }, (_, i) => i),
        description: "Sorting Complete!",
        type: 'overwrite' // Neutral final state
    });
    return { steps };
}

// --- MERGE SORT ---
export function mergeSort(initialArray: number[]): { steps: SortingStep[] } {
    const array = [...initialArray];
    const steps: SortingStep[] = [];

    function merge(arr: number[], l: number, m: number, r: number) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = new Array(n1);
        const R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arr[l + i];
        for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            steps.push({
                array: [...arr],
                highlightIndices: [l + i, m + 1 + j],
                sortedIndices: [],
                description: `Comparing ${L[i]} (Left) and ${R[j]} (Right)`,
                type: 'compare'
            });
            if (L[i] <= R[j]) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            steps.push({
                array: [...arr],
                highlightIndices: [k],
                sortedIndices: [],
                description: `Placed ${arr[k]} at index ${k}`,
                type: 'overwrite'
            });
            k++;
        }
        while (i < n1) {
            arr[k] = L[i];
            steps.push({
                array: [...arr],
                highlightIndices: [k],
                sortedIndices: [],
                description: `Placed remaining ${L[i]} at index ${k}`,
                type: 'overwrite'
            });
            i++; k++;
        }
        while (j < n2) {
            arr[k] = R[j];
            steps.push({
                array: [...arr],
                highlightIndices: [k],
                sortedIndices: [],
                description: `Placed remaining ${R[j]} at index ${k}`,
                type: 'overwrite'
            });
            j++; k++;
        }
    }

    function sort(arr: number[], l: number, r: number) {
        if (l < r) {
            const m = Math.floor(l + (r - l) / 2);
            sort(arr, l, m);
            sort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }

    sort(array, 0, array.length - 1);

    steps.push({
        array: [...array],
        highlightIndices: [],
        sortedIndices: Array.from({ length: array.length }, (_, i) => i),
        description: "Sorting Complete!",
        type: 'overwrite'
    });

    return { steps };
}


// --- QUICK SORT ---
export function quickSort(initialArray: number[]): { steps: SortingStep[] } {
    const array = [...initialArray];
    const steps: SortingStep[] = [];

    function partition(arr: number[], low: number, high: number) {
        const pivot = arr[high];
        steps.push({
            array: [...arr],
            highlightIndices: [high],
            sortedIndices: [],
            description: `Pivot chosen: ${pivot}`,
            type: 'pivot'
        });

        let i = (low - 1);
        for (let j = low; j <= high - 1; j++) {
            steps.push({
                array: [...arr],
                highlightIndices: [j, high],
                sortedIndices: [],
                description: `Comparing ${arr[j]} with pivot ${pivot}`,
                type: 'compare'
            });
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                steps.push({
                    array: [...arr],
                    highlightIndices: [i, j],
                    sortedIndices: [],
                    description: `Swapped ${arr[i]} and ${arr[j]}`,
                    type: 'swap'
                });
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        steps.push({
            array: [...arr],
            highlightIndices: [i + 1, high],
            sortedIndices: [],
            description: `Placed pivot ${pivot} at correct position ${i + 1}`,
            type: 'overwrite'
        });
        return (i + 1);
    }

    function sort(arr: number[], low: number, high: number) {
        if (low < high) {
            const pi = partition(arr, low, high);
            sort(arr, low, pi - 1);
            sort(arr, pi + 1, high);
        }
    }

    sort(array, 0, array.length - 1);
    steps.push({
        array: [...array],
        highlightIndices: [],
        sortedIndices: Array.from({ length: array.length }, (_, i) => i),
        description: "Sorting Complete!",
        type: 'overwrite'
    });

    return { steps };
}
