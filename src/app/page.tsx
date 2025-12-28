'use client'

import { Scene } from '@/components/Scene'
import { useStore } from '@/store/useStore'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  // Only subscribe reactively to isRepairing and setRepairing
  const { isRepairing, setRepairing } = useStore((state) => ({
      isRepairing: state.isRepairing,
      setRepairing: state.setRepairing
  }))
  
  // Use local state for decayLevel display, updated via subscription
  const [displayDecay, setDisplayDecay] = useState(0)
  const [showRepairButton, setShowRepairButton] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // Subscribe to decayLevel changes with throttling
  useEffect(() => {
    let lastUpdate = 0
    const unsubscribe = useStore.subscribe((state) => {
      const now = Date.now()
      // Throttle UI updates to ~10fps for the decay display
      if (now - lastUpdate > 100) {
        lastUpdate = now
        setDisplayDecay(state.decayLevel)
        setShowRepairButton(state.decayLevel > 0.95)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
      if (isRepairing) {
          setLogs(["INIT_REPAIR_SEQUENCE_V9..."])
          let step = 0
          const messages = [
              "FLUSHING_GPU_MEMORY_BUFFER...",
              "DETECTED_ENTROPY_OVERLOAD...",
              "RECOMPILING_SHADER_CACHE...",
              "RESTORING_GEOMETRY_INTEGRITY...",
              "NORMALIZE_REALITY_MATRIX...",
              "SYSTEM_STABLE."
          ]
          
          const interval = setInterval(() => {
              if (step < messages.length) {
                  setLogs((prev) => [...prev, messages[step]])
                  step++
              } else {
                  clearInterval(interval)
                  setTimeout(() => {
                      setRepairing(false)
                      setLogs([])
                  }, 1000)
              }
          }, 800)
          
          return () => clearInterval(interval)
      }
  }, [isRepairing, setRepairing])

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505] text-[#E0E0E0] select-none">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Scene />
      </div>

      <div className="absolute top-4 left-4 z-10 font-mono text-xs opacity-50 pointer-events-none mix-blend-difference">
        <p>ENTROPY_OS v0.1</p>
        <p>DECAY_LEVEL: {displayDecay.toFixed(3)}</p>
      </div>

      {/* REPAIR BUTTON (Only at Max Entropy) */}
      {!isRepairing && showRepairButton && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm animate-in fade-in duration-1000">
            <button 
                onClick={() => setRepairing(true)}
                className="group relative px-8 py-4 bg-transparent border border-[#FF3333] text-[#FF3333] font-mono tracking-widest hover:bg-[#FF3333] hover:text-black transition-all duration-300"
            >
                <span className="relative z-10">INITIATE_REPAIR_SEQUENCE</span>
                <div className="absolute inset-0 bg-[#FF3333]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
      )}

      {/* REPAIR OVERLAY (Logs) */}
      {isRepairing && (
        <div className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center font-mono text-xs text-[#00FF00]">
            <div className="w-[300px] h-[200px] overflow-hidden flex flex-col justify-end">
                {logs.map((log, i) => (
                    <p key={i} className="mb-1 ">{`> ${log}`}</p>
                ))}
            </div>
            <div className="mt-4 w-[300px] h-1 bg-[#111]">
                <div 
                    className="h-full bg-[#00FF00] transition-all duration-300 ease-out"
                    style={{ width: `${(logs.length / 7) * 100}%` }}
                />
            </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 font-mono text-xs opacity-50 pointer-events-none">
         SCROLL TO CONSUME
      </div>
    </main>
  )
}
