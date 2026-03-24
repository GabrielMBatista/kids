"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ALBUMS, type Album, type Rarity, type StickerSource } from "@/types"

export interface StickerData {
    id: string
    name: string
    imageUrl: string
    album: string
    rarity: Rarity
    source: StickerSource
}

interface StickerBookProps {
    allStickers?: StickerData[]
    ownedStickers?: StickerData[]
}

const RARITY_COLORS: Record<string, string> = {
    COMMON: "from-slate-100 to-slate-200 border-slate-300 text-slate-500",
    UNCOMMON: "from-green-100 to-green-200 border-green-300 text-green-600",
    RARE: "from-blue-100 to-blue-200 border-blue-300 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    EPIC: "from-purple-100 to-purple-200 border-purple-300 text-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.6)]",
    LEGENDARY: "from-yellow-100 to-orange-200 border-yellow-400 text-orange-600 shadow-[0_0_25px_rgba(234,179,8,0.8)]",
}

export function StickerAlbum({ allStickers = [], ownedStickers = [] }: StickerBookProps) {
    const [activeAlbum, setActiveAlbum] = useState<string>(ALBUMS[0].id)

    const currentAlbumDef = ALBUMS.find(a => a.id === activeAlbum)!

    const slots = allStickers.filter(s => s.album === activeAlbum)
    // Mantém 12 slots para o grid. Se o banco tiver apenas 1, os outros 11 ficam vazios vizualmente (?)
    const displaySlots = Array.from({ length: 12 }).map((_, i) => slots[i] || null)

    const [selectedSticker, setSelectedSticker] = useState<any | null>(null)

    const BALLOON_COLORS = ["#fb923c", "#38bdf8", "#fb7185", "#facc15", "#34d399", "#a78bfa", "#f472b6"]
    const balloons = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
        x: 5 + (i / 12) * 90 + Math.random() * 5,
        size: 28 + Math.random() * 16,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 5,
    })), [])

    return (
        <>
            <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border-8 border-sky-100 max-w-4xl mx-auto font-nunito flex flex-col md:flex-row gap-8">
                {/* Sidebar - Abas do Álbum */}
                <aside className="w-full md:w-64 flex md:flex-col gap-3 overflow-x-auto overflow-y-hidden md:overflow-y-auto md:overflow-x-hidden pb-4 md:pb-0 md:pr-2 hide-scrollbar md:max-h-[600px] p-2">
                    {ALBUMS.map(album => {
                        const isActive = activeAlbum === album.id
                        const unlockedCount = ownedStickers.filter(s => s.album === album.id).length
                        const totalInAlbum = Math.max(allStickers.filter(s => s.album === album.id).length, 12)

                        return (
                            <button
                                key={album.id}
                                onClick={() => setActiveAlbum(album.id)}
                                className={`flex flex-col items-start p-4 rounded-2xl transition-all border-4 text-left min-w-[200px] md:min-w-0 flex-shrink-0 ${isActive
                                    ? "bg-sky-50 border-sky-400 shadow-md scale-105"
                                    : "bg-slate-50 border-slate-200 hover:border-sky-200 opacity-60"
                                    }`}
                            >
                                <span className="font-baloo text-xl font-bold text-slate-700">{album.name}</span>
                                <div className="flex justify-between w-full mt-2 items-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-br ${RARITY_COLORS[album.rarity]}`}>
                                        {album.rarity}
                                    </span>
                                    <span className="text-slate-500 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm">
                                        {unlockedCount}/{totalInAlbum}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </aside>

                {/* Páginas do Álbum */}
                <div className="flex-1 bg-gradient-to-br from-sky-50 to-indigo-50 p-6 md:p-8 rounded-[2rem] border-4 border-white shadow-inner relative min-h-[500px]">
                    <h2 className="font-baloo text-3xl font-bold text-sky-800 mb-6 flex justify-between items-center">
                        {currentAlbumDef.name}
                        <span className="text-sm md:text-lg bg-white px-4 py-2 rounded-full shadow-sm border-2 border-sky-100 text-sky-600">
                            Fonte: {currentAlbumDef.source === "GIPHY" ? "Animações Comuns" : "Arte Gerada por IA ✨"}
                        </span>
                    </h2>

                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                        <AnimatePresence mode="popLayout">
                            {displaySlots.map((sticker, i) => {
                                const isOwned = sticker ? ownedStickers.some(s => s.id === sticker.id) : false;

                                return (
                                    <motion.div
                                        key={sticker ? sticker.id : `empty-${i}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => isOwned && sticker ? setSelectedSticker(sticker) : null}
                                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all group relative overflow-hidden ${sticker
                                            ? isOwned
                                                ? 'bg-white shadow-lg border-4 border-white cursor-pointer hover:z-10 hover:scale-110'
                                                : 'bg-slate-100 border-4 border-dashed border-slate-300 pointer-events-none'
                                            : `bg-slate-200/50 border-4 border-dashed border-slate-300 opacity-40 shadow-inner`
                                            }`}
                                    >
                                        {sticker ? (
                                            <>
                                                {/* Brilho dinâmico para figurinhas raras */}
                                                {isOwned && ["RARE", "EPIC", "LEGENDARY"].includes(sticker.rarity) && (
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-60 group-hover:animate-shimmer pointer-events-none" style={{ backgroundSize: '200% 100%' }} />
                                                )}

                                                {/* Imagem (GIF ou Gerada) com Silhueta Semitransparente */}
                                                <img
                                                    src={sticker.imageUrl}
                                                    alt={sticker.name}
                                                    className={`w-full h-full object-contain drop-shadow-md relative z-10 transition-all ${!isOwned ? 'grayscale opacity-50 mix-blend-multiply' : 'mb-1'}`}
                                                />

                                                {!isOwned && (
                                                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                                                        <span className="text-3xl opacity-30 drop-shadow-none">🔒</span>
                                                    </div>
                                                )}

                                                {isOwned && (
                                                    <div className="absolute bottom-[-20px] left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold text-center py-1 opacity-0 group-hover:opacity-100 group-hover:bottom-0 transition-all z-20">
                                                        {sticker.name}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-4xl text-slate-400 font-baloo opacity-30">?</span>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modal Tela Cheia para Figurinha */}
            <AnimatePresence>
                {selectedSticker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSticker(null)}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden"
                    >
                        {/* Balloons loop */}
                        {balloons.map((b, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: "110vh", opacity: 0.8 }}
                                animate={{ y: "-20vh", opacity: [0.8, 1, 0.8] }}
                                transition={{
                                    duration: b.duration,
                                    delay: b.delay,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute pointer-events-none"
                                style={{ left: `${b.x}%` }}
                            >
                                {/* Balloon body */}
                                <div
                                    className="rounded-full relative"
                                    style={{
                                        width: b.size,
                                        height: b.size * 1.2,
                                        backgroundColor: b.color,
                                        boxShadow: `inset -4px -4px 8px rgba(0,0,0,0.15), inset 4px 4px 8px rgba(255,255,255,0.3)`,
                                    }}
                                >
                                    {/* Shine */}
                                    <div
                                        className="absolute rounded-full bg-white/40"
                                        style={{ width: b.size * 0.25, height: b.size * 0.25, top: '15%', left: '20%' }}
                                    />
                                    {/* Knot */}
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2"
                                        style={{
                                            bottom: -4,
                                            width: 0, height: 0,
                                            borderLeft: '4px solid transparent',
                                            borderRight: '4px solid transparent',
                                            borderTop: `6px solid ${b.color}`,
                                        }}
                                    />
                                </div>
                                {/* String */}
                                <div className="w-px h-10 bg-white/30 mx-auto" />
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white p-8 rounded-[3rem] max-w-lg w-full relative flex flex-col items-center border-8 border-sky-100 z-10"
                        >
                            <button
                                onClick={() => setSelectedSticker(null)}
                                className="absolute top-4 right-6 text-slate-400 hover:text-slate-700 text-3xl font-bold z-20"
                            >
                                &times;
                            </button>

                            <h3 className="font-baloo text-4xl text-slate-800 mb-6 text-center">{selectedSticker.name}</h3>

                            <div className="w-full aspect-square bg-slate-50 rounded-3xl p-6 border-4 border-slate-100 mb-6 flex items-center justify-center relative overflow-hidden shadow-inner">
                                {["RARE", "EPIC", "LEGENDARY"].includes(selectedSticker.rarity) && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-sky-200 to-transparent opacity-40 animate-shimmer pointer-events-none" style={{ backgroundSize: '200% 100%' }} />
                                )}
                                <img
                                    src={selectedSticker.imageUrl}
                                    alt={selectedSticker.name}
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                />
                            </div>

                            <div className={`px-6 py-2 rounded-full font-bold text-lg bg-gradient-to-br ${RARITY_COLORS[selectedSticker.rarity]}`}>
                                Raridade: {selectedSticker.rarity}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
