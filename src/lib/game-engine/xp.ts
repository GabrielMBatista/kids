import { LEVEL_TITLES, type LevelInfo } from "@/types"

/** XP awarded per game based on accuracy and base score */
export function calculateXP(score: number, accuracy: number, pillarMultiplier = 1): number {
    const base = Math.round(score * accuracy * pillarMultiplier)
    return Math.max(10, Math.min(base, 300)) // 10–300 XP per session
}

/** Given total XP, return current level + title info */
export function getLevelInfo(xp: number): LevelInfo {
    let currentIndex = 0
    for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_TITLES[i].xp) {
            currentIndex = i
            break
        }
    }

    const current = LEVEL_TITLES[currentIndex]
    const next = LEVEL_TITLES[currentIndex + 1]

    return {
        level: currentIndex + 1,
        title: current.title,
        xpRequired: current.xp,
        xpNext: next?.xp ?? current.xp,
    }
}

/** Sticker drop probability based on rarity */
export const RARITY_DROP_RATES: Record<string, number> = {
    COMMON: 0.60,
    UNCOMMON: 0.25,
    RARE: 0.10,
    EPIC: 0.04,
    LEGENDARY: 0.01,
}

/** Roll for a sticker reward — returns rarity or null if no drop */
export function rollStickerDrop(sessionScore: number): string | null {
    // Better scores increase the base drop chance
    const dropChance = sessionScore >= 80 ? 0.5 : sessionScore >= 50 ? 0.3 : 0.15
    if (Math.random() > dropChance) return null

    const roll = Math.random()
    let cumulative = 0
    for (const [rarity, rate] of Object.entries(RARITY_DROP_RATES)) {
        cumulative += rate
        if (roll < cumulative) return rarity
    }
    return "COMMON"
}

/** XP multiplier per curriculum pillar (higher pillars = harder = more XP) */
export const PILLAR_MULTIPLIERS: Record<string, number> = {
    LETTERS: 1.0,
    SOUNDS: 1.1,
    SYLLABLES: 1.2,
    WORDS: 1.35,
    SENTENCES: 1.5,
    COMPREHENSION: 1.75,
}
