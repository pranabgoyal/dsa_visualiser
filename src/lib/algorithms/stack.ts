export type Step = {
    description: string;
    stack: string[];
    output: string;
    highlightIndex?: number; // Index in the original expression
};

export function infixToPostfix(expression: string): { postfix: string; steps: Step[] } {
    let stack: string[] = [];
    let output = "";
    const steps: Step[] = [];
    const precedence: { [key: string]: number } = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "^": 3,
    };

    // Clean expression (remove spaces for parsing, but might need to handle them better for multi-char operands later)
    // For simplicity, assuming single char operands or space separated. 
    // Let's stick to single char for basic visualization validity.
    const tokens = expression.replace(/\s+/g, "").split("");

    for (let i = 0; i < tokens.length; i++) {
        const char = tokens[i];
        const currentStep: Step = {
            description: "",
            stack: [...stack],
            output,
            highlightIndex: i,
        };

        if (/[a-zA-Z0-9]/.test(char)) {
            output += char;
            currentStep.description = `Operand '${char}': Add directly to output.`;
        } else if (char === "(") {
            stack.push(char);
            currentStep.description = "Found '(': Push to stack.";
        } else if (char === ")") {
            currentStep.description = "Found ')': Pop from stack to output until '(' is found.";
            while (stack.length > 0 && stack[stack.length - 1] !== "(") {
                output += stack.pop();
            }
            stack.pop(); // Remove '('
        } else {
            // Operator
            currentStep.description = `Operator '${char}': Check precedence against stack top.`;
            while (
                stack.length > 0 &&
                stack[stack.length - 1] !== "(" &&
                precedence[char] <= precedence[stack[stack.length - 1] || ""]
            ) {
                const popped = stack.pop();
                output += popped;
                steps.push({
                    description: `Pop '${popped}' (higher or equal precedence) to output.`,
                    stack: [...stack],
                    output,
                    highlightIndex: i
                })
            }
            stack.push(char);
            currentStep.description += ` Push '${char}' to stack.`;
        }

        // Update step state after operation
        currentStep.stack = [...stack];
        currentStep.output = output;
        steps.push(currentStep);
    }

    // Pop remaining
    while (stack.length > 0) {
        const popped = stack.pop();
        output += popped;
        steps.push({
            description: `End of expression: Pop '${popped}' to output.`,
            stack: [...stack],
            output,
        });
    }

    // Final step
    steps.push({
        description: `Conversion complete. Final Postfix: ${output}`,
        stack: [],
        output,
    });

    return { postfix: output, steps };
}

export function evaluatePostfix(expression: string, values: Record<string, number> = {}): { result: number; steps: Step[] } {
    // Placeholder for evaluation logic if needed later
    return { result: 0, steps: [] };
}
