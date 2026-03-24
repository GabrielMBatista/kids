import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db/prisma"
import { getRandomSticker } from "@/lib/api/giphy"
import { generateImage, buildStickerPrompt } from "@/lib/api/gemini"

const ALBUMS = [
    { rarity: "COMMON", name: "animals", step: 50 },
    { rarity: "UNCOMMON", name: "heroes", step: 100 },
    { rarity: "RARE", name: "dragons", step: 150 },
    { rarity: "EPIC", name: "legends", step: 200 },
    { rarity: "LEGENDARY", name: "champions", step: 250 },
]

export async function POST(req: NextRequest) {
    const { childId, score, gameType } = await req.json()

    if (!childId) return NextResponse.json({ error: "Missing childId" }, { status: 400 })

    try {
        const child = await prisma.child.findUnique({
            where: { id: childId },
            include: { stickers: true }
        })

        if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 })

        const oldXp = child.xp
        const newXp = oldXp + score

        // XP Math Function
        // Level 1 starts with 0 XP. To reach Level 2 requires 50 XP.
        // Formula: required for Level L = 50 * 2^(L-1)
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

        const oldLevelInfo = getLevelInfo(oldXp)
        const newLevelInfo = getLevelInfo(newXp)

        let unlockedSticker = null

        const leveledUp = newLevelInfo.level > oldLevelInfo.level

        // If level up, find sequential sticker!
        if (leveledUp) {
            // Find which album the child should be completing.
            // There are 5 albums, 12 stickers each. Total 60 stickers.
            // For MVP: Count total distinct stickers owned. 
            // If < 12, album 0. If < 24, album 1. etc.

            const childStickersFull = await prisma.childSticker.findMany({
                where: { childId },
                include: { sticker: true }
            })

            let targetAlbumIndex = 0
            for (let i = 0; i < ALBUMS.length; i++) {
                const albumData = ALBUMS[i]
                const distinctCount = new Set(childStickersFull.filter(cs => cs.sticker?.rarity === albumData.rarity as any).map(cs => cs.stickerId)).size
                if (distinctCount < 12) {
                    targetAlbumIndex = i
                    break
                }
            }

            const currentTargetAlbum = ALBUMS[targetAlbumIndex] || ALBUMS[ALBUMS.length - 1]

            // 1. Pesquisa todas as figurinhas que os pais adicionaram neste álbum
            // Ordena por data de criação para que o álbum seja liberado em ordem exata
            const allDbStickersForAlbum = await prisma.sticker.findMany({
                where: { rarity: currentTargetAlbum.rarity as any },
                orderBy: { createdAt: "asc" }
            })

            // 2. Extrai os IDs das figurinhas que a criança JÁ TEM deste álbum
            const ownedStickerIds = childStickersFull
                .filter(cs => cs.sticker?.rarity === currentTargetAlbum.rarity)
                .map(cs => cs.stickerId)

            // 3. Filtra as figurinhas do banco que a criança AINDA NÃO TEM mantendo a ordem sequencial
            const unownedDbStickers = allDbStickersForAlbum.filter(s => !ownedStickerIds.includes(s.id))

            if (unownedDbStickers.length > 0) {
                // Pega sempre a primeira da sequência que ainda falta (Strictly Sequential Unlocking!)
                const sequentialSticker = unownedDbStickers[0]

                await prisma.childSticker.create({
                    data: { childId, stickerId: sequentialSticker.id, quantity: 1 }
                })
                unlockedSticker = sequentialSticker
            } else {
                // A criança já tem todas as figurinhas que estavam no banco ou não tem nenhuma cadastrada, 
                // MAS ainda não completou as 12 permitidas. Criamos uma nova dinamicamente.
                let imageUrl = ""
                let name = ""
                if (currentTargetAlbum.rarity === "COMMON" || currentTargetAlbum.rarity === "UNCOMMON") {
                    const query = currentTargetAlbum.name === "animals" ? "cute animal" : "cartoon superhero"
                    const giphyResult = await getRandomSticker(query)
                    if (giphyResult) {
                        imageUrl = giphyResult.images.fixed_height.url
                        name = giphyResult.title || query
                    }
                } else {
                    const subjects = currentTargetAlbum.name === "dragons" ? ["dragon"] : currentTargetAlbum.name === "legends" ? ["wizard"] : ["hero"]
                    const subject = subjects[Math.floor(Math.random() * subjects.length)]
                    const prompt = buildStickerPrompt("adventure", currentTargetAlbum.rarity as any, subject)
                    const img = await generateImage(prompt)
                    imageUrl = `data:${img.mimeType};base64,${img.base64}`
                    name = subject
                }

                if (imageUrl) {
                    const newSticker = await prisma.sticker.create({
                        data: {
                            name,
                            imageUrl,
                            rarity: currentTargetAlbum.rarity as any,
                            source: (currentTargetAlbum.rarity === "COMMON" || currentTargetAlbum.rarity === "UNCOMMON") ? "GIPHY" : "GEMINI",
                            album: currentTargetAlbum.name
                        }
                    })

                    await prisma.childSticker.create({
                        data: { childId, stickerId: newSticker.id, quantity: 1 }
                    })

                    unlockedSticker = newSticker
                }
            }
        }

        // Atualiza o progresso da criança
        const updatedChild = await prisma.child.update({
            where: { id: childId },
            data: { xp: newXp, level: newLevelInfo.level }
        })

        // Save Game Session
        await prisma.gameSession.create({
            data: {
                childId,
                gameType: gameType || "unknown",
                pillar: "LETTERS",
                score,
                xpEarned: score,
                accuracy: 1.0,
                duration: 60
            }
        })

        return NextResponse.json({
            child: updatedChild,
            unlockedSticker,
            oldLevelInfo,
            newLevelInfo
        })

    } catch (error) {
        console.error("Progress save error:", error)
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }
}
