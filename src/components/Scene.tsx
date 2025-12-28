
'use client'

import { Canvas } from '@react-three/fiber'
import { Feed } from '@/components/Feed'
import { Suspense } from 'react'

export function Scene() {
  return (
    <div className="h-screen w-full bg-[#050505]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
            <Feed />
        </Suspense>
      </Canvas>
    </div>
  )
}
