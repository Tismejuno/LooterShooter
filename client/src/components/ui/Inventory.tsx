import { usePlayer } from "../../lib/stores/usePlayer";
import { LootItem } from "../../lib/gameTypes";
import { useState } from "react";

interface InventoryProps {
  onClose: () => void;
}

const RARITY_COLORS = {
  common: '#c0c0c0',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
};

const RARITY_BG = {
  common: 'rgba(192,192,192,0.08)',
  uncommon: 'rgba(30,255,0,0.08)',
  rare: 'rgba(0,112,221,0.12)',
  epic: 'rgba(163,53,238,0.12)',
  legendary: 'rgba(255,128,0,0.15)',
};

const RARITY_GLOW = {
  common: 'none',
  uncommon: '0 0 8px rgba(30,255,0,0.35)',
  rare: '0 0 10px rgba(0,112,221,0.5)',
  epic: '0 0 14px rgba(163,53,238,0.6)',
  legendary: '0 0 20px rgba(255,128,0,0.8)',
};

function getRarityColor(rarity: string) {
  return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#c0c0c0';
}

// SVG-based item icons for different types
function ItemIcon({ type, rarity }: { type: string; rarity: string }) {
  const color = getRarityColor(rarity);
  const size = 48;

  const iconStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 6px auto',
    filter: rarity !== 'common' ? `drop-shadow(0 0 4px ${color})` : 'none',
  };

  switch (type) {
    case 'weapon':
      return (
        <div style={iconStyle}>
          <svg width={size} height={size} viewBox="0 0 48 48">
            {/* Sword icon */}
            <line x1="8" y1="40" x2="36" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="36" y1="12" x2="38" y2="10" stroke={color} strokeWidth="2" />
            {/* Crossguard */}
            <line x1="28" y1="20" x2="40" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            {/* Pommel */}
            <circle cx="9" cy="39" r="3" fill={color} />
            {/* Blade shine */}
            <line x1="14" y1="34" x2="30" y2="18" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
          </svg>
        </div>
      );
    case 'armor':
      return (
        <div style={iconStyle}>
          <svg width={size} height={size} viewBox="0 0 48 48">
            {/* Shield / Armor shape */}
            <path d="M24,6 L40,14 L40,26 Q40,38 24,44 Q8,38 8,26 L8,14 Z"
              fill={RARITY_BG[rarity as keyof typeof RARITY_BG] || 'rgba(192,192,192,0.1)'}
              stroke={color} strokeWidth="2.5" />
            {/* Chest plate lines */}
            <line x1="24" y1="12" x2="24" y2="36" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="14" y1="20" x2="34" y2="20" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Center gem */}
            <polygon points="24,17 27,22 24,27 21,22" fill={color} opacity="0.9" />
          </svg>
        </div>
      );
    case 'potion':
      return (
        <div style={iconStyle}>
          <svg width={size} height={size} viewBox="0 0 48 48">
            {/* Potion bottle */}
            <ellipse cx="24" cy="32" rx="12" ry="12" fill={color} opacity="0.7" />
            <rect x="20" y="16" width="8" height="14" fill={color} opacity="0.6" />
            {/* Neck */}
            <rect x="19" y="14" width="10" height="4" fill="#6a4a20" rx="1" />
            {/* Cork */}
            <rect x="20" y="10" width="8" height="5" fill="#8a6030" rx="1" />
            {/* Shine */}
            <ellipse cx="19" cy="28" rx="3" ry="4" fill="white" opacity="0.25" />
          </svg>
        </div>
      );
    case 'scroll':
      return (
        <div style={iconStyle}>
          <svg width={size} height={size} viewBox="0 0 48 48">
            {/* Scroll body */}
            <rect x="10" y="12" width="28" height="26" rx="4" fill="#f0e0a0" opacity="0.9" />
            {/* End caps */}
            <ellipse cx="10" cy="25" rx="5" ry="13" fill="#8a6040" />
            <ellipse cx="38" cy="25" rx="5" ry="13" fill="#8a6040" />
            {/* Magic runes */}
            <text x="24" y="22" textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">✦</text>
            <text x="24" y="32" textAnchor="middle" fontSize="6" fill={color} opacity="0.8">✦ ✦</text>
          </svg>
        </div>
      );
    default:
      return (
        <div style={iconStyle}>
          <svg width={size} height={size} viewBox="0 0 48 48">
            {/* Gem / Crystal */}
            <polygon points="24,6 36,18 36,30 24,42 12,30 12,18" fill={color} opacity="0.7" stroke={color} strokeWidth="2" />
            <polygon points="24,12 30,20 30,28 24,36 18,28 18,20" fill="white" opacity="0.2" />
            <line x1="24" y1="6" x2="24" y2="42" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
          </svg>
        </div>
      );
  }
}

