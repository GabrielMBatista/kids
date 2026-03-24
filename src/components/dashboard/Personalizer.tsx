"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import { Toast } from "@/components/ui/Toast"

// ─── Config ────────────────────────────────────────────────────────────────────

interface GameConfig {
    id: string
    name: string
    icon: string
    suggestions: string[]
}

const GAMES: GameConfig[] = [
    {
        id: "pesca-letras",
        name: "Pesca Letras",
        icon: "🐠",
        suggestions: ["Nemo", "Tubarão", "Polvo", "Baleia", "Peixe Palhaço", "Caranguejo", "Tartaruga", "Cavalo Marinho"]
    },
    {
        id: "olho-vivo",
        name: "Olho Vivo",
        icon: "🔍",
        suggestions: ["Bola", "Carrinho", "Urso", "Boneca", "Maçã", "Pato de Borracha", "Estrela", "Coração", "Avião"]
    }
]

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SavedAsset {
    id: string
    name: string
    imageUrl: string
}

interface PreviewItem {
    url: string
    name: string
    selected: boolean
}

type Phase = "idle" | "generating" | "review"

// ─── Component ─────────────────────────────────────────────────────────────────

export function Personalizer() {
    const [game, setGame] = useState(GAMES[0])

    // DB state
    const [assets, setAssets] = useState<SavedAsset[]>([])
    const [bg, setBg] = useState<SavedAsset | null>(null)
    const [loadingAssets, setLoadingAssets] = useState(false)

    // Generation state
    const [phase, setPhase] = useState<Phase>("idle")
    const [progress, setProgress] = useState("")
    const [bgPreview, setBgPreview] = useState<string | null>(null)
    const [previews, setPreviews] = useState<PreviewItem[]>([])

    // Action state
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [toast, setToast] = useState({ show: false, msg: "" })

    // ─── Fetch current assets ──────────────────────────────────────────────────

    const fetchAssets = useCallback(async () => {
        setLoadingAssets(true)
        try {
            const res = await fetch(`/api/admin/stickers?gameId=${game.id}`)
            const data = await res.json()
            setAssets(data.assets ?? [])
            setBg(data.background ?? null)
        } finally {
            setLoadingAssets(false)
        }
    }, [game.id])

    useEffect(() => {
        fetchAssets()
        setPhase("idle")
        setBgPreview(null)
        setPreviews([])
    }, [fetchAssets])

    // ─── Auto-generate full theme ──────────────────────────────────────────────

    const handleAutoGenerate = async () => {
        setPhase("generating")
        setBgPreview(null)
        setPreviews([])

        try {
            // 1) Generate AI background
            setProgress("Gerando cenário com IA...")
            const bgRes = await fetch("/api/admin/stickers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "generate-bg", gameId: game.id, prompt: game.name })
            })
            const bgData = await bgRes.json()
            if (bgData.preview) setBgPreview(bgData.preview.url)

            // 2) Search GIPHY for each suggestion in parallel
            setProgress("Buscando personagens...")
            const results = await Promise.allSettled(
                game.suggestions.map(async (tag) => {
                    const res = await fetch("/api/admin/stickers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "preview", source: "GIPHY", query: tag })
                    })
                    const data = await res.json()
                    if (data.previews?.[0]) {
                        return { url: data.previews[0].url, name: tag, selected: true } as PreviewItem
                    }
                    return null
                })
            )

            setPreviews(
                results
                    .filter((r): r is PromiseFulfilledResult<PreviewItem | null> => r.status === "fulfilled")
                    .map(r => r.value)
                    .filter((v): v is PreviewItem => v !== null)
            )

            setPhase("review")
        } catch (err) {
            console.error(err)
            setToast({ show: true, msg: "Erro ao gerar tema" })
            setPhase("idle")
        } finally {
            setProgress("")
        }
    }

    // ─── Generate background only ──────────────────────────────────────────────

    const handleGenerateBgOnly = async () => {
        setPhase("generating")
        setPreviews([])
        setBgPreview(null)
        setProgress("Gerando novo cenário...")

        try {
            const res = await fetch("/api/admin/stickers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "generate-bg", gameId: game.id, prompt: game.name })
            })
            const data = await res.json()
            if (data.preview) setBgPreview(data.preview.url)
            setPhase("review")
        } catch (err) {
            console.error(err)
            setToast({ show: true, msg: "Erro ao gerar fundo" })
            setPhase("idle")
        } finally {
            setProgress("")
        }
    }

    // ─── Manual search single tag ──────────────────────────────────────────────

    const handleSearchTag = async (tag: string) => {
        setPhase("generating")
        setBgPreview(null)
        setPreviews([])
        setProgress(`Buscando "${tag}"...`)

        try {
            const res = await fetch("/api/admin/stickers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "preview", source: "GIPHY", query: tag })
            })
            const data = await res.json()
            setPreviews(
                (data.previews ?? []).slice(0, 4).map((p: any) => ({
                    url: p.url,
                    name: tag,
                    selected: true,
                }))
            )
            setPhase("review")
        } catch (err) {
            console.error(err)
            setPhase("idle")
        } finally {
            setProgress("")
        }
    }

    // ─── Save selected previews ────────────────────────────────────────────────

    const handleSaveAll = async () => {
        setSaving(true)
        try {
            const promises: Promise<any>[] = []

            if (bgPreview) {
                promises.push(
                    fetch("/api/admin/stickers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "save",
                            source: "GEMINI",
                            rarity: "LEGENDARY",
                            name: `Fundo ${game.name}`,
                            imageUrl: bgPreview,
                            query: game.name,
                            album: `game:${game.id}:bg`
                        })
                    })
                )
            }

            for (const item of previews.filter(p => p.selected)) {
                promises.push(
                    fetch("/api/admin/stickers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            action: "save",
                            source: "GIPHY",
                            rarity: "COMMON",
                            name: item.name,
                            imageUrl: item.url,
                            query: item.name,
                            album: `game:${game.id}`
                        })
                    })
                )
            }

            await Promise.all(promises)

            const count = previews.filter(p => p.selected).length
            setToast({ show: true, msg: `Tema atualizado! ${bgPreview ? "1 fundo + " : ""}${count} personagens salvos.` })
            setPhase("idle")
            setBgPreview(null)
            setPreviews([])
            fetchAssets()
        } catch (err) {
            console.error(err)
            setToast({ show: true, msg: "Erro ao salvar" })
        } finally {
            setSaving(false)
        }
    }

    // ─── Delete single asset ───────────────────────────────────────────────────

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await fetch("/api/admin/stickers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", id })
            })
            setAssets(prev => prev.filter(a => a.id !== id))
            if (bg?.id === id) setBg(null)
        } finally {
            setDeletingId(null)
        }
    }

    // ─── Toggle preview selection ──────────────────────────────────────────────

    const togglePreview = (i: number) => {
        setPreviews(prev => prev.map((p, idx) => idx === i ? { ...p, selected: !p.selected } : p))
    }

    const cancelReview = () => {
        setPhase("idle")
        setBgPreview(null)
        setPreviews([])
    }

    const selectedCount = previews.filter(p => p.selected).length + (bgPreview ? 1 : 0)

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mt-8 relative">
            <Toast isVisible={toast.show} message={toast.msg} onClose={() => setToast({ ...toast, show: false })} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="font-baloo text-3xl font-bold text-slate-800">Personalizar Temas</h2>
                    <p className="text-slate-500 font-bold">Gere cenários automaticamente e faça ajustes finos</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start">
                    {GAMES.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setGame(g)}
                            disabled={phase !== "idle"}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${game.id === g.id
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            {g.icon} {g.name}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ─── GENERATING ─────────────────────────────────────────── */}
                {phase === "generating" && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="animate-bounce text-7xl mb-6">🪄</div>
                        <p className="font-baloo text-2xl font-bold text-indigo-400">{progress}</p>
                        <p className="text-sm text-slate-400 mt-2">Isso pode levar alguns segundos...</p>
                    </motion.div>
                )}

                {/* ─── REVIEW ────────────────────────────────────────────── */}
                {phase === "review" && (
                    <motion.div
                        key="review"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* BG Preview */}
                        {bgPreview && (
                            <div>
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Cenário Gerado</h3>
                                <div className="relative rounded-[2rem] overflow-hidden shadow-lg border-2 border-indigo-100">
                                    <img src={bgPreview} alt="Background" className="w-full aspect-video object-cover" />
                                    <button
                                        onClick={() => setBgPreview(null)}
                                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        x
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sticker Previews */}
                        {previews.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">
                                    Personagens ({previews.filter(p => p.selected).length} selecionados)
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {previews.map((p, i) => (
                                        <button
                                            key={i}
                                            onClick={() => togglePreview(i)}
                                            className={`relative p-3 rounded-2xl border-3 transition-all ${p.selected
                                                ? "border-emerald-400 bg-emerald-50 shadow-md"
                                                : "border-slate-200 bg-slate-50 opacity-50"
                                                }`}
                                        >
                                            <img src={p.url} alt={p.name} className="w-full h-24 object-contain" />
                                            <p className="text-xs font-bold text-slate-600 mt-1 truncate">{p.name}</p>
                                            {p.selected && (
                                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                                                    ✓
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Review Actions */}
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                            <Button onClick={cancelReview} variant="secondary" className="rounded-2xl px-8">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveAll}
                                variant="primary"
                                disabled={saving || selectedCount === 0}
                                className="rounded-2xl px-8 flex-1 max-w-xs shadow-indigo-200"
                            >
                                {saving ? "Salvando..." : `Aplicar ${selectedCount} ${selectedCount === 1 ? "item" : "itens"}`}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* ─── IDLE — Current State + Controls ───────────────────── */}
                {phase === "idle" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left: Controls */}
                            <div className="lg:col-span-4 space-y-5">
                                {/* Auto Generate */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2rem] border-2 border-indigo-100">
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Geração Automática</h3>
                                    <Button
                                        onClick={handleAutoGenerate}
                                        disabled={phase !== "idle"}
                                        variant="primary"
                                        className="w-full rounded-2xl shadow-indigo-200 py-5"
                                    >
                                        🪄 Gerar Tema Completo
                                    </Button>
                                    <p className="text-[10px] text-indigo-300 mt-2 text-center font-bold">
                                        Cria cenário + personagens com 1 clique
                                    </p>
                                </div>

                                {/* BG Only */}
                                <div className="bg-indigo-50/50 p-5 rounded-[2rem] border-2 border-indigo-100">
                                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Mudar Cenário</h3>
                                    <Button
                                        onClick={handleGenerateBgOnly}
                                        variant="secondary"
                                        className="w-full rounded-2xl py-4"
                                    >
                                        🎨 Novo Fundo com IA
                                    </Button>
                                </div>

                                {/* Manual Search */}
                                <div className="bg-slate-50 p-5 rounded-[2rem] border-2 border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Adicionar Personagem</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {game.suggestions.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleSearchTag(tag)}
                                                className="px-4 py-2 rounded-xl font-bold text-sm bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm border border-slate-100"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Current State */}
                            <div className="lg:col-span-8 space-y-6">
                                {loadingAssets ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin text-4xl">🔄</div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Current Background */}
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                                Cenário Atual
                                            </h3>
                                            {bg ? (
                                                <div className="relative group rounded-[2rem] overflow-hidden shadow-md border-2 border-slate-100">
                                                    <img src={bg.imageUrl} alt="Background" className="w-full aspect-video object-cover" />
                                                    <button
                                                        onClick={() => handleDelete(bg.id)}
                                                        disabled={deletingId === bg.id}
                                                        className="absolute top-3 right-3 w-8 h-8 bg-red-500/80 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    >
                                                        {deletingId === bg.id ? "..." : "x"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-100 rounded-[2rem] h-40 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-200">
                                                    <span className="text-4xl mb-2">🖼️</span>
                                                    <p className="font-bold text-sm">Nenhum cenário definido</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Current Stickers */}
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                                Personagens ({assets.length})
                                            </h3>
                                            {assets.length > 0 ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {assets.map(a => (
                                                        <div
                                                            key={a.id}
                                                            className="relative group bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm"
                                                        >
                                                            <img src={a.imageUrl} alt={a.name} className="w-full h-20 object-contain" />
                                                            <p className="text-[10px] font-bold text-slate-500 text-center mt-1 truncate">{a.name}</p>
                                                            <button
                                                                onClick={() => handleDelete(a.id)}
                                                                disabled={deletingId === a.id}
                                                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                                            >
                                                                {deletingId === a.id ? "..." : "x"}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 rounded-[2rem] py-12 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-200">
                                                    <span className="text-4xl mb-2">🎭</span>
                                                    <p className="font-bold text-sm">Nenhum personagem adicionado</p>
                                                    <p className="text-xs text-slate-300 mt-1">Use "Gerar Tema Completo" ou adicione um a um</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
