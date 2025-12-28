
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
uniform float uExplode; // 0.0 to 1.0

${simplexNoise3D}

void main() {
  vUv = uv;
  vec3 pos = position;

  // Initial Wobble
  float noiseVal = snoise(vec2(pos.x * 1.5, uTime * 0.3));
  vNoise = noiseVal;
  
  // Phase 3: Lag
  if (uDecay > 0.0) {
      float lag = (1.0 - uv.y) * uDecay * 0.5;
      pos.y -= sin(uTime * 2.0) * lag * 0.2; 
  }

  // Phase 4: Liquefaction
  if (uDecay > 0.6) {
      float meltStrength = (uDecay - 0.6) * 5.0; 
      float dripNoise = snoise(vec2(pos.x * 2.0, uTime * 0.5));
      pos.y -= meltStrength * (dripNoise * 0.5 + 0.5);
      pos.x += meltStrength * dripNoise * 0.2;
      pos.z -= meltStrength * 0.5;
  }

  // Phase 5: The Collapse (Explosion)
  if (uExplode > 0.0) {
     // Scatter vertices
     float explosionNoise = snoise(vec2(pos.x, pos.y) * 10.0 + uTime);
     vec3 dir = vec3(
         snoise(vec2(pos.y, uTime)),
         snoise(vec2(pos.x, uTime)),
         snoise(vec2(pos.z, uTime))
     );
     
     pos += dir * uExplode * 5.0;
     
     // Randomize point size for depth
     gl_PointSize = (1.0 - uExplode) * 5.0 + (random(uv) * 2.0);
  } else {
     gl_PointSize = 2.0;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const fragmentShader = `
uniform float uTime;
uniform float uDecay;
uniform float uExplode;
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vNoise;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

${simplexNoise3D}

void main() {
  // If exploded, render as simple dots or texture fragments
  if (uExplode > 0.1) {
      if (random(vUv * uTime) > (1.0 - uExplode)) discard;
  }

  vec2 uv = vUv;
  
  // existing decay logic ...
  // Phase 4: The Melt
  if (uDecay > 0.6) {
      float meltFactor = (uDecay - 0.6) * 2.0;
      float drip = snoise(vec2(uv.x * 8.0, uTime * 0.5)) * 0.5 + 0.5;
      uv.y -= drip * meltFactor * 0.5;
  }

  // Phase 5: Chromatic Aberration
  float r = texture2D(uTexture, uv + vec2(uDecay * 0.02, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(uDecay * 0.02, 0.0)).b;
  vec4 color = vec4(r, g, b, 1.0);

  // Phase 2: Desaturation
  if (uDecay > 0.0) {
      float desatStr = smoothstep(0.0, 0.4, uDecay);
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 bw = vec3(smoothstep(0.2, 0.8, gray));
      color.rgb = mix(color.rgb, bw, desatStr);
  }

  // Phase 3: Digital Rot
  if (uDecay > 0.3) {
      float noiseStr = smoothstep(0.3, 0.7, uDecay);
      float whiteNoise = random(uv * uTime * 100.0);
      if (whiteNoise < noiseStr * 0.4) {
         if (random(uv) > 0.5) color.rgb = vec3(1.0);
         else color.rgb = vec3(0.0);
      }
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
  
  // Collapse Fade
  if (uExplode > 0.0) {
      color.a *= (1.0 - uExplode);
  }

  if (color.a < 0.01) discard;

  gl_FragColor = color;
}
`
