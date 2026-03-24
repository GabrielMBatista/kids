import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { searchStickers } from "@/lib/api/giphy"
import { generateImage, buildStickerPrompt, buildBgPrompt } from "@/lib/api/gemini"

const ALBUM_BY_RARITY: Record<string, string> = {
    COMMON: "animals",
    UNCOMMON: "heroes",
    RARE: "dragons",
    EPIC: "legends",
    LEGENDARY: "champions",
}

/** GET /api/admin/stickers?gameId=pesca-letras — list current assets for a game */
export async function GET(req: NextRequest) {
    const gameId = req.nextUrl.searchParams.get("gameId")
    if (!gameId) {
        return NextResponse.json({ error: "gameId required" }, { status: 400 })
    }

    const [assets, background] = await Promise.all([
        prisma.sticker.findMany({
            where: { album: `game:${gameId}` },
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, imageUrl: true, album: true, source: true }
        }),
        prisma.sticker.findFirst({
            where: { album: `game:${gameId}:bg` },
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, imageUrl: true, album: true }
        })
    ])

    return NextResponse.json({ assets, background })
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action } = body

        if (action === "preview") {
            const { source, query, rarity } = body
            if (source === "GIPHY") {
                const results = await searchStickers(query, 4)
                return NextResponse.json({
                    previews: results.map(r => ({
                        url: r.images.fixed_height.url,
                        name: r.title || query,
                    }))
                })
            } else if (source === "GEMINI") {
                const prompt = buildStickerPrompt("custom", rarity || "RARE", query)
                const img = await generateImage(prompt)
                return NextResponse.json({
                    previews: [{
                        url: `data:${img.mimeType};base64,${img.base64}`,
                        name: query,
                    }]
                })
            }
        }

        if (action === "generate-bg") {
            const { prompt } = body
            const bgPrompt = buildBgPrompt(prompt, "EXPLORER")
            const img = await generateImage(bgPrompt, "16:9")
            return NextResponse.json({
                preview: {
                    url: `data:${img.mimeType};base64,${img.base64}`,
                    name: `Fundo ${prompt}`,
                }
            })
        }

        if (action === "save") {
            const { source, rarity, name, imageUrl, query, album: albumOverride } = body

            if (!imageUrl || !rarity || !source || !name) {
                return NextResponse.json({ error: "Missing fields" }, { status: 400 })
            }

            const album = albumOverride || ALBUM_BY_RARITY[rarity] || "custom"

            const sticker = await prisma.sticker.create({
                data: { name, imageUrl, rarity, source, album, prompt: query }
            })
            return NextResponse.json({ success: true, sticker })
        }

        if (action === "delete") {
            const { id } = body
            if (!id) {
                return NextResponse.json({ error: "id required" }, { status: 400 })
            }
            await prisma.sticker.delete({ where: { id } })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (err) {
        console.error("Admin sticker API error:", err)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
