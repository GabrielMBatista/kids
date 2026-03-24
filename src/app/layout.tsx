import type { Metadata } from "next"
import { Nunito, Baloo_2 } from "next/font/google"
import { Providers } from "@/components/layout/Providers"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "LetraFun | Aprender brincando",
  description: "Plataforma de alfabetização gamificada para crianças",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${nunito.variable} ${baloo.variable} font-nunito bg-sky-50 text-slate-800 antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
