import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { StickerManager } from "@/components/dashboard/StickerManager"
import { Personalizer } from "@/components/dashboard/Personalizer"
import prisma from "@/lib/db/prisma"
import { createChild, selectChild, resetAllProgress } from "@/lib/actions/child"

export default async function DashboardPage() {
    const session = await auth()

    // session will always exist if FREE_ACCESS is true due to auth() wrapper
    if (!session?.user?.id) {
        redirect("/login")
    }

    const children = await prisma.child.findMany({
        where: { parentId: session.user.id },
        include: { _count: { select: { sessions: true } } }
    })

    const totalXp = children.reduce((acc: number, c: any) => acc + c.xp, 0)
    const totalSessions = children.reduce((acc: number, c: any) => acc + c._count.sessions, 0)

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-nunito">
            <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b-2 border-slate-200 mb-8">
                <div>
                    <h1 className="font-baloo text-3xl font-bold text-slate-800">Painel dos Pais</h1>
                    <p className="text-slate-500 font-bold">Bem-vindo, {session.user.name ?? session.user.email}</p>
                </div>

                <div className="flex gap-2">
                    <form action={resetAllProgress}>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600">Zerar Progresso (Dev)</Button>
                    </form>
                    <form action={async () => {
                        "use server"
                        redirect("/")
                    }}>
                        <Button variant="ghost" size="sm">Sair</Button>
                    </form>
                </div>
            </header>

            <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Children Management */}
                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <h2 className="font-baloo text-2xl font-bold text-slate-700 mb-4">Perfis das Crianças</h2>
                    <div className="flex flex-col gap-4">
                        {children.map((child: any) => (
                            <div key={child.id} className="flex items-center justify-between bg-sky-50 p-6 rounded-2xl border-2 border-sky-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border-2 border-sky-200">
                                        {child.avatar === "fox" ? "🦊" : "🐱"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-lg">{child.name}</p>
                                        <p className="text-xs text-sky-600 font-bold uppercase tracking-wider">
                                            {child.ageGroup} • Nível {child.level}
                                        </p>
                                    </div>
                                </div>
                                <form action={selectChild.bind(null, child.id)}>
                                    <Button variant="primary" size="sm" className="px-6 rounded-full shadow-md">
                                        Jogar
                                    </Button>
                                </form>
                            </div>
                        ))}

                        <form action={createChild} className="flex flex-col gap-3 mt-4 pt-4 border-t-2 border-dashed border-slate-100">
                            <input
                                name="name"
                                placeholder="Nome da Criança"
                                className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 outline-none font-bold"
                                required
                            />
                            <Button variant="ghost" className="w-full border-2 border-dashed border-slate-300 hover:border-sky-300 hover:text-sky-500 text-slate-400">
                                + Adicionar Criança
                            </Button>
                        </form>
                    </div>
                </section>

                {/* Analytics */}
                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h2 className="font-baloo text-2xl font-bold text-slate-700 mb-4">Estatísticas Reais</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50 p-6 rounded-3xl text-center border-2 border-orange-100 shadow-sm">
                                <p className="text-4xl mb-2">🏆</p>
                                <p className="font-bold text-slate-700 text-2xl">{totalXp.toLocaleString()}</p>
                                <p className="text-xs text-orange-500 uppercase font-bold tracking-widest">XP Total</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-3xl text-center border-2 border-green-100 shadow-sm">
                                <p className="text-4xl mb-2">🎮</p>
                                <p className="font-bold text-slate-700 text-2xl">{totalSessions}</p>
                                <p className="text-xs text-green-600 uppercase font-bold tracking-widest">Partidas</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 italic text-slate-400 text-center">
                        <p className="text-sm">"O aprendizado é uma aventura sem fim!"</p>
                    </div>
                </section>

                <div className="lg:col-span-2 space-y-8">
                    <Personalizer />
                    <StickerManager />
                </div>
            </main>
        </div>
    )
}
