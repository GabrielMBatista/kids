import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ChildNav } from "@/components/layout/ChildNav"
import { Leaderboard } from "@/components/leaderboard/Leaderboard"
import prisma from "@/lib/db/prisma"
import { cookies } from "next/headers"

export default async function LeaderboardPage() {
    const cookieStore = await cookies()
    const activeChildId = cookieStore.get("letrafun_child_id")?.value

    const topPlayers = await prisma.child.findMany({
        orderBy: { xp: 'desc' },
        take: 10,
        select: {
            id: true,
            name: true,
            avatar: true,
            xp: true
        }
    })

    return (
        <div className="min-h-screen bg-yellow-50 p-4 md:p-6 font-nunito pb-28">
            <header className="flex justify-between items-center bg-white p-3 px-5 rounded-2xl shadow-sm mb-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl border-2 border-yellow-200">
                        🏅
                    </div>
                    <div>
                        <h1 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Placar Master</h1>
                        <p className="font-bold text-yellow-500 text-sm">Veja quem é a lenda da semana!</p>
                    </div>
                </div>

                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="rounded-full">❌</Button>
                </Link>
            </header>

            <main className="pb-10">
                <Leaderboard players={topPlayers} activeChildId={activeChildId} />
            </main>

            <ChildNav active="ranking" />
        </div>
    )
}
