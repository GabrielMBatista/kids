"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Toast } from "@/components/ui/Toast"

type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
type Source = "GIPHY" | "GEMINI"

interface Preview {
    url: string
    name: string
}

export function StickerManager() {
    const [source, setSource] = useState<Source>("GIPHY")
    const [rarity, setRarity] = useState<Rarity>("COMMON")
    const [query, setQuery] = useState("")
    const [previews, setPreviews] = useState<Preview[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState<string | null>(null)

    // Toast State
    const [toast, setToast] = useState<{ show: boolean, msg: string, type: "success" | "error" }>({
        show: false, msg: "", type: "success"
    })

    const handleSearch = async () => {
        if (!query.trim()) return
        setLoading(true)
        try {
            const res = await fetch("/api/admin/stickers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "preview", source, query, rarity })
            })
            const data = await res.json()
            if (data.previews) {
                setPreviews(data.previews)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (preview: Preview) => {
        setSaving(preview.url)
        try {
            await fetch("/api/admin/stickers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "save",
                    source,
                    rarity,
                    name: preview.name,
                    imageUrl: preview.url,
                    query
                })
            })
            setToast({ show: true, msg: "Figurinha lateral adicionada!", type: "success" })
        } catch (err) {
            console.error(err)
            setToast({ show: true, msg: "Erro ao salvar figurinha", type: "error" })
        } finally {
            setSaving(null)
        }
    }

    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6 lg:col-span-2">
            <h2 className="font-baloo text-2xl font-bold text-slate-700 mb-4">Gerenciador de Figurinhas</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-bold text-slate-500 mb-1">Fonte</label>
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value as Source)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                    >
                        <option value="GIPHY">Giphy (Busca Animada)</option>
                        <option value="GEMINI">Gemini (Gerar IA)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-500 mb-1">Raridade (Nível)</label>
                    <select
                        value={rarity}
                        onChange={(e) => setRarity(e.target.value as Rarity)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                    >
                        <option value="COMMON">Comum (Animais)</option>
                        <option value="UNCOMMON">Incomum (Heróis)</option>
                        <option value="RARE">Raro (Dragões)</option>
                        <option value="EPIC">Épico (Lendas)</option>
                        <option value="LEGENDARY">Lendário (Campeões)</option>
                    </select>
                </div>
                <div className="md:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-slate-500 mb-1">
                            {source === "GIPHY" ? "Buscar termo (Inglês funciona melhor)" : "Prompt (Assunto)"}
                        </label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={source === "GIPHY" ? "Ex: cute lion" : "Ex: red dragon with fire"}
                            className="w-full p-2 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading || !query.trim()} variant="primary" size="sm" className="h-[42px]">
                        {loading ? "Carregando..." : source === "GIPHY" ? "Buscar" : "Gerar"}
                    </Button>
                </div>
            </div>

            {previews.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase">Resultados ({previews.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((p, i) => (
                            <div key={i} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.url} alt="Preview" className="w-full h-32 object-contain rounded-lg bg-slate-100 mb-3" />
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full text-xs"
                                    onClick={() => handleSave(p)}
                                    disabled={saving === p.url}
                                >
                                    {saving === p.url ? "Salvando..." : "Salvar no Banco"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Toast
                isVisible={toast.show}
                message={toast.msg}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </section>
    )
}
