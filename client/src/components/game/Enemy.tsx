import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { Enemy as EnemyType } from "../../lib/gameTypes";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";

interface EnemyProps {
  enemy: EnemyType;
}

// Zombie - slow, rotting green-brown humanoid with outstretched arms
function ZombieModel() {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bodyColor = '#5a6820';
  const skinColor = '#8a6840';
  const darkSkin = '#5a3820';
  const eyeColor = '#ff4400';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const swing = Math.sin(t * 4) * 0.4;
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = swing * 0.5 + 0.45;
      leftArmRef.current.rotation.z = 0.15;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -swing * 0.5 + 0.35;
      rightArmRef.current.rotation.z = -0.12;
    }
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    // Head lolls
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 3) * 0.06;
    }
  });

  return (
    <group>
      {/* Legs */}
      <group ref={leftLegRef} position={[-0.17, 0.5, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.11, 0.1, 0.48, 8]} />
          <meshStandardMaterial color="#3a3010" roughness={0.95} />
        </mesh>
        <mesh castShadow position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.44, 8]} />
          <meshStandardMaterial color="#3a3010" roughness={0.95} />
        </mesh>
        {/* Foot */}
        <mesh castShadow position={[0, -0.72, 0.05]}>
          <boxGeometry args={[0.14, 0.1, 0.24]} />
          <meshStandardMaterial color="#2a2008" roughness={0.97} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.17, 0.5, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.11, 0.1, 0.48, 8]} />
          <meshStandardMaterial color="#3a3010" roughness={0.95} />
        </mesh>
        <mesh castShadow position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.44, 8]} />
          <meshStandardMaterial color="#3a3010" roughness={0.95} />
        </mesh>
        <mesh castShadow position={[0, -0.72, 0.05]}>
          <boxGeometry args={[0.14, 0.1, 0.24]} />
          <meshStandardMaterial color="#2a2008" roughness={0.97} />
        </mesh>
      </group>

      {/* Hunched torso */}
      <mesh castShadow position={[0, 0.86, 0]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[0.66, 0.67, 0.4]} />
        <meshStandardMaterial color={bodyColor} roughness={0.92} />
      </mesh>
      {/* Torn shirt patches */}
      <mesh position={[0.18, 0.82, 0.21]} rotation={[0.28, 0, 0.2]}>
        <boxGeometry args={[0.22, 0.28, 0.01]} />
        <meshStandardMaterial color={darkSkin} roughness={0.97} />
      </mesh>
      <mesh position={[-0.15, 0.9, 0.21]} rotation={[0.28, 0, -0.15]}>
        <boxGeometry args={[0.18, 0.2, 0.01]} />
        <meshStandardMaterial color={darkSkin} roughness={0.97} />
      </mesh>

      {/* Left arm (reaching forward/dangling) */}
      <group ref={leftArmRef} position={[-0.39, 0.92, 0.1]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.46, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.92} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.92} />
        </mesh>
        {/* Clawed hand */}
        <mesh castShadow position={[0, -0.72, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={darkSkin} roughness={0.9} />
        </mesh>
        {/* Claws */}
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} castShadow position={[x, -0.82, 0.04]}>
            <coneGeometry args={[0.015, 0.08, 4]} />
            <meshStandardMaterial color="#1a0a00" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[0.39, 0.92, 0.1]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.46, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.92} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.92} />
        </mesh>
        <mesh castShadow position={[0, -0.72, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={darkSkin} roughness={0.9} />
        </mesh>
        {[-0.04, 0, 0.04].map((x, i) => (
          <mesh key={i} castShadow position={[x, -0.82, 0.04]}>
            <coneGeometry args={[0.015, 0.08, 4]} />
            <meshStandardMaterial color="#1a0a00" roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Head */}
      <mesh ref={headRef} castShadow position={[0, 1.37, 0.09]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.42, 0.42, 0.4]} />
        <meshStandardMaterial color={skinColor} roughness={0.92} />
      </mesh>
      {/* Zombie eyes */}
      <mesh position={[-0.1, 1.41, 0.3]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[0.1, 1.41, 0.3]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.0} />
      </mesh>
      {/* Exposed jaw */}
      <mesh castShadow position={[0, 1.22, 0.18]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.28, 0.1, 0.18]} />
        <meshStandardMaterial color={darkSkin} roughness={0.92} />
      </mesh>
      {/* Messy hair */}
      <mesh castShadow position={[0, 1.56, 0.06]}>
        <boxGeometry args={[0.46, 0.1, 0.42]} />
        <meshStandardMaterial color="#1a0a00" roughness={1.0} />
      </mesh>
      {/* Eye glow */}
      <pointLight position={[0, 1.37, 0.32]} color={eyeColor} intensity={0.5} distance={2.5} />
    </group>
  );
}

