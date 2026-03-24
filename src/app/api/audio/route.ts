// API Route: GET /api/audio?text=borboleta
// Checks DB cache first — generates via ElevenLabs only on cache miss
// Returns { audioUrl: string }

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"

export async function GET(req: NextRequest) {
    const text = req.nextUrl.searchParams.get("text")?.trim()
    if (!text) return NextResponse.json({ error: "Missing text param" }, { status: 400 })
    if (text.length > 500) return NextResponse.json({ error: "Text too long" }, { status: 400 })

    // 1. Check cache
    const cached = await prisma.audioCache.findUnique({ where: { text } })
    if (cached) return NextResponse.json({ audioUrl: cached.audioUrl })

    try {
        // 2. Usar o Google TTS gratuito nativo (substituindo ElevenLabs)
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=pt-BR&client=tw-ob`

        const audioRes = await fetch(googleTtsUrl)
        if (!audioRes.ok) throw new Error("Google TTS falhou")

        const arrayBuffer = await audioRes.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")
        const audioUrl = `data:audio/mpeg;base64,${base64}`

        // Cache opcional no banco com data URI (apenas para dev)
        // await prisma.audioCache.create({ data: { text, audioUrl } })

        return NextResponse.json({ audioUrl })
    } catch (err) {
        console.error("Audio API error:", err)
        return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
    }
}
