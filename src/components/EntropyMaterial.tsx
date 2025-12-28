
import { shaderMaterial } from '@react-three/drei'
import { extend, ReactThreeFiber } from '@react-three/fiber'
import * as THREE from 'three'
import { fragmentShader, vertexShader } from '@/shaders/EntropyShader'

const EntropyMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uDecay: 0,
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
      entropyMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof EntropyMaterialImpl> & {
          uTime?: number
          uDecay?: number
          uTexture?: THREE.Texture
      }
    }
  }
}

export const EntropyMaterial = EntropyMaterialImpl