// Skeleton - fast, white bones, with scythe
function SkeletonModel() {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const boneColor = '#e8e0c0';
  const eyeColor = '#00ffcc';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const swing = Math.sin(t * 6) * 0.55;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing * 0.7;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing * 0.7;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
  });

  return (
    <group>
      {/* Ribcage torso */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.28]} />
        <meshStandardMaterial color={boneColor} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Rib details */}
      {[-0.15, 0, 0.15].map((y, i) => (
        <mesh key={i} castShadow position={[0, 0.9 + y, 0]}>
          <boxGeometry args={[0.52, 0.04, 0.3]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
      ))}
      {/* Spine */}
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.65, 6]} />
        <meshStandardMaterial color={boneColor} roughness={0.7} />
      </mesh>
      {/* Shoulder bones */}
      <mesh castShadow position={[-0.32, 1.18, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={boneColor} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.32, 1.18, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={boneColor} roughness={0.7} />
      </mesh>
      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.38, 0.95, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.42, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.38, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.65, 0]}>
          <sphereGeometry args={[0.07, 6, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Right arm with scythe */}
      <group ref={rightArmRef} position={[0.38, 0.95, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.42, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.38, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
        {/* Scythe handle */}
        <mesh castShadow position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 6]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.7} metalness={0.5} />
        </mesh>
        {/* Scythe blade */}
        <mesh castShadow position={[0.18, -1.2, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.04, 0.38, 0.06]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.9} emissive="#aaaaff" emissiveIntensity={0.2} />
        </mesh>
      </group>
      {/* Pelvis */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.4, 0.14, 0.26]} />
        <meshStandardMaterial color={boneColor} roughness={0.7} />
      </mesh>
      {/* Left leg */}
      <group ref={leftLegRef} position={[-0.16, 0.47, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.5, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.46, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.16, 0.47, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.5, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.46, 6]} />
          <meshStandardMaterial color={boneColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Skull */}
      <mesh castShadow position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={boneColor} roughness={0.7} />
      </mesh>
      {/* Eye sockets */}
      <mesh position={[-0.09, 1.48, 0.18]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.09, 1.48, 0.18]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
      </mesh>
      {/* Jaw */}
      <mesh castShadow position={[0, 1.3, 0.1]}>
        <boxGeometry args={[0.24, 0.08, 0.18]} />
        <meshStandardMaterial color={boneColor} roughness={0.8} />
      </mesh>
      <pointLight position={[0, 1.45, 0.2]} color={eyeColor} intensity={0.5} distance={2.5} />
    </group>
  );
}

// Orc - large, heavy, green with club
function OrcModel() {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const skinColor = '#3a8a30';
  const armorColor = '#4a3a20';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const swing = Math.sin(t * 3.5) * 0.35;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
  });

  return (
    <group>
      {/* Large torso */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.85, 0.8, 0.5]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      {/* Armor chest plate */}
      <mesh castShadow position={[0, 0.95, 0.28]}>
        <boxGeometry args={[0.7, 0.6, 0.08]} />
        <meshStandardMaterial color={armorColor} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Shoulder spikes */}
      <mesh castShadow position={[-0.52, 1.25, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.12, 0.32, 6]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh castShadow position={[0.52, 1.25, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.12, 0.32, 6]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.52, 0.95, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.15, 0.13, 0.55, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.13, 0.12, 0.48, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.88, 0]}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
      </group>
      {/* Right arm with club */}
      <group ref={rightArmRef} position={[0.52, 0.95, 0]}>
        <mesh castShadow position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.15, 0.13, 0.55, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.13, 0.12, 0.48, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        {/* Club handle */}
        <mesh castShadow position={[0, -1.1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 6]} />
          <meshStandardMaterial color="#3a2a10" roughness={0.9} />
        </mesh>
        {/* Club head */}
        <mesh castShadow position={[0, -1.42, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#2a1a08" roughness={0.8} />
        </mesh>
      </group>
      {/* Left leg */}
      <group ref={leftLegRef} position={[-0.22, 0.47, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.52, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.52, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.48, 8]} />
          <meshStandardMaterial color="#2a1a08" roughness={0.9} />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.22, 0.47, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.52, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.52, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.48, 8]} />
          <meshStandardMaterial color="#2a1a08" roughness={0.9} />
        </mesh>
      </group>
      {/* Head */}
      <mesh castShadow position={[0, 1.45, 0]}>
        <boxGeometry args={[0.55, 0.5, 0.5]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      {/* Tusks */}
      <mesh castShadow position={[-0.14, 1.27, 0.24]} rotation={[0.3, 0, 0.1]}>
        <coneGeometry args={[0.04, 0.22, 6]} />
        <meshStandardMaterial color="#fffff0" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.14, 1.27, 0.24]} rotation={[0.3, 0, -0.1]}>
        <coneGeometry args={[0.04, 0.22, 6]} />
        <meshStandardMaterial color="#fffff0" roughness={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.14, 1.53, 0.26]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff2200" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.14, 1.53, 0.26]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff2200" emissiveIntensity={0.8} />
      </mesh>
      {/* Horns */}
      <mesh castShadow position={[-0.18, 1.73, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.06, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.18, 1.73, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.06, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <pointLight position={[0, 1.45, 0.3]} color="#ff6600" intensity={0.3} distance={2} />
    </group>
  );
}

