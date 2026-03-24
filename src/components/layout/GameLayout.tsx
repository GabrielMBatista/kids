"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

interface GameLayoutProps {
    children: React.ReactNode
    title: string
    score: number
    onBack?: () => void
}

export function GameLayout({ children, title, score, onBack }: GameLayoutProps) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-sky-100 flex flex-col font-nunito">
            {/* HUD (Heads Up Display) */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b-4 border-white flex items-center justify-between px-4 md:px-8 shadow-sm z-50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack || (() => router.push("/games"))}
                        className="rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200"
                    >
                        ❌
                    </Button>
                    <h1 className="font-baloo text-2xl font-bold text-slate-700 hidden md:block">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-3 bg-orange-100 px-4 py-2 rounded-2xl border-2 border-orange-200">
                    <span className="text-2xl">⭐</span>
                    <span className="font-baloo text-2xl font-bold text-orange-600">
                        {score}
                    </span>
                </div>
            </header>

            {/* Game Stage */}
            <main className="flex-1 relative overflow-hidden flex items-center justify-center">
                {children}
            </main>
        </div>
    )
}
