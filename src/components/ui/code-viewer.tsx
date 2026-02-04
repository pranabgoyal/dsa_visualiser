"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { codeSnippets } from '@/lib/code-snippets';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
    title?: string;
    algorithm?: keyof typeof codeSnippets; // Key to look up in codeSnippets
    defaultLanguage?: "c" | "cpp" | "java" | "python";
    readOnly?: boolean;
    customCode?: string; // Fallback or override
    onLanguageChange?: (lang: "c" | "cpp" | "java" | "python") => void; // For external control
}

export function CodeViewer({
    title = "Algorithm Logic",
    algorithm,
    defaultLanguage = "python",
    readOnly = true,
    customCode,
    onLanguageChange
}: CodeViewerProps) {
    const [language, setLanguage] = useState<"c" | "cpp" | "java" | "python">(defaultLanguage);
    const [code, setCode] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (customCode) {
            setCode(customCode);
        } else if (algorithm && codeSnippets[algorithm]) {
            setCode(codeSnippets[algorithm][language]);
        } else {
            setCode("// Code not available");
        }
    }, [algorithm, language, customCode]);

    const handleLanguageChange = (lang: "c" | "cpp" | "java" | "python") => {
        setLanguage(lang);
        if (onLanguageChange) {
            onLanguageChange(lang);
        }
    };

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Card className="h-full w-full overflow-hidden flex flex-col border-primary/20 bg-muted/20">
            <CardHeader className="py-2 px-4 bg-muted/50 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                    {title}
                </CardTitle>
                <div className="flex gap-2 items-center">
                    <div className="flex gap-1 bg-background/50 p-1 rounded-md">
                        {(["c", "cpp", "java", "python"] as const).map((lang) => (
                            <Button
                                key={lang}
                                variant={language === lang ? "secondary" : "ghost"}
                                size="sm"
                                className="h-6 px-2 text-xs uppercase"
                                onClick={() => handleLanguageChange(lang)}
                            >
                                {lang === "cpp" ? "C++" : lang}
                            </Button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={handleCopy}
                        title="Copy code"
                    >
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[300px]">
                <Editor
                    height="100%"
                    language={language === "c" || language === "cpp" ? "cpp" : language}
                    value={code}
                    theme="vs-dark"
                    options={{
                        readOnly: readOnly,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        padding: { top: 16, bottom: 16 },
                        automaticLayout: true,
                        wordWrap: "on",
                        lineNumbers: "on"
                    }}
                />
            </CardContent>
        </Card>
    );
}
