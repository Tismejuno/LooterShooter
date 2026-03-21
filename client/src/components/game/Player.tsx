import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { useAudio } from "../../lib/stores/useAudio";
import { checkCollision } from "../../lib/gameUtils";

// Match the attack cooldown defined in the player store so mouse-held auto-fire
// doesn't issue more attempts than the store will actually accept.
const ATTACK_COOLDOWN_MS = 500;

export default function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const capeRef = useRef<THREE.Mesh>(null);

  // For mouse-aim raycasting
  const aimTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, -1));
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycasterTarget = useMemo(() => new THREE.Vector3(), []);

  const { camera, raycaster, pointer } = useThree();
  const [, getKeys] = useKeyboardControls();
  
  const { 
    position, 
    health, 
    mana, 
    level,
    experience,
    movePlayer,
    setAimDirection,
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
  const isMouseDown = useRef(false);
  const lastAutoFireTime = useRef(0);

  // Track mouse button state for auto-fire
  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (e.button === 0) isMouseDown.current = true; };
    const onUp = (e: MouseEvent) => { if (e.button === 0) isMouseDown.current = false; };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

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

    // ── Mouse aim: raycast pointer against the ground plane ──────────────────
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(groundPlane, raycasterTarget);
    if (hit) {
      aimTargetRef.current.copy(raycasterTarget);
    }

    // Compute 2D aim direction from player position to aim target
    const aimDir = new THREE.Vector3(
      aimTargetRef.current.x - position.x,
      0,
      aimTargetRef.current.z - position.z
    );
    if (aimDir.length() > 0.01) {
      aimDir.normalize();
      setAimDirection({ x: aimDir.x, y: 0, z: aimDir.z });
    }

    // ── Keyboard movement ─────────────────────────────────────────────────────
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
    }

    // ── Player rotation: always face mouse, not movement direction ─────────────
    if (aimDir.length() > 0.01) {
      const aimAngle = Math.atan2(aimDir.x, aimDir.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        aimAngle,
        0.18
      );
    }

    // ── Attacks: Space key or left mouse button ───────────────────────────────
    const now = Date.now();
    const aimDirObj = { x: aimDir.x, y: 0, z: aimDir.z };

    if (keys.attack) {
      attack(aimDirObj);
      isAttacking.current = true;
      attackTime.current = t;
    }
    // Left mouse auto-fire (rate-limited to match store attack cooldown)
    if (isMouseDown.current && now - lastAutoFireTime.current > ATTACK_COOLDOWN_MS) {
      attack(aimDirObj);
      lastAutoFireTime.current = now;
      isAttacking.current = true;
      attackTime.current = t;
    }
    if (keys.ability1) castAbility(1, aimDirObj);
    if (keys.ability2) castAbility(2, aimDirObj);
    if (keys.ability3) castAbility(3, aimDirObj);

    // ── Update group position ─────────────────────────────────────────────────
    groupRef.current.position.set(position.x, position.y, position.z);

    // ── Walking / running animations ─────────────────────────────────────────
    const walkSpeed = 6;
    const walkSwing = Math.sin(t * walkSpeed) * (moving ? 0.55 : 0);
    const walkBob = moving ? Math.abs(Math.sin(t * walkSpeed)) * 0.06 : 0;

    // Leg swing
    if (leftLegRef.current) leftLegRef.current.rotation.x = walkSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -walkSwing;

    // Arm swing (opposite to legs) — except during attack
    if (!isAttacking.current) {
      if (leftArmRef.current) leftArmRef.current.rotation.x = -walkSwing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = walkSwing * 0.6;
    }

    // Body bob
    if (torsoRef.current) {
      torsoRef.current.position.y = walkBob;
    }

    // Head idle sway
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.5) * (moving ? 0.04 : 0.02);
      headRef.current.rotation.x = moving ? Math.sin(t * walkSpeed * 0.5) * 0.02 : 0;
    }

    // ── Attack swing animation ────────────────────────────────────────────────
    if (isAttacking.current) {
      const attackDuration = 0.35;
      const elapsed = t - attackTime.current;
      if (elapsed < attackDuration) {
        const progress = elapsed / attackDuration;
        const swing = Math.sin(progress * Math.PI) * 1.4;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
        if (weaponRef.current) weaponRef.current.rotation.x = -swing * 0.5;
      } else {
        isAttacking.current = false;
      }
    }

    // ── Cape physics: lag behind movement + sway ──────────────────────────────
    if (capeRef.current) {
      const capeSwing = moving ? Math.sin(t * walkSpeed * 0.5) * 0.08 : 0;
      const capeLag = moving ? 0.12 : 0.04;
      capeRef.current.rotation.x = THREE.MathUtils.lerp(
        capeRef.current.rotation.x,
        capeLag,
        0.1
      );
      capeRef.current.rotation.z = capeSwing;
    }

    // ── Aura pulse animation ──────────────────────────────────────────────────
    if (auraRef.current) {
      const pulse = 1 + Math.sin(t * 2.5) * 0.12;
      auraRef.current.scale.setScalar(pulse);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.07 + Math.sin(t * 3.5) * 0.04;
    }

    // ── Isometric camera follow ───────────────────────────────────────────────
    const playerPos = groupRef.current.position;
    camera.position.lerp(
      new THREE.Vector3(playerPos.x + 10, playerPos.y + 15, playerPos.z + 10),
      0.08
    );
    camera.lookAt(playerPos);

    // ── Collision: enemies ────────────────────────────────────────────────────
    enemies.forEach(enemy => {
      if (checkCollision(position, enemy.position, 1.5)) {
        takeDamage(10);
        playHit();
      }
    });

    // ── Collision: loot ───────────────────────────────────────────────────────
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
  const darkArmorTrim = '#1a1a2a';

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Aura / level glow */}
      <mesh ref={auraRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.0, 20, 20]} />
        <meshBasicMaterial color={armorColor} transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>

      {/* ── LEGS ─────────────────────────────────────────────────────────── */}
      <group ref={leftLegRef} position={[-0.2, 0.1, 0]}>
        {/* Upper leg */}
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.145, 0.12, 0.62, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.55} metalness={0.15} />
        </mesh>
        {/* Lower leg */}
        <mesh castShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.52, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.55} metalness={0.1} />
        </mesh>
        {/* Knee guard */}
        <mesh castShadow position={[0, 0.0, 0.04]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={armorColor} roughness={0.3} metalness={0.55} />
        </mesh>
        {/* Boot */}
        <mesh castShadow position={[0, -0.47, 0.05]}>
          <boxGeometry args={[0.19, 0.15, 0.3]} />
          <meshStandardMaterial color={bootsColor} roughness={0.85} metalness={0.1} />
        </mesh>
        {/* Boot buckle */}
        <mesh castShadow position={[0, -0.42, 0.2]}>
          <boxGeometry args={[0.1, 0.05, 0.03]} />
          <meshStandardMaterial color="#888860" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.2, 0.1, 0]}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.145, 0.12, 0.62, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh castShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.52, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.55} metalness={0.1} />
        </mesh>
        {/* Knee guard */}
        <mesh castShadow position={[0, 0.0, 0.04]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={armorColor} roughness={0.3} metalness={0.55} />
        </mesh>
        <mesh castShadow position={[0, -0.47, 0.05]}>
          <boxGeometry args={[0.19, 0.15, 0.3]} />
          <meshStandardMaterial color={bootsColor} roughness={0.85} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, -0.42, 0.2]}>
          <boxGeometry args={[0.1, 0.05, 0.03]} />
          <meshStandardMaterial color="#888860" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* ── TORSO / CHEST ARMOR ───────────────────────────────────────────── */}
      <mesh ref={torsoRef} castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[0.72, 0.78, 0.42]} />
        <meshStandardMaterial color={armorColor} roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Chest detail lines */}
      <mesh castShadow position={[0, 1.08, 0.22]}>
        <boxGeometry args={[0.5, 0.55, 0.04]} />
        <meshStandardMaterial color={armorColor} roughness={0.2} metalness={0.7} emissive={armorColor} emissiveIntensity={0.08} />
      </mesh>
      {/* Center chest gem */}
      <mesh castShadow position={[0, 1.12, 0.24]}>
        <octahedronGeometry args={[0.07]} />
        <meshStandardMaterial color={armorColor} roughness={0.05} metalness={0.1} emissive={armorColor} emissiveIntensity={0.6} />
      </mesh>

      {/* Shoulder pauldrons */}
      <mesh castShadow position={[-0.45, 1.27, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={armorColor} roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.45, 1.27, 0]}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color={darkArmorTrim} roughness={0.5} metalness={0.4} transparent opacity={0.5} side={THREE.BackSide} />
      </mesh>
      <mesh castShadow position={[0.45, 1.27, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={armorColor} roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh castShadow position={[0.45, 1.27, 0]}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color={darkArmorTrim} roughness={0.5} metalness={0.4} transparent opacity={0.5} side={THREE.BackSide} />
      </mesh>

      {/* Belt */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[0.74, 0.11, 0.44]} />
        <meshStandardMaterial color="#4a3a20" roughness={0.75} metalness={0.25} />
      </mesh>
      {/* Belt buckle */}
      <mesh castShadow position={[0, 0.68, 0.23]}>
        <boxGeometry args={[0.13, 0.11, 0.04]} />
        <meshStandardMaterial color="#ccaa44" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* ── LEFT ARM ─────────────────────────────────────────────────────── */}
      <group ref={leftArmRef} position={[-0.47, 1.12, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.47, 10]} />
          <meshStandardMaterial color={armorColor} roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Elbow guard */}
        <mesh castShadow position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={armorColor} roughness={0.25} metalness={0.55} />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0, -0.57, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.4, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
      </group>

      {/* ── RIGHT ARM (holds weapon) ─────────────────────────────────────── */}
      <group ref={rightArmRef} position={[0.47, 1.12, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.47, 10]} />
          <meshStandardMaterial color={armorColor} roughness={0.35} metalness={0.4} />
        </mesh>
        {/* Elbow guard */}
        <mesh castShadow position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={armorColor} roughness={0.25} metalness={0.55} />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0, -0.57, 0]}>
          <cylinderGeometry args={[0.1, 0.09, 0.4, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </mesh>
        {/* ── WEAPON ────────────────────────────────────────────────────── */}
        <group ref={weaponRef} position={[0, -1.02, 0]}>
          {hasWeapon ? (
            <>
              {/* Blade */}
              <mesh castShadow position={[0, -0.48, 0]}>
                <boxGeometry args={[0.065, 0.95, 0.045]} />
                <meshStandardMaterial
                  color={weaponColor}
                  roughness={0.1}
                  metalness={0.97}
                  emissive={weaponColor}
                  emissiveIntensity={0.35}
                />
              </mesh>
              {/* Blade tip */}
              <mesh castShadow position={[0, -0.98, 0]}>
                <coneGeometry args={[0.035, 0.18, 4]} />
                <meshStandardMaterial color={weaponColor} roughness={0.1} metalness={0.97} emissive={weaponColor} emissiveIntensity={0.35} />
              </mesh>
              {/* Crossguard */}
              <mesh castShadow position={[0, -0.05, 0]}>
                <boxGeometry args={[0.32, 0.065, 0.065]} />
                <meshStandardMaterial color="#9a8a60" roughness={0.25} metalness={0.85} />
              </mesh>
              {/* Crossguard gems */}
              <mesh position={[-0.17, -0.05, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color={weaponColor} emissive={weaponColor} emissiveIntensity={1.2} />
              </mesh>
              <mesh position={[0.17, -0.05, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial color={weaponColor} emissive={weaponColor} emissiveIntensity={1.2} />
              </mesh>
              {/* Grip */}
              <mesh castShadow position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.042, 0.038, 0.28, 10]} />
                <meshStandardMaterial color="#4a2a10" roughness={0.88} />
              </mesh>
              {/* Grip wrapping */}
              {[0.04, 0.1, 0.18].map((y, i) => (
                <mesh key={i} castShadow position={[0, y, 0]}>
                  <torusGeometry args={[0.043, 0.008, 6, 12]} />
                  <meshStandardMaterial color="#7a5a30" roughness={0.7} metalness={0.3} />
                </mesh>
              ))}
              {/* Pommel */}
              <mesh castShadow position={[0, 0.27, 0]}>
                <sphereGeometry args={[0.065, 10, 10]} />
                <meshStandardMaterial color="#9a8a60" roughness={0.25} metalness={0.85} />
              </mesh>
              {/* Weapon glow */}
              <pointLight color={weaponColor} intensity={1.0} distance={3} />
            </>
          ) : (
            /* Bare hand / fist indicator */
            <mesh castShadow position={[0, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={skinColor} roughness={0.65} />
            </mesh>
          )}
        </group>
      </group>

      {/* ── NECK ─────────────────────────────────────────────────────────── */}
      <mesh castShadow position={[0, 1.47, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.16, 10]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>

      {/* ── HEAD ─────────────────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 1.77, 0]}>
        {/* Main head */}
        <mesh castShadow>
          <boxGeometry args={[0.43, 0.46, 0.42]} />
          <meshStandardMaterial color={skinColor} roughness={0.58} />
        </mesh>
        {/* Hair */}
        <mesh castShadow position={[0, 0.19, -0.04]}>
          <boxGeometry args={[0.45, 0.15, 0.4]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>
        {/* Side hair */}
        <mesh castShadow position={[-0.22, 0.08, -0.02]}>
          <boxGeometry args={[0.04, 0.2, 0.3]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>
        <mesh castShadow position={[0.22, 0.08, -0.02]}>
          <boxGeometry args={[0.04, 0.2, 0.3]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>
        {/* Eyes – glowing */}
        <mesh position={[-0.1, 0.05, 0.22]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshStandardMaterial color="#2244ff" emissive="#1133ff" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.1, 0.05, 0.22]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshStandardMaterial color="#2244ff" emissive="#1133ff" emissiveIntensity={1.2} />
        </mesh>
        {/* Eye whites */}
        <mesh position={[-0.1, 0.05, 0.214]}>
          <sphereGeometry args={[0.052, 10, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.214]}>
          <sphereGeometry args={[0.052, 10, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.04, 0.22]}>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        {/* Helmet/headband */}
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.47, 0.085, 0.44]} />
          <meshStandardMaterial color={armorColor} roughness={0.25} metalness={0.65} />
        </mesh>
        {/* Helmet front crest */}
        <mesh castShadow position={[0, 0.16, 0.22]}>
          <boxGeometry args={[0.12, 0.06, 0.04]} />
          <meshStandardMaterial color={armorColor} roughness={0.2} metalness={0.8} emissive={armorColor} emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* ── CAPE ──────────────────────────────────────────────────────────── */}
      <mesh ref={capeRef} castShadow position={[0, 1.12, -0.24]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[0.62, 0.9, 0.04]} />
        <meshStandardMaterial color="#1a0a3a" roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
      {/* Cape inner liner */}
      <mesh castShadow position={[0, 1.12, -0.22]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[0.58, 0.86, 0.02]} />
        <meshStandardMaterial color="#3a0a5a" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      {/* ── AIM INDICATOR: small glow dot at target position ─────────────── */}
      {/* Subtle crosshair at aim target on ground */}

      {/* Player ambient point light */}
      <pointLight
        position={[0, 1, 0]}
        intensity={0.7}
        color={armorColor}
        distance={4.5}
      />
    </group>
  );
}
