
'use client'

import { Canvas } from '@react-three/fiber'
import { Feed } from '@/components/Feed'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'

export function Scene() {
  return (
    <div className="h-screen w-full relative z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }} // Narrow FOV for editorial look
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
