import { useState } from "react";
import { Spell } from "../../lib/gameTypes";

interface SpellBookProps {
  onClose: () => void;
}

interface SpellData extends Spell {
  description: string;
  upgradeCost: number;
  maxLevel: number;
}

export default function SpellBook({ onClose }: SpellBookProps) {
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [playerMana] = useState(100); // This should come from player store
  
  const spells: SpellData[] = [
    {
      id: 'fireball',
      name: 'Fireball',
      level: 1,
      maxLevel: 5,
      manaCost: 20,
      cooldown: 3000,
      damage: 30,
      element: 'fire',
      description: 'Launch a blazing fireball that deals fire damage and may burn enemies',
      upgradeCost: 100
    },
    {
      id: 'heal',
      name: 'Healing Light',
      level: 1,
      maxLevel: 5,
      manaCost: 25,
      cooldown: 5000,
      effect: 'heal',
      element: 'holy',
      description: 'Restore health over time with holy magic',
      upgradeCost: 150
    },
    {
      id: 'teleport',
      name: 'Blink',
      level: 1,
      maxLevel: 3,
      manaCost: 30,
      cooldown: 8000,
      effect: 'teleport',
      element: 'arcane',
      description: 'Instantly teleport a short distance in the direction you are facing',
      upgradeCost: 200
    },
    {
      id: 'summon',
      name: 'Summon Familiar',
      level: 1,
      maxLevel: 5,
      manaCost: 50,
      cooldown: 30000,
      effect: 'summon',
      element: 'arcane',
      description: 'Summon a magical familiar to fight alongside you',
      upgradeCost: 250
    },
    {
      id: 'ice_shard',
      name: 'Ice Shard',
      level: 1,
      maxLevel: 5,
      manaCost: 15,
      cooldown: 2000,
      damage: 20,
      element: 'ice',
      description: 'Fire shards of ice that deal cold damage and slow enemies',
      upgradeCost: 100
    },
    {
      id: 'lightning',
      name: 'Chain Lightning',
      level: 1,
      maxLevel: 5,
      manaCost: 35,
      cooldown: 6000,
      damage: 40,
      element: 'lightning',
      description: 'Release lightning that chains between enemies',
      upgradeCost: 180
    }
  ];
  
  const getElementColor = (element?: Spell['element']) => {
    switch (element) {
      case 'fire': return '#ff4400';
      case 'ice': return '#00aaff';
      case 'lightning': return '#ffff00';
      case 'arcane': return '#aa00ff';
      case 'holy': return '#ffdd00';
      default: return '#ffffff';
    }
  };
  
  const handleUpgrade = (spellId: string) => {
    // TODO: Implement upgrade logic with player store
    console.log(`Upgrading spell: ${spellId}`);
  };
  
  const handleEquip = (spellId: string) => {
    // TODO: Implement equip logic
    console.log(`Equipping spell: ${spellId}`);
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      pointerEvents: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        border: '3px solid #6c63ff',
        borderRadius: '15px',
        padding: '30px',
        width: '900px',
        maxHeight: '85%',
        overflow: 'auto',
        color: '#fff',
        boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '2px solid #6c63ff',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#6c63ff', fontSize: '28px' }}>✨ Spell Book</h2>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#ff4444',
              border: 'none',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff6666'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff4444'}
          >
            Close
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '20px'
        }}>
          {spells.map((spell) => (
            <div
              key={spell.id}
              onClick={() => setSelectedSpell(spell.id)}
              style={{
                border: `3px solid ${getElementColor(spell.element)}`,
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: selectedSpell === spell.id ? 'rgba(108, 99, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 20px ${getElementColor(spell.element)}50`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Element icon */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: getElementColor(spell.element),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                opacity: 0.8
              }}>
                {spell.element === 'fire' && '🔥'}
                {spell.element === 'ice' && '❄️'}
                {spell.element === 'lightning' && '⚡'}
                {spell.element === 'arcane' && '🔮'}
                {spell.element === 'holy' && '✨'}
              </div>
              
              <div style={{
                color: getElementColor(spell.element),
                fontWeight: 'bold',
                fontSize: '20px',
                marginBottom: '10px'
              }}>
                {spell.name}
              </div>
              
              <div style={{
                fontSize: '13px',
                color: '#aaa',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                {spell.description}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '12px',
                fontSize: '12px'
              }}>
                <div style={{ color: '#0066ff' }}>
                  <strong>Mana:</strong> {spell.manaCost}
                </div>
                <div style={{ color: '#888' }}>
                  <strong>Cooldown:</strong> {spell.cooldown / 1000}s
                </div>
                {spell.damage && (
                  <div style={{ color: '#ff4444' }}>
                    <strong>Damage:</strong> {spell.damage}
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <div style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '5px',
                  padding: '5px',
                  fontSize: '12px'
                }}>
                  <div style={{ color: '#ffaa00', marginBottom: '3px' }}>
                    Level {spell.level}/{spell.maxLevel}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(spell.level / spell.maxLevel) * 100}%`,
                      height: '100%',
                      backgroundColor: '#ffaa00',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(spell.id);
                  }}
                  disabled={spell.level >= spell.maxLevel}
                  style={{
                    flex: 1,
                    backgroundColor: spell.level >= spell.maxLevel ? '#444' : '#6c63ff',
                    border: 'none',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: spell.level >= spell.maxLevel ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (spell.level < spell.maxLevel) {
                      e.currentTarget.style.backgroundColor = '#8883ff';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (spell.level < spell.maxLevel) {
                      e.currentTarget.style.backgroundColor = '#6c63ff';
                    }
                  }}
                >
                  Upgrade ({spell.upgradeCost} 💰)
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEquip(spell.id);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#44ff44',
                    border: 'none',
                    color: '#000',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#66ff66'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#44ff44'}
                >
                  Equip
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '25px',
          padding: '15px',
          backgroundColor: 'rgba(108, 99, 255, 0.1)',
          borderRadius: '10px',
          border: '2px solid #6c63ff',
          fontSize: '13px'
        }}>
          <div style={{ color: '#6c63ff', fontWeight: 'bold', marginBottom: '8px' }}>
            💡 Spell Tips
          </div>
          <div style={{ color: '#aaa', lineHeight: '1.6' }}>
            • Upgrade spells to increase their power and reduce mana cost<br />
            • Each element has unique effects: Fire burns, Ice slows, Lightning stuns<br />
            • Combine different spells for devastating combos<br />
            • Equip up to 4 spells in your quick slots (Q, E, R, F)
          </div>
        </div>
      </div>
    </div>
  );
}
