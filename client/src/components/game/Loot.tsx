import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { LootItem } from "../../lib/gameTypes";

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
      {/* Blade */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.08, 0.9, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.95} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {/* Blade edge taper */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.045, 0.2, 4]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.95} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {/* Crossguard */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.07]} />
        <meshStandardMaterial color="#8a7a50" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Grip */}
      <mesh castShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.35, 8]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
      {/* Pommel */}
      <mesh castShadow position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#8a7a50" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

// Chest armor model
function ArmorModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Main chest plate */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.6, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Abs detail */}
      <mesh castShadow position={[0, -0.1, 0.08]}>
        <boxGeometry args={[0.55, 0.35, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Shoulder pauldrons */}
      <mesh castShadow position={[-0.42, 0.18, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      <mesh castShadow position={[0.42, 0.18, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Center gem */}
      <mesh castShadow position={[0, 0.15, 0.09]}>
        <octahedronGeometry args={[0.07]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} emissive={color} emissiveIntensity={emissiveIntensity + 0.2} />
      </mesh>
    </group>
  );
}

// Potion bottle model
function PotionModel({ color, emissiveIntensity }: { color: string; emissiveIntensity: number }) {
  return (
    <group>
      {/* Bottle body */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0} transparent opacity={0.75} emissive={color} emissiveIntensity={emissiveIntensity + 0.3} />
      </mesh>
      {/* Bottle neck */}
      <mesh castShadow position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 0.22, 8]} />
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.8} emissive={color} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      {/* Cork */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.075, 0.07, 0.1, 8]} />
        <meshStandardMaterial color="#6a4a20" roughness={0.9} />
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
      {/* Main scroll body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.6, 12]} />
        <meshStandardMaterial color="#f0e0a0" roughness={0.9} />
      </mesh>
      {/* Top cap */}
      <mesh castShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
        <meshStandardMaterial color="#8a6040" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Bottom cap */}
      <mesh castShadow position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
        <meshStandardMaterial color="#8a6040" roughness={0.7} metalness={0.2} />
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
      {/* Crystal gem */}
      <mesh castShadow>
        <octahedronGeometry args={[0.2]} />
        <meshStandardMaterial color={color} roughness={0.05} metalness={0.1} transparent opacity={0.85} emissive={color} emissiveIntensity={emissiveIntensity + 0.3} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <octahedronGeometry args={[0.12]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export default function Loot({ item }: LootProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const groundRingRef = useRef<THREE.Mesh>(null);
  const orbitRingRef = useRef<THREE.Mesh>(null);

  const color = getRarityColor(item.rarity);
  const emissiveIntensity = getRarityEmissiveIntensity(item.rarity);
  const lightIntensity = getLightIntensity(item.rarity);

  const isRare = item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary';
  const isEpicPlus = item.rarity === 'epic' || item.rarity === 'legendary';
  const isLegendary = item.rarity === 'legendary';

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
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
      auraRef.current.scale.setScalar(pulse);
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

      {/* Ground beacon with spinning ring */}
      <mesh ref={groundRingRef} position={[item.position.x, -0.44, item.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.45, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Inner ground fill */}
      <mesh position={[item.position.x, -0.445, item.position.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Vertical light beam for rare+ items */}
      {isRare && (
        <mesh ref={beamRef} position={[item.position.x, 1.2, item.position.z]}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* Aura sphere for epic/legendary */}
      {isEpicPlus && (
        <mesh ref={auraRef} position={[item.position.x, item.position.y + 0.4, item.position.z]}>
          <sphereGeometry args={[isLegendary ? 0.75 : 0.6, 14, 14]} />
          <meshBasicMaterial color={color} transparent opacity={0.09} side={THREE.BackSide} depthWrite={false} />
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
