
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import { fragmentShader, vertexShader } from '@/shaders/EntropyShader'

const EntropyMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uDecay: 0,
    uExplode: 0,
    uTexture: new THREE.Texture(),
  },
  vertexShader,
  fragmentShader
)

extend({ EntropyMaterial: EntropyMaterialImpl })

// Add type definition for the custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      entropyMaterial: any
    }
  }
}

export const EntropyMaterial = EntropyMaterialImpl
