
// VANITAS - The Decay Shader
// Awwwards Quality implementation of digital rot

export const vertexShader = `
uniform float uTime;
uniform float uEntropy;
varying vec2 vUv;
varying float vDisplacement;

// Simplex Noise 2D
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
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
  
  // Phase 2: The Breaking (0.3 - 0.7) - Vertex Jitter
  if (uEntropy > 0.3) {
    float jitterIntensity = smoothstep(0.3, 0.8, uEntropy) * 0.1;
    float jitter = snoise(vec2(pos.x * 10.0, uTime * 2.0));
    pos.z += jitter * jitterIntensity;
  }
  
  // Phase 3: The Melting (0.7 - 1.0) - Liquefaction
  if (uEntropy > 0.6) {
      float meltIntensity = smoothstep(0.6, 1.0, uEntropy) * 2.0;
      float meltNoise = snoise(vec2(pos.x * 2.0, uTime * 0.5));
      
      // Dripping effect
      pos.y -= max(0.0, meltNoise * meltIntensity * 0.5);
      
      // Add "weight" to bottom vertices
      float lag = (1.0 - uv.y) * meltIntensity * 0.2;
      pos.y -= lag * sin(uTime);
  }

  vDisplacement = pos.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const fragmentShader = `
uniform float uTime;
uniform float uEntropy;
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vDisplacement;

// Simplex Noise (Shared)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
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
  vec2 uv = vUv;
  
  // Phase 3: The Melting - UV Distortion
  if (uEntropy > 0.6) {
      float dripIntensity = smoothstep(0.6, 1.0, uEntropy);
      float noiseWave = snoise(vec2(uv.x * 10.0, uTime * 0.2));
      uv.y -= noiseWave * dripIntensity * 0.2;
      
      // Horizontal smear
      uv.x += snoise(vec2(uv.y * 20.0, uTime * 0.1)) * dripIntensity * 0.02;
  }

  // Phase 2: The Breaking - Tearing/Rot
  float rotNoise = snoise(uv * 50.0 + uTime);
  if (uEntropy > 0.3) {
      float tearThreshold = smoothstep(0.3, 1.0, uEntropy) * 0.6; // Max 0.6 discard
      // Edge fraying
      float edgeDist = distance(uv, vec2(0.5));
      if (edgeDist > 0.4 && rotNoise < tearThreshold) discard;
      
      // Random holes
      if (rotNoise < (uEntropy - 0.3)) discard;
  }

  // Chromatic Aberration (The Glitch)
  float aberration = uEntropy * 0.02;
  float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;
  vec4 color = vec4(r, g, b, 1.0);

  // Phase 1: The Ageing - Desaturation & Grain
  if (uEntropy > 0.0) {
      // 1. Desaturation
      float grey = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      float desatFactor = smoothstep(0.0, 0.4, uEntropy);
      color.rgb = mix(color.rgb, vec3(grey), desatFactor); // Fade to grey
      
      // 2. Grain
      float grain = snoise(uv * 100.0 * uTime) * 0.1;
      color.rgb += grain * desatFactor;
      
      // High contrast for "Clinical" look
      if (uEntropy > 0.2) {
          color.rgb = (color.rgb - 0.5) * (1.0 + uEntropy * 0.5) + 0.5;
      }
  }
  
  // Phase 3: Color Burn (The Melting)
  if (uEntropy > 0.8) {
      float burn = smoothstep(0.8, 1.0, uEntropy);
      color.rgb = mix(color.rgb, vec3(1.0) - color.rgb, burn * 0.5); // Partial inversion
  }

  gl_FragColor = color;
}
`
