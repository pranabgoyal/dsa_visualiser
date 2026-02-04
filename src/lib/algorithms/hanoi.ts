export type HanoiStep = {
    rodA: number[]; // Discs on Rod A
    rodB: number[]; // Discs on Rod B
    rodC: number[]; // Discs on Rod C
    description: string;
    movingDisc: number | null; // The disc currently moving
    fromRod: string | null;
    toRod: string | null;
};

export function solveHanoi(n: number): { steps: HanoiStep[] } {
    const steps: HanoiStep[] = [];

    // Initial State
    const rods: { [key: string]: number[] } = {
        A: Array.from({ length: n }, (_, i) => n - i), // [3, 2, 1] for n=3
        B: [],
        C: []
    };

    steps.push({
        rodA: [...rods.A],
        rodB: [...rods.B],
        rodC: [...rods.C],
        description: `Initial State with ${n} discs.`,
        movingDisc: null,
        fromRod: null,
        toRod: null
    });

    function move(n: number, from: string, to: string, aux: string) {
        if (n === 0) return;

        move(n - 1, from, aux, to);

        const disc = rods[from].pop();
        if (disc) {
            rods[to].push(disc);
            steps.push({
                rodA: [...(rods.A || [])],
                rodB: [...(rods.B || [])],
                rodC: [...(rods.C || [])],
                description: `Move disc ${disc} from ${from} to ${to}`,
                movingDisc: disc,
                fromRod: from,
                toRod: to
            });
        }

        move(n - 1, aux, to, from);
    }

    move(n, 'A', 'C', 'B');

    steps.push({
        rodA: [...rods.A],
        rodB: [...rods.B],
        rodC: [...rods.C],
        description: `Solved! All discs moved to Rod C.`,
        movingDisc: null,
        fromRod: null,
        toRod: null
    });

    return { steps };
}
