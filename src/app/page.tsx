'use client'

import { Scene } from '@/components/Scene'
import { useStore } from '@/store/useStore'
import { useState, useEffect } from 'react'

export default function Home() {
  const isRepairing = useStore((state) => state.isRepairing)
  const setRepairing = useStore((state) => state.setRepairing)
  
  const [displayDecay, setDisplayDecay] = useState(0)
  const [showRepairButton, setShowRepairButton] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  // Subscribe to decayLevel changes with throttling
  useEffect(() => {
    let lastUpdate = 0
    const unsubscribe = useStore.subscribe((state) => {
      const now = Date.now()
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
          setLogs(["[ENTROPY_CORE] INITIATING RECOVERY PROTOCOL..."])
          let step = 0
          const messages = [
              "[GPU_BUFFER] Flushing corrupted memory sectors...",
              "[SHADER_ENGINE] Recompiling fragment pipelines...",
              "[GEOMETRY_SVC] Reconstructing vertex arrays...",
              "[TEXTURE_CACHE] Rebuilding mipmap chains...",
              "[REALITY_MATRIX] Normalizing coordinate space...",
              "[SYSTEM] Entropy levels stabilized.",
              "[SYSTEM] REBUILD COMPLETE."
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
                  }, 1500)
              }
          }, 600)
          
          return () => clearInterval(interval)
      }
  }, [isRepairing, setRepairing])

  const decayPercent = Math.round(displayDecay * 100)
  
  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505] text-[#E0E0E0] select-none cursor-crosshair">
      
      {/* WEBGL CANVAS */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* FILM GRAIN OVERLAY */}
      <div 
        className="absolute inset-0 z-5 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* TOP LEFT - System Status */}
      <div className="absolute top-8 left-8 z-10 font-mono text-[10px] tracking-[0.2em] uppercase pointer-events-none">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ 
              backgroundColor: displayDecay > 0.8 ? '#FF3333' : displayDecay > 0.4 ? '#FFAA00' : '#00FF66',
              boxShadow: `0 0 10px ${displayDecay > 0.8 ? '#FF3333' : displayDecay > 0.4 ? '#FFAA00' : '#00FF66'}`
            }}
          />
          <span className="opacity-60">ENTROPY_OS v0.1.0</span>
        </div>
        
        <div className="opacity-40 space-y-1">
          <p>SYS_INTEGRITY: {100 - decayPercent}%</p>
          <p>DECAY_LEVEL: {displayDecay.toFixed(4)}</p>
          <p>STATUS: {displayDecay > 0.8 ? 'CRITICAL' : displayDecay > 0.4 ? 'DEGRADED' : 'NOMINAL'}</p>
        </div>
      </div>

      {/* TOP RIGHT - Technical Readout */}
      <div className="absolute top-8 right-8 z-10 font-mono text-[10px] tracking-[0.15em] uppercase text-right pointer-events-none opacity-40">
        <p>RENDER_MODE: WEBGL2</p>
        <p>SHADER: CUSTOM_GLSL</p>
        <p>PARTICLES: {displayDecay > 0.9 ? 'ACTIVE' : 'STANDBY'}</p>
      </div>

      {/* BOTTOM LEFT - Instructions */}
      <div className="absolute bottom-8 left-8 z-10 font-mono pointer-events-none">
        <p className="text-[10px] tracking-[0.3em] uppercase opacity-30 mb-2">
          {displayDecay < 0.1 ? '↓ SCROLL TO DECAY' : displayDecay > 0.9 ? 'SYSTEM FAILURE' : 'ENTROPY INCREASING'}
        </p>
        <div className="w-32 h-[2px] bg-white/10 overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out"
            style={{ 
              width: `${decayPercent}%`,
              backgroundColor: displayDecay > 0.8 ? '#FF3333' : displayDecay > 0.4 ? '#888' : '#444'
            }}
          />
        </div>
      </div>

      {/* BOTTOM RIGHT - Credit */}
      <div className="absolute bottom-8 right-8 z-10 font-mono text-[9px] tracking-[0.2em] uppercase opacity-20 pointer-events-none">
        <p>VANITAS — A MEDITATION ON DIGITAL MORTALITY</p>
      </div>

      {/* CENTER - Large Decay Percentage (appears at high decay) */}
      {displayDecay > 0.6 && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none"
          style={{ opacity: (displayDecay - 0.6) * 0.3 }}
        >
          <span 
            className="font-mono text-[20vw] font-bold tracking-tighter"
            style={{ 
              color: 'transparent',
              WebkitTextStroke: '1px rgba(255,51,51,0.3)',
            }}
          >
            {decayPercent}
          </span>
        </div>
      )}

      {/* REPAIR BUTTON */}
      {!isRepairing && showRepairButton && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[#FF3333] mb-8 animate-pulse">
              ⚠ CRITICAL SYSTEM FAILURE
            </p>
            <button 
                onClick={() => setRepairing(true)}
                className="group relative px-12 py-5 bg-transparent border border-[#FF3333]/50 text-[#FF3333] font-mono text-xs tracking-[0.3em] uppercase hover:border-[#FF3333] hover:bg-[#FF3333]/10 transition-all duration-500"
            >
                <span className="relative z-10">INITIATE RECOVERY</span>
            </button>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mt-6">
              ALL PROGRESS WILL BE LOST
            </p>
          </div>
        </div>
      )}

      {/* REPAIR OVERLAY */}
      {isRepairing && (
        <div className="absolute inset-0 z-30 bg-[#050505] flex flex-col items-center justify-center font-mono">
          <div className="w-[500px] max-w-[90vw]">
            {/* Terminal Window */}
            <div className="border border-white/10 bg-black/50 backdrop-blur-sm">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                <span className="ml-4 text-[10px] tracking-[0.2em] uppercase opacity-40">RECOVERY_TERMINAL</span>
              </div>
              
              {/* Terminal Body */}
              <div className="p-4 h-[250px] overflow-hidden flex flex-col justify-end">
                {logs.map((log, i) => (
                    <p 
                      key={i} 
                      className="text-[11px] leading-relaxed mb-1"
                      style={{ 
                        color: log.includes('COMPLETE') ? '#00FF66' : 
                               log.includes('ERROR') ? '#FF3333' : '#00FF66',
                        opacity: i === logs.length - 1 ? 1 : 0.5
                      }}
                    >
                      {log}
                    </p>
                ))}
                <span className="inline-block w-2 h-4 bg-[#00FF66] animate-pulse" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 h-[2px] bg-white/10 overflow-hidden">
              <div 
                  className="h-full bg-[#00FF66] transition-all duration-500 ease-out"
                  style={{ width: `${(logs.length / 8) * 100}%` }}
              />
            </div>
            <p className="text-[9px] tracking-[0.3em] uppercase opacity-30 text-center mt-2">
              REBUILDING REALITY — {Math.round((logs.length / 8) * 100)}%
            </p>
          </div>
        </div>
      )}

    </main>
  )
}
