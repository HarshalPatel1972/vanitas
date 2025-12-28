
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import '@/components/EntropyMaterial'

interface SocialCardProps {
  position: [number, number, number]
  url: string
  text: string
  index: number
}

export function SocialCard({ position, url, text, index }: SocialCardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  // High-res photography texture loading
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(url)
    // Linear filter for smooth, high-end look
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [url])

  useFrame((state, delta) => {
    // Read entropy strictly from store (transient update for performance)
    const currentEntropy = useStore.getState().entropyLevel
    
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta
        materialRef.current.uniforms.uEntropy.value = currentEntropy
    }
  })

  // Geometry: 1.5 aspect ratio (vertical feed style). 
  // High segment count (64x64) is CRITICAL for the vertex displacement/melt effect.
  const geomArgs: [number, number, number, number] = [1.2, 1.6, 64, 64]

  return (
    <group position={position}>
      {/* 1. Main Content Card */}
      <mesh ref={meshRef}>
          <planeGeometry args={geomArgs} />
          {/* @ts-ignore - custom shader material */}
          <entropyMaterial
              ref={materialRef}
              uTexture={texture}
              transparent
              side={THREE.DoubleSide}
          />
      </mesh>
      
      {/* 2. Caption (Using Troika Text for crisp rendering) */}
      <Text
          position={[0, -1.0, 0.05]}
          fontSize={0.05}
          color="#E0E0E0" // Bone White
          anchorX="center"
          anchorY="top"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
          letterSpacing={0.05}
          maxWidth={1.1}
          textAlign="center"
      >
          {text.toUpperCase()}
      </Text>
      
      {/* 3. Subtle details (Index number) */}
       <Text
          position={[0.7, 0.7, 0.05]}
          fontSize={0.03}
          color="#444444" 
          anchorX="right"
          anchorY="top"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
       >
          {String(index + 1).padStart(2, '0')}
      </Text>
    </group>
  )
}
