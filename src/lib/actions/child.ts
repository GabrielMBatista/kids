"use server"

import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db/prisma"
import { redirect } from "next/navigation"

export async function selectChild(childId: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Verify ownership
    const child = await prisma.child.findFirst({
        where: { id: childId, parentId: session.user.id }
    })

    if (!child) throw new Error("Child not found")

    const cookieStore = await cookies()
    cookieStore.set("letrafun_child_id", childId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
    })

    redirect("/games")
}

export async function createChild(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const name = formData.get("name") as string
    const ageGroup = formData.get("ageGroup") as any || "ADVENTURER"

    if (!name) return

    await prisma.child.create({
        data: {
            name,
            ageGroup,
            parentId: session.user.id,
            avatar: "fox"
        }
    })

    // Revalidate or redirect
    redirect("/dashboard")
}

export async function resetAllProgress() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // For safety, only reset progress of children belonging to this parent
    const children = await prisma.child.findMany({
        where: { parentId: session.user.id }
    })

    const childIds = children.map((c: any) => c.id)

    // Delete related records
    await prisma.childSticker.deleteMany({ where: { childId: { in: childIds } } })
    await prisma.gameSession.deleteMany({ where: { childId: { in: childIds } } })

    // Reset XP and Level
    await prisma.child.updateMany({
        where: { parentId: session.user.id },
        data: { xp: 0, level: 1, streak: 0 }
    })

    redirect("/dashboard")
}
