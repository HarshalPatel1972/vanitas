
'use client'

import { Scene } from '@/components/Scene'
import { useStore } from '@/store/useStore'
import { useState, useEffect } from 'react'

export default function Home() {
  // Use individual selectors for performance
  const entropyLevel = useStore((state) => state.entropyLevel)
  const isRecompiling = useStore((state) => state.isRecompiling)
  const setIsRecompiling = useStore((state) => state.setIsRecompiling)
  const setEntropyLevel = useStore((state) => state.setEntropyLevel)
  
  const [displayEntropy, setDisplayEntropy] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  
  // Throttle UI updates (60fps is too much for React DOM)
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
        setDisplayEntropy(entropyLevel)
    })
    return () => cancelAnimationFrame(timer)
  }, [entropyLevel])

  // Repair Sequence Logic
  useEffect(() => {
      if (isRecompiling) {
          setLogs(["[SYSTEM] INITIATING FACTORY RESET..."])
          let step = 0
          const messages = [
              "Purging cache partitions...",
              "Re-allocating vertex buffers...",
              "Stabilizing reality matrix...",
              "Compliance levels normalizing...",
              "System Restore Complete."
          ]
          
          const interval = setInterval(() => {
              if (step < messages.length) {
                  setLogs((prev) => [...prev, `> ${messages[step]}`])
                  step++
              } else {
                  clearInterval(interval)
                  setTimeout(() => {
                      setIsRecompiling(false)
                      setEntropyLevel(0) // Reset the feed
                      setLogs([])
                      // Force scroll to top (hacky but effective for reset)
                      window.location.reload() 
                  }, 1000)
              }
          }, 800)
          
          return () => clearInterval(interval)
      }
  }, [isRecompiling, setIsRecompiling, setEntropyLevel])

  const entropyPercent = (displayEntropy * 100).toFixed(1)

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505] text-[#E0E0E0] selection:bg-[#FF2A2A] selection:text-black">
      
      {/* 1. THE 3D SCENE */}
      <Scene />

      {/* 2. UI - OVERLAY LAYER */}
      
      {/* Top Left: Branding */}
      <div className="absolute top-8 left-8 z-20 font-serif tracking-tighter text-4xl mix-blend-difference pointer-events-none">
        VANITAS
      </div>
      
      {/* Top Right: Technical Data */}
      <div className="absolute top-8 right-8 z-20 font-mono text-[10px] uppercase text-right opacity-60 pointer-events-none">
         <p>Feed Status: {displayEntropy > 0.8 ? 'CRITICAL' : 'ACTIVE'}</p>
         <p>Memory Usage: {Math.round(420 + displayEntropy * 500)}MB</p>
         <p>Render Mode: WebGL 2.0</p>
      </div>
      
      {/* Bottom Left: Instructions */}
      <div className="absolute bottom-8 left-8 z-20 font-mono text-[10px] uppercase opacity-40 pointer-events-none">
        <p>↓ Scroll to Consume</p>
        <p>⚠ Excessive Consumption Causes Decay</p>
      </div>
      
      {/* Bottom Right: Entropy Meter */}
      <div className="absolute bottom-8 right-8 z-20 font-mono text-2xl font-bold">
        <span style={{ color: displayEntropy > 0.8 ? '#FF2A2A' : '#E0E0E0' }}>
            {entropyPercent}%
        </span>
      </div>
      
      {/* 3. THE "LOCKOUT" STATE (Entropy > 95%) */}
      {!isRecompiling && displayEntropy > 0.95 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-1000">
            <div className="text-center space-y-6">
                <h1 className="font-serif text-6xl text-[#FF2A2A]">SYSTEM FAILURE</h1>
                <p className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]">
                    Maximum Entropy Reached. Feed Corrupted.
                </p>
                <button 
                    onClick={() => setIsRecompiling(true)}
                    className="px-8 py-3 border border-[#FF2A2A] text-[#FF2A2A] font-mono text-xs uppercase hover:bg-[#FF2A2A] hover:text-black transition-all duration-300"
                >
                    [ RE-COMPILE ]
                </button>
            </div>
        </div>
      )}
      
      {/* 4. REPAIR SEQUENCE OVERLAY */}
      {isRecompiling && (
         <div className="absolute inset-0 z-40 bg-[#050505] flex flex-col items-center justify-center font-mono text-xs text-[#FF2A2A]">
            <div className="w-[300px] text-left space-y-2">
                {logs.map((log, i) => (
                    <div key={i} className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                        {log}
                    </div>
                ))}
                <span className="inline-block w-2 h-4 bg-[#FF2A2A] animate-pulse"/>
            </div>
         </div>
      )}
      
      {/* 5. FILM GRAIN OVERLAY (CSS) */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      
    </main>
  )
}
