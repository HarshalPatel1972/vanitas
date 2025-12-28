'use client'

import { Canvas } from '@react-three/fiber'
import { Feed } from '@/components/Feed'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'

export function Scene() {
  return (
    <div className="h-screen w-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Subtle ambient lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        
        <Suspense fallback={null}>
          <Feed />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
