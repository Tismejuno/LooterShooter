#!/usr/bin/env python3
"""
LooterShooter Game Simulator

A Python implementation of the game mechanics for the LooterShooter game.
This script can be used for:
- Testing combat mechanics
- Simulating loot generation
- Testing player progression
- Balancing game difficulty

Usage:
    python looter_shooter_game.py --simulate-combat
    python looter_shooter_game.py --generate-loot --level 5
    python looter_shooter_game.py --simulate-dungeon-run --level 10
"""

import json
import math
import random
import argparse
from typing import List, Dict, Tuple, Any, Optional
from dataclasses import dataclass, asdict, field
from enum import Enum


class DamageType(Enum):
    """Types of damage in the game"""
    PHYSICAL = 'physical'
    FIRE = 'fire'
    ICE = 'ice'
    LIGHTNING = 'lightning'
    POISON = 'poison'
    ARCANE = 'arcane'


class ItemRarity(Enum):
    """Item rarity levels"""
    COMMON = 'common'
    UNCOMMON = 'uncommon'
    RARE = 'rare'
    EPIC = 'epic'
    LEGENDARY = 'legendary'


class ItemType(Enum):
    """Types of items"""
    WEAPON = 'weapon'
    ARMOR = 'armor'
    POTION = 'potion'
    SCROLL = 'scroll'


class StatusEffectType(Enum):
    """Status effect types"""
    BURN = 'burn'
    FREEZE = 'freeze'
    POISON = 'poison'
    STUN = 'stun'
    SLOW = 'slow'
    HEAL = 'heal'
    SHIELD = 'shield'


@dataclass
class Position:
    """3D position in the game world"""
    x: float
    y: float
    z: float


@dataclass
class Stats:
    """Character stats"""
    strength: int = 10
    dexterity: int = 10
    intelligence: int = 10
    vitality: int = 10
    
    def to_dict(self) -> Dict[str, int]:
        return {
            'strength': self.strength,
            'dexterity': self.dexterity,
            'intelligence': self.intelligence,
            'vitality': self.vitality
        }


@dataclass
class StatusEffect:
    """Status effect applied to entities"""
    id: str
    type: StatusEffectType
    duration: int  # milliseconds
    value: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type.value,
            'duration': self.duration,
            'value': self.value
        }


@dataclass
class LootItem:
    """Item that can be found or purchased"""
    id: str
    name: str
    type: ItemType
    rarity: ItemRarity
    stats: Dict[str, int] = field(default_factory=dict)
    value: int = 0
    effect: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type.value,
            'rarity': self.rarity.value,
            'stats': self.stats,
            'value': self.value,
            'effect': self.effect
        }


@dataclass
class DamageResult:
    """Result of damage calculation"""
    damage: int
    damage_type: DamageType
    is_critical: bool
    status_effect: Optional[StatusEffect] = None
    
    def to_dict(self) -> Dict[str, Any]:
        result = {
            'damage': self.damage,
            'damageType': self.damage_type.value,
            'isCritical': self.is_critical
        }
        if self.status_effect:
            result['statusEffect'] = self.status_effect.to_dict()
        return result


@dataclass
class Player:
    """Player character"""
    id: str
    name: str
    level: int
    health: int
    max_health: int
    mana: int
    max_mana: int
    stats: Stats
    gold: int = 0
    experience: int = 0
    status_effects: List[StatusEffect] = field(default_factory=list)
    inventory: List[LootItem] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'health': self.health,
            'maxHealth': self.max_health,
            'mana': self.mana,
            'maxMana': self.max_mana,
            'stats': self.stats.to_dict(),
            'gold': self.gold,
            'experience': self.experience,
            'statusEffects': [se.to_dict() for se in self.status_effects],
            'inventory': [item.to_dict() for item in self.inventory]
        }


