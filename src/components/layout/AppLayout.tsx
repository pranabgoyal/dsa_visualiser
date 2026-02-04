import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground relative">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />

            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent relative z-10">

                <div className="flex-1 p-8">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}
