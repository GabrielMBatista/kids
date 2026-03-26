import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-100 to-sky-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full opacity-50 blur-xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300 rounded-full opacity-50 blur-xl" />

      <div className="z-10 bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-xl border-4 border-white max-w-xl w-full text-center">
        <h1 className="font-baloo text-5xl md:text-7xl font-bold text-sky-500 mb-2 drop-shadow-sm">
          Letra<span className="text-orange-500">Fun</span>
        </h1>
        <p className="font-nunito text-lg md:text-xl text-slate-600 mb-8 font-semibold">
          Aprender a ler brincando!
        </p>

        <div className="flex flex-col gap-4 items-center">
          <Link href="/dashboard" className="w-full max-w-xs">
            <Button size="lg" className="w-full text-2xl" variant="primary">
              Jogar Agora!
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full max-w-xs mt-4">
            <Button size="md" className="w-full" variant="ghost">
              Área dos Pais
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer decorative */}
      <div className="mt-12 opacity-80 flex gap-4 text-4xl">
        <span>🦊</span>
        <span>🐯</span>
        <span>🐸</span>
      </div>
    </main>
  )
}