@dataclass
class Enemy:
    """Enemy entity"""
    id: str
    type: str
    level: int
    health: int
    max_health: int
    damage: int
    stats: Stats
    experience: int
    gold_reward: int
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'type': self.type,
            'level': self.level,
            'health': self.health,
            'maxHealth': self.max_health,
            'damage': self.damage,
            'stats': self.stats.to_dict(),
            'experience': self.experience,
            'goldReward': self.gold_reward
        }


class CombatSystem:
    """Combat system for damage calculation and status effects"""
    
    @staticmethod
    def calculate_damage(
        base_damage: int,
        damage_type: DamageType,
        attacker_stats: Stats,
        defender_stats: Stats,
        crit_chance: float = 0.1
    ) -> DamageResult:
        """Calculate damage with stats and critical hits"""
        total_damage = float(base_damage)
        
        # Apply stat modifiers based on damage type
        if damage_type == DamageType.PHYSICAL:
            total_damage += attacker_stats.strength * 0.5
        elif damage_type in [DamageType.FIRE, DamageType.ICE, DamageType.LIGHTNING, DamageType.ARCANE]:
            total_damage += attacker_stats.intelligence * 0.7
        
        # Apply defender resistance
        resistance = defender_stats.vitality * 0.3
        total_damage = max(1, total_damage - resistance)
        
        # Critical hit check
        is_critical = random.random() < crit_chance
        if is_critical:
            total_damage *= 2
        
        # Create result
        result = DamageResult(
            damage=int(total_damage),
            damage_type=damage_type,
            is_critical=is_critical
        )
        
        # Apply status effects based on damage type
        status_effect_id_counter = random.randint(1000, 9999)
        
        if damage_type == DamageType.FIRE and random.random() < 0.3:
            result.status_effect = StatusEffect(
                id=f'status_{status_effect_id_counter}',
                type=StatusEffectType.BURN,
                duration=5000,
                value=total_damage * 0.1
            )
        elif damage_type == DamageType.ICE and random.random() < 0.4:
            result.status_effect = StatusEffect(
                id=f'status_{status_effect_id_counter}',
                type=StatusEffectType.SLOW,
                duration=4000,
                value=0.5
            )
        elif damage_type == DamageType.LIGHTNING and random.random() < 0.2:
            result.status_effect = StatusEffect(
                id=f'status_{status_effect_id_counter}',
                type=StatusEffectType.STUN,
                duration=2000,
                value=0
            )
        elif damage_type == DamageType.POISON and random.random() < 0.5:
            result.status_effect = StatusEffect(
                id=f'status_{status_effect_id_counter}',
                type=StatusEffectType.POISON,
                duration=10000,
                value=total_damage * 0.05
            )
        
        return result
    
    @staticmethod
    def simulate_combat(player: Player, enemy: Enemy) -> Dict[str, Any]:
        """Simulate a combat encounter"""
        rounds = []
        player_health = player.health
        enemy_health = enemy.health
        round_num = 0
        
        while player_health > 0 and enemy_health > 0 and round_num < 100:
            round_num += 1
            
            # Player attacks
            player_damage = CombatSystem.calculate_damage(
                base_damage=20 + player.level * 5,
                damage_type=DamageType.PHYSICAL,
                attacker_stats=player.stats,
                defender_stats=enemy.stats
            )
            enemy_health -= player_damage.damage
            
            round_info = {
                'round': round_num,
                'playerAttack': player_damage.to_dict(),
                'enemyHealth': max(0, enemy_health)
            }
            
            # Enemy attacks if still alive
            if enemy_health > 0:
                enemy_damage = CombatSystem.calculate_damage(
                    base_damage=enemy.damage,
                    damage_type=DamageType.PHYSICAL,
                    attacker_stats=enemy.stats,
                    defender_stats=player.stats
                )
                player_health -= enemy_damage.damage
                
                round_info['enemyAttack'] = enemy_damage.to_dict()
                round_info['playerHealth'] = max(0, player_health)
            
            rounds.append(round_info)
        
        victory = player_health > 0
        
        return {
            'victory': victory,
            'rounds': round_num,
            'finalPlayerHealth': max(0, player_health),
            'finalEnemyHealth': max(0, enemy_health),
            'combatLog': rounds
        }


