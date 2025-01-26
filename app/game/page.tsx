import { JobSeekingGame } from "@/app/components/JobSeekingGame"
import { Header } from "@/app/components/Header"
import { Footer } from "@/app/components/Footer"

export default function GamePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <JobSeekingGame />
      </main>
      <Footer />
    </div>
  )
}

