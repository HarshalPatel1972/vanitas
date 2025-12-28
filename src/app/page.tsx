
'use client'

import { Scene } from '@/components/Scene'
import { useStore } from '@/store/useStore'

export default function Home() {
  const decayLevel = useStore((state) => state.decayLevel)

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505] text-[#E0E0E0]">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Scene />
      </div>

      <div className="absolute top-4 left-4 z-10 font-mono text-xs opacity-50 pointer-events-none">
        <p>ENTROPY_OS v0.1</p>
        <p>DECAY_LEVEL: {decayLevel.toFixed(3)}</p>
      </div>

      <div className="absolute bottom-4 left-4 z-10 font-mono text-xs opacity-50 pointer-events-none">
         SCROLL TO CONSUME
      </div>
    </main>
  )
}