// Demon - fast, red/black with wings and trident
function DemonModel() {
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const bodyColor = '#8b1a1a';
  const darkColor = '#2a0808';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const swing = Math.sin(t * 7) * 0.45;
    const wingFlap = Math.sin(t * 4) * 0.3;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
    if (leftWingRef.current) leftWingRef.current.rotation.z = wingFlap + 0.3;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -wingFlap - 0.3;
  });

  return (
    <group>
      {/* Body */}
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[0.7, 0.8, 0.42]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.2} emissive="#330000" emissiveIntensity={0.3} />
      </mesh>
      {/* Wings */}
      <group ref={leftWingRef} position={[-0.35, 1.2, -0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.04, 0.6]} />
          <meshStandardMaterial color={darkColor} roughness={0.8} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh castShadow position={[-0.45, 0, -0.12]}>
          <boxGeometry args={[0.5, 0.03, 0.38]} />
          <meshStandardMaterial color={darkColor} roughness={0.8} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={rightWingRef} position={[0.35, 1.2, -0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.04, 0.6]} />
          <meshStandardMaterial color={darkColor} roughness={0.8} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh castShadow position={[0.45, 0, -0.12]}>
          <boxGeometry args={[0.5, 0.03, 0.38]} />
          <meshStandardMaterial color={darkColor} roughness={0.8} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.44, 1.05, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.46, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} emissive="#220000" emissiveIntensity={0.2} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.42, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={darkColor} roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
      {/* Right arm with trident */}
      <group ref={rightArmRef} position={[0.44, 1.05, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.46, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} emissive="#220000" emissiveIntensity={0.2} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.42, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        {/* Trident handle */}
        <mesh castShadow position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Trident prongs */}
        {[-0.12, 0, 0.12].map((x, i) => (
          <mesh key={i} castShadow position={[x, -1.28, 0]}>
            <coneGeometry args={[0.025, 0.2, 4]} />
            <meshStandardMaterial color="#cc2200" roughness={0.3} metalness={0.8} emissive="#aa0000" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
      {/* Left leg */}
      <group ref={leftLegRef} position={[-0.2, 0.52, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.5, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.46, 8]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Right leg */}
      <group ref={rightLegRef} position={[0.2, 0.52, 0]}>
        <mesh castShadow position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.5, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.46, 8]} />
          <meshStandardMaterial color={darkColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Demonic head */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <boxGeometry args={[0.48, 0.46, 0.44]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} metalness={0.2} emissive="#220000" emissiveIntensity={0.4} />
      </mesh>
      {/* Large curved horns */}
      <mesh castShadow position={[-0.2, 1.9, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.06, 0.45, 6]} />
        <meshStandardMaterial color={darkColor} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.2, 1.9, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.06, 0.45, 6]} />
        <meshStandardMaterial color={darkColor} roughness={0.5} />
      </mesh>
      {/* Glowing demon eyes */}
      <mesh position={[-0.13, 1.67, 0.23]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.13, 1.67, 0.23]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>
      {/* Jaw */}
      <mesh castShadow position={[0, 1.44, 0.1]}>
        <boxGeometry args={[0.36, 0.1, 0.28]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      {/* Fangs */}
      <mesh castShadow position={[-0.1, 1.4, 0.24]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.03, 0.14, 4]} />
        <meshStandardMaterial color="#fffff0" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.1, 1.4, 0.24]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.03, 0.14, 4]} />
        <meshStandardMaterial color="#fffff0" roughness={0.4} />
      </mesh>
      {/* Demonic aura */}
      <pointLight position={[0, 1.2, 0]} color="#ff2200" intensity={1.2} distance={4} />
    </group>
  );
}

