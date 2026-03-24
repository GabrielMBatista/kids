import { OlhoVivoGame } from "@/components/games/letters/OlhoVivoGame"
import prisma from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function OlhoVivoPage() {
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

    // Busca adesivos variados para o Olho Vivo
    const stickers = await prisma.sticker.findMany({
        where: {
            album: "game:olho-vivo"
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
    })

    // Fallback se não houver curadoria
    const displayStickers = stickers.length > 0 ? stickers : await prisma.sticker.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    })

    // Busca fundo curado
    const background = await prisma.sticker.findFirst({
        where: { album: "game:olho-vivo:bg" },
        orderBy: { createdAt: 'desc' }
    })

    return <OlhoVivoGame
        childId={child.id}
        initialXp={child.xp}
        assets={displayStickers.map((s: any) => ({
            name: (s.prompt || s.name).toUpperCase(),
            imageUrl: s.imageUrl
        }))}
        backgroundUrl={background?.imageUrl}
    />
}
