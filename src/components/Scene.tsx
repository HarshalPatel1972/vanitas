
'use client'

import { Canvas } from '@react-three/fiber'
import { Feed } from '@/components/Feed'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'

export function Scene() {
  return (
    <div className="absolute inset-0 z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 35 }} // Moved camera back slightly
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]} // Handle retina screens
      >
        <color attach="background" args={['#050505']} />
        
        {/* Minimal lighting - the shader handles most visuals */}
        <ambientLight intensity={0.8} />
        
        <Suspense fallback={null}>
          <Feed />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}
