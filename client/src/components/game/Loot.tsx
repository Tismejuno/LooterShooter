import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { LootItem } from "../../lib/gameTypes";
import {
  metalTex, leatherTex, magicTex, crystalTex,
  stoneTex, goldTex, runeInscriptionTex, glowGradientTex,
} from "../../lib/textures";

interface LootProps {
  item: LootItem;
}

// Get rarity color for materials
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return '#c0c0c0';
    case 'uncommon': return '#1eff00';
    case 'rare': return '#0070dd';
    case 'epic': return '#a335ee';
    case 'legendary': return '#ff8000';
    default: return '#c0c0c0';
  }
};

const getRarityEmissiveIntensity = (rarity: string) => {
  switch (rarity) {
    case 'common': return 0.0;
    case 'uncommon': return 0.15;
    case 'rare': return 0.25;
    case 'epic': return 0.4;
    case 'legendary': return 0.8;
    default: return 0;
  }
};

const getLightIntensity = (rarity: string) => {
  switch (rarity) {
    case 'common': return 0.2;
    case 'uncommon': return 0.5;
    case 'rare': return 0.8;
    case 'epic': return 1.2;
    case 'legendary': return 2.0;
    default: return 0.2;
  }
};

// Sword model for weapon items
function SwordModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Blade – metal texture map for realism */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.08, 0.9, 0.04]} />
        <meshStandardMaterial map={metalTex(1)} color={color} roughness={0.12} metalness={0.97} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {/* Blade edge taper */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.045, 0.2, 4]} />
        <meshStandardMaterial map={metalTex(1)} color={color} roughness={0.12} metalness={0.97} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {/* Crossguard – gold texture */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.07]} />
        <meshStandardMaterial map={goldTex()} color="#8a7a50" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Grip – leather texture */}
      <mesh castShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.35, 8]} />
        <meshStandardMaterial map={leatherTex(1)} color="#4a2a10" roughness={0.85} />
      </mesh>
      {/* Pommel */}
      <mesh castShadow position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial map={goldTex()} color="#8a7a50" roughness={0.25} metalness={0.85} />
      </mesh>
    </group>
  );
}

// Chest armor model
function ArmorModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Main chest plate – metal texture */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.6, 0.15]} />
        <meshStandardMaterial map={metalTex(2)} color={color} roughness={0.28} metalness={0.72} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Abs detail */}
      <mesh castShadow position={[0, -0.1, 0.08]}>
        <boxGeometry args={[0.55, 0.35, 0.06]} />
        <meshStandardMaterial map={metalTex(1)} color={color} roughness={0.18} metalness={0.82} />
      </mesh>
      {/* Shoulder pauldrons */}
      <mesh castShadow position={[-0.42, 0.18, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial map={metalTex(1)} color={color} roughness={0.28} metalness={0.72} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      <mesh castShadow position={[0.42, 0.18, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial map={metalTex(1)} color={color} roughness={0.28} metalness={0.72} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Center gem – crystal texture */}
      <mesh castShadow position={[0, 0.15, 0.09]}>
        <octahedronGeometry args={[0.07]} />
        <meshStandardMaterial map={crystalTex()} color={color} roughness={0.05} metalness={0.1} emissive={color} emissiveIntensity={emissiveIntensity + 0.2} />
      </mesh>
    </group>
  );
}

// Potion bottle model
function PotionModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Bottle body – magic swirl texture visible through glass */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial map={magicTex()} color={color} roughness={0.05} metalness={0} transparent opacity={0.78} emissive={color} emissiveIntensity={emissiveIntensity + 0.3} />
      </mesh>
      {/* Bottle neck */}
      <mesh castShadow position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.08} transparent opacity={0.82} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Cork – leather texture */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.075, 0.07, 0.1, 8]} />
        <meshStandardMaterial map={leatherTex(1)} color="#6a4a20" roughness={0.88} />
      </mesh>
      {/* Liquid shine */}
      <mesh position={[0.06, 0.04, 0.14]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Scroll model
function ScrollModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Main scroll body – stone texture for parchment feel */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.6, 12]} />
        <meshStandardMaterial map={stoneTex(1)} color="#f0e0a0" roughness={0.88} />
      </mesh>
      {/* Top cap – leather */}
      <mesh castShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
        <meshStandardMaterial map={leatherTex(1)} color="#8a6040" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Bottom cap */}
      <mesh castShadow position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
        <meshStandardMaterial map={leatherTex(1)} color="#8a6040" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Magic rune glow line */}
      <mesh position={[0, 0, 0.19]}>
        <planeGeometry args={[0.24, 0.45]} />
        <meshBasicMaterial color={color} transparent opacity={emissiveIntensity * 0.6 + 0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Ribbon seal */}
      <mesh position={[0, 0, 0.2]}>
        <planeGeometry args={[0.08, 0.12]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Consumable / misc item (gem/crystal)
function ConsumableModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Crystal gem – crystal texture */}
      <mesh castShadow>
        <octahedronGeometry args={[0.2]} />
        <meshStandardMaterial map={crystalTex()} color={color} roughness={0.05} metalness={0.1} transparent opacity={0.85} emissive={color} emissiveIntensity={emissiveIntensity + 0.3} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <octahedronGeometry args={[0.12]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Ammo model (magazine + rounds)
function AmmoModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Magazine body */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.22, 0.42, 0.1]} />
        <meshStandardMaterial map={metalTex(1)} color="#4d4d5a" roughness={0.35} metalness={0.8} emissive={color} emissiveIntensity={emissiveIntensity * 0.35} />
      </mesh>
      {/* Magazine plate */}
      <mesh castShadow position={[0, -0.21, 0]}>
        <boxGeometry args={[0.24, 0.06, 0.12]} />
        <meshStandardMaterial map={metalTex(1)} color="#2c2c34" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Top rounds */}
      {[-0.055, 0, 0.055].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.24, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.1, 8]} />
          <meshStandardMaterial map={goldTex()} color="#c99d3a" roughness={0.2} metalness={0.92} emissive={color} emissiveIntensity={emissiveIntensity * 0.25} />
        </mesh>
      ))}
    </group>
  );
}