function ItemCard({
  item,
  isEquipped,
  onClick,
  onUse,
  showUse
}: {
  item: LootItem;
  isEquipped: boolean;
  onClick: () => void;
  onUse?: () => void;
  showUse?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const color = getRarityColor(item.rarity);
  const rarityBg = RARITY_BG[item.rarity as keyof typeof RARITY_BG] || 'rgba(192,192,192,0.08)';
  const glow = RARITY_GLOW[item.rarity as keyof typeof RARITY_GLOW] || 'none';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${color}`,
        borderRadius: '10px',
        padding: '10px 8px',
        backgroundColor: isEquipped ? `rgba(0,255,100,0.12)` : rarityBg,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'scale(1.04) translateY(-2px)' : 'scale(1)',
        boxShadow: hovered ? glow : isEquipped ? `0 0 8px rgba(0,255,100,0.4)` : 'none',
        position: 'relative',
        textAlign: 'center' as const,
      }}
    >
      {/* Equipped badge */}
      {isEquipped && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#00cc66',
          color: '#fff',
          fontSize: '9px',
          fontWeight: 'bold',
          padding: '2px 5px',
          borderRadius: '6px',
          letterSpacing: '0.5px',
        }}>
          EQUIPPED
        </div>
      )}

      {/* Item rarity badge */}
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        backgroundColor: color,
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        boxShadow: `0 0 4px ${color}`,
      }} />

      <ItemIcon type={item.type} rarity={item.rarity} />

      <div style={{
        color,
        fontWeight: 'bold',
        fontSize: '12px',
        marginBottom: '3px',
        lineHeight: '1.2',
        textShadow: item.rarity === 'legendary' ? `0 0 8px ${color}` : 'none',
      }}>
        {item.name}
      </div>
      <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
        {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} •{' '}
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </div>
      {item.stats && (
        <div style={{ fontSize: '10px', color: '#88ccaa', marginTop: '4px' }}>
          {Object.entries(item.stats).slice(0, 3).map(([stat, value]) => (
            <div key={stat} style={{ lineHeight: '1.4' }}>+{value} {stat}</div>
          ))}
        </div>
      )}
      {item.value && (
        <div style={{ fontSize: '10px', color: '#ffcc44', marginTop: '3px' }}>
          💰 {item.value}g
        </div>
      )}
      {showUse && onUse && (item.type === 'potion' || item.type === 'scroll' || item.type === 'consumable') && (
        <button
          onClick={(e) => { e.stopPropagation(); onUse(); }}
          style={{
            marginTop: '6px',
            width: '100%',
            backgroundColor: '#2a6a44',
            border: `1px solid #44aa66`,
            color: '#88ffaa',
            padding: '3px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        >
          USE
        </button>
      )}
    </div>
  );
}

export default function Inventory({ onClose }: InventoryProps) {
  const { inventory, equipped, equipItem, unequipItem, useConsumable } = usePlayer();
  const [activeTab, setActiveTab] = useState<'all' | 'weapons' | 'armor' | 'consumables'>('all');

  const handleItemClick = (item: LootItem) => {
    if (item.type === 'weapon' || item.type === 'armor') {
      const isEquipped = equipped.some(eq => eq.id === item.id);
      if (isEquipped) {
        unequipItem(item.id);
      } else {
        equipItem(item);
      }
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'weapons') return item.type === 'weapon';
    if (activeTab === 'armor') return item.type === 'armor';
    if (activeTab === 'consumables') return item.type === 'potion' || item.type === 'scroll' || item.type === 'consumable';
    return true;
  });

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    border: 'none',
    borderBottom: active ? '2px solid #ffaa00' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: active ? '#ffaa00' : '#888',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.2s',
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      pointerEvents: 'auto',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: '#131820',
        border: '2px solid #3a3050',
        borderRadius: '14px',
        padding: '0',
        width: '680px',
        maxHeight: '82vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        boxShadow: '0 0 60px rgba(100,60,200,0.25), 0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1a1030 0%, #0d0820 100%)',
          borderBottom: '1px solid #2a2040',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>⚔️</span>
            <h2 style={{ margin: 0, color: '#ffaa00', fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>
              INVENTORY
            </h2>
            <span style={{ color: '#666', fontSize: '13px' }}>({inventory.length}/30)</span>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #554',
              color: '#aaa',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#442222';
              e.currentTarget.style.color = '#ff6666';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Equipped section */}
        {equipped.length > 0 && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a2040', backgroundColor: '#0d1018' }}>
            <div style={{ fontSize: '11px', color: '#44cc88', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '10px' }}>
              EQUIPPED ITEMS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
            }}>
              {equipped.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isEquipped={true}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #2a2040',
          backgroundColor: '#0a0c14',
          padding: '0 16px',
        }}>
          {(['all', 'weapons', 'armor', 'consumables'] as const).map(tab => (
            <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab === 'all' ? '📦 All' :
               tab === 'weapons' ? '⚔️ Weapons' :
               tab === 'armor' ? '🛡️ Armor' : '🧪 Consumables'}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div style={{
          overflowY: 'auto',
          padding: '16px 20px',
          flex: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: '#3a3050 #131820',
        }}>
          {filteredInventory.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#555', padding: '40px 0', fontSize: '14px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
              No items in this category
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
            }}>
              {filteredInventory.map((item) => {
                const isEquipped = equipped.some(eq => eq.id === item.id);
                return (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isEquipped={isEquipped}
                    onClick={() => handleItemClick(item)}
                    onUse={() => useConsumable(item)}
                    showUse={true}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
