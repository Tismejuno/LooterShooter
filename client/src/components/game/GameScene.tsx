import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import Player from "./Player";
import Dungeon from "./Dungeon";
import Enemy from "./Enemy";
import Loot from "./Loot";
import Projectile from "./Projectile";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { usePlayer } from "../../lib/stores/usePlayer";

export default function GameScene() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const { enemies } = useEnemies();
  const { items } = useLoot();
  const { projectiles, position } = usePlayer();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Main light follows player position
    if (lightRef.current) {
      lightRef.current.position.set(position.x + 15, 25, position.z + 10);
      lightRef.current.target.position.set(position.x, 0, position.z);
      lightRef.current.target.updateMatrixWorld();
    }

    // Rim light oscillates for atmosphere
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 0.3 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <>
      {/* === LIGHTING SETUP === */}

      {/* Deep ambient - dark dungeon atmosphere */}
      <ambientLight intensity={0.12} color="#1a1030" />

      {/* Main directional (moonlight-style) */}
      <directionalLight
        ref={lightRef}
        intensity={0.8}
        position={[15, 25, 10]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.001}
        color="#c8aaff"
      />

      {/* Warm rim light from behind (fire/lava source) */}
      <directionalLight
        ref={rimLightRef}
        intensity={0.4}
        position={[-10, 8, -15]}
        color="#ff6622"
      />

      {/* Cool fill from opposite side */}
      <directionalLight
        intensity={0.2}
        position={[0, 5, 20]}
        color="#4488ff"
      />

      {/* Central dungeon lantern glow */}
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#ffcc44" distance={20} decay={1.5} />

      {/* Far corner atmospheric lights */}
      <pointLight position={[-20, 3, -20]} intensity={0.6} color="#ff4400" distance={15} decay={2} />
      <pointLight position={[20, 3, -20]} intensity={0.4} color="#ff4400" distance={12} decay={2} />
      <pointLight position={[-20, 3, 20]} intensity={0.5} color="#4422ff" distance={12} decay={2} />
      <pointLight position={[20, 3, 20]} intensity={0.4} color="#4422ff" distance={12} decay={2} />

      {/* Subtle upward bounce light from floor */}
      <hemisphereLight args={["#0a0818", "#201808", 0.15]} />

      {/* === GAME OBJECTS === */}
      <Dungeon />
      <Player />

      {/* Enemies */}
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}

      {/* Loot items */}
      {items.map((item) => (
        <Loot key={item.id} item={item} />
      ))}

      {/* Projectiles */}
      {projectiles.map((projectile) => (
        <Projectile key={projectile.id} projectile={projectile} />
      ))}
    </>
  );
}