// Gem / precious stone model
function GemModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Main gem body – crystal texture + faceted geometry */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <octahedronGeometry args={[0.23, 1]} />
        <meshStandardMaterial map={crystalTex()} color={color} roughness={0.0} metalness={0.05} transparent opacity={0.88} emissive={color} emissiveIntensity={emissiveIntensity + 0.5} />
      </mesh>
      {/* Upper pavilion highlight */}
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.12, 0.18, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={0.0} />
      </mesh>
      {/* Inner core glow */}
      <mesh>
        <octahedronGeometry args={[0.1, 0]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Sparkle highlight */}
      <mesh position={[0.06, 0.12, 0.1]}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// Rune / inscribed tablet model
function RuneModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Stone tablet body – stone_wall texture */}
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.46, 0.08]} />
        <meshStandardMaterial map={stoneTex(1)} color="#3a3040" roughness={0.78} metalness={0.1} />
      </mesh>
      {/* Carved border */}
      <mesh castShadow position={[0, 0, 0.042]}>
        <boxGeometry args={[0.26, 0.38, 0.02]} />
        <meshStandardMaterial color="#2a2030" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Central rune glyph – glowing cross */}
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[0.06, 0.28, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={emissiveIntensity * 0.8 + 0.4} />
      </mesh>
      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[0.28, 0.06, 0.01]} />
        <meshBasicMaterial color={color} transparent opacity={emissiveIntensity * 0.8 + 0.4} />
      </mesh>
      {/* Corner rune dots */}
      {[[-0.09, 0.16], [0.09, 0.16], [-0.09, -0.16], [0.09, -0.16]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.055]}>
          <circleGeometry args={[0.025, 6]} />
          <meshBasicMaterial color={color} transparent opacity={emissiveIntensity * 0.7 + 0.3} />
        </mesh>
      ))}
      {/* Glow aura on rune face – rune inscription texture overlay */}
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[0.28, 0.4]} />
        <meshBasicMaterial map={runeInscriptionTex()} color={color} transparent opacity={emissiveIntensity * 0.7 + 0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Accessory / ring model
function AccessoryModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Ring band – gold texture */}
      <mesh castShadow>
        <torusGeometry args={[0.2, 0.045, 12, 32]} />
        <meshStandardMaterial map={goldTex()} color="#c8a820" roughness={0.18} metalness={0.94} emissive="#806010" emissiveIntensity={0.15} />
      </mesh>
      {/* Gem setting (raised prong) */}
      <mesh castShadow position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.06, 8]} />
        <meshStandardMaterial map={goldTex()} color="#c8a820" roughness={0.22} metalness={0.92} />
      </mesh>
      {/* Gem stone – crystal texture */}
      <mesh castShadow position={[0, 0.255, 0]}>
        <octahedronGeometry args={[0.065, 1]} />
        <meshStandardMaterial map={crystalTex()} color={color} roughness={0.0} metalness={0.0} transparent opacity={0.9} emissive={color} emissiveIntensity={emissiveIntensity + 0.4} />
      </mesh>
      {/* Setting prongs */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} castShadow
          position={[Math.cos(angle) * 0.052, 0.26, Math.sin(angle) * 0.052]}
          rotation={[0, 0, angle]}>
          <coneGeometry args={[0.012, 0.05, 4]} />
          <meshStandardMaterial map={goldTex()} color="#c8a820" roughness={0.2} metalness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

