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
  const setEntropyLevel = useStore((state) => state.setEntropyLevel);

  useFrame(() => {
    // Entropy from Time: very slow constant increase
    // increaseEntropy(delta * 0.001); 

    // Entropy from Scroll: based on scroll offset (0 to 1)
    // We map scroll.offset directly to a portion of entropy or add to it.
    // Let's make it so scroll position roughly correlates to entropy level 0-80%
    // and time fills the rest.
    
    // For demo/prototype: Map scroll offset directly to entropy for visual testing
    const targetEntropy = scroll.offset * 0.8; 
    
    // Smoothly interpolate current entropy to target (if we were strictly mapping)
    // But store logic is additive in prompt description. 
    // "Entropy increases based on Time Spent + Pixels Scrolled"
    // Let's implement a simple version where we set it based on scroll for now to "Control" the rot.
    setEntropyLevel(targetEntropy);
  });

  return null;
};

const NewsFeed = () => {
  const { newsData, setNewsData } = useStore();

  useEffect(() => {
    // In real app, fetch from /api/news
    // Here we use mock data
    setNewsData(MOCK_NEWS);
  }, [setNewsData]);

  // Spacing between cards
  const gap = 5; 
  
  return (
    <group position={[0, 0, 0]}>
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

export default function Experience() {
  return (
    <div className="w-full h-screen bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]} // Optimize pixel ratio
      >
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <ScrollControls pages={MOCK_NEWS.length} damping={0.2} distance={1}>
            <Scroll>
              {/* Main Content moves with scroll? 
                  drei Scroll component:
                  <Scroll> -> content moves
                  <Scroll html> -> html overlay moves
                  
                  Usually mapping 3D content to scroll:
                  The <Scroll> container offsets its children.
              */}
              <NewsFeed />
            </Scroll>
            
            <EntropyLogic />
          </ScrollControls>
          <Preload all />
        </Suspense>
      </Canvas>
      
      {/* HTML Overlay for Logo/Header if needed */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none mix-blend-difference z-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter" style={{ fontFamily: 'Arial, sans-serif' }}>
          Vanitas
        </h1>
        <p className="text-xs font-mono mt-2">News is not infinite.</p>
      </div>
    </div>
  );
}
