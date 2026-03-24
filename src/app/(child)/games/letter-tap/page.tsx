import { LetterTapGame } from "@/components/games/letter-tap/LetterTapGame"
import prisma from "@/lib/db/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LetterTapPage() {
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

    return <LetterTapGame childId={child.id} initialXp={child.xp} />
}
