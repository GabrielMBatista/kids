import { PescaLetrasGame } from "@/components/games/letters/PescaLetrasGame"
import prisma from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PescaLetrasPage() {
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

    // Busca adesivos curados para o jogo
    const fishStickers = await prisma.sticker.findMany({
        where: { album: "game:pesca-letras" },
        orderBy: { createdAt: "desc" }
    })

    // Busca fundo curado
    const background = await prisma.sticker.findFirst({
        where: { album: "game:pesca-letras:bg" },
        orderBy: { createdAt: 'desc' }
    })

    return <PescaLetrasGame
        childId={child.id}
        initialXp={child.xp}
        fishAssets={fishStickers.map((s: any) => s.imageUrl)}
        backgroundUrl={background?.imageUrl}
    />
}
