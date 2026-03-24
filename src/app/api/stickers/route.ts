// API Route: POST /api/stickers/reward
// Called after a game session — rolls for a sticker and returns it
// Body: { childId, gameType, pillar, score, accuracy }

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { rollStickerDrop } from "@/lib/game-engine/xp"
import { getRandomSticker } from "@/lib/api/giphy"
import { generateImage, buildStickerPrompt } from "@/lib/api/gemini"
import type { Rarity, StickerSource } from "@/types"

const GIPHY_QUERIES: Record<string, string> = {
    animals: "cute animal",
    heroes: "cartoon superhero",
}

const GEMINI_SUBJECTS: Record<string, string[]> = {
    dragons: ["dragon", "fire dragon", "ice dragon", "crystal dragon"],
    legends: ["wizard", "knight", "sorceress", "warrior"],
    champions: ["golden champion", "legendary hero", "cosmic knight"],
}

const ALBUM_BY_RARITY: Record<Rarity, string> = {
    COMMON: "animals",
    UNCOMMON: "heroes",
    RARE: "dragons",
    EPIC: "legends",
    LEGENDARY: "champions",
}

export async function POST(req: NextRequest) {
    const { childId, score } = await req.json()

    if (!childId) return NextResponse.json({ sticker: null })

    // 1. Roll for drop
    const rarity = rollStickerDrop(score) as Rarity | null
    if (!rarity) return NextResponse.json({ sticker: null })

    const album = ALBUM_BY_RARITY[rarity]
    const source: StickerSource = ["COMMON", "UNCOMMON"].includes(rarity) ? "GIPHY" : "GEMINI"

    try {
        // 2. Check if we have an existing sticker of this rarity in DB
        const existing = await prisma.sticker.findFirst({
            where: { rarity, source },
            orderBy: { createdAt: "desc" },
        })

        if (existing) {
            // Award existing sticker to child
            await prisma.childSticker.upsert({
                where: { childId_stickerId: { childId, stickerId: existing.id } },
                update: { quantity: { increment: 1 } },
                create: { childId, stickerId: existing.id, quantity: 1 },
            })
            return NextResponse.json({ sticker: existing })
        }

        // 3. Fetch/generate new sticker
        let imageUrl = ""
        let name = ""
        let prompt: string | undefined

        if (source === "GIPHY") {
            const query = GIPHY_QUERIES[album]
            const giphyResult = await getRandomSticker(query)
            if (!giphyResult) return NextResponse.json({ sticker: null })
            imageUrl = giphyResult.images.fixed_height.url
            name = giphyResult.title || query
        } else {
            const subjects = GEMINI_SUBJECTS[album] ?? ["hero"]
            const subject = subjects[Math.floor(Math.random() * subjects.length)]
            prompt = buildStickerPrompt("adventure", rarity, subject)
            const img = await generateImage(prompt)
            // In production: upload to Vercel Blob
            imageUrl = `data:${img.mimeType};base64,${img.base64}`
            name = subject
        }

        // 4. Save sticker to DB
        const sticker = await prisma.sticker.create({
            data: { name, imageUrl, rarity, source, album, prompt },
        })

        // 5. Award to child
        await prisma.childSticker.create({
            data: { childId, stickerId: sticker.id, quantity: 1 },
        })

        return NextResponse.json({ sticker })
    } catch (err) {
        console.error("Sticker reward error:", err)
        return NextResponse.json({ sticker: null })
    }
}
