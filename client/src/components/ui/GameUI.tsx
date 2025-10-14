import { useState, useEffect } from "react";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useGame } from "../../lib/stores/useGame";
import { useKeyboardControls } from "@react-three/drei";
import Inventory from "./Inventory";
import SkillTree from "./SkillTree";
import Minimap from "./Minimap";
import SpellBook from "./SpellBook";
import Shop from "./Shop";
import Convert from "./Convert";

export default function GameUI() {
  const [subscribe, getKeys] = useKeyboardControls();
  const [showInventory, setShowInventory] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const { phase } = useGame();
  const { 
    health, 
    maxHealth, 
    mana, 
    maxMana, 
    level, 
    experience, 
    experienceToNext,
    stats,
    gold
  } = usePlayer();

  // Handle UI toggle keys with useEffect to avoid render-time state updates
  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state.inventory,
      (inventoryPressed) => {
        if (inventoryPressed && !showInventory) {
          setShowInventory(true);
        }
      }
    );
    return unsubscribe;
  }, [subscribe, showInventory]);

  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state.skills,
      (skillsPressed) => {
        if (skillsPressed && !showSkills) {
          setShowSkills(true);
        }
      }
    );
    return unsubscribe;
  }, [subscribe, showSkills]);

  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      pointerEvents: 'none',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Health and Mana bars */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto'
      }}>
        {/* Health Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: '#ff0000', fontWeight: 'bold', minWidth: '40px' }}>HP:</span>
          <div style={{
            width: '200px',
            height: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid #333',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(health / maxHealth) * 100}%`,
              height: '100%',
              backgroundColor: '#ff0000',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ color: '#fff', fontSize: '14px' }}>
            {health}/{maxHealth}
          </span>
        </div>

        {/* Mana Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: '#0066ff', fontWeight: 'bold', minWidth: '40px' }}>MP:</span>
          <div style={{
            width: '200px',
            height: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid #333',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(mana / maxMana) * 100}%`,
              height: '100%',
              backgroundColor: '#0066ff',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ color: '#fff', fontSize: '14px' }}>
            {mana}/{maxMana}
          </span>
        </div>

        {/* Experience Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ color: '#ffaa00', fontWeight: 'bold', minWidth: '40px' }}>XP:</span>
          <div style={{
            width: '200px',
            height: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid #333',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(experience / experienceToNext) * 100}%`,
              height: '100%',
              backgroundColor: '#ffaa00',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ color: '#fff', fontSize: '12px' }}>
            Lv.{level}
          </span>
        </div>
      </div>

      {/* Player Stats */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        border: '2px solid #444',
        color: '#fff',
        fontSize: '14px',
        minWidth: '180px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffaa00' }}>Stats</h3>
        <div>Strength: {stats.strength}</div>
        <div>Dexterity: {stats.dexterity}</div>
        <div>Intelligence: {stats.intelligence}</div>
        <div>Vitality: {stats.vitality}</div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
          Damage: {stats.strength * 2 + 10}
        </div>
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '10px', 
          borderTop: '1px solid #444',
          fontSize: '16px',
          color: '#ffcc00',
          fontWeight: 'bold'
        }}>
          💰 {gold} Gold
        </div>
      </div>

      {/* Quick Access Menu */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={() => setShowSpells(true)}
          style={{
            backgroundColor: '#6c63ff',
            border: '2px solid #8883ff',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#8883ff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c63ff'}
        >
          ✨ Spells
        </button>
        
        <button
          onClick={() => setShowShop(true)}
          style={{
            backgroundColor: '#8b7355',
            border: '2px solid #a08060',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a08060'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b7355'}
        >
          🏪 Shop
        </button>
        
        <button
          onClick={() => setShowConvert(true)}
          style={{
            backgroundColor: '#6c63ff',
            border: '2px solid #8883ff',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#8883ff'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c63ff'}
        >
          ⚗️ Convert
        </button>
      </div>

      {/* Controls help */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '8px',
        border: '2px solid #444',
        color: '#fff',
        fontSize: '12px'
      }}>
        <div><strong>WASD:</strong> Move</div>
        <div><strong>SPACE:</strong> Attack</div>
        <div><strong>Q/E/R:</strong> Abilities</div>
        <div><strong>I:</strong> Inventory</div>
        <div><strong>T:</strong> Skills</div>
      </div>

      {/* Minimap */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px'
      }}>
        <Minimap />
      </div>

      {/* Modals */}
      {showInventory && (
        <Inventory onClose={() => setShowInventory(false)} />
      )}
      
      {showSkills && (
        <SkillTree onClose={() => setShowSkills(false)} />
      )}
      
      {showSpells && (
        <SpellBook onClose={() => setShowSpells(false)} />
      )}
      
      {showShop && (
        <Shop onClose={() => setShowShop(false)} />
      )}
      
      {showConvert && (
        <Convert onClose={() => setShowConvert(false)} />
      )}

      {/* Game phase indicator */}
      {phase !== 'playing' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '20px',
          borderRadius: '10px',
          fontSize: '24px',
          textAlign: 'center'
        }}>
          {phase === 'ready' ? 'Click to Start Adventure!' : 'Game Over'}
        </div>
      )}
    </div>
  );
}
