'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, useScroll, Preload } from '@react-three/drei';
import { VanitasMeltMaterial } from '../shaders/VanitasMeltMaterial';
import { NewsCard } from './NewsCard';
import { useStore } from '../store/useStore';
import { MOCK_NEWS } from '../lib/mockData';

// Register the custom shader material
extend({ VanitasMeltMaterial });

// Add Typescript support for the custom element
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vanitasMeltMaterial: any; 
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const EntropyLogic = () => {
  const scroll = useScroll();
  const increaseEntropyTo = useStore((state) => state.increaseEntropyTo);
  const isRepairing = useStore((state) => state.isRepairing);

  useFrame((state, delta) => {
    // If repairing, we might want to pause entropy or let it reset? 
    // Prompt says "unusable". We will handle usability in UI overlay.
    // Entropy logic: Irreversible increase based on scroll.
    
    // Map scroll offset to 0-1 range roughly over the scroll distance
    const targetEntropy = scroll.offset; 
    
    // Only increase
    increaseEntropyTo(targetEntropy);
    
    // Time based decay? No, "News is not infinite" -> decay implies healing.
    // We only add entropy over time if active?
    // "Entropy increases based on Time Spent + Pixels Scrolled"
    // Let's add a very small time factor:
    // increaseEntropyTo(scroll.offset + state.clock.elapsedTime * 0.005);
  });

  return null;
};

// ... imports
import { useThree } from '@react-three/fiber';

// ... NewsFeed definition ...
const NewsFeed = () => {
    // ... setup
  const { newsData, setNewsData } = useStore();
  const { width } = useThree((state) => state.viewport);
  
  // Responsive Design Logic
  const isMobile = width < 5;
  const responsiveScale = isMobile ? (width * 0.9) / 4 : 1;
  
  useEffect(() => {
    setNewsData(MOCK_NEWS);
  }, [setNewsData]);

  const gap = 4.5; 
  
  return (
    <group position={[0, 0, 0]} scale={[responsiveScale, responsiveScale, 1]}>
      {newsData.map((item, index) => (
        <NewsCard 
          key={index} 
          item={item} 
          position={[0, -index * gap, 0]} 
        />
      ))}
    </group>
  );
};
// removed the duplicate import useThree at bottom


// ... (other imports)

// ... imports
import { Stars, Sparkles } from '@react-three/drei';

// Wrapper to control effects based on entropy using CSS (Zero GPU Cost)
const CSSDynamicEffects = () => {
    const entropy = useStore((state) => state.entropyLevel);
    
    // Noise visibility optimization for dark backgrounds
    const noiseOpacity = Math.min(0.15, Math.max(0.02, entropy * 0.3)); 
    const vigOpacity = Math.min(0.8, entropy); 
    
    return (
        <>
            {/* Vignette Overlay (CSS Radial Gradient) */}
            <div 
                className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 ease-linear"
                style={{
                    opacity: vigOpacity,
                    background: 'radial-gradient(circle, transparent 50%, #000 150%)'
                }}
            />
            {/* Noise Overlay - Fixed for Dark Mode */}
            <div 
                className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-300 ease-linear"
                style={{
                    opacity: noiseOpacity,
                    backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
                    filter: 'contrast(120%) brightness(120%)',
                    mixBlendMode: 'plus-lighter' // Better for noise on dark bg
                }}
            />
            {/* Scanline/Grid effect for premium feel? Optional */}
        </>
    );
};

// ... CSSDynamicEffects ...

const RepairOverlay = () => {
    const entropy = useStore((state) => state.entropyLevel);
    const startRepair = useStore((state) => state.startRepair);
    const isRepairing = useStore((state) => state.isRepairing);
    const checkRepairStatus = useStore((state) => state.checkRepairStatus);
    const repairEndTime = useStore((state) => state.repairEndTime);
    
    const [timeLeft, setTimeLeft] = React.useState<string>("");

    useEffect(() => {
        checkRepairStatus();
        const interval = setInterval(() => {
             if (isRepairing && repairEndTime) {
                 const remaining = repairEndTime - Date.now();
                 if (remaining <= 0) {
                     checkRepairStatus(); // Trigger completion
                 } else {
                     const minutes = Math.floor(remaining / 60000);
                     const seconds = Math.floor((remaining % 60000) / 1000);
                     setTimeLeft(`${minutes}m ${seconds}s`);
                 }
             }
        }, 1000);
        return () => clearInterval(interval);
    }, [isRepairing, repairEndTime, checkRepairStatus]);

    if (isRepairing) {
        return (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-red-500 font-mono p-4">
                <h1 className="text-4xl font-bold mb-4 glitch-text">SYSTEM RECOMPILING</h1>
                <p className="text-xl mb-8">REALITY INTEGRITY RESTORING...</p>
                <div className="text-6xl font-black">{timeLeft}</div>
                <p className="mt-8 text-sm opacity-50">Please touch grass while you wait.</p>
                
                {/* DEV ONLY: Quick Fix - Made more visible as requested */}
                <button 
                    onClick={() => startRepair(100)} 
                    className="mt-8 border border-white/20 px-4 py-2 text-xs text-white/50 hover:text-white hover:border-white uppercase tracking-widest transition-all"
                    title="Dev: Instant Fix"
                >
                    [DEV: QUICK YIELD (UNLOCK NOW)]
                </button>
            </div>
        );
    }

    // Show "Wield It" (Fix It) button if entropy is high (> 50%)
    if (entropy > 0.5) {
        return (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center gap-2">
                <button 
                    onClick={() => startRepair(60 * 60 * 1000)} // 1 hour
                    className="bg-red-600 text-white font-bold py-3 px-8 rounded-none border border-white hover:bg-red-700 transition-colors uppercase tracking-widest animate-pulse"
                >
                    WIELD REALITY (FIX)
                </button>
                <button 
                    onClick={() => startRepair(5000)} // 5 seconds
                    className="text-xs text-gray-500 hover:text-white uppercase tracking-widest"
                >
                    [DEV: QUICK YIELD]
                </button>
            </div>
        );
    }
    
    return null;
};

export default function Experience() {
  const isRepairing = useStore((state) => state.isRepairing);
  
  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden font-sans">
        {/* CSS Effects Layer */}
        <CSSDynamicEffects />

      {/* 3D Scene */}
      {!isRepairing && (
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }} // Zoomed in slightly, simpler perspective
        gl={{ 
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance"
        }}
        dpr={[1, 2]} // Allow higher quality on powerful phones, R3F handles scaling
        performance={{ min: 0.5 }} 
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 15]} /> {/* Depth Cue */}
        
        {/* Subtle Environment Texture */}
        <Stars radius={30} depth={20} count={800} factor={3} saturation={0} fade speed={0.5} />

        <Suspense fallback={null}> 
            {/* Note: In a real app we'd use a loader. For now, we fallback to null to avoid ugly pop-in, 
                but we need to ensure textures load fast. */}
          <ScrollControls pages={MOCK_NEWS.length * 0.7} damping={0.2} distance={1}>
            <Scroll>
               <NewsFeed />
            </Scroll>
            <EntropyLogic />
          </ScrollControls>
          <Preload all />
        </Suspense>
      </Canvas>
      )}

      {/* UI Overlays */}
      <RepairOverlay />
      
      {!isRepairing && (
      <div className="absolute top-0 left-0 w-full p-4 md:p-8 pointer-events-none mix-blend-difference z-10">
        <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
          Vanitas
        </h1>
        <p className="text-[10px] md:text-xs font-mono mt-1 md:mt-2">News is not infinite.</p>
      </div>
      )}
    </div>
  );
}
