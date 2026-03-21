import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import Player from "./Player";
import Dungeon from "./Dungeon";
import Enemy from "./Enemy";
import Loot from "./Loot";
import Projectile from "./Projectile";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { usePlayer } from "../../lib/stores/usePlayer";

// Aim cursor that follows the mouse pointer on the ground plane
function AimCursor() {
  const cursorRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const { raycaster, pointer, camera } = useThree();

  useFrame((state) => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(groundPlane, target);
    if (hit && cursorRef.current) {
      cursorRef.current.position.set(target.x, 0.02, target.z);
    }
    // Rotate outer ring
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.04;
    }
  });

  return (
    <group ref={cursorRef}>
      {/* Inner dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      {/* Crosshair arms */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, angle]}
          position={[Math.cos(angle) * 0.18, 0, Math.sin(angle) * 0.18]}
        >
          <planeGeometry args={[0.06, 0.14]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Outer spinning ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 24]} />
        <meshBasicMaterial color="#44aaff" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

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
      <ambientLight intensity={0.15} color="#1a1030" />

      {/* Main directional (moonlight-style) with adaptive shadow quality */}
      <directionalLight
        ref={lightRef}
        intensity={1.0}
        position={[15, 25, 10]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0005}
        color="#c8aaff"
      />

      {/* Warm rim light (fire/lava source) */}
      <directionalLight
        ref={rimLightRef}
        intensity={0.5}
        position={[-10, 8, -15]}
        color="#ff6622"
      />

      {/* Cool fill light */}
      <directionalLight intensity={0.25} position={[0, 5, 20]} color="#4488ff" />

      {/* Central dungeon lantern */}
      <pointLight position={[0, 6, 0]} intensity={0.6} color="#ffcc44" distance={22} decay={1.5} />

      {/* Far corner atmospheric lights */}
      <pointLight position={[-20, 3, -20]} intensity={0.7} color="#ff4400" distance={18} decay={2} />
      <pointLight position={[20, 3, -20]} intensity={0.5} color="#ff4400" distance={15} decay={2} />
      <pointLight position={[-20, 3, 20]} intensity={0.6} color="#4422ff" distance={15} decay={2} />
      <pointLight position={[20, 3, 20]} intensity={0.5} color="#4422ff" distance={15} decay={2} />

      {/* Sky hemisphere for outdoor biomes */}
      <hemisphereLight args={["#6699cc", "#334422", 0.25]} />

      {/* === GAME OBJECTS === */}
      <Dungeon />
      <Player />

      {/* Aim cursor */}
      <AimCursor />

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

      {/* === POST-PROCESSING (bloom + vignette) === */}
      <EffectComposer>
        {/* Bloom: makes emissive glows, lava, crystals, torches beautiful */}
        <Bloom
          luminanceThreshold={0.35}
          luminanceSmoothing={0.6}
          intensity={1.4}
          blendFunction={BlendFunction.ADD}
          mipmapBlur
        />
        {/* Vignette: darkens the edges for cinematic atmosphere */}
        <Vignette eskil={false} offset={0.35} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
}
