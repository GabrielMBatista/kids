import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/db/prisma"

// In a real app we'd use bcrypt, but for local dev & MVP we simplify
const { handlers: nextHandlers, auth: nextAuth, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Parent Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "pais@email.com" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string
                const password = credentials.password as string

                // Mock auth for local dev bypass if requested
                if (password === "admin") {
                    let user = await prisma.parent.findUnique({ where: { email } })
                    if (!user) {
                        user = await prisma.parent.create({
                            data: { email, password: "admin", name: "Admin (Bypass)" },
                        })
                    }
                    return { id: user.id, email: user.email, name: user.name }
                }

                const user = await prisma.parent.findUnique({ where: { email } })
                if (!user || user.password !== password) return null

                return { id: user.id, email: user.email, name: user.name }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        async session({ session, token }) {
            if (session.user) session.user.id = token.id as string
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})

export const handlers = nextHandlers

export const auth = async (...args: any[]) => {
    // @ts-ignore
    const session = await nextAuth(...args)

    // Bypass temporário garantido (sem depender de restart de servidor para .env)
    const MOCK_LOGIN_ENABLED = true

    if (!session && MOCK_LOGIN_ENABLED) {
        return {
            user: {
                id: process.env.GUEST_PARENT_ID || "cmn4t9t660000ugscm9mfoh5m",
                email: "guest@letrafun.com",
                name: "Visitante"
            },
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
        }
    }
    return session
}
export { signIn, signOut }
