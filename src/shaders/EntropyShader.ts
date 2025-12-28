
// Shared noise functions could be moved to a common string or just duplicated for simplicity in this specific setup.

const simplexNoise3D = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));
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
`

export const vertexShader = `
varying vec2 vUv;
varying float vNoise;
uniform float uTime;
uniform float uDecay;
uniform float uScrollProps;

${simplexNoise3D}

void main() {
  vUv = uv;
  vec3 pos = position;

  // Initial Wobble/Alive feel
  float noiseVal = snoise(vec2(pos.x * 1.5, uTime * 0.3));
  vNoise = noiseVal;
  
  // Phase 3: The "Lag" Drag (Vertex Distortion) based on Decay
  // Simulating drag: bottom vertices lag behind
  if (uDecay > 0.0) {
      // Simple approximation of lag - in reality would interact with scroll delta
      float lag = (1.0 - uv.y) * uDecay * 0.5;
      pos.y -= sin(uTime * 2.0) * lag * 0.1; 
  }

  // Phase 4: Liquefaction (Vertex Displacement)
  if (uDecay > 0.6) {
      float meltStrength = (uDecay - 0.6) * 5.0; 
      
      // Major drip downwards
      float dripNoise = snoise(vec2(pos.x * 2.0, uTime * 0.5));
      pos.y -= meltStrength * (dripNoise * 0.5 + 0.5);
      
      // Structural collapse (x-axis random walk)
      pos.x += meltStrength * dripNoise * 0.2;
      
      // Push back so it looks like it's falling "in" or dissolving
      pos.z -= meltStrength * 0.5;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const fragmentShader = `
uniform float uTime;
uniform float uDecay;
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vNoise;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

${simplexNoise3D}

void main() {
  vec2 uv = vUv;
  
  // Phase 4: The Melt (Texture Distortion)
  // We use snoise here for smooth liquid dripping
  if (uDecay > 0.6) {
      float meltFactor = (uDecay - 0.6) * 2.0;
      
      // Calculate drip offset using smooth noise
      float drip = snoise(vec2(uv.x * 8.0, uTime * 0.5)) * 0.5 + 0.5;
      drip *= meltFactor * 0.5;
      
      // Only affect things below the "melt line" which rises? 
      // Or just global distortion:
      uv.y -= drip;
  }

  // Phase 5: Chromatic Aberration (Data Rot)
  // Split channels based on decay
  float r = texture2D(uTexture, uv + vec2(uDecay * 0.02, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(uDecay * 0.02, 0.0)).b;
  vec4 color = vec4(r, g, b, 1.0);

  // Phase 2: Desaturation
  if (uDecay > 0.0) {
      float desatStr = smoothstep(0.0, 0.4, uDecay);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      // Crush contrast for that "Brutalist" photocopy look
      vec3 bw = vec3(smoothstep(0.2, 0.8, gray));
      color.rgb = mix(color.rgb, bw, desatStr);
  }

  // Phase 3: Digital Rot (Static/Grain)
  if (uDecay > 0.3) {
      float noiseStr = smoothstep(0.3, 0.7, uDecay);
      float whiteNoise = random(uv * uTime * 100.0);
      
      // Static Snow
      if (whiteNoise < noiseStr * 0.4) {
         // Some pixels burn to white, some to black
         if (random(uv) > 0.5) color.rgb = vec3(1.0);
         else color.rgb = vec3(0.0);
      }
      
      // Alpha Rot (Eating holes)
      // Use larger snoise for the "moth holes"
      float rotNoise = snoise(vec2(uv.x * 20.0, uv.y * 20.0 + uTime));
      if (rotNoise < (uDecay - 0.3) * 2.0 - 1.0) {
          discard;
      }
  }

  // Edge Fraying
  float edgeDist = distance(uv, vec2(0.5));
  if (edgeDist > 0.6 - (uDecay * 0.2)) {
      color.a *= smoothstep(0.05, 0.0, edgeDist - (0.5 - (uDecay * 0.2)));
  }

  gl_FragColor = color;
}
`
