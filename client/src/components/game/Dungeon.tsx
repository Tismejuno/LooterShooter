import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDungeon } from "../../lib/stores/useDungeon";
import { Room } from "../../lib/DungeonEngine";

// Particle system constants
const SNOW_SPREAD_XZ = 22;
const SNOW_HEIGHT_MAX = 10;
const SNOW_FALL_SPEED = 0.016;
const EMBER_SPREAD_XZ = 18;
const EMBER_HEIGHT_MAX = 5;
const EMBER_RISE_SPEED = 0.016;
const WISP_SPREAD_XZ = 16;
const WISP_HEIGHT_MAX = 4;

function TorchLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity =
        1.2 +
        Math.sin(state.clock.elapsedTime * 8 + position[0]) * 0.4 +
        Math.random() * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh castShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#4a2a10" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.15, 6]} />
        <meshStandardMaterial color="#3a2010" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <coneGeometry args={[0.06, 0.16, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={3} transparent opacity={0.7} />
      </mesh>
      <pointLight ref={lightRef} color="#ff8833" intensity={1.2} distance={6} decay={2} castShadow={false} />
    </group>
  );
}

function SnowParticles({ cx, cz }: { cx: number; cz: number }) {
  const COUNT = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = cx + (Math.random() - 0.5) * SNOW_SPREAD_XZ;
      arr[i * 3 + 1] = Math.random() * SNOW_HEIGHT_MAX;
      arr[i * 3 + 2] = cz + (Math.random() - 0.5) * SNOW_SPREAD_XZ;
    }
    return arr;
  }, [cx, cz]);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  useFrame((state) => {
    if (!posAttr.current) return;
    const arr = posAttr.current.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] -= SNOW_FALL_SPEED * (0.8 + Math.sin(i) * 0.4);
      arr[i * 3]     += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.005;
      if (arr[i * 3 + 1] < -0.5) {
        arr[i * 3 + 1] = SNOW_HEIGHT_MAX;
        arr[i * 3]     = cx + (Math.random() - 0.5) * SNOW_SPREAD_XZ;
        arr[i * 3 + 2] = cz + (Math.random() - 0.5) * SNOW_SPREAD_XZ;
      }
    }
    posAttr.current.needsUpdate = true;
  });
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e8f4ff" size={0.09} transparent opacity={0.82} sizeAttenuation />
    </points>
  );
}

function EmberParticles({ cx, cz }: { cx: number; cz: number }) {
  const COUNT = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = cx + (Math.random() - 0.5) * EMBER_SPREAD_XZ;
      arr[i * 3 + 1] = Math.random() * (EMBER_HEIGHT_MAX - 1);
      arr[i * 3 + 2] = cz + (Math.random() - 0.5) * EMBER_SPREAD_XZ;
    }
    return arr;
  }, [cx, cz]);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  useFrame((state) => {
    if (!posAttr.current) return;
    const arr = posAttr.current.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += EMBER_RISE_SPEED * (0.6 + Math.sin(i * 3.7) * 0.3);
      arr[i * 3]     += Math.sin(state.clock.elapsedTime + i * 0.7) * 0.008;
      if (arr[i * 3 + 1] > EMBER_HEIGHT_MAX) {
        arr[i * 3 + 1] = 0;
        arr[i * 3]     = cx + (Math.random() - 0.5) * EMBER_SPREAD_XZ;
        arr[i * 3 + 2] = cz + (Math.random() - 0.5) * EMBER_SPREAD_XZ;
      }
    }
    posAttr.current.needsUpdate = true;
  });
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ff5500" size={0.07} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