// Relic / ancient artifact model
function RelicModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Main orb – metal texture with dark tint */}
      <mesh castShadow>
        <sphereGeometry args={[0.19, 14, 14]} />
        <meshStandardMaterial map={metalTex(1)} color="#1a0a20" roughness={0.15} metalness={0.35} emissive={color} emissiveIntensity={emissiveIntensity * 0.4} />
      </mesh>
      {/* Outer shell bands (2 rings) – gold texture */}
      <mesh castShadow>
        <torusGeometry args={[0.19, 0.028, 8, 28]} />
        <meshStandardMaterial map={goldTex()} color="#8a6030" roughness={0.28} metalness={0.87} />
      </mesh>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.19, 0.028, 8, 28]} />
        <meshStandardMaterial map={goldTex()} color="#8a6030" roughness={0.28} metalness={0.87} />
      </mesh>
      {/* Inner pulsing core */}
      <mesh>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={emissiveIntensity * 0.6 + 0.3} />
      </mesh>
      {/* Connecting gem nodes */}
      {[
        [0, 0.2, 0], [0, -0.2, 0], [0.2, 0, 0], [-0.2, 0, 0]
      ].map(([x, y, z], i) => (
        <mesh key={i} castShadow position={[x, y, z]}>
          <octahedronGeometry args={[0.038]} />
          <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} emissive={color} emissiveIntensity={emissiveIntensity + 0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Material / crafting resource model (raw crystal cluster)
function MaterialModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Central spike */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <coneGeometry args={[0.09, 0.38, 5]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} emissive={color} emissiveIntensity={emissiveIntensity * 0.8} />
      </mesh>
      {/* Side spikes */}
      <mesh castShadow position={[0.1, 0, 0.05]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.06, 0.28, 5]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} emissive={color} emissiveIntensity={emissiveIntensity * 0.6} />
      </mesh>
      <mesh castShadow position={[-0.1, -0.02, 0.05]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.055, 0.25, 5]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} emissive={color} emissiveIntensity={emissiveIntensity * 0.6} />
      </mesh>
      <mesh castShadow position={[0.02, 0.02, -0.1]} rotation={[0.4, 0, 0.2]}>
        <coneGeometry args={[0.05, 0.22, 5]} />
        <meshStandardMaterial map={crystalTex()} color={color} roughness={0.18} metalness={0.5} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Rock base – stone texture */}
      <mesh castShadow position={[0, -0.1, 0]}>
        <dodecahedronGeometry args={[0.13]} />
        <meshStandardMaterial map={stoneTex(1)} color="#4a4040" roughness={0.92} metalness={0.05} />
      </mesh>
    </group>
  );
}

