import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/db/prisma"

// In a real app we'd use bcrypt, but for local dev & MVP we simplify
export const { handlers, auth, signIn, signOut } = NextAuth({
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
                if (process.env.LOCAL_DEV_BYPASS === "true" && password === "admin") {
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
