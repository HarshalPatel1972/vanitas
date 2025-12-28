// =====================================================
// ENTROPY SHADER - Awwwards-Quality Decay System
// =====================================================

const simplexNoise = `
// Simplex Noise by Ashima Arts
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

// Random function needed in both shaders
const randomFunc = `
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
`;

export const vertexShader = `
varying vec2 vUv;
varying float vNoise;
varying float vElevation;
uniform float uTime;
uniform float uDecay;
uniform float uExplode;

${simplexNoise}
${randomFunc}

void main() {
  vUv = uv;
  vec3 pos = position;

  // Organic breathing effect
  float noiseVal = snoise(vec2(pos.x * 1.5 + uTime * 0.1, pos.y * 1.5));
  vNoise = noiseVal;
  
  // Phase 1: Subtle living distortion
  float breathe = sin(uTime * 0.5) * 0.02;
  pos.z += noiseVal * breathe;
  
  // Phase 2: Lag/Jelly effect as decay increases
  if (uDecay > 0.0) {
      float lag = (1.0 - uv.y) * uDecay * 0.3;
      pos.y -= sin(uTime * 2.0 + pos.x) * lag * 0.15;
      pos.x += cos(uTime * 1.5 + pos.y) * lag * 0.05;
  }

  // Phase 3: Liquefaction - geometry melts
  if (uDecay > 0.5) {
      float meltStrength = (uDecay - 0.5) * 4.0;
      float dripNoise = snoise(vec2(pos.x * 3.0, uTime * 0.3));
      pos.y -= meltStrength * (dripNoise * 0.5 + 0.5) * 0.5;
      pos.x += meltStrength * dripNoise * 0.1;
      pos.z -= meltStrength * 0.3;
  }

  // Phase 4: Collapse/Explosion
  if (uExplode > 0.0) {
      vec3 dir = vec3(
          snoise(vec2(pos.y * 5.0, uTime)),
          snoise(vec2(pos.x * 5.0, uTime + 10.0)),
          snoise(vec2(pos.z * 5.0, uTime + 20.0))
      );
      pos += normalize(dir) * uExplode * 3.0;
      gl_PointSize = max(1.0, (1.0 - uExplode) * 4.0 + random(uv) * 2.0);
  } else {
      gl_PointSize = 2.0;
  }

  vElevation = pos.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = `
uniform float uTime;
uniform float uDecay;
uniform float uExplode;
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vNoise;
varying float vElevation;

${simplexNoise}
${randomFunc}

void main() {
  vec2 uv = vUv;
  
  // Early discard for explosion particles
  if (uExplode > 0.1) {
      float particleChance = random(vUv * uTime * 0.1);
      if (particleChance > (1.0 - uExplode * 0.8)) discard;
  }
  
  // Phase 3: UV Distortion (Liquid Melt)
  if (uDecay > 0.5) {
      float meltFactor = (uDecay - 0.5) * 2.0;
      float drip = snoise(vec2(uv.x * 6.0, uTime * 0.4)) * 0.5 + 0.5;
      uv.y -= drip * meltFactor * 0.3;
      uv.x += snoise(vec2(uv.y * 10.0, uTime * 0.2)) * meltFactor * 0.05;
  }

  // Chromatic Aberration - increases with decay
  float aberration = uDecay * 0.025;
  float r = texture2D(uTexture, uv + vec2(aberration, aberration * 0.5)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(aberration, -aberration * 0.5)).b;
  vec4 color = vec4(r, g, b, 1.0);

  // Phase 1: Desaturation with contrast boost
  if (uDecay > 0.0) {
      float desatStr = smoothstep(0.0, 0.5, uDecay);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      // High contrast B&W
      float contrast = smoothstep(0.3, 0.7, gray);
      vec3 bw = vec3(contrast);
      color.rgb = mix(color.rgb, bw, desatStr);
  }

  // Phase 2: Digital Rot - static and holes
  if (uDecay > 0.25) {
      float noiseStr = smoothstep(0.25, 0.6, uDecay);
      
      // Scanlines
      float scanline = sin(uv.y * 200.0 + uTime * 5.0) * 0.5 + 0.5;
      color.rgb -= scanline * noiseStr * 0.1;
      
      // Random static pixels
      float whiteNoise = random(uv * uTime * 50.0);
      if (whiteNoise < noiseStr * 0.15) {
          color.rgb = vec3(whiteNoise > 0.5 ? 1.0 : 0.0);
      }
      
      // Moth holes - eat away at the image
      float holeNoise = snoise(vec2(uv.x * 15.0 + uTime * 0.1, uv.y * 15.0));
      if (holeNoise < (uDecay - 0.3) * 1.5 - 0.8) {
          discard;
      }
  }

  // Edge dissolution
  float edgeDist = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;
  float edgeThreshold = 1.0 - uDecay * 0.4;
  if (edgeDist > edgeThreshold) {
      float edgeNoise = random(uv * 100.0 + uTime);
      if (edgeNoise > (edgeThreshold + 0.1 - edgeDist) * 5.0) {
          discard;
      }
  }
  
  // Vignette that intensifies with decay
  float vignette = 1.0 - smoothstep(0.3, 0.9, edgeDist);
  color.rgb *= mix(1.0, vignette, uDecay * 0.5);
  
  // System Error Red tint at high decay
  if (uDecay > 0.7) {
      float redTint = (uDecay - 0.7) * 0.5;
      color.r += redTint * 0.3;
  }
  
  // Collapse fade
  if (uExplode > 0.0) {
      color.a *= (1.0 - uExplode);
  }

  if (color.a < 0.01) discard;

  gl_FragColor = color;
}
`;
