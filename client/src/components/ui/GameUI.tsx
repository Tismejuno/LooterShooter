import { useState, useEffect, useRef } from "react";
import { usePlayer } from "../../lib/stores/usePlayer";
import { useGame } from "../../lib/stores/useGame";
import { useKeyboardControls } from "@react-three/drei";
import { useDailyLogin } from "../../lib/stores/useDailyLogin";
import { useStory } from "../../lib/stores/useStory";
import Inventory from "./Inventory";
import SkillTree from "./SkillTree";
import Minimap from "./Minimap";
import SpellBook from "./SpellBook";
import Shop from "./Shop";
import Convert from "./Convert";
import DailyLogin from "./DailyLogin";
import StoryPanel from "./StoryPanel";

// Animated bar component
function StatBar({
  value,
  max,
  color,
  bgColor,
  label,
  icon,
}: {
  value: number;
  max: number;
  color: string;
  bgColor: string;
  label: string;
  icon: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const lowPct = pct < 25;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '16px', minWidth: '20px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ color: color, fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{label}</span>
          <span style={{ color: '#ccc', fontSize: '10px' }}>{Math.round(value)}/{max}</span>
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: bgColor,
          borderRadius: '5px',
          overflow: 'hidden',
          border: `1px solid ${color}44`,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: lowPct
              ? `linear-gradient(90deg, ${color}88, #ff2200)`
              : `linear-gradient(90deg, ${color}bb, ${color})`,
            borderRadius: '5px',
            transition: 'width 0.3s ease',
            boxShadow: `0 0 6px ${color}66`,
            position: 'relative',
          }}>
            {/* Shine overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              borderRadius: '5px 5px 0 0',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// XP bar component
function XpBar({ experience, experienceToNext, level }: { experience: number; experienceToNext: number; level: number }) {
  const pct = Math.max(0, Math.min(100, (experience / experienceToNext) * 100));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ffaa00, #ff6600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 0 8px rgba(255,160,0,0.6)',
        border: '2px solid #ffcc0066',
      }}>
        {level}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ color: '#ffaa00', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>EXPERIENCE</span>
          <span style={{ color: '#888', fontSize: '9px' }}>{experience}/{experienceToNext}</span>
        </div>
        <div style={{
          width: '100%',
          height: '7px',
          backgroundColor: 'rgba(255,170,0,0.15)',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid rgba(255,170,0,0.3)',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #cc7700, #ffaa00, #ffdd66)',
            borderRadius: '4px',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 5px rgba(255,170,0,0.5)',
          }} />
        </div>
      </div>
    </div>
  );
}

// Quick action button
function QuickButton({
  onClick,
  emoji,
  label,
  color,
  borderColor,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
  color: string;
  borderColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? color : `${color}88`,
        border: `1px solid ${borderColor}`,
        color: '#fff',
        padding: '7px 13px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
        transition: 'all 0.18s',
        boxShadow: hovered ? `0 0 12px ${color}88` : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        letterSpacing: '0.3px',
      }}
    >
      <span style={{ fontSize: '14px' }}>{emoji}</span>
      {label}
    </button>
  );
}

// Level up flash overlay
function LevelUpFlash({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.25) 0%, transparent 70%)',
      pointerEvents: 'none',
      animation: 'levelUpFlash 1s ease-out',
    }} />
  );
}

export default function GameUI() {
  const [subscribe, getKeys] = useKeyboardControls();
  const [showInventory, setShowInventory] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const prevLevel = useRef(1);

  const { phase, runStage, worldTier, challengeModifiers } = useGame();
  const {
    health,
    maxHealth,
    mana,
    maxMana,
    level,
    experience,
    experienceToNext,
    stats,
    gold,
    statusEffects,
  } = usePlayer();

  const { showLoginModal } = useDailyLogin();
  const { currentZone } = useStory();
  const zone = currentZone();

  // Detect level-up
  useEffect(() => {
    if (level > prevLevel.current) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
      prevLevel.current = level;
    }
  }, [level]);

  // Handle UI toggle keys
  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state.inventory,
      (pressed) => { if (pressed && !showInventory) setShowInventory(true); }
    );
    return unsubscribe;
  }, [subscribe, showInventory]);

  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state.skills,
      (pressed) => { if (pressed && !showSkills) setShowSkills(true); }
    );
    return unsubscribe;
  }, [subscribe, showSkills]);

  const healthPct = health / maxHealth;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    }}>
      {/* Level-up flash */}
      <LevelUpFlash show={showLevelUp} />

      {/* === TOP LEFT: Player Stats HUD === */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        pointerEvents: 'auto',
        background: 'linear-gradient(135deg, rgba(10,12,22,0.95) 0%, rgba(18,14,30,0.9) 100%)',
        border: '1px solid rgba(100,80,200,0.35)',
        borderRadius: '12px',
        padding: '14px 16px',
        width: '220px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Player title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(100,80,200,0.2)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4a90e2, #7b5ea7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            border: '2px solid rgba(100,120,255,0.4)',
            boxShadow: '0 0 8px rgba(100,120,255,0.3)',
          }}>⚔️</div>
          <div>
            <div style={{ color: '#e8d8ff', fontWeight: 'bold', fontSize: '13px' }}>Hero</div>
            <div style={{ color: '#888', fontSize: '10px' }}>Dungeon Slayer</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <StatBar value={health} max={maxHealth} color="#ff4444" bgColor="rgba(255,0,0,0.12)" label="HEALTH" icon="❤️" />
          <StatBar value={mana} max={maxMana} color="#4488ff" bgColor="rgba(0,80,255,0.12)" label="MANA" icon="💧" />
          <XpBar experience={experience} experienceToNext={experienceToNext} level={level} />
        </div>

        {/* Gold display */}
        <div style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255,200,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '16px' }}>💰</span>
          <span style={{ color: '#ffcc44', fontWeight: 'bold', fontSize: '15px' }}>{gold.toLocaleString()}</span>
          <span style={{ color: '#888', fontSize: '11px' }}>gold</span>
        </div>

        {/* Current zone indicator */}
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: `1px solid ${zone.accentColor}30`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }} onClick={() => setShowStory(true)}>
          <span style={{ fontSize: '14px' }}>{zone.icon}</span>
          <div>
            <div style={{ color: zone.accentColor, fontSize: '10px', fontWeight: 'bold' }}>
              {zone.subtitle.split('—')[0].trim()}
            </div>
            <div style={{ color: '#aaa', fontSize: '9px' }}>{zone.name}</div>
          </div>
        </div>

        <div style={{
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          fontSize: "10px",
          color: "#9bb0ff",
          lineHeight: 1.5,
        }}>
          <div>Run Stage: {runStage.toUpperCase()}</div>
          <div>World Tier: {worldTier}</div>
          <div>Challenges: {challengeModifiers.length}</div>
        </div>
      </div>

      {/* === TOP RIGHT: Stats Panel === */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'linear-gradient(135deg, rgba(10,12,22,0.95) 0%, rgba(18,14,30,0.9) 100%)',
        border: '1px solid rgba(100,80,200,0.35)',
        borderRadius: '12px',
        padding: '14px 16px',
        color: '#fff',
        fontSize: '12px',
        minWidth: '160px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ color: '#aa88ff', fontWeight: 'bold', fontSize: '11px', letterSpacing: '2px', marginBottom: '10px' }}>
          ATTRIBUTES
        </div>
        {[
          { label: 'Strength', value: stats.strength, icon: '💪', color: '#ff6644' },
          { label: 'Dexterity', value: stats.dexterity, icon: '⚡', color: '#44ddff' },
          { label: 'Intelligence', value: stats.intelligence, icon: '🔮', color: '#aa66ff' },
          { label: 'Vitality', value: stats.vitality, icon: '❤️', color: '#ff4444' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '3px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ color: '#aaa', fontSize: '11px' }}>
              <span style={{ marginRight: '5px' }}>{icon}</span>{label}
            </span>
            <span style={{ color, fontWeight: 'bold', fontSize: '13px' }}>{value}</span>
          </div>
        ))}
        <div style={{
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#ffcc66',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>⚔️ Damage</span>
          <span style={{ fontWeight: 'bold' }}>{stats.strength * 2 + 10}</span>
        </div>
      </div>

      {/* === TOP CENTER: Quick Action Bar === */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'auto',
      }}>
        <QuickButton onClick={() => setShowInventory(true)} emoji="🎒" label="Inventory" color="#4455aa" borderColor="#6677cc" />
        <QuickButton onClick={() => setShowSpells(true)} emoji="✨" label="Spells" color="#6644aa" borderColor="#9966dd" />
        <QuickButton onClick={() => setShowSkills(true)} emoji="📊" label="Skills" color="#336644" borderColor="#559966" />
        <QuickButton onClick={() => setShowShop(true)} emoji="🏪" label="Shop" color="#775533" borderColor="#aa7755" />
        <QuickButton onClick={() => setShowConvert(true)} emoji="⚗️" label="Convert" color="#556644" borderColor="#778866" />
        <QuickButton onClick={() => setShowStory(true)} emoji="📖" label="Story" color="#553366" borderColor="#886699" />
      </div>

      {/* === Status Effects Display === */}
      {statusEffects.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100px',
          left: '16px',
          display: 'flex',
          gap: '5px',
        }}>
          {statusEffects.map(effect => {
            const icons: Record<string, string> = {
              burn: '🔥', freeze: '❄️', poison: '☠️', stun: '⚡', slow: '🌀', heal: '💚', shield: '🛡️'
            };
            return (
              <div key={effect.id} title={effect.type} style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}>
                {icons[effect.type] || '✦'}
              </div>
            );
          })}
        </div>
      )}

      {/* === Level Up Banner === */}
      {showLevelUp && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(30,20,5,0.98), rgba(50,30,0,0.95))',
          border: '2px solid #ffaa00',
          borderRadius: '16px',
          padding: '20px 40px',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(255,170,0,0.5)',
          animation: 'levelUpSlide 0.4s ease-out',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>⬆️</div>
          <div style={{ color: '#ffdd44', fontWeight: 'bold', fontSize: '22px', letterSpacing: '3px' }}>LEVEL UP!</div>
          <div style={{ color: '#ffaa00', fontSize: '16px', marginTop: '4px' }}>Level {level}</div>
          <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Stats increased • +2 Skill Points</div>
        </div>
      )}

      {/* === Bottom Left: Controls help === */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(8,10,18,0.88)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '10px 14px',
        color: '#fff',
        fontSize: '11px',
        backdropFilter: 'blur(4px)',
        lineHeight: '1.8',
      }}>
        {[
          ['WASD', 'Move'],
          ['SPACE', 'Attack'],
          ['Q/E/R', 'Abilities'],
          ['I', 'Inventory'],
          ['T', 'Skills'],
        ].map(([key, action]) => (
          <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              padding: '1px 5px',
              fontWeight: 'bold',
              fontSize: '10px',
              color: '#ccbbff',
              minWidth: '40px',
              textAlign: 'center',
            }}>{key}</span>
            <span style={{ color: '#888' }}>{action}</span>
          </div>
        ))}
      </div>

      {/* === Bottom Right: Minimap === */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
        <Minimap />
      </div>

      {/* === Modals === */}
      {showInventory && <Inventory onClose={() => setShowInventory(false)} />}
      {showSkills && <SkillTree onClose={() => setShowSkills(false)} />}
      {showSpells && <SpellBook onClose={() => setShowSpells(false)} />}
      {showShop && <Shop onClose={() => setShowShop(false)} />}
      {showConvert && <Convert onClose={() => setShowConvert(false)} />}
      {showStory && <StoryPanel onClose={() => setShowStory(false)} />}
      {showLoginModal && <DailyLogin />}

      {/* === Game Phase Overlay === */}
      {phase !== 'playing' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at center, rgba(20,10,40,0.97) 0%, rgba(0,0,0,0.98) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}>
          {phase === 'ready' ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚔️</div>
              <h1 style={{
                color: '#ffaa00',
                fontSize: '42px',
                fontWeight: 'bold',
                letterSpacing: '6px',
                textShadow: '0 0 30px rgba(255,170,0,0.6)',
                margin: '0 0 10px',
              }}>DUNGEON SLAYER</h1>
              <p style={{ color: '#aa88dd', fontSize: '16px', marginBottom: '30px', letterSpacing: '2px' }}>
                Diablo × Borderlands
              </p>
              <button
                onClick={() => {}}
                style={{
                  background: 'linear-gradient(135deg, #6644aa, #4422aa)',
                  border: '2px solid #aa88ff',
                  color: '#fff',
                  padding: '14px 36px',
                  borderRadius: '10px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  letterSpacing: '2px',
                  boxShadow: '0 0 30px rgba(100,80,200,0.5)',
                }}
              >
                CLICK TO ENTER DUNGEON
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💀</div>
              <h1 style={{ color: '#ff4444', fontSize: '42px', fontWeight: 'bold', letterSpacing: '6px', textShadow: '0 0 30px rgba(255,0,0,0.6)', margin: '0 0 20px' }}>
                GAME OVER
              </h1>
              <p style={{ color: '#888', fontSize: '14px' }}>You have been defeated...</p>
            </>
          )}
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes levelUpFlash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes levelUpSlide {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
