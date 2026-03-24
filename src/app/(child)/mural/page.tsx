import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ChildNav } from "@/components/layout/ChildNav"
import { StickerAlbum } from "@/components/mural/StickerAlbum"
import prisma from "@/lib/db/prisma"

export const dynamic = "force-dynamic"

export default async function MuralPage() {
    const cookieStore = await cookies()
    const childId = cookieStore.get("letrafun_child_id")?.value

    if (!childId) {
        redirect("/dashboard")
    }

    // 1. Busca TODAS as figurinhas cadastradas no banco (criadas pelo app)
    const allStickers = await prisma.sticker.findMany()

    // 2. Busca apenas as figurinhas que a criança JÁ GANHOU 
    const childStickers = await prisma.childSticker.findMany({
        where: { childId },
        include: { sticker: true }
    })

    // Filtra para passar apenas o objeto Sticker pro Álbum
    const ownedStickers = childStickers.map((cs: any) => cs.sticker)

    return (
        <div className="min-h-screen bg-sky-100 p-4 md:p-6 font-nunito pb-28">
            <header className="flex justify-between items-center bg-white p-3 px-5 rounded-2xl shadow-sm mb-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-2xl border-2 border-sky-200">
                        📚
                    </div>
                    <div>
                        <h1 className="font-baloo text-lg font-bold text-slate-700 leading-tight">Mural de Figurinhas</h1>
                        <p className="font-bold text-sky-500 text-sm">Colecione todas jogando!</p>
                    </div>
                </div>

                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="rounded-full">❌</Button>
                </Link>
            </header>

            <main>
                <StickerAlbum allStickers={allStickers} ownedStickers={ownedStickers} />
            </main>

            <ChildNav active="mural" />
        </div>
    )
}
