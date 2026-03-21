import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDungeon } from "../../lib/stores/useDungeon";

function TorchLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      // Flickering torch effect
      lightRef.current.intensity = 1.2 + Math.sin(state.clock.elapsedTime * 8 + position[0]) * 0.4 + Math.random() * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Torch stick */}
      <mesh castShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
      {/* Torch head */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.15, 6]} />
        <meshStandardMaterial color="#3a2010" roughness={0.8} />
      </mesh>
      {/* Flame core */}
      <mesh position={[0, 0.22, 0]}>
        <coneGeometry args={[0.06, 0.16, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      {/* Flame outer */}
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={3} transparent opacity={0.7} />
      </mesh>
      {/* Flickering point light */}
      <pointLight ref={lightRef} color="#ff8833" intensity={1.2} distance={6} decay={2} castShadow={false} />
    </group>
  );
}

export default function Dungeon() {
  const grassTexture = useTexture("/textures/grass.png");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const woodTexture = useTexture("/textures/wood.jpg");
  
  const { currentLevel, rooms, walls } = useDungeon();
  
  // Configure textures
  useMemo(() => {
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(8, 8);
    asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(6, 6);
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
  }, [grassTexture, asphaltTexture, woodTexture]);

  return (
    <group>
      {/* Outer ground / grass */}
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.9}
          color="#2a3a1a"
        />
      </mesh>

      {/* Dungeon rooms - stone floor */}
      {rooms.map((room, index) => (
        <group key={index}>
          <mesh
            receiveShadow
            position={[room.x, -0.45, room.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[room.width, room.height]} />
            <meshStandardMaterial
              map={asphaltTexture}
              roughness={0.65}
              metalness={0.05}
              color="#282828"
            />
          </mesh>
          {/* Room border / baseboard */}
          <mesh
            receiveShadow
            position={[room.x, -0.44, room.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[room.width + 0.4, room.height + 0.4]} />
            <meshStandardMaterial color="#141414" roughness={0.9} />
          </mesh>
          {/* Floor center rune glow */}
          <mesh
            position={[room.x, -0.43, room.z]}
            rotation={[-Math.PI / 2, 0, index * 0.7]}
          >
            <ringGeometry args={[0.8, 1.0, 12]} />
            <meshBasicMaterial color="#2a1a66" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Dungeon walls - stone bricks */}
      {walls.map((wall, index) => (
        <group key={index}>
          <mesh
            castShadow
            receiveShadow
            position={[wall.x, wall.height / 2, wall.z]}
          >
            <boxGeometry args={[wall.width, wall.height, wall.depth]} />
            <meshStandardMaterial
              map={woodTexture}
              roughness={0.85}
              color="#2a2218"
            />
          </mesh>
          {/* Wall cap (darker top) */}
          <mesh
            castShadow
            position={[wall.x, wall.height + 0.06, wall.z]}
          >
            <boxGeometry args={[wall.width + 0.08, 0.12, wall.depth + 0.08]} />
            <meshStandardMaterial color="#161210" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Decorative pillars in rooms */}
      {rooms.map((room, index) => (
        <group key={`pillars-${index}`}>
          {[-1, 1].map(x =>
            [-1, 1].map(z => {
              const px = room.x + x * (room.width / 3);
              const pz = room.z + z * (room.height / 3);
              return (
                <group key={`${x}-${z}`}>
                  {/* Main pillar */}
                  <mesh castShadow position={[px, 1.2, pz]}>
                    <cylinderGeometry args={[0.28, 0.34, 2.4, 8]} />
                    <meshStandardMaterial color="#3a3020" roughness={0.85} metalness={0.05} />
                  </mesh>
                  {/* Pillar base */}
                  <mesh castShadow position={[px, 0.06, pz]}>
                    <cylinderGeometry args={[0.42, 0.42, 0.12, 8]} />
                    <meshStandardMaterial color="#2a2015" roughness={0.9} />
                  </mesh>
                  {/* Pillar capital (top) */}
                  <mesh castShadow position={[px, 2.46, pz]}>
                    <cylinderGeometry args={[0.42, 0.3, 0.14, 8]} />
                    <meshStandardMaterial color="#2a2015" roughness={0.9} />
                  </mesh>
                  {/* Torch on pillar */}
                  <TorchLight position={[px + 0.35, 1.9, pz + 0.35]} />
                </group>
              );
            })
          )}
        </group>
      ))}

      {/* Atmospheric fog plane near floor */}
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial color="#0a0816" transparent opacity={0.3} />
      </mesh>

      {/* Environmental details: scattered rocks */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 15 + Math.sin(i * 3.7) * 8;
        return (
          <mesh
            key={`rock-${i}`}
            castShadow
            position={[Math.cos(angle) * r, -0.3, Math.sin(angle) * r]}
            rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.3]}
          >
            <dodecahedronGeometry args={[0.2 + Math.sin(i) * 0.15, 0]} />
            <meshStandardMaterial color="#2a2820" roughness={0.95} />
          </mesh>
        );
      })}

      {/* Subtle glowing floor runes in rooms */}
      {rooms.slice(0, 3).map((room, index) => (
        <mesh
          key={`rune-${index}`}
          position={[room.x, -0.42, room.z]}
          rotation={[-Math.PI / 2, 0, index * Math.PI / 3]}
        >
          <ringGeometry args={[1.0, 1.15, 8]} />
          <meshBasicMaterial color="#3322aa" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