export default function Enemy({ enemy }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  const healthFillRef = useRef<THREE.Mesh>(null);
  const hpPulseRef = useRef<THREE.Mesh>(null);
  const { position: playerPosition } = usePlayer();
  const { moveEnemy } = useEnemies();

  // Hit-flash tracking
  const prevHealthRef = useRef(enemy.health);
  const hitFlashTimeRef = useRef(-999);
  const idlePhaseRef = useRef(Math.random() * Math.PI * 2); // random idle offset per enemy

  useFrame((state) => {
    if (!groupRef.current || enemy.health <= 0) return;
    const t = state.clock.elapsedTime;

    // Detect damage taken → trigger flash
    if (enemy.health < prevHealthRef.current) {
      hitFlashTimeRef.current = t;
    }
    prevHealthRef.current = enemy.health;

    // Hit flash: briefly scale up and emit bright red
    const flashAge = t - hitFlashTimeRef.current;
    const flashing = flashAge < 0.25;
    if (flashing) {
      const flashIntensity = 1 - flashAge / 0.25;
      groupRef.current.scale.setScalar(1 + flashIntensity * 0.06);
    } else {
      groupRef.current.scale.setScalar(1);
    }

    // Move toward player
    const direction = new THREE.Vector3()
      .subVectors(
        new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z),
        new THREE.Vector3(enemy.position.x, enemy.position.y, enemy.position.z)
      );

    const dist = direction.length();
    if (dist > 0.1) direction.normalize();

    const speed = enemy.speed * 0.016;
    const newPos = {
      x: enemy.position.x + direction.x * speed,
      y: enemy.position.y,
      z: enemy.position.z + direction.z * speed
    };

    moveEnemy(enemy.id, newPos);
    groupRef.current.position.set(newPos.x, newPos.y, newPos.z);

    // Idle sway / bobbing
    const idleSwayY = Math.sin(t * 1.8 + idlePhaseRef.current) * 0.012;
    groupRef.current.position.y = newPos.y + idleSwayY;

    // Face direction of movement
    if (dist > 0.1) {
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        0.12
      );
    }

    // Health bar always faces camera
    if (healthBarRef.current) {
      healthBarRef.current.lookAt(state.camera.position);
    }
    if (healthFillRef.current) {
      healthFillRef.current.lookAt(state.camera.position);
    }

    // Low HP pulse glow
    const healthPercent = enemy.health / enemy.maxHealth;
    if (hpPulseRef.current) {
      hpPulseRef.current.lookAt(state.camera.position);
      const pulseMat = hpPulseRef.current.material as THREE.MeshBasicMaterial;
      if (healthPercent < 0.25) {
        pulseMat.opacity = 0.5 + Math.sin(t * 8) * 0.3;
      } else {
        pulseMat.opacity = 0;
      }
    }
  });

  if (enemy.health <= 0) return null;

  const healthPercent = enemy.health / enemy.maxHealth;
  const hpColor = healthPercent > 0.5 ? '#00cc00' : healthPercent > 0.25 ? '#ffcc00' : '#ff2200';

  const typeIndicatorColor = enemy.type === 'demon' ? '#ff2200'
    : enemy.type === 'orc' ? '#ff6600'
    : enemy.type === 'skeleton' ? '#00ffcc'
    : '#66ff00';

  // Health bar width shrinks with health
  const barFullW = 1.3;
  const barFillW = healthPercent * barFullW;
  const barFillOffset = -(barFullW - barFillW) / 2;

  return (
    <group ref={groupRef} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
      {/* Enemy model by type */}
      {enemy.type === 'zombie' && <ZombieModel />}
      {enemy.type === 'skeleton' && <SkeletonModel />}
      {enemy.type === 'orc' && <OrcModel />}
      {enemy.type === 'demon' && <DemonModel />}
      {!['zombie', 'skeleton', 'orc', 'demon'].includes(enemy.type) && <ZombieModel />}

      {/* ── HEALTH BAR ──────────────────────────────────────────────── */}
      {/* Bar border/shadow */}
      <mesh ref={healthBarRef} position={[0, 2.82, 0]}>
        <planeGeometry args={[barFullW + 0.08, 0.2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* Bar background */}
      <mesh position={[0, 2.82, 0.005]}>
        <planeGeometry args={[barFullW, 0.14]} />
        <meshBasicMaterial color="#330000" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Bar fill */}
      <mesh
        ref={healthFillRef}
        position={[barFillOffset, 2.82, 0.01]}
      >
        <planeGeometry args={[barFillW, 0.12]} />
        <meshBasicMaterial color={hpColor} transparent opacity={0.97} side={THREE.DoubleSide} />
      </mesh>
      {/* Enemy name/type tag */}
      <mesh position={[0, 2.98, 0]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshBasicMaterial color={typeIndicatorColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Low-health danger pulse */}
      <mesh ref={hpPulseRef} position={[0, 2.82, 0.02]}>
        <planeGeometry args={[barFullW + 0.14, 0.24]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

