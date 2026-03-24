// ─── Shared Types for LetraFun ────────────────────────────────────────────────

export type AgeGroup = "EXPLORER" | "ADVENTURER" | "CHALLENGER"
export type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
export type StickerSource = "GIPHY" | "GEMINI"
export type Pillar = "LETTERS" | "SOUNDS" | "SYLLABLES" | "WORDS" | "SENTENCES" | "COMPREHENSION"
export type GameType =
  | "letter-tap"
  | "sound-echo"
  | "color-the-letter"
  | "syllable-factory"
  | "beat-syllable"
  | "musical-dictation"
  | "word-hunt"
  | "phrase-duel"
  | "spelling-race"
  | "story-order"

// ─── Child profile ─────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string
  name: string
  avatar: string
  ageGroup: AgeGroup
  xp: number
  level: number
  streak: number
  lastPlayedAt: string | null
}

export interface ChildWithStickers extends ChildProfile {
  stickers: OwnedSticker[]
}

// ─── Progression ────────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number
  title: string
  xpRequired: number
  xpNext: number
}

export const LEVEL_TITLES: { xp: number; title: string }[] = [
  { xp: 0,    title: "Aprendiz das Letras" },
  { xp: 500,  title: "Caçador de Sílabas" },
  { xp: 1500, title: "Mestre das Palavras" },
  { xp: 3000, title: "Guardião das Frases" },
  { xp: 6000, title: "Lenda da Leitura" },
]

// ─── Stickers ────────────────────────────────────────────────────────────────

export interface Sticker {
  id: string
  name: string
  imageUrl: string
  rarity: Rarity
  source: StickerSource
  album: string
}

export interface OwnedSticker extends Sticker {
  quantity: number
  earnedAt: string
}

// ─── Albums ─────────────────────────────────────────────────────────────────

export interface Album {
  id: string
  name: string
  rarity: Rarity
  source: StickerSource
  stickers: Sticker[]
}

export const ALBUMS: Omit<Album, "stickers">[] = [
  { id: "animals",   name: "Animais da Floresta", rarity: "COMMON",    source: "GIPHY" },
  { id: "heroes",    name: "Heróis das Letras",   rarity: "UNCOMMON",  source: "GIPHY" },
  { id: "dragons",   name: "Dragões Guardiões",   rarity: "RARE",      source: "GEMINI" },
  { id: "legends",   name: "Lendas do Alfabeto",  rarity: "EPIC",      source: "GEMINI" },
  { id: "champions", name: "Campeões Brilhantes", rarity: "LEGENDARY", source: "GEMINI" },
]

// ─── Game Session ────────────────────────────────────────────────────────────

export interface GameSessionResult {
  gameType: GameType
  pillar: Pillar
  score: number
  xpEarned: number
  accuracy: number
  duration: number
  stickerReward?: Sticker
}

// ─── Theme ──────────────────────────────────────────────────────────────────

export interface Theme {
  id: string
  name: string
  ageGroup: AgeGroup
  bgImageUrl: string | null
  charImageUrl: string | null
  activeFrom: string
  activeTo: string
}
