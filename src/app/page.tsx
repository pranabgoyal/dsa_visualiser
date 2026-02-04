
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Cpu, Layers, Network, Search, BarChart3, Zap, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-10 relative"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{
        backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'linear-gradient(to bottom, black, transparent)'
      }}></div>
      <motion.div variants={item} className="flex flex-col gap-4 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
          Visualize <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 animate-pulse">Algorithms</span> Like Never Before
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          A powerful, educational platform for understanding Data Structures and Algorithms with real-time, interactive visualizations and code walkthroughs.
        </p>
        <div className="flex gap-4 justify-center md:justify-start">
          <Link href="/stack">
            <Button size="lg" className="gap-2 text-md">
              Start Learning <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Linked List */}
        <motion.div variants={item}>
          <Link href="/linked-list">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <LinkIcon className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Linked List</CardTitle>
                <CardDescription>Dynamic Memory</CardDescription>
              </CardHeader>
              <CardContent>
                Visualize Singly & Doubly Linked Lists with pointer manipulations and AI explanations.
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Stack */}
        <motion.div variants={item}>
          <Link href="/stack">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Layers className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Stack Operations</CardTitle>
                <CardDescription>Infix to Postfix</CardDescription>
              </CardHeader>
              <CardContent>
                Visualize how Stacks parse mathematical expressions and handle precedence.
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Queue */}
        <motion.div variants={item}>
          <Link href="/queue">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Cpu className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>CPU Scheduling</CardTitle>
                <CardDescription>Queue (Round Robin)</CardDescription>
              </CardHeader>
              <CardContent>
                See how Operating Systems use Queues to schedule processes with Time Quantums.
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Trees */}
        <motion.div variants={item}>
          <Link href="/tree">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Network className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Tree Data Structures</CardTitle>
                <CardDescription>BST, AVL, & Heaps</CardDescription>
              </CardHeader>
              <CardContent>
                Explore Binary Search Trees, AVL Trees, and Heaps with auto-balancing animations and step-by-step traversals.
              </CardContent>
            </Card>
          </Link>
        </motion.div>



        {/* Search */}
        <motion.div variants={item}>
          <Link href="/search">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Search Algorithms</CardTitle>
                <CardDescription>Linear vs Binary</CardDescription>
              </CardHeader>
              <CardContent>
                Compare different search strategies with real-time visualization of the search process.
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Sorting */}
        <motion.div variants={item}>
          <Link href="/sorting">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Sorting Algorithms</CardTitle>
                <CardDescription>Bubble, Merge, Quick Sort</CardDescription>
              </CardHeader>
              <CardContent>
                Visual comparison of sorting algorithms with step-by-step color coding and speed control.
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Hanoi */}
        <motion.div variants={item}>
          <Link href="/hanoi">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Tower of Hanoi</CardTitle>
                <CardDescription>Recursive Solver</CardDescription>
              </CardHeader>
              <CardContent>
                Visualize the classic recursive problem of moving discs between rods.
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

