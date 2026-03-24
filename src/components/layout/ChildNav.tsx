import Link from "next/link"

interface ChildNavProps {
    active: "jogos" | "ranking" | "mural"
}

const tabs = [
    { id: "jogos" as const, href: "/games", icon: "🎮", label: "Jogos" },
    { id: "ranking" as const, href: "/leaderboard", icon: "🏆", label: "Ranking" },
    { id: "mural" as const, href: "/mural", icon: "📚", label: "Mural" },
]

export function ChildNav({ active }: ChildNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-slate-100 px-4 pt-2 pb-6 flex justify-center gap-2 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50">
            {tabs.map(tab => {
                const isActive = tab.id === active
                return (
                    <Link key={tab.id} href={tab.href} className="flex-1 max-w-[8rem]">
                        <div className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all ${isActive
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-slate-400 hover:bg-slate-50"
                            }`}>
                            <span className="text-xl leading-none">{tab.icon}</span>
                            <span className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                                {tab.label}
                            </span>
                        </div>
                    </Link>
                )
            })}
        </nav>
    )
}
