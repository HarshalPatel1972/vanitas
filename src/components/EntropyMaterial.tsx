
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from '@/shaders/EntropyShader'

const EntropyMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uEntropy: 0,
    uTexture: new THREE.Texture(),
  },
  vertexShader,
  fragmentShader
)

extend({ EntropyMaterial: EntropyMaterialImpl })

export { EntropyMaterialImpl }