function WispParticles({ cx, cz, color }: { cx: number; cz: number; color: string }) {
  const COUNT = 40;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = cx + (Math.random() - 0.5) * WISP_SPREAD_XZ;
      arr[i * 3 + 1] = 0.3 + Math.random() * 3;
      arr[i * 3 + 2] = cz + (Math.random() - 0.5) * WISP_SPREAD_XZ;
    }
    return arr;
  }, [cx, cz]);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  useFrame((state) => {
    if (!posAttr.current) return;
    const arr = posAttr.current.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     += Math.sin(t * 0.4 + i * 1.3) * 0.006;
      arr[i * 3 + 1] += Math.sin(t * 0.6 + i * 2.1) * 0.005;
      arr[i * 3 + 2] += Math.cos(t * 0.35 + i * 1.7) * 0.006;
      arr[i * 3 + 1] = Math.max(0.2, Math.min(WISP_HEIGHT_MAX, arr[i * 3 + 1]));
    }
    posAttr.current.needsUpdate = true;
  });
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={posAttr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.12} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function CloudPuff({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x =
        position[0] + Math.sin(state.clock.elapsedTime * 0.12 + position[2]) * 1.5;
    }
  });
  const blobs: Array<[number, number, number, number]> = [
    [0, 0, 0, 1.0], [-0.7, 0.2, 0, 0.75], [0.7, 0.1, 0, 0.8],
    [0.1, 0.4, 0, 0.65], [-0.3, -0.1, 0.4, 0.6],
  ];
  return (
    <group ref={groupRef} position={position}>
      {blobs.map(([ox, oy, oz, r], i) => (
        <mesh key={i} position={[ox, oy, oz]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshStandardMaterial color="#f0f6ff" roughness={1} metalness={0} transparent opacity={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function CrystalSpike({
  position, color, height, radius,
}: {
  position: [number, number, number]; color: string; height: number; radius: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} castShadow position={position}>
      <coneGeometry args={[radius, height, 6]} />
      <meshStandardMaterial
        color={color} emissive={color} emissiveIntensity={0.5}
        roughness={0.05} metalness={0.3} transparent opacity={0.88}
      />
    </mesh>
  );
}

function LavaSurface({ cx, cz, w, h }: { cx: number; cz: number; w: number; h: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * 1.2) * 0.3;
    if (mat.map) {
      mat.map.offset.x = state.clock.elapsedTime * 0.04;
      mat.map.offset.y = state.clock.elapsedTime * 0.02;
    }
  });
  return (
    <mesh ref={meshRef} receiveShadow position={[cx, -0.44, cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, h, 12, 12]} />
      <meshStandardMaterial color="#cc2200" emissive="#ff4400" emissiveIntensity={0.7} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function SkyGround({ cx, cz, w, h }: { cx: number; cz: number; w: number; h: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const hue = ((state.clock.elapsedTime * 5) % 360) / 360;
    mat.color.setHSL(hue, 0.5, 0.7);
  });
  return (
    <mesh ref={meshRef} receiveShadow position={[cx, -0.46, cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color="#a0c8ff" transparent opacity={0.6} />
    </mesh>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.22, 1.6, 7]} />
        <meshStandardMaterial color="#5a3510" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 2.0, 0]}>
        <coneGeometry args={[1.0, 1.6, 8]} />
        <meshStandardMaterial color="#1a6a10" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 2.8, 0]}>
        <coneGeometry args={[0.75, 1.3, 8]} />
        <meshStandardMaterial color="#227822" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 3.5, 0]}>
        <coneGeometry args={[0.5, 1.0, 8]} />
        <meshStandardMaterial color="#2a9020" roughness={0.8} />
      </mesh>
    </group>
  );
}

function IceStalactite({ position, h }: { position: [number, number, number]; h: number }) {
  return (
    <mesh castShadow position={position}>
      <coneGeometry args={[0.12, h, 6]} />
      <meshStandardMaterial
        color="#c8e8ff" emissive="#88ccff" emissiveIntensity={0.2}
        roughness={0.05} metalness={0.4} transparent opacity={0.85}
      />
    </mesh>
  );
}

