
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import '@/components/EntropyMaterial' // Register the material

interface SocialCardProps {
  position: [number, number, number]
  url: string
  text: string
  index: number
}

export function SocialCard({ position, url, text, index }: SocialCardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const textRef = useRef<any>(null)
  
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(url)
  
  // Use refs to track state without causing re-renders
  const isExplodingRef = useRef(false)

  useFrame((state, delta) => {
    // Read directly from store without causing re-render
    const currentDecay = useStore.getState().decayLevel
    
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta
        materialRef.current.uniforms.uDecay.value = currentDecay
        
        // Calculate explosion level (starts at 0.9 decay)
        const explode = Math.max(0, (currentDecay - 0.9) * 10)
        materialRef.current.uniforms.uExplode.value = explode
    }
    
    // Handle visibility imperatively without React state
    const shouldExplode = currentDecay > 0.9
    
    if (shouldExplode !== isExplodingRef.current) {
        isExplodingRef.current = shouldExplode
        // Toggle visibility imperatively
        if (meshRef.current) meshRef.current.visible = !shouldExplode
        if (pointsRef.current) pointsRef.current.visible = shouldExplode
        if (textRef.current) textRef.current.visible = !shouldExplode
    }
  })

  // Use higher density geometry for better particle effects
  const geomArgs: [number, number, number, number] = [1, 1, 64, 64]

  return (
    <group position={position}>
      {/* Mesh (visible when not exploding) */}
      <mesh ref={meshRef} scale={[4, 3, 1]}>
          <planeGeometry args={geomArgs} />
          {/* @ts-ignore */}
          <entropyMaterial
              ref={materialRef}
              uTexture={texture}
              transparent
              side={THREE.DoubleSide}
          />
      </mesh>
      
      {/* Points (visible when exploding) - starts hidden */}
      <points ref={pointsRef} scale={[4, 3, 1]} visible={false}>
          <planeGeometry args={geomArgs} />
          {/* @ts-ignore */}
          <entropyMaterial
              uTexture={texture}
              transparent
              depthWrite={false}
          />
      </points>
      
      {/* The Text Mesh */}
      <Text
          ref={textRef}
          position={[0, -2, 0.1]}
          fontSize={0.2}
          color="#E0E0E0" 
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
          {text}
      </Text>
    </group>
  )
}
