export type Process = {
    id: string;
    burstTime: number;
    remainingTime: number;
    arrivalTime: number;
    color: string;
};

export type SchedulerState = {
    time: number;
    readyQueue: string[]; // List of Process IDs
    runningProcess: string | null;
    completedProcesses: string[];
    ganttChart: { processId: string; startTime: number; endTime: number }[];
    description: string;
};

export type SimulationResult = {
    steps: SchedulerState[];
};

export function simulateRoundRobin(
    processes: Process[],
    timeQuantum: number
): SimulationResult {
    let currentTime = 0;
    let queue: Process[] = [];
    let completed: Process[] = [];
    const steps: SchedulerState[] = [];
    const gantt: { processId: string; startTime: number; endTime: number }[] = [];

    // Clone processes to avoid mutation issues
    const procs = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    // Sort by arrival time initially
    let pending = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime);

    // Initial Step
    steps.push({
        time: 0,
        readyQueue: [],
        runningProcess: null,
        completedProcesses: [],
        ganttChart: [],
        description: "Simulation Start",
    });

    while (completed.length < procs.length) {
        // Add arrived processes to queue
        while (pending.length > 0 && pending[0].arrivalTime <= currentTime) {
            const p = pending.shift()!;
            queue.push(p);
            steps.push({
                time: currentTime,
                readyQueue: queue.map(x => x.id),
                runningProcess: null,
                completedProcesses: completed.map(x => x.id),
                ganttChart: [...gantt],
                description: `Process ${p.id} arrived and added to ready queue.`
            });
        }

        if (queue.length === 0) {
            if (pending.length > 0) {
                // Jump to next arrival if CPU is idle
                const nextArrival = pending[0].arrivalTime;
                // Add idle time to gantt if needed, or just jump
                steps.push({
                    time: currentTime,
                    readyQueue: [],
                    runningProcess: null,
                    completedProcesses: completed.map(x => x.id),
                    ganttChart: [...gantt],
                    description: `CPU Idle until ${nextArrival}`
                });
                currentTime = nextArrival;
                continue;
            } else {
                break; // Should not happen if loop condition is correct
            }
        }

        const currentProcess = queue.shift()!;
        const executionTime = Math.min(currentProcess.remainingTime, timeQuantum);

        // Snapshot: Process starts running
        steps.push({
            time: currentTime,
            readyQueue: queue.map(x => x.id),
            runningProcess: currentProcess.id,
            completedProcesses: completed.map(x => x.id),
            ganttChart: [...gantt],
            description: `Process ${currentProcess.id} executing for ${executionTime} units.`
        });

        // Update state
        currentTime += executionTime;
        currentProcess.remainingTime -= executionTime;
        gantt.push({ processId: currentProcess.id, startTime: currentTime - executionTime, endTime: currentTime });

        // Check for new arrivals during this execution window
        while (pending.length > 0 && pending[0].arrivalTime <= currentTime) {
            const p = pending.shift()!;
            queue.push(p);
            steps.push({
                time: currentTime,
                readyQueue: queue.map(x => x.id),
                runningProcess: currentProcess.id, // Still technically running until context switch
                completedProcesses: completed.map(x => x.id),
                ganttChart: [...gantt],
                description: `Process ${p.id} arrived during execution and added to ready queue.`
            });
        }

        if (currentProcess.remainingTime > 0) {
            queue.push(currentProcess);
            steps.push({
                time: currentTime,
                readyQueue: queue.map(x => x.id),
                runningProcess: null,
                completedProcesses: completed.map(x => x.id),
                ganttChart: [...gantt],
                description: `Process ${currentProcess.id} time slice expired. Re-queued.`
            });
        } else {
            completed.push(currentProcess);
            steps.push({
                time: currentTime,
                readyQueue: queue.map(x => x.id),
                runningProcess: null,
                completedProcesses: completed.map(x => x.id),
                ganttChart: [...gantt],
                description: `Process ${currentProcess.id} execution completed.`
            });
        }
    }

    // Final State
    steps.push({
        time: currentTime,
        readyQueue: [],
        runningProcess: null,
        completedProcesses: completed.map(x => x.id),
        ganttChart: [...gantt],
        description: "Simulation Complete."
    });

    return { steps };
}
