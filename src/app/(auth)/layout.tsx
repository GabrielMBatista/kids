import { redirect } from "next/navigation"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const MOCK_LOGIN_ENABLED = true

    if (MOCK_LOGIN_ENABLED) {
        redirect("/dashboard")
    }

    return <>{children}</>
}
