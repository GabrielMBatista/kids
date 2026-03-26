import { redirect } from "next/navigation"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    if (process.env.FREE_ACCESS === "true") {
        redirect("/dashboard")
    }

    return <>{children}</>
}
