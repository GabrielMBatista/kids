"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface ToastProps {
    message: string
    type?: "success" | "error"
    isVisible: boolean
    onClose: () => void
}

export function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 3000)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-3xl shadow-2xl border-2 flex items-center gap-3 font-bold ${type === "success"
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "bg-rose-500 border-rose-400 text-white"
                        }`}
                >
                    <span className="text-2xl">{type === "success" ? "✨" : "⚠️"}</span>
                    <p>{message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
