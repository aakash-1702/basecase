"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Palette per theme: paper = ink line-drawing + coral points, dark = warm. */
const PALETTE = {
  light: { points: "#e4572e", pointsOpacity: 0.5, outer: "#14110f", outerOpacity: 0.16, inner: "#e4572e", innerOpacity: 0.22 },
  dark: { points: "#ff6b3d", pointsOpacity: 0.7, outer: "#f2eee4", outerOpacity: 0.14, inner: "#ff6b3d", innerOpacity: 0.2 },
} as const;

type Palette = (typeof PALETTE)[keyof typeof PALETTE];

/** Small seeded PRNG so the point cloud is deterministic (pure during render). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────── particles: a slowly drifting point cloud ───────────── */
function Particles({ count = 900, palette }: { count?: number; palette: Palette }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = mulberry32(1702);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.6 + rand() * 1.6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += delta * 0.05;
    p.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={palette.points}
        size={0.028}
        sizeAttenuation
        transparent
        opacity={palette.pointsOpacity}
        depthWrite={false}
      />
    </points>
  );
}

/* ───────────── wireframe icosahedron drawn like a line illustration ───────────── */
function Wire({ palette }: { palette: Palette }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (outer.current) {
      outer.current.rotation.y += delta * 0.18;
      outer.current.rotation.x += delta * 0.07;
    }
    if (inner.current) {
      inner.current.rotation.y -= delta * 0.12;
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
      inner.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.9, 1]} />
        <meshBasicMaterial color={palette.outer} wireframe transparent opacity={palette.outerOpacity} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshBasicMaterial color={palette.inner} wireframe transparent opacity={palette.innerOpacity} />
      </mesh>
    </group>
  );
}

/* ───────────── pointer parallax on the whole scene ───────────── */
function Rig() {
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 0.6;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame((state) => {
    state.camera.position.x += (target.current.x - state.camera.position.x) * 0.04;
    state.camera.position.y += (-target.current.y - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * Hero background. Render loop runs only while the hero is on screen and is
 * frozen for users who prefer reduced motion. DPR is capped so it stays cheap
 * on retina displays.
 */
export default function HeroScene({ className, dark = false }: { className?: string; dark?: boolean }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // client-only component (dynamic, ssr:false) so reading matchMedia in the
  // initialiser is safe; changes are picked up through the listener callback
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const palette = dark ? PALETTE.dark : PALETTE.light;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameloop = reduced ? "demand" : visible ? "always" : "never";

  return (
    <div ref={wrapper} className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={frameloop}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 6.5], fov: 48 }}
        style={{ background: "transparent" }}
      >
        <Particles palette={palette} />
        <Wire palette={palette} />
        {!reduced && <Rig />}
      </Canvas>
    </div>
  );
}
