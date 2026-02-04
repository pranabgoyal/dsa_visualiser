
import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    gradient?: string;
}

export function PageHeader({
    title,
    description,
    gradient = "from-primary to-purple-400"
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-2 mb-2">
            <h1 className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
                {title}
            </h1>
            <p className="text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
