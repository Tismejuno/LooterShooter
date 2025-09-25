import { usePlayer } from "../../lib/stores/usePlayer";
import { LootItem } from "../../lib/gameTypes";

interface InventoryProps {
  onClose: () => void;
}

export default function Inventory({ onClose }: InventoryProps) {
  const { inventory, equipped, equipItem, unequipItem } = usePlayer();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#ffffff';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      default: return '#ffffff';
    }
  };

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
        width: '600px',
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
          <h2 style={{ margin: 0, color: '#ffaa00' }}>Inventory</h2>
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

        {/* Equipped Items */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#44ff44', marginBottom: '10px' }}>Equipped</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px'
          }}>
            {equipped.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleItemClick(item)}
                style={{
                  border: `2px solid ${getRarityColor(item.rarity)}`,
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ 
                  color: getRarityColor(item.rarity),
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginBottom: '5px'
                }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </div>
                {item.stats && (
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <div key={stat}>+{value} {stat}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Items */}
        <div>
          <h3 style={{ color: '#aaaaaa', marginBottom: '10px' }}>Items ({inventory.length}/30)</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '10px'
          }}>
            {inventory.map((item) => {
              const isEquipped = equipped.some(eq => eq.id === item.id);
              return (
                <div 
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    border: `2px solid ${getRarityColor(item.rarity)}`,
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: isEquipped ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    opacity: isEquipped ? 0.7 : 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ 
                    color: getRarityColor(item.rarity),
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '5px'
                  }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </div>
                  {item.stats && (
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                      {Object.entries(item.stats).map(([stat, value]) => (
                        <div key={stat}>+{value} {stat}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
