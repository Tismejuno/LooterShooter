import { useFrame } from "@react-three/fiber";
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
  const { enemies } = useEnemies();
  const { items } = useLoot();
  const { projectiles } = usePlayer();

  // Update lighting to follow player
  useFrame(() => {
    if (lightRef.current) {
      // Keep light following player for better visibility
      lightRef.current.position.set(0, 20, 5);
      lightRef.current.target.position.set(0, 0, 0);
    }
  });

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.3} color="#ffa500" />
      <directionalLight
        ref={lightRef}
        intensity={1.2}
        position={[0, 20, 5]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#ffaa44"
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ff6600" />

      {/* Game objects */}
      <Dungeon />
      <Player />
      
      {/* Render enemies */}
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
      
      {/* Render loot items */}
      {items.map((item) => (
        <Loot key={item.id} item={item} />
      ))}
      
      {/* Render projectiles */}
      {projectiles.map((projectile) => (
        <Projectile key={projectile.id} projectile={projectile} />
      ))}
    </>
  );
}
