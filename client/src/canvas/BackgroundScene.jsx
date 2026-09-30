import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Custom animated GLSL gradient mesh ────────────────────────────────────
const gradientVertShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const gradientFragShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

vec3 palette(float t) {
  vec3 a = vec3(0.02, 0.03, 0.10);
  vec3 b = vec3(0.03, 0.04, 0.18);
  vec3 c = vec3(0.06, 0.04, 0.20);
  vec3 d = vec3(0.20, 0.40, 0.80);
  return a + b * cos(6.28318 * (c * t + d));
}

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float smoothnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(noise(i), noise(i + vec2(1.0, 0.0)), u.x),
    mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * smoothnoise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.08;

  // Animated warped gradient
  vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(1.0)));
  vec2 r = vec2(fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t));

  float f = fbm(uv + r);

  // Deep space dark with blue-violet hints
  vec3 col = mix(
    vec3(0.04, 0.04, 0.09),   // near black
    vec3(0.06, 0.04, 0.16),   // deep violet
    clamp(f * f * 4.0, 0.0, 1.0)
  );
  col = mix(col, vec3(0.10, 0.08, 0.30), clamp(length(q), 0.0, 1.0));
  col = mix(col, vec3(0.18, 0.12, 0.40), f * f * f * 2.0);

  // Radial vignette brightening toward center
  float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5));
  col *= 0.85 + 0.15 * vignette;

  gl_FragColor = vec4(col, 1.0);
}
`

function GradientPlane() {
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta
    }
  })

  return (
    <mesh>
      {/* Full-screen triangle strip */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={gradientVertShader}
        fragmentShader={gradientFragShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

// ─── Floating particles ─────────────────────────────────────────────────────
function FloatingParticles({ count = 80 }) {
  const meshRef = useRef()

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = []
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5
      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: 0,
      })
    }
    return { positions, velocities }
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i].x
      pos[i * 3 + 1] += velocities[i].y

      if (Math.abs(pos[i * 3])     > 10) velocities[i].x *= -1
      if (Math.abs(pos[i * 3 + 1]) > 6)  velocities[i].y *= -1
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={new THREE.Color('#4f8fff')}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

// ─── Main export ────────────────────────────────────────────────────────────
export default function BackgroundScene() {
  return (
    <div className="bg-canvas" aria-hidden="true">
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 0, 1], fov: 90, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
      >
        <GradientPlane />
        <FloatingParticles count={80} />
      </Canvas>
    </div>
  )
}