class LootSystem:
    """Loot generation system"""
    
    ITEM_PREFIXES = {
        ItemType.WEAPON: ['Sharp', 'Keen', 'Brutal', 'Swift', 'Deadly', 'Ancient', 'Cursed', 'Blessed', 'Vengeful', 'Divine'],
        ItemType.ARMOR: ['Sturdy', 'Light', 'Heavy', 'Reinforced', 'Magical', 'Dragon', 'Shadow', 'Holy', 'Ethereal', 'Titan'],
        ItemType.POTION: ['Minor', 'Lesser', 'Greater', 'Major', 'Superior', 'Divine'],
        ItemType.SCROLL: ['Scroll of', 'Tome of', 'Grimoire of', 'Codex of']
    }
    
    ITEM_TYPES_NAMES = {
        ItemType.WEAPON: ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger', 'Mace', 'Spear', 'Hammer', 'Wand'],
        ItemType.ARMOR: ['Helmet', 'Chestplate', 'Boots', 'Gauntlets', 'Shield', 'Cloak', 'Belt', 'Ring'],
        ItemType.POTION: ['Health Potion', 'Mana Potion', 'Strength Elixir', 'Defense Tonic', 'Speed Draught'],
        ItemType.SCROLL: ['Fireball', 'Lightning', 'Ice Storm', 'Healing', 'Teleportation', 'Summoning']
    }
    
    RARITY_VALUES = {
        ItemRarity.COMMON: {'multiplier': 1.0, 'sell_value': 10},
        ItemRarity.UNCOMMON: {'multiplier': 1.5, 'sell_value': 25},
        ItemRarity.RARE: {'multiplier': 2.0, 'sell_value': 50},
        ItemRarity.EPIC: {'multiplier': 3.0, 'sell_value': 100},
        ItemRarity.LEGENDARY: {'multiplier': 5.0, 'sell_value': 250}
    }
    
    @staticmethod
    def generate_item(rarity: ItemRarity, item_type: Optional[ItemType] = None, player_level: int = 1) -> LootItem:
        """Generate a random item"""
        if item_type is None:
            item_type = LootSystem._random_item_type()
        
        name = LootSystem._generate_item_name(item_type, rarity)
        stats = LootSystem._generate_stats(item_type, rarity, player_level)
        value = LootSystem._calculate_value(item_type, rarity, stats)
        
        item_id = f'item_{random.randint(1000, 9999)}'
        
        item = LootItem(
            id=item_id,
            name=name,
            type=item_type,
            rarity=rarity,
            stats=stats,
            value=value
        )
        
        # Add special effects for consumables
        if item_type in [ItemType.POTION, ItemType.SCROLL]:
            item.effect = LootSystem._generate_effect(item_type, name)
        
        return item
    
    @staticmethod
    def _random_item_type() -> ItemType:
        """Get random item type with weighted probabilities"""
        roll = random.random() * 100
        if roll < 35:
            return ItemType.WEAPON
        elif roll < 70:
            return ItemType.ARMOR
        elif roll < 90:
            return ItemType.POTION
        else:
            return ItemType.SCROLL
    
    @staticmethod
    def _generate_item_name(item_type: ItemType, rarity: ItemRarity) -> str:
        """Generate a name for the item"""
        prefix = random.choice(LootSystem.ITEM_PREFIXES[item_type])
        base_name = random.choice(LootSystem.ITEM_TYPES_NAMES[item_type])
        
        if item_type == ItemType.SCROLL:
            return f'{prefix} {base_name}'
        elif item_type == ItemType.POTION:
            return f'{prefix} {base_name}'
        else:
            return f'{prefix} {base_name}'
    
    @staticmethod
    def _generate_stats(item_type: ItemType, rarity: ItemRarity, player_level: int) -> Dict[str, int]:
        """Generate stats for an item"""
        stats = {}
        multiplier = LootSystem.RARITY_VALUES[rarity]['multiplier']
        
        if item_type == ItemType.WEAPON:
            stats['damage'] = int((10 + player_level * 2) * multiplier)
            if random.random() < 0.5:
                stats['critChance'] = int(5 * multiplier)
        elif item_type == ItemType.ARMOR:
            stats['defense'] = int((8 + player_level * 1.5) * multiplier)
            if random.random() < 0.5:
                stats['health'] = int(20 * multiplier)
        
        return stats
    
    @staticmethod
    def _calculate_value(item_type: ItemType, rarity: ItemRarity, stats: Dict[str, int]) -> int:
        """Calculate the sell value of an item"""
        base_value = LootSystem.RARITY_VALUES[rarity]['sell_value']
        stat_value = sum(stats.values()) * 2
        return base_value + stat_value
    
    @staticmethod
    def _generate_effect(item_type: ItemType, name: str) -> str:
        """Generate effect description for consumables"""
        if item_type == ItemType.POTION:
            if 'Health' in name:
                return 'Restores health over time'
            elif 'Mana' in name:
                return 'Restores mana over time'
            elif 'Strength' in name:
                return 'Temporarily increases strength'
            elif 'Defense' in name:
                return 'Temporarily increases defense'
            else:
                return 'Increases movement speed'
        else:  # SCROLL
            return f'Casts {name.split()[-1]} spell'


