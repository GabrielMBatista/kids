"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameLayout } from "@/components/layout/GameLayout"
import { RewardScreen } from "@/components/games/RewardScreen"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const FISH_COLORS = ["#fb923c", "#38bdf8", "#fb7185", "#facc15", "#34d399"]

// 4 swim lanes — well within the visible area
const LANES = [15, 38, 61, 84]
const MAX_FISH = 4

interface Fish {
    id: number
    letter: string
    color: string
    imageUrl?: string
    x: number
    lane: number  // lane index (0-4)
    speed: number
    direction: number
}

interface PescaLetrasGameProps {
    childId: string
    initialXp: number
    fishAssets?: string[]
    backgroundUrl?: string
}

export function PescaLetrasGame({ childId, initialXp, fishAssets = [], backgroundUrl }: PescaLetrasGameProps) {
    const [score, setScore] = useState(0)
    const [round, setRound] = useState(1)
    const [gameOver, setGameOver] = useState(false)
    const [targetLetter, setTargetLetter] = useState("")
    const [fishes, setFishes] = useState<Fish[]>([])
    const [wrongGuesses, setWrongGuesses] = useState<number[]>([])
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)
    const [rewardData, setRewardData] = useState<any>(null)
    const [levelData, setLevelData] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)

    const bubbles = useMemo(() => Array.from({ length: 14 }, () => ({
        left: `${Math.random() * 100}%`,
        width: 16 + Math.random() * 30,
        height: 16 + Math.random() * 30,
        duration: 8 + Math.random() * 8,
        delay: Math.random() * 8,
    })), [])

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const fishIdCounter = useRef(0)
    const fishAssetsRef = useRef(fishAssets)
    fishAssetsRef.current = fishAssets
    const targetRef = useRef("")

    useEffect(() => {
        audioRef.current = new Audio()
    }, [])

    // Round change — just swap target letter, don't reset fish
    useEffect(() => {
        if (gameOver) return

        const target = LETTERS[Math.floor(Math.random() * LETTERS.length)]
        setTargetLetter(target)
        targetRef.current = target
        setWrongGuesses([])

        // Ensure at least 1 fish has the target letter
        setFishes(prev => {
            const hasTarget = prev.some(f => f.letter === target)
            if (!hasTarget && prev.length > 0) {
                const idx = Math.floor(Math.random() * prev.length)
                return prev.map((f, i) => i === idx ? { ...f, letter: target } : f)
            }
            return prev
        })

        setTimeout(() => playLetterAudio(target), 500)
    }, [round, gameOver])

    // Spawn + movement — runs once, independent of round
    useEffect(() => {
        if (gameOver) return

        const spawnInterval = setInterval(() => {
            setFishes(prev => {
                if (prev.length >= MAX_FISH) return prev

                // Find a free lane
                const occupiedLanes = new Set(prev.map(f => f.lane))
                const freeLanes = LANES.map((_, i) => i).filter(i => !occupiedLanes.has(i))
                if (freeLanes.length === 0) return prev

                const laneIdx = freeLanes[Math.floor(Math.random() * freeLanes.length)]
                const id = fishIdCounter.current++
                const direction = Math.random() > 0.5 ? 1 : -1
                const target = targetRef.current
                const needsTarget = !prev.some(f => f.letter === target)
                const isTarget = needsTarget || Math.random() > 0.6
                const assets = fishAssetsRef.current

                const newFish: Fish = {
                    id,
                    letter: isTarget ? target : LETTERS[Math.floor(Math.random() * LETTERS.length)],
                    color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
                    imageUrl: assets.length > 0 ? assets[Math.floor(Math.random() * assets.length)] : undefined,
                    x: direction === 1 ? -8 : 108,
                    lane: laneIdx,
                    speed: 0.12 + Math.random() * 0.18,
                    direction,
                }
                return [...prev, newFish]
            })
        }, 1800)

        const moveInterval = setInterval(() => {
            setFishes(prev => prev
                .map(f => ({ ...f, x: f.x + (f.direction * f.speed) }))
                .filter(f => f.x > -10 && f.x < 110)
            )
        }, 50)

        return () => {
            clearInterval(spawnInterval)
            clearInterval(moveInterval)
        }
    }, [gameOver])

    const playLetterAudio = async (letter: string) => {
        if (isPlayingAudio) return
        setIsPlayingAudio(true)
        try {
            const url = `/sounds/letters/${letter.toUpperCase()}.mp3?v=5`
            if (audioRef.current) {
                audioRef.current.src = url
                audioRef.current.playbackRate = 0.8
                await audioRef.current.play().catch(() => { })
            }
        } finally {
            setTimeout(() => setIsPlayingAudio(false), 1500)
        }
    }

    const handleFishClick = async (fish: Fish) => {
        if (fish.letter === targetRef.current) {
            setScore(s => s + 10)
            const winAudio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3")
            winAudio.play().catch(() => { })
            setFishes(prev => prev.filter(f => f.id !== fish.id))

            if (round >= 5) {
                await finishGame(score + 10)
            } else {
                setRound(r => r + 1)
            }
        } else {
            if (wrongGuesses.includes(fish.id)) return
            setScore(s => Math.max(0, s - 2))
            setWrongGuesses(prev => [...prev, fish.id])
            const errorAudio = new Audio("https://cdn.freesound.org/previews/142/142608_1840003-lq.mp3")
            errorAudio.play().catch(() => { })
            playLetterAudio(targetRef.current)
        }
    }

    const finishGame = async (finalScore: number) => {
        setIsSaving(true)
        setGameOver(true)
        try {
            const res = await fetch("/api/games/finish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ childId, score: finalScore, gameType: "pesca-letras" })
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
                title="Pesca Letras"
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
        <GameLayout title="Pesca Letras" score={score}>
            {/* Background */}
            {backgroundUrl ? (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundUrl})` }}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col overflow-hidden">
                    {/* Sky */}
                    <div className="h-1/3 bg-gradient-to-b from-sky-300 to-sky-100 relative">
                        <div className="absolute top-6 right-10 w-16 h-16 bg-yellow-300 rounded-full shadow-[0_0_40px_rgba(253,224,71,0.5)] border-4 border-yellow-200" />
                    </div>
                    {/* Ocean */}
                    <div className="flex-1 bg-gradient-to-b from-blue-400 to-blue-800" />
                </div>
            )}

            {/* Waves */}
            {!backgroundUrl && (
                <div className="absolute top-1/3 left-0 w-full h-6 overflow-hidden z-[1]">
                    <motion.div
                        animate={{ x: [-100, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="flex"
                    >
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-16 h-16 bg-blue-300/40 rounded-full -mt-8" />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Game UI */}
            <div className="flex flex-col items-center w-full h-full absolute inset-0 z-10 pt-2">
                {/* Instruction */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playLetterAudio(targetLetter)}
                    disabled={isPlayingAudio}
                    className="bg-white p-3 px-8 rounded-2xl shadow-2xl border-4 border-blue-200 flex flex-col items-center gap-0.5 z-50 shrink-0"
                >
                    <span className="text-2xl text-blue-600 font-baloo font-bold">Pesque o {targetLetter}</span>
                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Toque para ouvir</span>
                </motion.button>

                {/* Ocean Area */}
                <div className="flex-1 w-full relative overflow-hidden mt-1">
                    <AnimatePresence>
                        {fishes.map((fish) => {
                            const isWrong = wrongGuesses.includes(fish.id)
                            const y = LANES[fish.lane]
                            return (
                                <motion.button
                                    key={fish.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: isWrong ? 0.3 : 1,
                                        scale: 1,
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => handleFishClick(fish)}
                                    disabled={isWrong}
                                    className="absolute cursor-pointer select-none"
                                    style={{
                                        left: `${fish.x}%`,
                                        top: `${y}%`,
                                        width: 160,
                                        height: 180,
                                        marginLeft: -80,
                                        marginTop: -90,
                                    }}
                                >
                                    {/* Letter bubble above fish */}
                                    <div className="flex justify-center mb-1">
                                        <div className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border-2 border-blue-200">
                                            <span className="font-baloo font-bold text-xl text-blue-700">
                                                {fish.letter}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fish body */}
                                    <div
                                        className="w-32 h-28 mx-auto relative"
                                        style={{ transform: fish.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)' }}
                                    >
                                        {fish.imageUrl ? (
                                            <img
                                                src={fish.imageUrl}
                                                alt="Fish"
                                                className="w-full h-full object-contain drop-shadow-lg"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full relative"
                                                style={{
                                                    backgroundColor: fish.color,
                                                    borderRadius: '50% 20% 50% 50%',
                                                    border: '3px solid rgba(255,255,255,0.4)',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                                }}
                                            >
                                                {/* Eye */}
                                                <div className="absolute top-[22%] right-[22%] w-2.5 h-2.5 bg-white rounded-full">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full" />
                                                </div>
                                                {/* Tail */}
                                                <div
                                                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rotate-45"
                                                    style={{ backgroundColor: fish.color, borderRadius: '3px' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Error feedback */}
                                    {isWrong && (
                                        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-4xl z-20">
                                            ❌
                                        </div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </AnimatePresence>

                    {/* Bubbles */}
                    {bubbles.map((b, i) => (
                        <motion.div
                            key={i}
                            className="absolute bg-white/50 rounded-full border border-white/60 shadow-sm"
                            style={{
                                bottom: -20,
                                left: b.left,
                                width: b.width,
                                height: b.height
                            }}
                            animate={{ y: -1000 }}
                            transition={{
                                duration: b.duration,
                                repeat: Infinity,
                                delay: b.delay
                            }}
                        />
                    ))}
                </div>
            </div>
        </GameLayout>
    )
}
