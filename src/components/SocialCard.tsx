
import { useRef } from 'react'
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
  const decayLevel = useStore((state) => state.decayLevel)
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load(url)

  useFrame((state, delta) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta
        materialRef.current.uniforms.uDecay.value = decayLevel
    }
  })

  return (
    <group position={position}>
      {/* The Image/Content Mesh */}
      <mesh ref={meshRef} scale={[4, 3, 1]}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <entropyMaterial
            ref={materialRef}
            uTexture={texture}
            transparent
            side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* The Text Mesh */}
      <Text
        position={[0, -2, 0.1]}
        fontSize={0.2}
        color={decayLevel > 0.3 ? "#E0E0E0" : "#050505"} // Invert color as it decays? Or keep white on black.
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        {text}
      </Text>
    </group>
  )
}
