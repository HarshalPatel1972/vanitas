import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const SignalDecayMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uEntropy: 0.0,
    uTime: 0.0,
    uResolution: new THREE.Vector2(1,1) // Added for potential quantization if needed
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader (God Mode Signal Loss)
  `
    precision mediump float;
    
    uniform sampler2D uTexture;
    uniform float uEntropy; // 0.0 (Clean) to 1.0 (Lost)
    uniform float uTime;
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        vec2 uv = vUv;
        
        // 1. Horizontal Tearing (Glitch)
        // Only happens if entropy is high
        float noiseWave = random(vec2(0.0, uv.y + uTime));
        float tear = (noiseWave - 0.5) * 0.1 * uEntropy;
        
        // Randomly snap UVs horizontally
        if (random(vec2(uTime, uv.y)) < uEntropy * 0.3) {
            uv.x += tear;
        }

        // 2. Chromatic Aberration (RGB Split)
        float shift = uEntropy * 0.02;
        float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
        float g = texture2D(uTexture, uv).g;
        float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;

        // 3. Scanlines (CRT Effect) - Adjusted frequency
        float scanline = sin(uv.y * 800.0) * 0.1 * uEntropy;
        vec3 color = vec3(r, g, b) - scanline;

        // 4. Desaturation (Fade to Grey)
        vec3 grey = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
        color = mix(color, grey, uEntropy);

        gl_FragColor = vec4(color, 1.0);
    }
  `
);