class EnemyFactory:
    """Factory for creating enemies"""
    
    ENEMY_TYPES = {
        'zombie': {'health': 50, 'damage': 10, 'experience': 20, 'gold': 5},
        'skeleton': {'health': 40, 'damage': 15, 'experience': 25, 'gold': 8},
        'orc': {'health': 80, 'damage': 20, 'experience': 35, 'gold': 12},
        'demon': {'health': 200, 'damage': 40, 'experience': 100, 'gold': 50}
    }
    
    @staticmethod
    def create_enemy(enemy_type: str, level: int) -> Enemy:
        """Create an enemy of the specified type and level"""
        if enemy_type not in EnemyFactory.ENEMY_TYPES:
            enemy_type = 'zombie'
        
        template = EnemyFactory.ENEMY_TYPES[enemy_type]
        level_multiplier = 1 + (level - 1) * 0.3
        
        health = int(template['health'] * level_multiplier)
        damage = int(template['damage'] * level_multiplier)
        experience = int(template['experience'] * level_multiplier)
        gold = int(template['gold'] * level_multiplier)
        
        # Generate stats based on enemy type and level
        stats = Stats(
            strength=8 + level * 2,
            dexterity=6 + level,
            intelligence=5 + level,
            vitality=10 + level * 2
        )
        
        return Enemy(
            id=f'enemy_{random.randint(1000, 9999)}',
            type=enemy_type,
            level=level,
            health=health,
            max_health=health,
            damage=damage,
            stats=stats,
            experience=experience,
            gold_reward=gold
        )