function DungeonRoom({
  room, asphaltTexture, woodTexture,
}: {
  room: Room; asphaltTexture: THREE.Texture; woodTexture: THREE.Texture;
}) {
  return (
    <group>
      <mesh receiveShadow position={[room.x, -0.45, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial map={asphaltTexture} roughness={0.65} metalness={0.05} color="#282828" />
      </mesh>
      <mesh receiveShadow position={[room.x, -0.44, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width + 0.4, room.height + 0.4]} />
        <meshStandardMaterial color="#141414" roughness={0.9} />
      </mesh>
      <mesh position={[room.x, -0.43, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 12]} />
        <meshBasicMaterial color="#2a1a66" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      {([-1, 1] as const).flatMap((xSign) =>
        ([-1, 1] as const).map((zSign) => {
          const px = room.x + xSign * (room.width / 3);
          const pz = room.z + zSign * (room.height / 3);
          return (
            <group key={`${xSign}-${zSign}`}>
              <mesh castShadow position={[px, 1.2, pz]}>
                <cylinderGeometry args={[0.28, 0.34, 2.4, 8]} />
                <meshStandardMaterial color="#3a3020" roughness={0.85} metalness={0.05} />
              </mesh>
              <mesh castShadow position={[px, 0.06, pz]}>
                <cylinderGeometry args={[0.42, 0.42, 0.12, 8]} />
                <meshStandardMaterial color="#2a2015" roughness={0.9} />
              </mesh>
              <mesh castShadow position={[px, 2.46, pz]}>
                <cylinderGeometry args={[0.42, 0.3, 0.14, 8]} />
                <meshStandardMaterial color="#2a2015" roughness={0.9} />
              </mesh>
              <TorchLight position={[px + 0.35, 1.9, pz + 0.35]} />
            </group>
          );
        })
      )}
      <pointLight position={[room.x, 3, room.z]} color="#ff8833" intensity={0.4} distance={10} decay={2} />
    </group>
  );
}

function GrasslandRoom({ room, grassTexture }: { room: Room; grassTexture: THREE.Texture }) {
  const trees = useMemo<Array<[number, number, number]>>(() => {
    const count = 6 + Math.floor(room.width / 4);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = room.width * 0.38 + Math.sin(i * 2.3) * 1.5;
      return [room.x + Math.cos(angle) * r, 0, room.z + Math.sin(angle) * r] as [number, number, number];
    });
  }, [room]);
  const flowerColors = ["#ffdd44", "#ff6688", "#cc44ff"];
  return (
    <group>
      <mesh receiveShadow position={[room.x, -0.45, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial map={grassTexture} roughness={0.88} color="#2d5a1a" />
      </mesh>
      <mesh receiveShadow position={[room.x, -0.44, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[room.width * 0.28, 16]} />
        <meshStandardMaterial color="#5a3a18" roughness={0.95} />
      </mesh>
      {trees.map((pos, i) => <Tree key={i} position={pos} />)}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = room.width * 0.22;
        return (
          <mesh key={i} position={[room.x + Math.cos(angle) * r, -0.38, room.z + Math.sin(angle) * r]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.18, 6]} />
            <meshBasicMaterial color={flowerColors[i % 3]} />
          </mesh>
        );
      })}
      <pointLight position={[room.x, 5, room.z]} color="#88ee44" intensity={0.5} distance={14} decay={2} />
      <WispParticles cx={room.x} cz={room.z} color="#aaff55" />
    </group>
  );
}

