"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (res?.error) {
            setError("Credenciais inválidas")
            setLoading(false)
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-200 to-indigo-100">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white">
                <div className="text-center mb-8">
                    <h1 className="font-baloo text-4xl font-bold text-slate-800">
                        Área dos Pais 🦊
                    </h1>
                    <p className="font-nunito text-slate-500 mt-2">
                        Acesse o painel para gerenciar os perfis das crianças.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block font-nunito font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all font-nunito"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-nunito font-bold text-slate-700 mb-1">Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition-all font-nunito"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 font-bold text-sm text-center">{error}</p>}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-4"
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar / Demo"}
                    </Button>

                    {process.env.NEXT_PUBLIC_LOCAL_DEV_BYPASS === "true" && (
                        <p className="text-xs text-center text-slate-400 mt-4">
                            ✨ Dev Bypass ativado: use qualquer email com senha 'admin' para autologin.
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
