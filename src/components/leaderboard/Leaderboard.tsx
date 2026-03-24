"use client"

import { motion } from "framer-motion"

interface Player {
    id: string
    name: string
    avatar: string
    xp: number
}

interface LeaderboardProps {
    players: Player[]
    activeChildId?: string
}

export function Leaderboard({ players, activeChildId }: LeaderboardProps) {
    return (
        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border-8 border-yellow-100 max-w-2xl mx-auto font-nunito flex flex-col items-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-baloo text-3xl md:text-4xl font-bold text-yellow-600 mb-8 text-center">
                Pódio da Semana
            </h2>

            <div className="w-full flex flex-col gap-4">
                {players.map((player, index) => {
                    const isHighlighted = player.id === activeChildId

                    return (
                        <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-4 md:p-6 rounded-3xl border-4 transition-all ${isHighlighted
                                ? "bg-yellow-50 border-yellow-400 shadow-md scale-105 z-10"
                                : "bg-slate-50 border-slate-200"
                                }`}
                        >
                            <div className={`w-12 h-12 flex items-center justify-center font-baloo font-bold text-2xl rounded-full ${index === 0 ? "bg-yellow-400 text-white" :
                                index === 1 ? "bg-slate-300 text-slate-700" :
                                    index === 2 ? "bg-orange-300 text-white" :
                                        "bg-slate-100 text-slate-400"
                                }`}>
                                {index + 1}
                            </div>

                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm border-2 border-slate-100 uppercase">
                                {player.avatar === "fox" ? "🦊" : player.avatar === "cat" ? "🐱" : "👦"}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-baloo text-2xl font-bold text-slate-700">
                                    {player.name}
                                </h3>
                            </div>

                            <div className="text-right">
                                <span className="font-baloo font-bold text-2xl text-orange-500">
                                    {player.xp}
                                </span>
                                <span className="text-sm font-bold text-slate-400 ml-1">XP</span>
                                {isHighlighted && (
                                    <div className="text-xs font-bold text-yellow-600 uppercase tracking-widest mt-1">
                                        Você!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
