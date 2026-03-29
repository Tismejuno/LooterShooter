import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, Trail } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useEnemies } from "../../lib/stores/useEnemies";
import { useLoot } from "../../lib/stores/useLoot";
import { useAudio } from "../../lib/stores/useAudio";
import { useVFX } from "../../lib/stores/useVFX";
import { checkCollision } from "../../lib/gameUtils";
import { metalTex, leatherTex, crystalTex, goldTex } from "../../lib/textures";

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
  // Extra visual refs
  const chestGemRef = useRef<THREE.Mesh>(null);
  const weaponGlowRef = useRef<THREE.PointLight>(null);
  const playerLightRef = useRef<THREE.PointLight>(null);

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
  const { addEffect } = useVFX();

  const isMoving = useRef(false);
  const isAttacking = useRef(false);
  const attackTime = useRef(0);
  const isMouseDown = useRef(false);
  const lastAutoFireTime = useRef(0);

  // Hit-shake state
  const hitShakeTimeRef = useRef(-999);
  const hitShakeOffset = useRef(new THREE.Vector3());

  // Footstep timing
  const lastFootstepTimeRef = useRef(-999);
  const footstepInterval = 0.38; // seconds between dust puffs

  // Health & level tracking for visual effects
  const prevHealthRef = useRef(100);
  const hitFlashTimeRef = useRef(-999);
  const prevLevelRef = useRef(1);
  const lastAbilityFlashRef = useRef(-999);

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
    if (keys.ability1) { castAbility(1, aimDirObj); lastAbilityFlashRef.current = t; addEffect({ type: "ability", position, color: "#44aaff" }); }
    if (keys.ability2) { castAbility(2, aimDirObj); lastAbilityFlashRef.current = t; addEffect({ type: "ability", position, color: "#aa44ff" }); }
    if (keys.ability3) { castAbility(3, aimDirObj); lastAbilityFlashRef.current = t; addEffect({ type: "ability", position, color: "#ff4444" }); }

    // ── Hit-shake: briefly jitter group position on damage ───────────────────
    const shakeAge = t - hitShakeTimeRef.current;
    if (shakeAge < 0.25) {
      const shakeDecay = 1 - shakeAge / 0.25;
      hitShakeOffset.current.set(
        (Math.random() - 0.5) * 0.12 * shakeDecay,
        0,
        (Math.random() - 0.5) * 0.12 * shakeDecay
      );
    } else {
      hitShakeOffset.current.set(0, 0, 0);
    }
    groupRef.current.position.set(
      position.x + hitShakeOffset.current.x,
      position.y + hitShakeOffset.current.y,
      position.z + hitShakeOffset.current.z
    );

    // ── Footstep dust puffs while moving ─────────────────────────────────────
    if (moving && t - lastFootstepTimeRef.current > footstepInterval) {
      lastFootstepTimeRef.current = t;
      addEffect({ type: "footstep", position: { x: position.x, y: position.y, z: position.z }, color: "#a08070" });
    }

    // ── Detect damage taken → player hit flash + shake ───────────────────────
    if (health < prevHealthRef.current) {
      hitFlashTimeRef.current = t;
      hitShakeTimeRef.current = t;
    }
    prevHealthRef.current = health;

    // ── Detect level up → level-up VFX ────────────────────────────────────────
    if (level > prevLevelRef.current) {
      prevLevelRef.current = level;
      addEffect({ type: "levelup", position, color: "#ffdd00" });
    }

    // ── Walking / running animations ─────────────────────────────────────────
    const walkSpeed = 6;
    // Distinguish running (both horizontal keys) vs walking
    const diagonal = (keys.forward || keys.backward) && (keys.leftward || keys.rightward);
    const runMultiplier = diagonal ? 1.0 : (moving ? 1.3 : 0);
    const walkSwing = Math.sin(t * walkSpeed * runMultiplier) * (moving ? 0.6 : 0);
    const walkBob = moving ? Math.abs(Math.sin(t * walkSpeed * runMultiplier)) * 0.07 : 0;

    // Idle breathing when still
    const breathScale = moving ? 1 : 1 + Math.sin(t * 1.2) * 0.018;

    // Leg swing
    if (leftLegRef.current) leftLegRef.current.rotation.x = walkSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -walkSwing;

    // Arm swing (opposite to legs) — except during attack
    if (!isAttacking.current) {
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -walkSwing * 0.65;
        // Subtle idle arm drift
        if (!moving) leftArmRef.current.rotation.z = -0.05 + Math.sin(t * 0.8) * 0.02;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = walkSwing * 0.65;
        if (!moving) rightArmRef.current.rotation.z = 0.05 + Math.sin(t * 0.8 + 1) * 0.02;
      }
    }

    // Body bob + breathing scale
    if (torsoRef.current) {
      torsoRef.current.position.y = walkBob;
      torsoRef.current.scale.y = breathScale;
      // Subtle forward lean when moving
      torsoRef.current.rotation.x = moving ? THREE.MathUtils.lerp(torsoRef.current.rotation.x, -0.08, 0.06) : THREE.MathUtils.lerp(torsoRef.current.rotation.x, 0, 0.05);
    }

    // Head idle sway
    if (headRef.current) {
      headRef.current.rotation.y = moving ? Math.sin(t * 1.5) * 0.04 : Math.sin(t * 1.1) * 0.025;
      headRef.current.rotation.x = moving ? Math.sin(t * walkSpeed * 0.5) * 0.02 : Math.sin(t * 0.7) * 0.01;
    }

    // ── Attack swing animation ────────────────────────────────────────────────
    if (isAttacking.current) {
      const attackDuration = 0.35;
      const elapsed = t - attackTime.current;
      if (elapsed < attackDuration) {
        const progress = elapsed / attackDuration;
        const swing = Math.sin(progress * Math.PI) * 1.5;
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -swing;
          // Side sweep component for more natural motion
          rightArmRef.current.rotation.z = swing * 0.2;
        }
        if (weaponRef.current) weaponRef.current.rotation.x = -swing * 0.5;
        // Weapon glow spikes on attack
        if (weaponGlowRef.current) {
          weaponGlowRef.current.intensity = 1.0 + swing * 2;
        }
      } else {
        isAttacking.current = false;
        if (rightArmRef.current) rightArmRef.current.rotation.z = 0;
        if (weaponGlowRef.current) weaponGlowRef.current.intensity = 1.0;
      }
    }

    // ── Cape physics: lag behind movement + sway ──────────────────────────────
    if (capeRef.current) {
      const capeSwing = moving ? Math.sin(t * walkSpeed * 0.5) * 0.1 : Math.sin(t * 0.6) * 0.03;
      const capeLag = moving ? 0.14 : 0.04;
      capeRef.current.rotation.x = THREE.MathUtils.lerp(capeRef.current.rotation.x, capeLag, 0.08);
      capeRef.current.rotation.z = THREE.MathUtils.lerp(capeRef.current.rotation.z, capeSwing, 0.1);
    }

    // ── Aura pulse animation ──────────────────────────────────────────────────
    if (auraRef.current) {
      const hitAge = t - hitFlashTimeRef.current;
      const abilityAge = t - lastAbilityFlashRef.current;
      const hitFlashActive = hitAge < 0.4;
      const abilityFlashActive = abilityAge < 0.5;
      const lowHealth = health < 30;

      let auraOpacity = 0.07 + Math.sin(t * 3.5) * 0.04;
      let auraScale = 1 + Math.sin(t * 2.5) * 0.12;

      if (hitFlashActive) {
        // Red flash on damage
        const flashT = 1 - hitAge / 0.4;
        (auraRef.current.material as THREE.MeshBasicMaterial).color.set(
          flashT > 0.5 ? "#ff2200" : armorColor
        );
        auraOpacity = Math.max(auraOpacity, flashT * 0.25);
        auraScale = 1 + flashT * 0.15;
      } else if (abilityFlashActive) {
        // Color flash on ability
        const flashT = 1 - abilityAge / 0.5;
        (auraRef.current.material as THREE.MeshBasicMaterial).color.set("#44aaff");
        auraOpacity = Math.max(auraOpacity, flashT * 0.2);
        auraScale = 1 + flashT * 0.18;
      } else if (lowHealth) {
        // Danger: pulse red at low health
        const dangerPulse = 0.5 + Math.sin(t * 8) * 0.5;
        (auraRef.current.material as THREE.MeshBasicMaterial).color.set("#ff1100");
        auraOpacity = 0.08 + dangerPulse * 0.18;
        auraScale = 1 + dangerPulse * 0.2;
      } else {
        (auraRef.current.material as THREE.MeshBasicMaterial).color.set(armorColor);
      }

      auraRef.current.scale.setScalar(auraScale);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity = auraOpacity;
    }

    // ── Chest gem pulse ───────────────────────────────────────────────────────
    if (chestGemRef.current) {
      const gemMat = chestGemRef.current.material as THREE.MeshStandardMaterial;
      gemMat.emissiveIntensity = 0.5 + Math.sin(t * 4) * 0.3;
    }

    // ── Player ambient light – breathes with mana ─────────────────────────────
    if (playerLightRef.current) {
      playerLightRef.current.intensity = 0.5 + Math.sin(t * 2) * 0.15 + (mana / 50) * 0.2;
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
        // Sparkle pickup VFX color-matched to rarity
        const pickupColors: Record<string, string> = {
          common: '#c0c0c0', uncommon: '#1eff00', rare: '#0070dd',
          epic: '#a335ee', legendary: '#ff8000'
        };
        addEffect({ type: "loot", position: item.position, color: pickupColors[item.rarity] ?? '#ffffff' });
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
          <meshStandardMaterial map={leatherTex(1)} color={pantsColor} roughness={0.52} metalness={0.15} />
        </mesh>
        {/* Lower leg */}
        <mesh castShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.52, 10]} />
          <meshStandardMaterial map={leatherTex(1)} color={pantsColor} roughness={0.52} metalness={0.1} />
        </mesh>
        {/* Knee guard – metal texture */}
        <mesh castShadow position={[0, 0.0, 0.04]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.28} metalness={0.58} />
        </mesh>
        {/* Boot – leather texture */}
        <mesh castShadow position={[0, -0.47, 0.05]}>
          <boxGeometry args={[0.19, 0.15, 0.3]} />
          <meshStandardMaterial map={leatherTex(1)} color={bootsColor} roughness={0.82} metalness={0.1} />
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
          <meshStandardMaterial map={leatherTex(1)} color={pantsColor} roughness={0.52} metalness={0.1} />
        </mesh>
        {/* Knee guard – metal */}
        <mesh castShadow position={[0, 0.0, 0.04]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.28} metalness={0.58} />
        </mesh>
        <mesh castShadow position={[0, -0.47, 0.05]}>
          <boxGeometry args={[0.19, 0.15, 0.3]} />
          <meshStandardMaterial map={leatherTex(1)} color={bootsColor} roughness={0.82} metalness={0.1} />
        </mesh>
        <mesh castShadow position={[0, -0.42, 0.2]}>
          <boxGeometry args={[0.1, 0.05, 0.03]} />
          <meshStandardMaterial map={goldTex()} color="#888860" roughness={0.28} metalness={0.82} />
        </mesh>
      </group>

      {/* ── TORSO / CHEST ARMOR ───────────────────────────────────────────── */}
      <mesh ref={torsoRef} castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[0.72, 0.78, 0.42]} />
        <meshStandardMaterial map={metalTex(2)} color={armorColor} roughness={0.32} metalness={0.52} />
      </mesh>
      {/* Chest detail lines – polished metal */}
      <mesh castShadow position={[0, 1.08, 0.22]}>
        <boxGeometry args={[0.5, 0.55, 0.04]} />
        <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.18} metalness={0.72} emissive={armorColor} emissiveIntensity={0.08} />
      </mesh>
      {/* Center chest gem – crystal texture */}
      <mesh ref={chestGemRef} castShadow position={[0, 1.12, 0.24]}>
        <octahedronGeometry args={[0.07]} />
        <meshStandardMaterial map={crystalTex()} color={armorColor} roughness={0.04} metalness={0.1} emissive={armorColor} emissiveIntensity={0.6} />
      </mesh>

      {/* Shoulder pauldrons – metal texture */}
      <mesh castShadow position={[-0.45, 1.27, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.22} metalness={0.62} />
      </mesh>
      <mesh castShadow position={[-0.45, 1.27, 0]}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color={darkArmorTrim} roughness={0.5} metalness={0.4} transparent opacity={0.5} side={THREE.BackSide} />
      </mesh>
      <mesh castShadow position={[0.45, 1.27, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.22} metalness={0.62} />
      </mesh>
      <mesh castShadow position={[0.45, 1.27, 0]}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color={darkArmorTrim} roughness={0.5} metalness={0.4} transparent opacity={0.5} side={THREE.BackSide} />
      </mesh>

      {/* Belt – leather texture */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[0.74, 0.11, 0.44]} />
        <meshStandardMaterial map={leatherTex(1)} color="#4a3a20" roughness={0.72} metalness={0.22} />
      </mesh>
      {/* Belt buckle – gold texture */}
      <mesh castShadow position={[0, 0.68, 0.23]}>
        <boxGeometry args={[0.13, 0.11, 0.04]} />
        <meshStandardMaterial map={goldTex()} color="#ccaa44" roughness={0.22} metalness={0.88} />
      </mesh>

      {/* ── LEFT ARM ─────────────────────────────────────────────────────── */}
      <group ref={leftArmRef} position={[-0.47, 1.12, 0]}>
        {/* Upper arm – metal */}
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.47, 10]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.32} metalness={0.42} />
        </mesh>
        {/* Elbow guard */}
        <mesh castShadow position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.22} metalness={0.58} />
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
        {/* Upper arm – metal */}
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.47, 10]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.32} metalness={0.42} />
        </mesh>
        {/* Elbow guard */}
        <mesh castShadow position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.22} metalness={0.58} />
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
              {/* Blade – metal texture */}
              <mesh castShadow position={[0, -0.48, 0]}>
                <boxGeometry args={[0.065, 0.95, 0.045]} />
                <meshStandardMaterial
                  map={metalTex(1)}
                  color={weaponColor}
                  roughness={0.08}
                  metalness={0.98}
                  emissive={weaponColor}
                  emissiveIntensity={0.38}
                />
              </mesh>
              {/* Blade tip wrapped in Trail – trail follows the tip during swings */}
              <Trail
                color={weaponColor}
                width={0.22}
                length={8}
                decay={3}
                local={true}
                stride={0}
                interval={1}
                attenuation={(width) => width * width}
              >
                <mesh castShadow position={[0, -0.98, 0]}>
                  <coneGeometry args={[0.035, 0.18, 4]} />
                  <meshStandardMaterial map={metalTex(1)} color={weaponColor} roughness={0.08} metalness={0.98} emissive={weaponColor} emissiveIntensity={0.38} />
                </mesh>
              </Trail>
              {/* Crossguard – gold texture */}
              <mesh castShadow position={[0, -0.05, 0]}>
                <boxGeometry args={[0.32, 0.065, 0.065]} />
                <meshStandardMaterial map={goldTex()} color="#9a8a60" roughness={0.22} metalness={0.88} />
              </mesh>
              {/* Crossguard gems – crystal texture */}
              <mesh position={[-0.17, -0.05, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial map={crystalTex()} color={weaponColor} emissive={weaponColor} emissiveIntensity={1.2} />
              </mesh>
              <mesh position={[0.17, -0.05, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshStandardMaterial map={crystalTex()} color={weaponColor} emissive={weaponColor} emissiveIntensity={1.2} />
              </mesh>
              {/* Grip – leather texture */}
              <mesh castShadow position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.042, 0.038, 0.28, 10]} />
                <meshStandardMaterial map={leatherTex(1)} color="#4a2a10" roughness={0.85} />
              </mesh>
              {/* Grip wrapping */}
              {[0.04, 0.1, 0.18].map((y, i) => (
                <mesh key={i} castShadow position={[0, y, 0]}>
                  <torusGeometry args={[0.043, 0.008, 6, 12]} />
                  <meshStandardMaterial map={leatherTex(1)} color="#7a5a30" roughness={0.68} metalness={0.3} />
                </mesh>
              ))}
              {/* Pommel – gold texture */}
              <mesh castShadow position={[0, 0.27, 0]}>
                <sphereGeometry args={[0.065, 10, 10]} />
                <meshStandardMaterial map={goldTex()} color="#9a8a60" roughness={0.22} metalness={0.88} />
              </mesh>
              {/* Weapon glow */}
              <pointLight ref={weaponGlowRef} color={weaponColor} intensity={1.0} distance={3} />
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
        {/* Helmet/headband – metal texture */}
        <mesh castShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[0.47, 0.085, 0.44]} />
          <meshStandardMaterial map={metalTex(1)} color={armorColor} roughness={0.22} metalness={0.68} />
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
        ref={playerLightRef}
        position={[0, 1, 0]}
        intensity={0.7}
        color={armorColor}
        distance={4.5}
      />
    </group>
  );
}
