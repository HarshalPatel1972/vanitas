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
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const textRef = useRef<any>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  // Memoize texture loading
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const tex = loader.load(url)
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [url])
  
  const isExplodingRef = useRef(false)

  useFrame((state, delta) => {
    const currentDecay = useStore.getState().decayLevel
    
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta
        materialRef.current.uniforms.uDecay.value = currentDecay
        
        const explode = Math.max(0, (currentDecay - 0.9) * 10)
        materialRef.current.uniforms.uExplode.value = explode
    }
    
    // Subtle floating animation
    if (groupRef.current) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05
    }
    
    // Handle visibility
    const shouldExplode = currentDecay > 0.9
    if (shouldExplode !== isExplodingRef.current) {
        isExplodingRef.current = shouldExplode
        if (meshRef.current) meshRef.current.visible = !shouldExplode
        if (pointsRef.current) pointsRef.current.visible = shouldExplode
        if (textRef.current) textRef.current.visible = !shouldExplode
    }
  })

  const geomArgs: [number, number, number, number] = [1, 1, 64, 64]

  return (
    <group ref={groupRef} position={position}>
      {/* Card Frame - subtle border effect */}
      <mesh scale={[4.1, 3.1, 1]} position={[0, 0, -0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#111111" transparent opacity={0.5} />
      </mesh>
      
      {/* Main Image Mesh */}
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
      
      {/* Points for explosion */}
      <points ref={pointsRef} scale={[4, 3, 1]} visible={false}>
          <planeGeometry args={geomArgs} />
          {/* @ts-ignore */}
          <entropyMaterial
              uTexture={texture}
              transparent
              depthWrite={false}
          />
      </points>
      
      {/* Username/Text */}
      <Text
          ref={textRef}
          position={[0, -1.8, 0.1]}
          fontSize={0.12}
          color="#666666"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
          letterSpacing={0.05}
          maxWidth={3.5}
      >
          {text}
      </Text>
      
      {/* Interaction hint */}
      <Text
          ref={textRef}
          position={[-1.8, 1.3, 0.1]}
          fontSize={0.06}
          color="#333333"
          anchorX="left"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
          letterSpacing={0.1}
      >
          #{String(index + 1).padStart(2, '0')}
      </Text>
    </group>
  )
}
