import * as THREE from 'three';

import { shaderMaterial } from '@react-three/drei';

// VanitasMeltMaterial.js adaptation

const vertexShader = `
  uniform float uTime;
  uniform float uEntropy; // 0.0 to 1.0
  varying vec2 vUv;
  
  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // THE MELT LOGIC
    // As entropy increases, vertices drop down based on noise
    float noiseVal = snoise(vec2(pos.x * 2.0, uTime * 0.5));
    float meltStrength = smoothstep(0.5, 1.0, uEntropy); 
    
    // Only melt the bottom half more than the top or just generally melt downwards
    // pos.y -= max(0.0, noiseVal) * meltStrength * 3.0; // Original logic
    // Enhanced melt logic for better visual
    pos.y -= (noiseVal + 0.5) * meltStrength * 2.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform sampler2D uTexture;
  uniform float uEntropy;
  varying vec2 vUv;
  
  void main() {
    vec4 color = texture2D(uTexture, vUv);
    
    // 1. DESATURATION (The Ageing)
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 bwColor = vec3(gray);
    color.rgb = mix(color.rgb, bwColor, uEntropy);
    
    // 2. DIGITAL ROT (The Glitch)
    float staticNoise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    if (staticNoise < uEntropy * 0.3) {
        color.rgb = vec3(0.05); // Dead pixels
        color.a = 1.0; // Ensure dead pixels are opaque or maybe transparent?
        // If we want holes:
        // if (staticNoise < uEntropy * 0.3) discard;
    }

    gl_FragColor = color;
  }
`;

const VanitasMeltMaterial = shaderMaterial(
  { uTime: 0, uEntropy: 0, uTexture: new THREE.Texture() },
  vertexShader,
  fragmentShader
);

export { VanitasMeltMaterial };
