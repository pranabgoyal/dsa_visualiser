"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Layers, Cpu, Network, Search, Database, BarChart3, Zap, ChevronLeft, ChevronRight, Link as LinkIcon } from "lucide-react";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Linked List", href: "/linked-list", icon: LinkIcon },
    { name: "Stack / Infix", href: "/stack", icon: Layers },
    { name: "Queue / Scheduling", href: "/queue", icon: Cpu },
    { name: "Trees / Indexing", href: "/tree", icon: Network },
    { name: "Search Algos", href: "/search", icon: Search },
    { name: "Sorting", href: "/sorting", icon: BarChart3 },
    { name: "Tower of Hanoi", href: "/hanoi", icon: Zap },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`
            relative z-20 flex flex-col h-full bg-background/95 backdrop-blur-lg border-r border-border transition-all duration-300
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}>
            <div className={cn("flex items-center p-4 border-b border-border h-16", isCollapsed ? "justify-center" : "justify-between")}>
                <div className="flex items-center overflow-hidden whitespace-nowrap">
                    <Database className={cn("h-6 w-6 text-primary flex-shrink-0 animate-pulse", !isCollapsed && "mr-2")} />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-lg font-bold tracking-tight text-foreground"
                        >
                            DSA <span className="text-primary">Visualizer</span>
                        </motion.span>
                    )}
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-hide">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors relative overflow-hidden whitespace-nowrap",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                isCollapsed ? "justify-center px-2" : ""
                            )}
                            title={isCollapsed ? item.name : ""}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                                    !isCollapsed && "mr-3"
                                )}
                            />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border flex flex-col gap-2">
                <div className={cn("flex items-center justify-between", isCollapsed && "justify-center")}>
                    {!isCollapsed && <span className="text-xs font-semibold text-muted-foreground">Theme</span>}
                    <ThemeToggle />
                </div>


                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
                    {!isCollapsed && "Collapse Sidebar"}
                </Button>
            </div>
        </div>
    );
}
