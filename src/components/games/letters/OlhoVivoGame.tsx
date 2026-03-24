"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameLayout } from "@/components/layout/GameLayout"
import { RewardScreen } from "@/components/games/RewardScreen"

const DEFAULT_OBJECTS = [
    { name: "MAÇÃ", emoji: "🍎" },
    { name: "BOLA", emoji: "⚽" },
    { name: "GATO", emoji: "🐱" },
    { name: "PATO", emoji: "🦆" },
    { name: "DADO", emoji: "🎲" },
    { name: "URSO", emoji: "🧸" },
    { name: "CASA", emoji: "🏠" },
    { name: "SOL", emoji: "☀️" },
    { name: "LÁPIS", emoji: "✏️" },
    { name: "FLOR", emoji: "🌸" },
    { name: "CARRO", emoji: "🚗" },
    { name: "LUA", emoji: "🌙" },
]

interface Asset {
    name: string
    imageUrl: string
}

interface SceneObject {
    id: number
    name: string
    emoji?: string
    imageUrl?: string
    x: number
    y: number
    rotation: number
    isTarget: boolean
}

interface OlhoVivoGameProps {
    childId: string
    initialXp: number
    assets?: Asset[]
    backgroundUrl?: string
}

// Heurística de gênero em português: palavras terminadas em "a" (exceto algumas) são femininas
function artigoPortugues(name: string): string {
    const n = name.trim().toUpperCase()
    // Exceções masculinas comuns terminadas em "a"
    const masculinas = ["DIA", "MAPA", "CINEMA", "PROBLEMA", "SISTEMA", "TEMA", "SOFÁ", "PANDA"]
    if (masculinas.includes(n)) return "o"
    // Palavras terminadas em "a" ou "ã" são femininas
    if (n.endsWith("A") || n.endsWith("Ã")) return "a"
    return "o"
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export function OlhoVivoGame({ childId, initialXp, assets = [], backgroundUrl }: OlhoVivoGameProps) {
    const [score, setScore] = useState(0)
    const [round, setRound] = useState(1)
    const [gameOver, setGameOver] = useState(false)
    const [targetName, setTargetName] = useState("")
    const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([])
    const [foundIds, setFoundIds] = useState<number[]>([])
    const [wrongIds, setWrongIds] = useState<number[]>([])
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)
    const [rewardData, setRewardData] = useState<any>(null)
    const [levelData, setLevelData] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [usedTargets, setUsedTargets] = useState<Set<string>>(new Set())

    const assetsRef = useRef(assets)
    assetsRef.current = assets

    useEffect(() => {
        if (gameOver) return
        startRound()
    }, [round, gameOver])

    const startRound = () => {
        const currentAssets = assetsRef.current

        // Build pool: cada item é único por nome
        const seen = new Set<string>()
        const pool: Array<{ name: string; emoji?: string; imageUrl?: string }> = []

        for (const a of currentAssets) {
            const key = a.name.toUpperCase()
            if (!seen.has(key)) {
                seen.add(key)
                pool.push({ name: key, imageUrl: a.imageUrl })
            }
        }
        for (const d of DEFAULT_OBJECTS) {
            if (!seen.has(d.name)) {
                seen.add(d.name)
                pool.push({ name: d.name, emoji: d.emoji })
            }
        }

        // Escolhe alvo não usado
        const available = pool.filter(p => !usedTargets.has(p.name))
        const targetPool = available.length > 0 ? available : pool
        const target = targetPool[Math.floor(Math.random() * targetPool.length)]

        setTargetName(target.name)
        setFoundIds([])
        setWrongIds([])
        setUsedTargets(prev => new Set(prev).add(target.name))

        // Distrações: itens diferentes do alvo, sem repetir
        const distractorPool = shuffle(pool.filter(p => p.name !== target.name))
        const distractors = distractorPool.slice(0, 11)

        // Grid 3x4 centralizado
        const COLS = 3
        const ROWS = 4

        const slots = shuffle(
            Array.from({ length: COLS * ROWS }, (_, i) => ({
                x: ((i % COLS) + 0.5) * (100 / COLS),
                y: ((Math.floor(i / COLS)) + 0.5) * (100 / ROWS),
            }))
        )

        const objects: SceneObject[] = []

        // Alvo
        objects.push({
            id: 0,
            name: target.name,
            emoji: target.emoji,
            imageUrl: target.imageUrl,
            x: slots[0].x,
            y: slots[0].y,
            rotation: Math.random() * 20 - 10,
            isTarget: true,
        })

        // Distrações
        for (let i = 0; i < distractors.length; i++) {
            const d = distractors[i]
            objects.push({
                id: i + 1,
                name: d.name,
                emoji: d.emoji,
                imageUrl: d.imageUrl,
                x: slots[i + 1].x,
                y: slots[i + 1].y,
                rotation: Math.random() * 30 - 15,
                isTarget: false,
            })
        }

        setSceneObjects(shuffle(objects))
        playTargetAudio(target.name)
    }

    const playTargetAudio = async (name: string) => {
        if (isPlayingAudio) return
        setIsPlayingAudio(true)
        window.speechSynthesis.cancel()
        const artigo = artigoPortugues(name)
        const msg = new SpeechSynthesisUtterance(`Ache ${artigo} ${name}`)
        msg.lang = "pt-BR"
        msg.rate = 0.8
        msg.onend = () => setIsPlayingAudio(false)
        window.speechSynthesis.speak(msg)
        // Fallback timeout
        setTimeout(() => setIsPlayingAudio(false), 3000)
    }

    const handleObjectClick = async (obj: SceneObject) => {
        if (wrongIds.includes(obj.id) || foundIds.includes(obj.id)) return

        if (obj.isTarget) {
            setFoundIds(prev => [...prev, obj.id])
            setScore(s => s + 20)

            const winAudio = new Audio("https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3")
            winAudio.play().catch(() => { })

            setTimeout(async () => {
                if (round >= 5) {
                    await finishGame(score + 20)
                } else {
                    setRound(r => r + 1)
                }
            }, 1200)
        } else {
            setScore(s => Math.max(0, s - 2))
            setWrongIds(prev => [...prev, obj.id])
            const errorAudio = new Audio("https://cdn.freesound.org/previews/142/142608_1840003-lq.mp3")
            errorAudio.play().catch(() => { })
        }
    }

    const finishGame = async (finalScore: number) => {
        setIsSaving(true)
        setGameOver(true)
        try {
            const res = await fetch("/api/games/finish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ childId, score: finalScore, gameType: "olho-vivo" })
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
                title="Olho Vivo"
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
                    setUsedTargets(new Set())
                }}
            />
        )
    }

    return (
        <GameLayout title="Olho Vivo" score={score}>
            {/* Background */}
            {backgroundUrl ? (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundUrl})` }}
                />
            ) : (
                <div className="absolute inset-0 bg-blue-50/50" />
            )}

            <div className="flex flex-col items-center w-full h-full max-w-5xl mx-auto py-3 px-3 absolute inset-0 z-10">
                {/* Header UI */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white p-4 px-8 rounded-[2rem] shadow-xl border-4 border-amber-200 flex flex-col items-center gap-1 z-50 shrink-0"
                >
                    <h2 className="font-baloo text-2xl text-slate-700 text-center">
                        Onde está {artigoPortugues(targetName)} <span className="text-amber-500 font-black">{targetName}</span>?
                    </h2>
                    <button
                        onClick={() => playTargetAudio(targetName)}
                        className="text-xs font-bold text-amber-400 uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        🔊 Ouvir comando
                    </button>
                </motion.div>

                {/* Search Area */}
                <div className="relative flex-1 w-full bg-white/70 backdrop-blur-md rounded-[3rem] shadow-inner border-4 border-white overflow-hidden cursor-crosshair mt-3">
                    <AnimatePresence>
                        {sceneObjects.map((obj) => (
                            <motion.button
                                key={`${round}-${obj.id}`}
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: 1,
                                    rotate: obj.rotation,
                                    opacity: wrongIds.includes(obj.id) ? 0.2 : 1,
                                    filter: wrongIds.includes(obj.id) ? 'grayscale(1)' : 'none'
                                }}
                                whileHover={!wrongIds.includes(obj.id) ? { scale: 1.15 } : {}}
                                whileTap={!wrongIds.includes(obj.id) ? { scale: 0.9 } : {}}
                                onClick={() => handleObjectClick(obj)}
                                disabled={wrongIds.includes(obj.id) || foundIds.includes(obj.id)}
                                className="absolute cursor-pointer select-none p-1 flex items-center justify-center"
                                style={{
                                    left: `${obj.x}%`,
                                    top: `${obj.y}%`,
                                    width: 90,
                                    height: 90,
                                    marginLeft: -45,
                                    marginTop: -45,
                                }}
                            >
                                {obj.imageUrl ? (
                                    <img src={obj.imageUrl} alt={obj.name} className="w-full h-full object-contain drop-shadow-md" />
                                ) : (
                                    <span className="text-5xl drop-shadow-md">{obj.emoji}</span>
                                )}

                                {wrongIds.includes(obj.id) && (
                                    <div className="absolute inset-0 flex items-center justify-center text-red-500 text-4xl">
                                        ❌
                                    </div>
                                )}
                                {foundIds.includes(obj.id) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 flex items-center justify-center text-green-500 text-5xl pointer-events-none"
                                    >
                                        ✨
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </GameLayout>
    )
}
