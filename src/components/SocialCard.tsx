
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Image, Text } from '@react-three/drei'
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
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  // Remove reactive subscription to prevent per-frame re-renders
  // const decayLevel = useStore((state) => state.decayLevel) 
  
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(url)
  
  // Local state for explosion to trigger React update only when necessary
  const [isExploding, setIsExploding] = useState(false)

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
    
    // Only update React state if crossing the threshold
    if (currentDecay > 0.9 && !isExploding) setIsExploding(true)
    if (currentDecay <= 0.9 && isExploding) setIsExploding(false)
  })

  // Use higher density geometry for better particle effects
  const geomArgs: [number, number, number, number] = [1, 1, 64, 64]

  return (
    <group position={position}>
      {/* The Image/Content Mesh - Swaps to Points when exploding */}
      {isExploding ? (
        <points ref={meshRef as any} scale={[4, 3, 1]}>
            <planeGeometry args={geomArgs} />
            {/* @ts-ignore */}
            <entropyMaterial
                ref={materialRef}
                uTexture={texture}
                transparent
                depthWrite={false}
            />
        </points>
      ) : (
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
      )}
      
      {/* The Text Mesh - Hide when exploding */}
      {!isExploding && (
        <Text
            position={[0, -2, 0.1]}
            fontSize={0.2}
            color="#E0E0E0" 
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
            {text}
        </Text>
      )}
    </group>
  )
}
