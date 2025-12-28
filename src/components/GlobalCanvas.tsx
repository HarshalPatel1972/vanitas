'use client';
// Main entry point for the 3D Layer that sits BEHIND the content
// It uses <View> to portal 3D content into HTML divs

import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';

export default function GlobalCanvas({ children, ...props }: any) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        {...props}
        gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        }}
        dpr={[1, 1.5]} // Performance Cap
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ pointerEvents: 'none' }}
        eventSource={typeof window !== 'undefined' ? document.body : undefined}
      >
         <View.Port /> {/* This renders all children Views inside the single canvas */}
         <Preload all />
      </Canvas>
    </div>
  );
}
