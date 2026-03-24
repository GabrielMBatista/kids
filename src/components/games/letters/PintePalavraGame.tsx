"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameLayout } from "@/components/layout/GameLayout"
import { RewardScreen } from "@/components/games/RewardScreen"

const GAME_DATA = [
    { word: "GATO", missing: [1, 3], image: "🐱" },
    { word: "BOLA", missing: [1, 3], image: "⚽" },
    { word: "CASA", missing: [1, 3], image: "🏠" },
    { word: "PATO", missing: [1, 3], image: "🦆" },
    { word: "SOL", missing: [1], image: "☀️" },
    { word: "LUA", missing: [1, 2], image: "🌙" },
    { word: "UVA", missing: [0, 2], image: "🍇" },
    { word: "SAPO", missing: [1, 3], image: "🐸" },
    { word: "MOTO", missing: [1, 3], image: "🏍️" },
    { word: "FOGO", missing: [1, 3], image: "🔥" },
    { word: "GELO", missing: [1, 3], image: "🧊" },
    { word: "CACO", missing: [1, 3], image: "🥥" }, // Usando coco para Caco
]

const VOWELS = ["A", "E", "I", "O", "U"]

interface PintePalavraGameProps {
    childId: string
    initialXp: number
}

export function PintePalavraGame({ childId, initialXp }: PintePalavraGameProps) {
    const [score, setScore] = useState(0)
    const [round, setRound] = useState(1)
    const [gameOver, setGameOver] = useState(false)
    const [currentChallenge, setCurrentChallenge] = useState<any>(null)
    const [slots, setSlots] = useState<string[]>([])
    const [isColored, setIsColored] = useState(false)
    const [rewardData, setRewardData] = useState<any>(null)
    const [levelData, setLevelData] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [usedIndices, setUsedIndices] = useState<number[]>([])

    useEffect(() => {
        if (gameOver) return
        startRound()
    }, [round, gameOver])

    const startRound = () => {
        // Filtrar índices não usados
        const availableIndices = GAME_DATA
            .map((_, i) => i)
            .filter(i => !usedIndices.includes(i))

        // Se acabarem as palavras novas, reseta
        const indicesToUse = availableIndices.length > 0 ? availableIndices : GAME_DATA.map((_, i) => i)

        const randomIndex = indicesToUse[Math.floor(Math.random() * indicesToUse.length)]
        const challenge = GAME_DATA[randomIndex]

        setCurrentChallenge(challenge)
        setUsedIndices(prev => availableIndices.length > 0 ? [...prev, randomIndex] : [randomIndex])

        setSlots(challenge.word.split("").map((char: string, i: number) =>
            challenge.missing.includes(i) ? "" : char
        ))
        setIsColored(false)
    }

    const handleDrop = (letter: string, index: number) => {
        if (currentChallenge.word[index] === letter) {
            const newSlots = [...slots]
            newSlots[index] = letter
            setSlots(newSlots)

            const successAudio = new Audio("https://cdn.freesound.org/previews/511/511448_10332306-lq.mp3")
            successAudio.play().catch(() => { })

            // Verifica se completou a palavra
            if (newSlots.join("") === currentChallenge.word) {
                setIsColored(true)
                setScore(s => s + 15)

                const winAudio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3")
                winAudio.play().catch(() => { })

                setTimeout(async () => {
                    if (round >= 5) {
                        await finishGame(score + 15)
                    } else {
                        setRound(r => r + 1)
                    }
                }, 2000)
            }
        } else {
            const errorAudio = new Audio("https://cdn.freesound.org/previews/142/142608_1840003-lq.mp3")
            errorAudio.play().catch(() => { })
            setScore(s => Math.max(0, s - 2))
        }
    }

    const finishGame = async (finalScore: number) => {
        setIsSaving(true)
        setGameOver(true)
        try {
            const res = await fetch("/api/games/finish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ childId, score: finalScore, gameType: "pinte-palavra" })
            })
            const data = await res.json()
            setRewardData(data.unlockedSticker)
            setLevelData({ oldLevelInfo: data.oldLevelInfo, newLevelInfo: data.newLevelInfo })
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    if (gameOver && levelData) {
        return (
            <RewardScreen
                title="Pinte a Palavra"
                score={score}
                baseLevel={levelData.oldLevelInfo.level}
                newLevel={levelData.newLevelInfo.level}
                baseLevelXp={levelData.oldLevelInfo.xpInCurrentLevel}
                newLevelXp={levelData.newLevelInfo.xpInCurrentLevel}
                requiredXp={levelData.newLevelInfo.requiredForNextLevel}
                unlockedSticker={rewardData}
                onPlayAgain={() => {
                    setScore(0)
                    setRound(1)
                    setGameOver(false)
                    setRewardData(null)
                    setLevelData(null)
                }}
            />
        )
    }

    return (
        <GameLayout title="Pinte a Palavra" score={score}>
            <div className="fixed inset-0 bg-pink-50 -z-10" />

            <div className="flex flex-col items-center gap-12 w-full max-w-4xl p-4">
                {/* Image Area */}
                <motion.div
                    animate={{
                        scale: isColored ? 1.2 : 1,
                        filter: isColored ? "grayscale(0%)" : "grayscale(100%)",
                    }}
                    className={`text-[12rem] md:text-[16rem] transition-all duration-1000 ${isColored ? 'drop-shadow-2xl' : 'opacity-40'}`}
                >
                    {currentChallenge?.image}
                </motion.div>

                {/* Word Slots */}
                <div className="flex gap-2 md:gap-4">
                    {slots.map((char, i) => (
                        <div
                            key={i}
                            className={`w-16 h-20 md:w-20 md:h-24 rounded-2xl flex items-center justify-center text-4xl font-baloo font-bold shadow-lg border-4 
                                ${char ? 'bg-white border-pink-400 text-pink-600' : 'bg-pink-100 border-dashed border-pink-300'}
                            `}
                        >
                            {char}
                        </div>
                    ))}
                </div>

                {/* Vowels Dock */}
                <div className="flex gap-3 md:gap-6 bg-white/50 p-6 rounded-[3rem] backdrop-blur-md border-4 border-white">
                    {VOWELS.map((vowel) => (
                        <motion.button
                            key={vowel}
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={1}
                            onDragEnd={(_, info) => {
                                // Lógica manual de drop baseada na posição
                                // Para simplificar, vamos verificar se soltou perto de algum slot vazio
                                const elements = document.elementsFromPoint(info.point.x, info.point.y)
                                const slotIndex = slots.findIndex((s, idx) => !s && currentChallenge.missing.includes(idx))

                                // Simplificação: se acertar a letra, a gente auto-atribui ao primeiro slot que precisa dessa letra
                                const targetIdx = currentChallenge.word.split("").indexOf(vowel, slots.indexOf("") === -1 ? 0 : slots.indexOf(""))

                                // Na vida real usaríamos uma lib de DND, mas aqui vamos simular o clique se o drag terminar "perto"
                                // ou apenas usar clique se for mobile
                                handleDrop(vowel, targetIdx !== -1 ? targetIdx : -1)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                // Fallback para clique
                                const emptyIdx = slots.findIndex((s, idx) => !s && currentChallenge.missing.includes(idx) && currentChallenge.word[idx] === vowel)
                                if (emptyIdx !== -1) {
                                    handleDrop(vowel, emptyIdx)
                                } else {
                                    const errorAudio = new Audio("https://cdn.freesound.org/previews/142/142608_1840003-lq.mp3")
                                    errorAudio.play().catch(() => { })
                                }
                            }}
                            className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-3xl shadow-md border-4 border-pink-200 text-3xl font-baloo font-bold text-pink-500 flex items-center justify-center cursor-grab active:cursor-grabbing"
                        >
                            {vowel}
                        </motion.button>
                    ))}
                </div>
            </div>
        </GameLayout>
    )
}
