import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost"
    size?: "sm" | "md" | "lg" | "icon"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    {
                        "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_4px_0_rgb(194,65,12)] hover:shadow-[0_2px_0_rgb(194,65,12)] hover:translate-y-[2px]": variant === "primary",
                        "bg-blue-400 text-white hover:bg-blue-500 shadow-[0_4px_0_rgb(59,130,246)] hover:shadow-[0_2px_0_rgb(59,130,246)] hover:translate-y-[2px]": variant === "secondary",
                        "bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_0_rgb(185,28,28)]": variant === "danger",
                        "hover:bg-slate-100 text-slate-700": variant === "ghost",
                        "h-10 px-4 text-sm": size === "sm",
                        "h-14 px-6 text-xl": size === "md",
                        "h-16 px-8 text-2xl": size === "lg",
                        "h-12 w-12": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)

Button.displayName = "Button"
