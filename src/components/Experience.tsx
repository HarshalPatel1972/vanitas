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

const NewsFeed = () => {
  const { newsData, setNewsData } = useStore();
  const { width } = useThree((state) => state.viewport);
  
  // Responsive scaling
  const isMobile = width < 5;
  const scale = isMobile ? 0.55 : 1;
  const xOffset = isMobile ? 0 : 0; // centered
  
  // Optimization: reduce geometry segments on mobile if needed? 
  // R3F handles prop updates well, but changing geometry args rebuilds mesh.
  // We'll keep standard args for now but just scale.

  useEffect(() => {
    setNewsData(MOCK_NEWS);
  }, [setNewsData]);

  const gap = 4.5; 
  
  return (
    <group position={[xOffset, 0, 0]} scale={[scale, scale, 1]}>
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

import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { Stars } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

// Wrapper to control effects based on entropy
const DynamicEffects = () => {
    const entropy = useStore((state) => state.entropyLevel);
    // We want 0 distortion at start.
    // Noise opacity 0 -> 0.3 as entropy 0 -> 0.5
    // Vignette opacity?
    
    // Note: Changing props on PostProcessing effects can be expensive if it causes shader recompilation.
    // However, opacity on Noise is usually a uniform.
    // Let's try controlling it. If laggy, we might need a custom shader pass or just step it.
    
    // Threshold: "clean 4k website" until scroll starts.
    // Let's ramp it up quickly after 0.05 entropy.
    
    const noiseOpacity = Math.min(0.5, Math.max(0, (entropy - 0.05) * 0.8));
    const vigDarkness = 0.5 + Math.min(0.6, entropy); // 0.5 to 1.1

    if (entropy < 0.01) return null; // Completely clean start

    return (
        <EffectComposer>
            <Noise opacity={noiseOpacity} />
            <Vignette eskil={false} offset={0.1} darkness={vigDarkness} />
        </EffectComposer>
    );
};

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
            </div>
        );
    }

    // Show "Wield It" (Fix It) button if entropy is high (> 50%)
    if (entropy > 0.5) {
        return (
            <button 
                onClick={() => startRepair(60 * 60 * 1000)} // 1 hour
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-40 bg-red-600 text-white font-bold py-3 px-8 rounded-none border border-white hover:bg-red-700 transition-colors uppercase tracking-widest animate-pulse"
            >
                WIELD REALITY (FIX)
            </button>
        );
    }
    
    return null;
};

export default function Experience() {
  const isRepairing = useStore((state) => state.isRepairing);

  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden">
      {/* 3D Scene */}
      {!isRepairing && (
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: false, alpha: false, stencil: false, depth: true }}
        dpr={[1, 1.5]} 
      >
        <color attach="background" args={['#050505']} />
        
        {/* Stars fade in as entropy rises? Or just subtle bg? 
            User wants "4k clean start". Stars are fine if subtle, but let's hide them initially if precise.
            Let's keep them very faint or remove. Prompt said "4k clean". 
            Let's assume simple black bg is cleanest.
        */}
        <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <ScrollControls pages={MOCK_NEWS.length * 0.7} damping={0.2} distance={1}>
            <Scroll>
              <NewsFeed />
            </Scroll>
            <EntropyLogic />
          </ScrollControls>
          <Preload all />
        </Suspense>

        <DynamicEffects />
      </Canvas>
      )}

      {/* UI Overlays */}
      <RepairOverlay />
      
      {!isRepairing && (
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none mix-blend-difference z-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
          Vanitas
        </h1>
        <p className="text-xs font-mono mt-2">News is not infinite.</p>
      </div>
      )}
    </div>
  );
}