class GameSimulator:
    """Simulate game scenarios"""
    
    @staticmethod
    def create_player(name: str, level: int = 1) -> Player:
        """Create a player character"""
        base_health = 100
        base_mana = 50
        
        health = base_health + (level - 1) * 20
        mana = base_mana + (level - 1) * 10
        
        stats = Stats(
            strength=10 + (level - 1) * 2,
            dexterity=10 + (level - 1) * 2,
            intelligence=10 + (level - 1) * 2,
            vitality=10 + (level - 1) * 2
        )
        
        return Player(
            id='player_1',
            name=name,
            level=level,
            health=health,
            max_health=health,
            mana=mana,
            max_mana=mana,
            stats=stats,
            gold=100 * level,
            experience=0
        )
    
    @staticmethod
    def simulate_dungeon_run(player_level: int, dungeon_level: int) -> Dict[str, Any]:
        """Simulate a complete dungeon run"""
        player = GameSimulator.create_player("Hero", player_level)
        
        # Generate enemies for the dungeon
        num_enemies = 3 + dungeon_level
        enemies_defeated = []
        loot_collected = []
        
        for i in range(num_enemies):
            # Select enemy type based on dungeon level
            if i == num_enemies - 1 and dungeon_level >= 5:
                enemy_type = 'demon'  # Boss
            else:
                enemy_type = random.choice(['zombie', 'skeleton', 'orc'])
            
            enemy = EnemyFactory.create_enemy(enemy_type, dungeon_level)
            
            # Simulate combat
            combat_result = CombatSystem.simulate_combat(player, enemy)
            
            if not combat_result['victory']:
                # Player died
                return {
                    'success': False,
                    'reason': f'Defeated by {enemy.type}',
                    'enemiesDefeated': len(enemies_defeated),
                    'lootCollected': [item.to_dict() for item in loot_collected],
                    'finalStats': player.to_dict()
                }
            
            # Victory - update player
            player.health = combat_result['finalPlayerHealth']
            player.experience += enemy.experience
            player.gold += enemy.gold_reward
            
            enemies_defeated.append({
                'type': enemy.type,
                'level': enemy.level,
                'combatRounds': combat_result['rounds']
            })
            
            # Generate loot
            if random.random() < 0.6:  # 60% loot drop chance
                rarity_roll = random.random()
                if rarity_roll < 0.5:
                    rarity = ItemRarity.COMMON
                elif rarity_roll < 0.8:
                    rarity = ItemRarity.UNCOMMON
                elif rarity_roll < 0.95:
                    rarity = ItemRarity.RARE
                elif rarity_roll < 0.99:
                    rarity = ItemRarity.EPIC
                else:
                    rarity = ItemRarity.LEGENDARY
                
                loot = LootSystem.generate_item(rarity, player_level=dungeon_level)
                loot_collected.append(loot)
                player.inventory.append(loot)
        
        return {
            'success': True,
            'enemiesDefeated': len(enemies_defeated),
            'enemyDetails': enemies_defeated,
            'lootCollected': [item.to_dict() for item in loot_collected],
            'finalStats': player.to_dict(),
            'totalGold': player.gold,
            'totalExperience': player.experience
        }


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='LooterShooter Game Simulator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Simulate combat between player and enemy:
    python looter_shooter_game.py --simulate-combat --player-level 5 --enemy-level 5
  
  Generate random loot:
    python looter_shooter_game.py --generate-loot --rarity rare --count 5
  
  Simulate a complete dungeon run:
    python looter_shooter_game.py --simulate-dungeon-run --player-level 10 --dungeon-level 5
        """
    )
    
    parser.add_argument(
        '--simulate-combat',
        action='store_true',
        help='Simulate a combat encounter'
    )
    
    parser.add_argument(
        '--simulate-dungeon-run',
        action='store_true',
        help='Simulate a complete dungeon run'
    )
    
    parser.add_argument(
        '--generate-loot',
        action='store_true',
        help='Generate random loot items'
    )
    
    parser.add_argument(
        '--player-level',
        type=int,
        default=1,
        help='Player level (default: 1)'
    )
    
    parser.add_argument(
        '--enemy-level',
        type=int,
        default=1,
        help='Enemy level for combat simulation (default: 1)'
    )
    
    parser.add_argument(
        '--dungeon-level',
        type=int,
        default=1,
        help='Dungeon level for dungeon run simulation (default: 1)'
    )
    
    parser.add_argument(
        '--enemy-type',
        type=str,
        default='zombie',
        choices=['zombie', 'skeleton', 'orc', 'demon'],
        help='Enemy type for combat simulation (default: zombie)'
    )
    
    parser.add_argument(
        '--rarity',
        type=str,
        default='common',
        choices=['common', 'uncommon', 'rare', 'epic', 'legendary'],
        help='Item rarity for loot generation (default: common)'
    )
    
    parser.add_argument(
        '--count',
        type=int,
        default=1,
        help='Number of items to generate (default: 1)'
    )
    
    parser.add_argument(
        '--export',
        type=str,
        help='Export results to JSON file'
    )
    
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducible results'
    )
    
    args = parser.parse_args()
    
    if args.seed is not None:
        random.seed(args.seed)
    
    result = None
    
    if args.simulate_combat:
        print(f"\n{'=' * 60}")
        print("COMBAT SIMULATION")
        print(f"{'=' * 60}\n")
        
        player = GameSimulator.create_player("Hero", args.player_level)
        enemy = EnemyFactory.create_enemy(args.enemy_type, args.enemy_level)
        
        print(f"Player: Level {player.level}, Health: {player.health}, Stats: {player.stats.to_dict()}")
        print(f"Enemy: {enemy.type.capitalize()} (Level {enemy.level}), Health: {enemy.health}, Damage: {enemy.damage}")
        print()
        
        combat_result = CombatSystem.simulate_combat(player, enemy)
        
        print(f"Combat Result: {'VICTORY' if combat_result['victory'] else 'DEFEAT'}")
        print(f"Rounds: {combat_result['rounds']}")
        print(f"Final Player Health: {combat_result['finalPlayerHealth']}/{player.max_health}")
        print(f"Final Enemy Health: {combat_result['finalEnemyHealth']}/{enemy.max_health}")
        
        result = combat_result
    
    elif args.simulate_dungeon_run:
        print(f"\n{'=' * 60}")
        print("DUNGEON RUN SIMULATION")
        print(f"{'=' * 60}\n")
        
        print(f"Player Level: {args.player_level}")
        print(f"Dungeon Level: {args.dungeon_level}")
        print()
        
        dungeon_result = GameSimulator.simulate_dungeon_run(args.player_level, args.dungeon_level)
        
        print(f"Result: {'SUCCESS' if dungeon_result['success'] else 'FAILURE'}")
        if not dungeon_result['success']:
            print(f"Reason: {dungeon_result['reason']}")
        print(f"Enemies Defeated: {dungeon_result['enemiesDefeated']}")
        print(f"Loot Items Collected: {len(dungeon_result['lootCollected'])}")
        
        if dungeon_result['success']:
            print(f"Total Gold: {dungeon_result['totalGold']}")
            print(f"Total Experience: {dungeon_result['totalExperience']}")
            
            print("\nLoot Collected:")
            for item_data in dungeon_result['lootCollected']:
                print(f"  - {item_data['name']} ({item_data['rarity']}) - Value: {item_data['value']} gold")
        
        result = dungeon_result
    
    elif args.generate_loot:
        print(f"\n{'=' * 60}")
        print("LOOT GENERATION")
        print(f"{'=' * 60}\n")
        
        rarity = ItemRarity[args.rarity.upper()]
        items = []
        
        for i in range(args.count):
            item = LootSystem.generate_item(rarity, player_level=args.player_level)
            items.append(item)
            
            print(f"Item {i+1}: {item.name}")
            print(f"  Type: {item.type.value}")
            print(f"  Rarity: {item.rarity.value}")
            print(f"  Stats: {item.stats}")
            print(f"  Value: {item.value} gold")
            if item.effect:
                print(f"  Effect: {item.effect}")
            print()
        
        result = {'items': [item.to_dict() for item in items]}
    
    else:
        parser.print_help()
        return 1
    
    # Export to file if requested
    if args.export and result:
        with open(args.export, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\nResults exported to {args.export}")
    
    print(f"\n{'=' * 60}\n")
    return 0


if __name__ == '__main__':
    exit(main())
