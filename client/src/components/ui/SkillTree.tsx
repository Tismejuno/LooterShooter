import { useState } from "react";
import { usePlayer } from "../../lib/stores/usePlayer";

interface SkillTreeProps {
  onClose: () => void;
}

export default function SkillTree({ onClose }: SkillTreeProps) {
  const { level, skillPoints, skills, allocateSkillPoint } = usePlayer();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const skillCategories = {
    combat: {
      name: "Combat",
      color: "#ff4444",
      skills: [
        { id: "power_attack", name: "Power Attack", maxLevel: 5, description: "Increases attack damage" },
        { id: "critical_strike", name: "Critical Strike", maxLevel: 5, description: "Increases critical hit chance" },
        { id: "weapon_mastery", name: "Weapon Mastery", maxLevel: 3, description: "Increases weapon effectiveness" }
      ]
    },
    magic: {
      name: "Magic",
      color: "#4444ff",
      skills: [
        { id: "fireball", name: "Fireball", maxLevel: 5, description: "Launches a fireball projectile" },
        { id: "ice_shard", name: "Ice Shard", maxLevel: 5, description: "Slows enemies with ice damage" },
        { id: "mana_efficiency", name: "Mana Efficiency", maxLevel: 3, description: "Reduces mana costs" }
      ]
    },
    defense: {
      name: "Defense",
      color: "#44ff44",
      skills: [
        { id: "armor_mastery", name: "Armor Mastery", maxLevel: 5, description: "Increases armor effectiveness" },
        { id: "health_boost", name: "Health Boost", maxLevel: 5, description: "Increases maximum health" },
        { id: "regeneration", name: "Regeneration", maxLevel: 3, description: "Slowly regenerates health" }
      ]
    }
  };

  const canAllocateSkill = (skillId: string, maxLevel: number) => {
    const currentLevel = skills[skillId] || 0;
    return skillPoints > 0 && currentLevel < maxLevel;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      pointerEvents: 'auto'
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '3px solid #666',
        borderRadius: '10px',
        padding: '20px',
        width: '800px',
        maxHeight: '80%',
        overflow: 'auto',
        color: '#fff'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#ffaa00' }}>Skill Tree</h2>
            <div style={{ fontSize: '14px', color: '#aaa' }}>
              Level: {level} | Skill Points: {skillPoints}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#ff4444',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {Object.entries(skillCategories).map(([categoryKey, category]) => (
            <div 
              key={categoryKey}
              style={{
                border: `2px solid ${category.color}`,
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
              }}
            >
              <h3 style={{ 
                color: category.color, 
                margin: '0 0 15px 0',
                textAlign: 'center'
              }}>
                {category.name}
              </h3>
              
              {category.skills.map((skill) => {
                const currentLevel = skills[skill.id] || 0;
                const canAllocate = canAllocateSkill(skill.id, skill.maxLevel);
                
                return (
                  <div 
                    key={skill.id}
                    style={{
                      marginBottom: '10px',
                      padding: '10px',
                      border: selectedSkill === skill.id ? '2px solid #ffaa00' : '1px solid #555',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedSkill(skill.id)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>{skill.name}</span>
                      <span style={{ 
                        color: currentLevel === skill.maxLevel ? '#44ff44' : '#aaa' 
                      }}>
                        {currentLevel}/{skill.maxLevel}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '10px' }}>
                      {skill.description}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[...Array(skill.maxLevel)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: '1px solid #666',
                            backgroundColor: i < currentLevel ? category.color : 'transparent',
                            borderRadius: '3px'
                          }}
                        />
                      ))}
                      
                      {canAllocate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            allocateSkillPoint(skill.id);
                          }}
                          style={{
                            marginLeft: '10px',
                            padding: '2px 8px',
                            backgroundColor: '#44ff44',
                            border: 'none',
                            borderRadius: '3px',
                            color: '#000',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
