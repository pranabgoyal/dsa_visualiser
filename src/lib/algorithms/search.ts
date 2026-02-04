export type SearchStep = {
    array: number[];
    highlightIndices: number[]; // Indices currently being compared/processed
    foundIndex: number | null;
    description: string;
    range?: { start: number; end: number }; // For Binary Search visualization
};

export function linearSearch(array: number[], target: number): { steps: SearchStep[] } {
    const steps: SearchStep[] = [];

    for (let i = 0; i < array.length; i++) {
        steps.push({
            array: [...array],
            highlightIndices: [i],
            foundIndex: null,
            description: `Comparing index ${i} (Value: ${array[i]}) with Target (${target}).`
        });

        if (array[i] === target) {
            steps.push({
                array: [...array],
                highlightIndices: [i],
                foundIndex: i,
                description: `Match found at index ${i}!`
            });
            return { steps };
        }
    }

    steps.push({
        array: [...array],
        highlightIndices: [],
        foundIndex: null,
        description: `Reached end of array. Target (${target}) not found.`
    });

    return { steps };
}

export function binarySearch(array: number[], target: number): { steps: SearchStep[] } {
    const steps: SearchStep[] = [];
    let left = 0;
    let right = array.length - 1;

    // Must assume array is sorted for binary search
    // We'll trust the input is sorted or sort it before passing, but algorithms usually operate on assumed sorted data.

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        steps.push({
            array: [...array],
            highlightIndices: [mid],
            foundIndex: null,
            range: { start: left, end: right },
            description: `Checking middle element at index ${mid} (Value: ${array[mid]}). Range: [${left}, ${right}]`
        });

        if (array[mid] === target) {
            steps.push({
                array: [...array],
                highlightIndices: [mid],
                foundIndex: mid,
                range: { start: left, end: right },
                description: `Match found at index ${mid}!`
            });
            return { steps };
        }

        if (array[mid] < target) {
            left = mid + 1;
            steps.push({
                array: [...array],
                highlightIndices: [mid],
                foundIndex: null,
                range: { start: left, end: right },
                description: `Value ${array[mid]} < Target ${target}. Ignore left half.`
            });
        } else {
            right = mid - 1;
            steps.push({
                array: [...array],
                highlightIndices: [mid],
                foundIndex: null,
                range: { start: left, end: right },
                description: `Value ${array[mid]} > Target ${target}. Ignore right half.`
            });
        }
    }

    steps.push({
        array: [...array],
        highlightIndices: [],
        foundIndex: null,
        range: { start: left, end: right },
        description: `Target (${target}) not found.`
    });

    return { steps };
}
