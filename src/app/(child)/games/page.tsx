import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ChildNav } from "@/components/layout/ChildNav"
import prisma from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function GameHubPage() {
    const cookieStore = await cookies()
    const childId = cookieStore.get("letrafun_child_id")?.value

    if (!childId) {
        redirect("/dashboard")
    }

    const child = await prisma.child.findUnique({
        where: { id: childId }
    })

    if (!child) {
        redirect("/dashboard")
    }

    // Mesma lógica da API para manter consistência
    function getLevelInfo(totalXp: number) {
        let lvl = 1
        let required = 50
        let previousCumulative = 0
        let cumulativeRequired = 50

        while (totalXp >= cumulativeRequired) {
            lvl++
            previousCumulative = cumulativeRequired
            required = required * 2
            cumulativeRequired += required
        }

        return {
            level: lvl,
            xpInCurrentLevel: totalXp - previousCumulative,
            requiredForNextLevel: required
        }
    }

    const levelInfo = getLevelInfo(child.xp)
    const progressPercent = (levelInfo.xpInCurrentLevel / levelInfo.requiredForNextLevel) * 100

    return (
        <div className="min-h-screen bg-sky-100 p-4 md:p-6 font-nunito pb-28">
            <header className="flex justify-between items-center bg-white p-3 px-5 rounded-2xl shadow-sm mb-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-2xl border-2 border-sky-100">
                        {child.avatar === 'fox' ? '🦊' : '🐱'}
                    </div>
                    <div>
                        <h1 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Olá, {child.name}!</h1>
                        <p className="font-bold text-sky-500 text-sm">Nível {levelInfo.level} • {child.xp.toLocaleString()} XP</p>
                    </div>
                </div>

                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="rounded-full">❌</Button>
                </Link>
            </header>

            <main className="max-w-4xl mx-auto space-y-8">
                {/* Pilar: Letras e Sons */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="font-baloo text-lg font-bold text-slate-800 bg-white px-4 py-1.5 rounded-full shadow-sm border-2 border-slate-100 whitespace-nowrap">
                            1. As Letras 🔤
                        </h2>
                        <div className="h-2.5 flex-1 bg-white rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-green-400 rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/games/letter-tap">
                            <div className="bg-white p-4 rounded-2xl shadow-[0_6px_0_rgb(203,213,225)] hover:shadow-[0_3px_0_rgb(203,213,225)] hover:translate-y-[3px] transition-all border-2 border-slate-100 flex items-center gap-4 cursor-pointer active:translate-y-[6px] active:shadow-none group">
                                <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform font-bold">
                                    A
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Que Letra É Essa?</h3>
                                    <p className="text-slate-400 font-bold text-sm">+10 XP por acerto</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/games/pesca-letras">
                            <div className="bg-white p-4 rounded-2xl shadow-[0_6px_0_rgb(203,213,225)] hover:shadow-[0_3px_0_rgb(203,213,225)] hover:translate-y-[3px] transition-all border-2 border-slate-100 flex items-center gap-4 cursor-pointer active:translate-y-[6px] active:shadow-none group">
                                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    🎣
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Pesca Letras</h3>
                                    <p className="text-slate-400 font-bold text-sm">Pesque a letra certa!</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/games/olho-vivo">
                            <div className="bg-white p-4 rounded-2xl shadow-[0_6px_0_rgb(203,213,225)] hover:shadow-[0_3px_0_rgb(203,213,225)] hover:translate-y-[3px] transition-all border-2 border-slate-100 flex items-center gap-4 cursor-pointer active:translate-y-[6px] active:shadow-none group">
                                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    🔍
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Olho Vivo</h3>
                                    <p className="text-slate-400 font-bold text-sm">Ache o objeto!</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Pilar: Sílabas */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="font-baloo text-lg font-bold text-slate-800 bg-white px-4 py-1.5 rounded-full shadow-sm border-2 border-slate-100 whitespace-nowrap">
                            2. As Sílabas 📖
                        </h2>
                        <div className="h-2.5 flex-1 bg-white rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-orange-400 w-[15%] rounded-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/games/pinte-palavra">
                            <div className="bg-white p-4 rounded-2xl shadow-[0_6px_0_rgb(203,213,225)] hover:shadow-[0_3px_0_rgb(203,213,225)] hover:translate-y-[3px] transition-all border-2 border-slate-100 flex items-center gap-4 cursor-pointer active:translate-y-[6px] active:shadow-none group">
                                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                    🖌️
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Pinte a Palavra</h3>
                                    <p className="text-slate-400 font-bold text-sm">Complete e pinte!</p>
                                </div>
                            </div>
                        </Link>

                        <div className="opacity-50 cursor-not-allowed bg-slate-200 p-4 rounded-2xl border-2 border-slate-300 flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-300 rounded-xl flex items-center justify-center text-2xl grayscale shrink-0">
                                🚂
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-baloo text-lg font-bold text-slate-500 leading-tight">Fábrica de Sílabas</h3>
                                <p className="text-slate-400 font-bold text-sm">Alcance Nível 5</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <ChildNav active="jogos" />
        </div>
    )
}
