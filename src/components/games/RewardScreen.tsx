"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameLayout } from "@/components/layout/GameLayout"

function BalloonRain() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
            {Array.from({ length: 30 }).map((_, i) => {
                const isStar = i % 3 === 0
                const isConfetti = i % 3 === 1
                return (
                    <motion.div
                        key={i}
                        initial={{
                            y: "110vh",
                            x: `${Math.random() * 100}vw`,
                            rotate: 0,
                            scale: Math.random() * 0.5 + 0.8
                        }}
                        animate={{
                            y: "-10vh",
                            x: `${Math.random() * 100}vw`,
                            rotate: 360
                        }}
                        transition={{
                            duration: Math.random() * 2 + 3,
                            ease: "easeOut",
                            delay: Math.random() * 0.5
                        }}
                        className="absolute text-5xl drop-shadow-lg"
                    >
                        {isStar ? "⭐" : isConfetti ? "🎉" : "🎈"}
                    </motion.div>
                )
            })}
        </div>
    )
}

interface RewardScreenProps {
    title: string
    score: number
    baseLevel: number
    newLevel: number
    baseLevelXp: number    // How much XP the child had IN THIS LEVEL before the game (e.g. 10/100)
    newLevelXp: number     // How much XP the child has IN THIS LEVEL after the game (e.g. 60/100)
    requiredXp: number     // Total XP required for this specific level (e.g. 100)
    unlockedSticker: any | null
    onPlayAgain: () => void
}

export function RewardScreen({
    title,
    score,
    baseLevel,
    newLevel,
    baseLevelXp,
    newLevelXp,
    requiredXp,
    unlockedSticker,
    onPlayAgain
}: RewardScreenProps) {
    const [giftOpened, setGiftOpened] = useState(false)
    const stickerUnlocked = !!unlockedSticker

    // Calculate percentages for the bar
    // If we leveled up, the bar should fill to 100%. Then we'd need a multi-stage animation, 
    // but for MVP we just show the final state or the bar full.
    // Actually, if we leveled up, let's show the bar filling from baseLevelXp to 100%.
    const oldPercent = Math.min((baseLevelXp / requiredXp) * 100, 100)
    const newPercent = stickerUnlocked ? 100 : Math.min((newLevelXp / requiredXp) * 100, 100)

    return (
        <GameLayout title={title} score={score}>
            {giftOpened && <BalloonRain />}

            <div className="flex flex-col items-center justify-center h-full gap-8 max-w-lg mx-auto p-4 z-50">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-slate-100 flex flex-col items-center text-center relative z-50"
                >
                    <h2 className="text-4xl font-baloo font-bold text-sky-500 mb-2">Muito bem!</h2>
                    <p className="text-xl text-slate-600 font-nunito font-bold mb-8">
                        Você ganhou <span className="text-orange-500 text-3xl">+{score} XP</span>
                    </p>

                    {/* Barra de Progresso Avatar */}
                    <div className="w-full mb-8 relative">
                        <div className="h-6 bg-slate-100 rounded-full overflow-hidden border-inner shadow-inner w-full relative">
                            <motion.div
                                initial={{ width: `${oldPercent}%` }}
                                animate={{ width: `${newPercent}%` }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)] relative"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                        </div>
                        <div className="absolute -top-10 -right-6 text-xl bg-slate-50 border-4 border-slate-200 w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-slate-400 shadow-sm z-10 transform rotate-12">
                            {stickerUnlocked ? "🔓" : "🔒"}
                        </div>

                        {/* Avatar */}
                        <motion.div
                            initial={{ left: `${oldPercent}%` }}
                            animate={{ left: `${newPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            className="absolute -top-6 -translate-x-1/2 w-16 h-16 drop-shadow-md z-20 flex items-center justify-center text-5xl"
                        >
                            👦
                        </motion.div>
                    </div>

                    <p className="text-slate-500 font-bold mb-2 font-nunito bg-slate-100 px-4 py-1 rounded-full text-sm">
                        Nível {baseLevel}
                    </p>

                    {/* Unboxing Area */}
                    <div className="min-h-[220px] flex items-center justify-center w-full">
                        <AnimatePresence mode="wait">
                            {stickerUnlocked ? (
                                !giftOpened ? (
                                    <motion.button
                                        key="giftbox"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: [0, -5, 5, -5, 0] }}
                                        transition={{ delay: 2, rotate: { repeat: Infinity, duration: 2, delay: 2.5 } }}
                                        onClick={() => {
                                            setGiftOpened(true)
                                            const audio = new Audio("https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3")
                                            audio.play().catch(() => { })
                                        }}
                                        className="text-8xl drop-shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                                    >
                                        🎁
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        key="sticker-reward"
                                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                        className="relative flex flex-col items-center"
                                    >
                                        <div className="w-48 h-48 bg-slate-50 border-8 border-slate-200 rounded-3xl p-4 shadow-2xl relative overflow-hidden flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-60 animate-shimmer pointer-events-none" style={{ backgroundSize: '200% 100%' }} />
                                            <img src={unlockedSticker?.imageUrl || ""} alt="Figurinha Nova" className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
                                        </div>
                                        <div className="absolute -bottom-5 bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-baloo font-bold text-xl px-8 py-2 rounded-full shadow-lg border-4 border-white transform -rotate-2">
                                            {unlockedSticker?.name || "Nova Figurinha!"}
                                        </div>

                                        <p className="mt-8 text-slate-500 font-bold font-nunito">Ele já está colado no seu Mural!</p>
                                    </motion.div>
                                )
                            ) : (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 2.5 }}
                                    className="text-slate-400 font-nunito font-bold italic"
                                >
                                    Faltam {requiredXp - newLevelXp} XP para a próxima figurinha!
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        className="mt-6 w-full text-2xl h-16 rounded-2xl shadow-lg border-b-4 bg-orange-500 text-white border-orange-600 hover:border-b-0 hover:translate-y-1 active:translate-y-2 transition-all font-baloo"
                        onClick={onPlayAgain}
                    >
                        Jogar de Novo!
                    </button>
                </motion.div>
            </div>
        </GameLayout>
    )
}