// Artifact / legendary ancient relic model
function ArtifactModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Base disc plinth – stone texture */}
      <mesh castShadow position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.08, 8]} />
        <meshStandardMaterial map={stoneTex(1)} color="#302030" roughness={0.28} metalness={0.72} />
      </mesh>
      {/* Pyramid-like body – metal texture */}
      <mesh castShadow position={[0, 0.04, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial map={metalTex(1)} color="#201020" roughness={0.18} metalness={0.62} emissive={color} emissiveIntensity={emissiveIntensity * 0.25} />
      </mesh>
      {/* Gold trim rings */}
      {[-0.05, 0.04, 0.13].map((y, i) => (
        <mesh key={i} castShadow position={[0, y, 0]}>
          <torusGeometry args={[0.22 - i * 0.03, 0.02, 6, 24]} />
          <meshStandardMaterial map={goldTex()} color="#c8a020" roughness={0.18} metalness={0.96} />
        </mesh>
      ))}
      {/* Central power gem – crystal texture */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <octahedronGeometry args={[0.085, 1]} />
        <meshStandardMaterial map={crystalTex()} color={color} roughness={0.0} metalness={0.0} transparent opacity={0.92} emissive={color} emissiveIntensity={emissiveIntensity + 0.6} />
      </mesh>
      {/* Energy beams from equatorial points */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.18, 0.04, Math.sin(angle) * 0.18]}>
          <octahedronGeometry args={[0.035]} />
          <meshBasicMaterial color={color} transparent opacity={emissiveIntensity * 0.8 + 0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Helper: compute particle orbit angle at time t
function particleAngle(i: number, t: number, phases: Float32Array, speeds: Float32Array) {
  return phases[i] + t * speeds[i];
}

// ── Floating ambient particles for epic / legendary items ─────────────────────
function LootParticles({ color, isLegendary }: { color: string; isLegendary: boolean }) {
  const COUNT = isLegendary ? 24 : 14;
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases, radii, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const ph = new Float32Array(COUNT);
    const r = new Float32Array(COUNT);
    const sp = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      ph[i] = (i / COUNT) * Math.PI * 2 + Math.random() * 0.5;
      r[i] = 0.3 + Math.random() * (isLegendary ? 0.65 : 0.45);
      sp[i] = 0.8 + Math.random() * 1.2;
      pos[i * 3] = Math.cos(ph[i]) * r[i];
      pos[i * 3 + 1] = Math.random() * 0.8;
      pos[i * 3 + 2] = Math.sin(ph[i]) * r[i];
    }
    return { positions: pos, phases: ph, radii: r, speeds: sp };
  }, [COUNT, isLegendary]);

  useFrame((state) => {
    if (!posAttr.current || !pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const arr = posAttr.current.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const angle = particleAngle(i, t, phases, speeds);
      arr[i * 3] = Math.cos(angle) * radii[i];
      arr[i * 3 + 1] = 0.15 + ((i / COUNT + t * speeds[i] * 0.25) % 1) * (isLegendary ? 1.0 : 0.7);
      arr[i * 3 + 2] = Math.sin(angle) * radii[i];
    }
    posAttr.current.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.size = 0.07 + Math.sin(t * 3) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.08} transparent opacity={isLegendary ? 0.75 : 0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// Rarity label colors for the HTML overlay
const rarityLabelColor: Record<string, string> = {
  common: '#c0c0c0',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
};

/** Spawn-pop animation constants */
const SPAWN_DURATION = 0.45; // seconds for the pop-in
const SPAWN_OVERSHOOT = 0.25; // how much scale overshoots past 1.0

export default function Loot({ item }: LootProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const groundRingRef = useRef<THREE.Mesh>(null);
  const orbitRingRef = useRef<THREE.Mesh>(null);

  // Spawn-pop animation: track when this item was first rendered
  const spawnTimeRef = useRef<number | null>(null);

  const color = getRarityColor(item.rarity);
  const emissiveIntensity = getRarityEmissiveIntensity(item.rarity);
  const lightIntensity = getLightIntensity(item.rarity);

  const isRare = item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary';
  const isEpicPlus = item.rarity === 'epic' || item.rarity === 'legendary';
  const isLegendary = item.rarity === 'legendary';

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // ── Spawn-pop animation ───────────────────────────────────────────────────
    if (spawnTimeRef.current === null) spawnTimeRef.current = t;
    const spawnAge = t - spawnTimeRef.current;
    const spawnT = Math.min(spawnAge / SPAWN_DURATION, 1);
    // Elastic overshoot: scale pops past 1 then settles
    const elasticScale = spawnT < 1
      ? 1 + Math.sin(spawnT * Math.PI) * SPAWN_OVERSHOOT * (1 - spawnT)
      : 1;

    if (groupRef.current) {
      // Apply spawn scale
      groupRef.current.scale.setScalar(elasticScale);

      // Floating: legendary bobs higher + faster
      const floatAmp = isLegendary ? 0.26 : isEpicPlus ? 0.2 : 0.15;
      const floatSpeed = isLegendary ? 2.5 : 2.0;
      groupRef.current.position.y = item.position.y + Math.sin(t * floatSpeed) * floatAmp;

      // Rotation: legendary spins faster
      const rotSpeed = isLegendary ? 1.4 : isEpicPlus ? 1.0 : 0.7;
      groupRef.current.rotation.y = t * rotSpeed;
    }

    // Aura pulse for epic/legendary
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * (isLegendary ? 4 : 3)) * (isLegendary ? 0.18 : 0.12);
      auraRef.current.scale.setScalar(pulse * elasticScale);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity =
        (isLegendary ? 0.12 : 0.07) + Math.sin(t * 2.5) * 0.04;
    }

    // Beam pulse for rare+
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.1 + Math.sin(t * 3 + 1) * 0.06;
    }

    // Ground beacon ring spins
    if (groundRingRef.current) {
      groundRingRef.current.rotation.z = t * (isLegendary ? 2.5 : 1.5);
      (groundRingRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(t * 2) * 0.1;
    }

    // Orbit ring spins in opposite direction for legendary
    if (orbitRingRef.current) {
      orbitRingRef.current.rotation.z = -t * 2.0;
      orbitRingRef.current.rotation.x = Math.sin(t * 0.8) * 0.4;
      (orbitRingRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(t * 3.5) * 0.08;
    }
  });

  const renderModel = () => {
    switch (item.type) {
      case 'weapon':
        return <SwordModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'armor':
        return <ArmorModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'potion':
        return <PotionModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'scroll':
        return <ScrollModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'ammo':
        return <AmmoModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'rune':
        return <RuneModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'gem':
        return <GemModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'accessory':
      case 'offhand':
        return <AccessoryModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'relic':
        return <RelicModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'artifact':
        return <ArtifactModel color={color} emissiveIntensity={emissiveIntensity} />;
      case 'material':
      case 'blueprint':
        return <MaterialModel color={color} emissiveIntensity={emissiveIntensity} />;
      default:
        return <ConsumableModel color={color} emissiveIntensity={emissiveIntensity} />;
    }
  };

  return (
    <group>
      {/* Item model group (floats and rotates) */}
      <group ref={groupRef} position={[item.position.x, item.position.y, item.position.z]}>
        {renderModel()}
      </group>

      {/* Ambient floating particles for epic / legendary */}
      {isEpicPlus && (
        <group position={[item.position.x, item.position.y, item.position.z]}>
          <LootParticles color={color} isLegendary={isLegendary} />
        </group>
      )}

      {/* Item name + rarity label — always visible to help navigation */}
      <group position={[item.position.x, item.position.y + 1.1, item.position.z]}>
        <Html
          center
          distanceFactor={8}
          occlude={false}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            textAlign: 'center',
            lineHeight: '1.2',
            fontFamily: '"Segoe UI", sans-serif',
            textShadow: '0 0 6px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: rarityLabelColor[item.rarity] ?? '#ffffff',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {item.rarity}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#f0f0f0',
              marginTop: '1px',
            }}>
              {item.name}
            </div>
          </div>
        </Html>
      </group>

      {/* Ground beacon with spinning ring */}
      <mesh ref={groundRingRef} position={[item.position.x, -0.44, item.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.45, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Inner ground fill – glow gradient for a smooth radial spotlight */}
      <mesh position={[item.position.x, -0.445, item.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshBasicMaterial map={glowGradientTex()} color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Vertical light beam for rare+ items */}
      {isRare && (
        <mesh ref={beamRef} position={[item.position.x, 1.2, item.position.z]}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* Aura sphere for epic/legendary – glow gradient gives a soft falloff */}
      {isEpicPlus && (
        <mesh ref={auraRef} position={[item.position.x, item.position.y + 0.4, item.position.z]}>
          <sphereGeometry args={[isLegendary ? 0.75 : 0.6, 14, 14]} />
          <meshBasicMaterial map={glowGradientTex()} color={color} transparent opacity={0.09} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}

      {/* Orbit ring for legendary only */}
      {isLegendary && (
        <mesh ref={orbitRingRef} position={[item.position.x, item.position.y + 0.5, item.position.z]}>
          <torusGeometry args={[0.55, 0.03, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}

      {/* Item glow light */}
      <pointLight
        position={[item.position.x, item.position.y + 0.7, item.position.z]}
        color={color}
        intensity={lightIntensity}
        distance={isLegendary ? 6 : isEpicPlus ? 4.5 : 3}
        decay={2}
      />
    </group>
  );
}
