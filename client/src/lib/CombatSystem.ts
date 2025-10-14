import { Position, StatusEffect, Projectile } from "./gameTypes";

export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'arcane';

export interface CombatEntity {
  id: string;
  position: Position;
  health: number;
  maxHealth: number;
  statusEffects: StatusEffect[];
}

export interface DamageResult {
  targetId: string;
  damage: number;
  damageType: DamageType;
  isCritical: boolean;
  statusEffect?: StatusEffect;
}

let statusEffectIdCounter = 0;

export class CombatSystem {
  static calculateDamage(
    baseDamage: number,
    damageType: DamageType,
    attackerStats: { strength?: number; dexterity?: number; intelligence?: number },
    defenderStats: { vitality?: number },
    critChance: number = 0.1
  ): DamageResult {
    let totalDamage = baseDamage;
    
    // Apply stat modifiers based on damage type
    if (damageType === 'physical') {
      totalDamage += (attackerStats.strength || 0) * 0.5;
    } else if (damageType === 'fire' || damageType === 'ice' || damageType === 'lightning' || damageType === 'arcane') {
      totalDamage += (attackerStats.intelligence || 0) * 0.7;
    }
    
    // Apply defender resistance
    const resistance = (defenderStats.vitality || 0) * 0.3;
    totalDamage = Math.max(1, totalDamage - resistance);
    
    // Critical hit check
    const isCritical = Math.random() < critChance;
    if (isCritical) {
      totalDamage *= 2;
    }
    
    // Create result
    const result: DamageResult = {
      targetId: '',
      damage: Math.floor(totalDamage),
      damageType,
      isCritical
    };
    
    // Apply status effects based on damage type
    if (damageType === 'fire' && Math.random() < 0.3) {
      result.statusEffect = this.createStatusEffect('burn', 5000, Math.floor(totalDamage * 0.1));
    } else if (damageType === 'ice' && Math.random() < 0.4) {
      result.statusEffect = this.createStatusEffect('slow', 4000, 0.5);
    } else if (damageType === 'lightning' && Math.random() < 0.2) {
      result.statusEffect = this.createStatusEffect('stun', 2000, 0);
    } else if (damageType === 'poison' && Math.random() < 0.5) {
      result.statusEffect = this.createStatusEffect('poison', 10000, Math.floor(totalDamage * 0.05));
    }
    
    return result;
  }
  
  static createStatusEffect(
    type: StatusEffect['type'],
    duration: number,
    value: number
  ): StatusEffect {
    return {
      id: `status_${++statusEffectIdCounter}`,
      type,
      duration,
      value
    };
  }
  
  static updateStatusEffects(
    entity: CombatEntity,
    deltaTime: number
  ): { entity: CombatEntity; damage: number } {
    let totalDamage = 0;
    const updatedEffects: StatusEffect[] = [];
    
    entity.statusEffects.forEach(effect => {
      const newDuration = effect.duration - deltaTime;
      
      if (newDuration > 0) {
        // Apply effect
        if (effect.type === 'burn' || effect.type === 'poison') {
          // Damage over time
          totalDamage += effect.value * (deltaTime / 1000);
        } else if (effect.type === 'heal') {
          // Heal over time (negative damage)
          totalDamage -= effect.value * (deltaTime / 1000);
        }
        
        updatedEffects.push({
          ...effect,
          duration: newDuration
        });
      }
    });
    
    return {
      entity: {
        ...entity,
        statusEffects: updatedEffects,
        health: Math.max(0, Math.min(entity.maxHealth, entity.health - totalDamage))
      },
      damage: totalDamage
    };
  }
  
  static checkCollision(
    projectile: Projectile,
    target: { position: Position; radius?: number }
  ): boolean {
    const radius = target.radius || 1;
    const dx = projectile.position.x - target.position.x;
    const dy = projectile.position.y - target.position.y;
    const dz = projectile.position.z - target.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return distance < radius + 0.5; // Projectile has 0.5 radius
  }
  
  static calculateKnockback(
    from: Position,
    to: Position,
    force: number
  ): Position {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    
    return {
      x: (dx / distance) * force,
      y: 0,
      z: (dz / distance) * force
    };
  }
  
  static isInRange(pos1: Position, pos2: Position, range: number): boolean {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance <= range;
  }
  
  static getDirection(from: Position, to: Position): Position {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance === 0) {
      return { x: 0, y: 0, z: -1 };
    }
    
    return {
      x: dx / distance,
      y: 0,
      z: dz / distance
    };
  }
}
