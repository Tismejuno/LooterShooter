import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { useAudio } from "../../lib/stores/useAudio";
import { checkCollision } from "../../lib/gameUtils";

export default function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls();
  
  const { 
    position, 
    health, 
    mana, 
    level,
    experience,
    movePlayer, 
    takeDamage, 
    gainExperience,
    attack,
    castAbility,
    collectItem,
    equipped,
    stats
  } = usePlayer();
  
  const { enemies, damageEnemy } = useEnemies();
  const { items, removeItem } = useLoot();
  const { playHit } = useAudio();

  const isMoving = useRef(false);
  const isAttacking = useRef(false);
  const attackTime = useRef(0);

  // Determine player appearance based on equipped items
  const armorColor = useMemo(() => {
    const armor = equipped.find(e => e.type === 'armor');
    if (!armor) return '#4a90e2';
    switch (armor.rarity) {
      case 'legendary': return '#ff8000';
      case 'epic': return '#a335ee';
      case 'rare': return '#0070dd';
      case 'uncommon': return '#1eff00';
      default: return '#aaaaaa';
    }
  }, [equipped]);

  const hasWeapon = equipped.some(e => e.type === 'weapon');
  const weaponRarity = equipped.find(e => e.type === 'weapon')?.rarity || 'common';
  const weaponColor = useMemo(() => {
    switch (weaponRarity) {
      case 'legendary': return '#ff8000';
      case 'epic': return '#a335ee';
      case 'rare': return '#0070dd';
      case 'uncommon': return '#1eff00';
      default: return '#aaaaaa';
    }
  }, [weaponRarity]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Handle movement
    const keys = getKeys();
    let direction = new THREE.Vector3();
    
    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.leftward) direction.x -= 1;
    if (keys.rightward) direction.x += 1;
    
    const moving = direction.length() > 0;
    isMoving.current = moving;

    if (moving) {
      direction.normalize();
      movePlayer(direction);

      // Rotate group to face movement direction
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
    }

    // Handle attacks
    if (keys.attack) {
      attack();
      isAttacking.current = true;
      attackTime.current = t;
    }
    if (keys.ability1) castAbility(1);
    if (keys.ability2) castAbility(2);
    if (keys.ability3) castAbility(3);

    // Update group position
    groupRef.current.position.set(position.x, position.y, position.z);

    // Walking / running animations
    const walkSpeed = 6;
    const walkSwing = Math.sin(t * walkSpeed) * (moving ? 0.5 : 0);
    const walkBob = moving ? Math.abs(Math.sin(t * walkSpeed)) * 0.05 : 0;

    // Leg swing
    if (leftLegRef.current) leftLegRef.current.rotation.x = walkSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -walkSwing;

    // Arm swing (counter to legs)
    if (leftArmRef.current) leftArmRef.current.rotation.x = -walkSwing * 0.6;
    if (rightArmRef.current) rightArmRef.current.rotation.x = walkSwing * 0.6;

    // Body bob
    if (torsoRef.current) {
      torsoRef.current.position.y = walkBob;
    }

    // Head sway
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.5) * (moving ? 0.05 : 0.02);
    }

    // Attack animation
    if (isAttacking.current) {
      const attackDuration = 0.4;
      const elapsed = t - attackTime.current;
      if (elapsed < attackDuration) {
        const progress = elapsed / attackDuration;
        const swing = Math.sin(progress * Math.PI) * 1.2;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
        if (weaponRef.current) weaponRef.current.rotation.x = -swing * 0.5;
      } else {
        isAttacking.current = false;
      }
    }

    // Aura pulse animation
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.1;
      auraRef.current.scale.setScalar(pulse);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 3) * 0.04;
    }

    // Isometric camera follow
    const playerPos = groupRef.current.position;
    camera.position.lerp(
      new THREE.Vector3(playerPos.x + 10, playerPos.y + 15, playerPos.z + 10),
      0.08
    );
    camera.lookAt(playerPos);

    // Check for collisions with enemies
    enemies.forEach(enemy => {
      if (checkCollision(position, enemy.position, 1.5)) {
        takeDamage(10);
        playHit();
      }
    });

    // Check for loot collection
    items.forEach(item => {
      if (checkCollision(position, item.position, 1)) {
        collectItem(item);
        removeItem(item.id);
      }
    });
  });

  const skinColor = '#e8c4a0';
  const hairColor = '#3a1a00';
  const pantsColor = '#2a3a5a';
  const bootsColor = '#3a2510';

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Aura / level glow */}
      <mesh ref={auraRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color={armorColor} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.2, 0.1, 0]}>
        {/* Upper leg */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.6, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Lower leg */}
        <mesh castShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.5, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Boot */}
        <mesh castShadow position={[0, -0.45, 0.04]}>
          <boxGeometry args={[0.18, 0.14, 0.28]} />
          <meshStandardMaterial color={bootsColor} roughness={0.9} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.2, 0.1, 0]}>
        {/* Upper leg */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.6, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Lower leg */}
        <mesh castShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.5, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Boot */}
        <mesh castShadow position={[0, -0.45, 0.04]}>
          <boxGeometry args={[0.18, 0.14, 0.28]} />
          <meshStandardMaterial color={bootsColor} roughness={0.9} />
        </mesh>
      </group>

      {/* Torso / Chest armor */}
      <mesh ref={torsoRef} castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[0.7, 0.75, 0.4]} />
        <meshStandardMaterial color={armorColor} roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Shoulder pauldrons */}
      <mesh castShadow position={[-0.43, 1.25, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={armorColor} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[0.43, 1.25, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={armorColor} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Belt */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[0.72, 0.1, 0.42]} />
        <meshStandardMaterial color="#4a3a20" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Belt buckle */}
      <mesh castShadow position={[0, 0.68, 0.22]}>
        <boxGeometry args={[0.12, 0.1, 0.04]} />
        <meshStandardMaterial color="#ccaa44" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.45, 1.1, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.45, 8]} />
          <meshStandardMaterial color={armorColor} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Right arm (holds weapon) */}
      <group ref={rightArmRef} position={[0.45, 1.1, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.45, 8]} />
          <meshStandardMaterial color={armorColor} roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Weapon in hand */}
        <group ref={weaponRef} position={[0, -1.0, 0]}>
          {hasWeapon ? (
            <>
              {/* Sword blade */}
              <mesh castShadow position={[0, -0.45, 0]}>
                <boxGeometry args={[0.06, 0.9, 0.04]} />
                <meshStandardMaterial
                  color={weaponColor}
                  roughness={0.15}
                  metalness={0.95}
                  emissive={weaponColor}
                  emissiveIntensity={0.3}
                />
              </mesh>
              {/* Crossguard */}
              <mesh castShadow position={[0, -0.05, 0]}>
                <boxGeometry args={[0.28, 0.06, 0.06]} />
                <meshStandardMaterial color="#8a7a50" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Hilt/grip */}
              <mesh castShadow position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
                <meshStandardMaterial color="#4a2a10" roughness={0.9} />
              </mesh>
              {/* Pommel */}
              <mesh castShadow position={[0, 0.25, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#8a7a50" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Weapon glow */}
              <pointLight color={weaponColor} intensity={0.8} distance={2.5} />
            </>
          ) : (
            /* Fist / bare hand indicator */
            <mesh castShadow position={[0, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={skinColor} roughness={0.7} />
            </mesh>
          )}
        </group>
      </group>

      {/* Neck */}
      <mesh castShadow position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.15, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 1.75, 0]}>
        {/* Main head */}
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.45, 0.4]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        {/* Hair */}
        <mesh castShadow position={[0, 0.18, -0.04]}>
          <boxGeometry args={[0.44, 0.14, 0.38]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.05, 0.21]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1aff" emissive="#0000ff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.1, 0.05, 0.21]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#1a1aff" emissive="#0000ff" emissiveIntensity={0.5} />
        </mesh>
        {/* Helmet/headband */}
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.46, 0.08, 0.42]} />
          <meshStandardMaterial color={armorColor} roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* Cape */}
      <mesh castShadow position={[0, 1.1, -0.22]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.6, 0.85, 0.04]} />
        <meshStandardMaterial color="#1a0a3a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Player ambient glow */}
      <pointLight
        position={[0, 1, 0]}
        intensity={0.6}
        color={armorColor}
        distance={4}
      />
    </group>
  );
}
