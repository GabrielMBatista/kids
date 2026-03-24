"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameLayout } from "@/components/layout/GameLayout"
import { Button } from "@/components/ui/Button"
import { RewardScreen } from "../RewardScreen"

// Em produção viria do DB/config
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const COLOR_CLASSES = [
    "bg-red-50 text-red-500 border-red-200 shadow-[0_8px_0_rgb(254,202,202)] hover:shadow-[0_4px_0_rgb(254,202,202)] text-shadow-sm",
    "bg-sky-50 text-sky-500 border-sky-200 shadow-[0_8px_0_rgb(186,230,253)] hover:shadow-[0_4px_0_rgb(186,230,253)] text-shadow-sm",
    "bg-green-50 text-green-500 border-green-200 shadow-[0_8px_0_rgb(187,247,208)] hover:shadow-[0_4px_0_rgb(187,247,208)] text-shadow-sm",
    "bg-purple-50 text-purple-500 border-purple-200 shadow-[0_8px_0_rgb(233,213,255)] hover:shadow-[0_4px_0_rgb(233,213,255)] text-shadow-sm"
]

export function LetterTapGame({ childId, initialXp }: { childId?: string, initialXp?: number }) {
    const [score, setScore] = useState(0)

    const [targetLetter, setTargetLetter] = useState("A")
    const [options, setOptions] = useState<string[]>([])
    const [round, setRound] = useState(1)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [colorMapping, setColorMapping] = useState<number[]>([0, 1, 2, 3])
    const [rewardData, setRewardData] = useState<any>(null)
    const [levelData, setLevelData] = useState<any>(null)
    const [wrongGuesses, setWrongGuesses] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)


    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Inicia round e gera opções
    useEffect(() => {
        if (gameOver) return
        const target = LETTERS[Math.floor(Math.random() * LETTERS.length)]
        setTargetLetter(target)

        // Pega mais 3 letras erradas
        const others = LETTERS.filter(l => l !== target)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)

        // Mistura a certa com as erradas
        setOptions([target, ...others].sort(() => Math.random() - 0.5))
        setColorMapping([0, 1, 2, 3].sort(() => Math.random() - 0.5))
        setWrongGuesses([])

        // Pequena pausa antes de falar a letra inicial para a criança se situar
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
            playLetterAudio(target)
        }, 500)

        // Cleanup function
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [round, gameOver])

    const playLetterAudio = async (letter: string) => {
        if (isPlayingAudio) return
        setIsPlayingAudio(true)

        try {
            // Adicionamos ?v=5 para as novas correções fonéticas (O vs U)
            const audioUrl = `/sounds/letters/${letter.toUpperCase()}.mp3?v=5`

            if (audioRef.current) {
                audioRef.current.src = audioUrl
                audioRef.current.playbackRate = 0.75 // Deixa a fala mais lenta e didática
                audioRef.current.play().catch(() => { })
            } else {
                const audio = new Audio(audioUrl)
                audio.playbackRate = 0.75 // Deixa a fala mais lenta e didática
                audioRef.current = audio
                audio.play().catch(() => { })
            }
        } catch (err) {
            console.error("Audio error", err)
        } finally {
            // Aumenta o tempo de bloqueio de áudio por causa da fala mais lenta
            setTimeout(() => setIsPlayingAudio(false), 1500)
        }
    }

    const handleTap = (letter: string) => {
        if (isTransitioning) return

        if (letter === targetLetter) {
            // Acertou
            setScore(s => s + 10)
            const winAudio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3")
            winAudio.play().catch(() => { })

            setIsTransitioning(true)

            // Pausa dramática e didática antes de mudar de tela
            setTimeout(async () => {
                if (round >= 5) {
                    setIsSaving(true)
                    setGameOver(true) // Fim de jogo em 5 rodadas para o MVP

                    if (childId) {
                        try {
                            const res = await fetch("/api/games/finish", {
                                method: "POST",
                                body: JSON.stringify({ childId, score: score + 10, gameType: "letter-tap" })
                            })
                            const data = await res.json()
                            if (data.unlockedSticker) {
                                setRewardData(data.unlockedSticker)
                            }
                            if (data.child) {
                                setLevelData(data)
                            }
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    setIsSaving(false)
                } else {
                    setRound(r => r + 1)
                }
                setIsTransitioning(false)
            }, 1500)


        } else {
            // Errou
            if (wrongGuesses.includes(letter)) return // Já clicou antes

            const errorAudio = new Audio("https://cdn.freesound.org/previews/142/142608_1840003-lq.mp3")
            errorAudio.play().catch(() => { })

            // Penalidade
            setScore(s => Math.max(0, s - 2))
            setWrongGuesses(prev => [...prev, letter])

            // Toca o som da letra certa novamente para reforço
            playLetterAudio(targetLetter)
        }
    }

    if (gameOver) {
        if (isSaving || !levelData) {
            return (
                <GameLayout title="Que Letra É Essa?" score={score}>
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="animate-spin text-6xl mb-4">🦊</div>
                        <h2 className="font-baloo text-2xl text-sky-600 font-bold animate-pulse">Calculando seus Pontos...</h2>
                    </div>
                </GameLayout>
            )
        }

        return (
            <RewardScreen
                title="Que Letra É Essa?"
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
                    setRewardData(null)
                    setLevelData(null)
                    setGameOver(false)
                }}
            />
        )
    }


    return (
        <GameLayout title="Que Letra É Essa?" score={score}>
            <div className="flex flex-col items-center justify-center w-full max-w-2xl">

                {/* Helper Character / Button to replay audio */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playLetterAudio(targetLetter)}
                    disabled={isPlayingAudio}
                    className="bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-slate-200 mb-12 flex flex-col items-center gap-4 cursor-pointer"
                >
                    <span className="text-6xl">🦊</span>
                    <span className="font-baloo font-bold text-xl text-sky-600 bg-sky-100 px-6 py-2 rounded-full">
                        Toque para ouvir
                    </span>
                </motion.button>

                {/* Floating Letters */}
                <div className="grid grid-cols-2 gap-6 w-full px-4">
                    <AnimatePresence mode="popLayout">
                        {options.map((letter, index) => (
                            <motion.button
                                key={`${round}-${letter}`}
                                initial={{ scale: 0, rotate: Math.random() * 45 - 20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleTap(letter)}
                                disabled={wrongGuesses.includes(letter)}
                                className={`aspect-square rounded-[2rem] hover:translate-y-1 active:translate-y-2 active:shadow-none border-4 flex items-center justify-center text-6xl md:text-8xl font-baloo font-bold transition-all select-none ${COLOR_CLASSES[colorMapping[index]]} ${wrongGuesses.includes(letter) ? 'opacity-10 grayscale pointer-events-none' : ''}`}
                            >
                                {letter}
                            </motion.button>

                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </GameLayout>
    )
}