function SnowRoom({ room }: { room: Room }) {
  const stalactites = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const r = room.width * 0.32 + Math.sin(i * 1.7) * 1.2;
      return {
        pos: [room.x + Math.cos(angle) * r, -0.45, room.z + Math.sin(angle) * r] as [number, number, number],
        h: 0.6 + Math.abs(Math.sin(i)) * 0.4,
      };
    }), [room]);
  return (
    <group>
      <mesh receiveShadow position={[room.x, -0.45, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial color="#ddeeff" roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh receiveShadow position={[room.x, -0.44, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[room.width * 0.3, 20]} />
        <meshStandardMaterial color="#aaccff" roughness={0.05} metalness={0.5} transparent opacity={0.5} />
      </mesh>
      {stalactites.map((s, i) => <IceStalactite key={i} position={s.pos} h={s.h} />)}
      <SnowParticles cx={room.x} cz={room.z} />
      <pointLight position={[room.x, 4, room.z]} color="#88ccff" intensity={0.6} distance={14} decay={2} />
    </group>
  );
}

function CloudRoom({ room }: { room: Room }) {
  const clouds = useMemo<Array<[number, number, number]>>(() =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      const r = room.width * 0.28 + i * 0.8;
      return [room.x + Math.cos(angle) * r, 2.5 + (i % 3) * 0.8, room.z + Math.sin(angle) * r] as [number, number, number];
    }), [room]);
  return (
    <group>
      <SkyGround cx={room.x} cz={room.z} w={room.width} h={room.height} />
      <mesh receiveShadow position={[room.x, -0.44, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[room.width * 0.32, 16]} />
        <meshStandardMaterial color="#e8f4ff" roughness={0.9} />
      </mesh>
      {clouds.map((pos, i) => <CloudPuff key={i} position={pos} />)}
      <pointLight position={[room.x, 6, room.z]} color="#88ccff" intensity={0.8} distance={16} decay={1.5} />
      <pointLight position={[room.x, 1, room.z]} color="#ffeecc" intensity={0.4} distance={12} decay={2} />
    </group>
  );
}

function LavaRoom({ room }: { room: Room }) {
  const lavaPools = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => {
      const angle = (i / 4) * Math.PI * 2;
      const r = room.width * 0.26;
      return {
        cx: room.x + Math.cos(angle) * r,
        cz: room.z + Math.sin(angle) * r,
        r: 1.0 + Math.abs(Math.sin(i * 1.3)) * 0.4,
      };
    }), [room]);
  return (
    <group>
      <mesh receiveShadow position={[room.x, -0.45, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial color="#1a0808" roughness={0.92} />
      </mesh>
      <LavaSurface cx={room.x} cz={room.z} w={room.width * 0.7} h={room.height * 0.7} />
      {lavaPools.map((p, i) => (
        <mesh key={i} receiveShadow position={[p.cx, -0.43, p.cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.r, 14]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff2200" emissiveIntensity={1.2} roughness={0.3} />
        </mesh>
      ))}
      <EmberParticles cx={room.x} cz={room.z} />
      <pointLight position={[room.x, 1, room.z]} color="#ff4400" intensity={1.2} distance={14} decay={2} />
      {lavaPools.map((p, i) => (
        <pointLight key={i} position={[p.cx, 0.5, p.cz]} color="#ff6600" intensity={0.8} distance={6} decay={2} />
      ))}
    </group>
  );
}

function CrystalRoom({ room }: { room: Room }) {
  const crystals = useMemo(() => {
    const colors = ["#aa44ff", "#4488ff", "#44ffcc", "#ff44aa", "#ffaa44"];
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + Math.sin(i) * 0.3;
      const dist = room.width * (0.18 + Math.abs(Math.sin(i * 2.1)) * 0.14);
      return {
        pos: [room.x + Math.cos(angle) * dist, -0.45 + Math.sin(i) * 0.05, room.z + Math.sin(angle) * dist] as [number, number, number],
        color: colors[i % colors.length],
        h: 0.6 + Math.abs(Math.sin(i * 0.7)) * 1.2,
        r: 0.07 + Math.abs(Math.cos(i)) * 0.1,
      };
    });
  }, [room]);
  return (
    <group>
      <mesh receiveShadow position={[room.x, -0.45, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial color="#0a0820" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh receiveShadow position={[room.x, -0.44, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[room.width * 0.25, 20]} />
        <meshStandardMaterial color="#220044" roughness={0.05} metalness={0.9} transparent opacity={0.7} />
      </mesh>
      {crystals.map((c, i) => <CrystalSpike key={i} position={c.pos} color={c.color} height={c.h} radius={c.r} />)}
      <pointLight position={[room.x, 3, room.z]} color="#aa44ff" intensity={0.8} distance={14} decay={2} />
      <WispParticles cx={room.x} cz={room.z} color="#cc88ff" />
    </group>
  );
}

export default function Dungeon() {
  const grassTexture = useTexture("/textures/grass.png");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const woodTexture = useTexture("/textures/wood.jpg");
  const { rooms, walls } = useDungeon();

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
      <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={grassTexture} roughness={0.9} color="#1e2e10" />
      </mesh>

      {rooms.map((room, index) => {
        switch (room.biome) {
          case "grassland":
            return <GrasslandRoom key={index} room={room} grassTexture={grassTexture} />;
          case "snow":
            return <SnowRoom key={index} room={room} />;
          case "clouds":
            return <CloudRoom key={index} room={room} />;
          case "lava":
            return <LavaRoom key={index} room={room} />;
          case "crystal":
            return <CrystalRoom key={index} room={room} />;
          default:
            return <DungeonRoom key={index} room={room} asphaltTexture={asphaltTexture} woodTexture={woodTexture} />;
        }
      })}

      {walls.map((wall, index) => (
        <group key={index}>
          <mesh castShadow receiveShadow position={[wall.x, wall.height / 2, wall.z]}>
            <boxGeometry args={[wall.width, wall.height, wall.depth]} />
            <meshStandardMaterial map={woodTexture} roughness={0.85} color="#2a2218" />
          </mesh>
          <mesh castShadow position={[wall.x, wall.height + 0.06, wall.z]}>
            <boxGeometry args={[wall.width + 0.08, 0.12, wall.depth + 0.08]} />
            <meshStandardMaterial color="#161210" roughness={0.9} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshBasicMaterial color="#050410" transparent opacity={0.25} />
      </mesh>

      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = 18 + Math.abs(Math.sin(i * 3.7)) * 9;
        return (
          <mesh key={i} castShadow position={[Math.cos(angle) * r, -0.3, Math.sin(angle) * r]} rotation={[Math.sin(i) * 0.5, (i * 0.7) % Math.PI, Math.cos(i) * 0.3]}>
            <dodecahedronGeometry args={[0.22 + Math.abs(Math.sin(i)) * 0.18, 0]} />
            <meshStandardMaterial color="#2a2820" roughness={0.95} />
          </mesh>
        );
      })}

      {rooms
        .filter((r) => r.biome === "dungeon")
        .slice(0, 3)
        .map((room, index) => (
          <mesh key={index} position={[room.x, -0.42, room.z]} rotation={[-Math.PI / 2, 0, (index * Math.PI) / 3]}>
            <ringGeometry args={[1.0, 1.15, 8]} />
            <meshBasicMaterial color="#3322aa" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        ))}
    </group>
  );
}
