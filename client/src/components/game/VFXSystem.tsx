import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useVFX, VFXEffect } from "../../lib/stores/useVFX";

// ──────────────────────────────────────────────────────────────────────────────
// Hit spark burst – fires when a projectile connects with an enemy
// ──────────────────────────────────────────────────────────────────────────────
function HitParticles({ effect }: { effect: VFXEffect }) {
  const COUNT = 16;
  const MAX_AGE = 0.45;
  const startTimeRef = useRef<number | null>(null);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { removeEffect } = useVFX();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = effect.position.x;
      pos[i * 3 + 1] = effect.position.y + 0.5;
      pos[i * 3 + 2] = effect.position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = 2.5 + Math.random() * 3.5;
      vel[i * 3] = Math.cos(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.abs(Math.sin(phi)) * speed + 1.5;
      vel[i * 3 + 2] = Math.cos(phi) * Math.sin(theta) * speed;
    }
    return { positions: pos, velocities: vel };
  }, [effect.position]);

  useFrame((state) => {
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - startTimeRef.current;

    if (age > MAX_AGE) {
      removeEffect(effect.id);
      return;
    }

    if (!posAttr.current) return;
    const arr = posAttr.current.array as Float32Array;
    const dt = 0.016;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += velocities[i * 3] * dt;
      arr[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      arr[i * 3 + 2] += velocities[i * 3 + 2] * dt;
      velocities[i * 3 + 1] -= 18 * dt; // gravity
    }
    posAttr.current.needsUpdate = true;

    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 1 - age / MAX_AGE);
      mat.size = 0.18 * (1 - age / MAX_AGE * 0.5);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={effect.color}
        size={0.18}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Death explosion – fires when an enemy dies
// ──────────────────────────────────────────────────────────────────────────────
function DeathExplosion({ effect }: { effect: VFXEffect }) {
  const COUNT = 28;
  const MAX_AGE = 1.0;
  const startTimeRef = useRef<number | null>(null);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { removeEffect } = useVFX();

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = effect.position.x;
      pos[i * 3 + 1] = effect.position.y + 0.6;
      pos[i * 3 + 2] = effect.position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.3) * Math.PI * 0.7;
      const speed = 3 + Math.random() * 5;
      vel[i * 3] = Math.cos(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.abs(Math.sin(phi)) * speed * 0.8 + 2;
      vel[i * 3 + 2] = Math.cos(phi) * Math.sin(theta) * speed;
    }
    return { positions: pos, velocities: vel };
  }, [effect.position]);

  useFrame((state) => {
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - startTimeRef.current;
    const t = age / MAX_AGE;

    if (age > MAX_AGE) {
      removeEffect(effect.id);
      return;
    }

    if (posAttr.current) {
      const arr = posAttr.current.array as Float32Array;
      const dt = 0.016;
      for (let i = 0; i < COUNT; i++) {
        arr[i * 3] += velocities[i * 3] * dt;
        arr[i * 3 + 1] += velocities[i * 3 + 1] * dt;
        arr[i * 3 + 2] += velocities[i * 3 + 2] * dt;
        velocities[i * 3 + 1] -= 14 * dt;
      }
      posAttr.current.needsUpdate = true;

      if (pointsRef.current) {
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        mat.opacity = Math.max(0, 1 - t);
      }
    }

    // Expand shockwave ring
    if (ringRef.current) {
      const s = 1 + t * 5;
      ringRef.current.scale.set(s, s, s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.6 - t * 0.8);
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={effect.color}
          size={0.22}
          transparent
          opacity={1}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Shockwave ring */}
      <mesh ref={ringRef} position={[effect.position.x, effect.position.y + 0.1, effect.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 24]} />
        <meshBasicMaterial color={effect.color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Ability cast ring – expands outward when player uses an ability
// ──────────────────────────────────────────────────────────────────────────────
function AbilityRing({ effect }: { effect: VFXEffect }) {
  const MAX_AGE = 0.7;
  const startTimeRef = useRef<number | null>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const burstRef = useRef<THREE.Mesh>(null);
  const { removeEffect } = useVFX();

  useFrame((state) => {
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - startTimeRef.current;
    const t = age / MAX_AGE;

    if (age > MAX_AGE) {
      removeEffect(effect.id);
      return;
    }

    const easeOut = 1 - (1 - t) * (1 - t);
    const outerS = 1 + easeOut * 6;
    const innerS = 1 + easeOut * 3;
    const fadeOut = Math.max(0, 1 - t * 1.2);

    if (outerRingRef.current) {
      outerRingRef.current.scale.set(outerS, outerS, outerS);
      (outerRingRef.current.material as THREE.MeshBasicMaterial).opacity = fadeOut * 0.5;
    }
    if (innerRingRef.current) {
      innerRingRef.current.scale.set(innerS, innerS, innerS);
      (innerRingRef.current.material as THREE.MeshBasicMaterial).opacity = fadeOut * 0.8;
    }
    if (burstRef.current) {
      const bs = 1 + easeOut * 2;
      burstRef.current.scale.setScalar(bs);
      (burstRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.4 - t * 0.5);
    }
  });

  return (
    <group position={[effect.position.x, effect.position.y + 0.1, effect.position.z]}>
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.85, 32]} />
        <meshBasicMaterial color={effect.color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial color={effect.color} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={burstRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color={effect.color} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Level-up spiral – golden particles swirling upward
// ──────────────────────────────────────────────────────────────────────────────
function LevelUpSpiral({ effect }: { effect: VFXEffect }) {
  const COUNT = 32;
  const MAX_AGE = 2.0;
  const startTimeRef = useRef<number | null>(null);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { removeEffect } = useVFX();

  const { positions, phases, radii } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const ph = new Float32Array(COUNT);
    const r = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      ph[i] = (i / COUNT) * Math.PI * 2;
      r[i] = 0.4 + Math.random() * 0.7;
      pos[i * 3] = effect.position.x + Math.cos(ph[i]) * r[i];
      pos[i * 3 + 1] = effect.position.y;
      pos[i * 3 + 2] = effect.position.z + Math.sin(ph[i]) * r[i];
    }
    return { positions: pos, phases: ph, radii: r };
  }, [effect.position]);

  useFrame((state) => {
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - startTimeRef.current;
    const t = age / MAX_AGE;

    if (age > MAX_AGE) {
      removeEffect(effect.id);
      return;
    }

    if (posAttr.current) {
      const arr = posAttr.current.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const angle = phases[i] + age * 3.5;
        const r = radii[i] * (1 - t * 0.4);
        arr[i * 3] = effect.position.x + Math.cos(angle) * r;
        arr[i * 3 + 1] = effect.position.y + age * 1.8 * (0.4 + (i / COUNT) * 0.6);
        arr[i * 3 + 2] = effect.position.z + Math.sin(angle) * r;
      }
      posAttr.current.needsUpdate = true;

      if (pointsRef.current) {
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        const fadeIn = Math.min(1, age * 4);
        const fadeOut = Math.max(0, 1 - (t - 0.6) / 0.4);
        mat.opacity = Math.min(fadeIn, fadeOut) * 0.9;
        mat.size = 0.2 + Math.sin(age * 6) * 0.06;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={effect.color}
        size={0.2}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Root VFXSystem – maps active effects to their renderer
// ──────────────────────────────────────────────────────────────────────────────
export default function VFXSystem() {
  const { effects } = useVFX();

  return (
    <>
      {effects.map((effect) => {
        switch (effect.type) {
          case "hit":
            return <HitParticles key={effect.id} effect={effect} />;
          case "death":
            return <DeathExplosion key={effect.id} effect={effect} />;
          case "ability":
            return <AbilityRing key={effect.id} effect={effect} />;
          case "levelup":
            return <LevelUpSpiral key={effect.id} effect={effect} />;
          default:
            return null;
        }
      })}
    </>
  );
}
