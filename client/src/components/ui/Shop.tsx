import { useState } from "react";
import { LootItem } from "../../lib/gameTypes";
import { LootSystem } from "../../lib/LootSystem";

interface ShopProps {
  onClose: () => void;
}

interface ShopItem extends LootItem {
  stock: number;
}

export default function Shop({ onClose }: ShopProps) {
  const [playerGold] = useState(500); // This should come from player store
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Generate shop inventory
  const [shopInventory] = useState<ShopItem[]>(() => {
    const items: ShopItem[] = [];
    const position = { x: 0, y: 0, z: 0 };
    
    // Generate random items for sale
    for (let i = 0; i < 12; i++) {
      const rarity = LootSystem.rollRarity(5, 0);
      const item = LootSystem.generateItem(position, rarity, undefined, 5);
      items.push({ ...item, stock: Math.floor(Math.random() * 3) + 1 });
    }
    
    return items;
  });
  
  // Player inventory (mock data - should come from player store)
  const [playerInventory] = useState<LootItem[]>([]);
  
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
  
  const handleBuy = (item: ShopItem) => {
    if (playerGold >= (item.value || 0)) {
      console.log(`Buying ${item.name} for ${item.value} gold`);
      // TODO: Implement buy logic with player store
    }
  };
  
  const handleSell = (item: LootItem) => {
    const sellValue = Math.floor((item.value || 0) * 0.5); // Sell for 50% of value
    console.log(`Selling ${item.name} for ${sellValue} gold`);
    // TODO: Implement sell logic with player store
  };
  
  const refreshStock = () => {
    // TODO: Implement stock refresh
    console.log('Refreshing shop stock...');
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
        backgroundColor: '#2a2520',
        border: '4px solid #8b7355',
        borderRadius: '15px',
        padding: '30px',
        width: '1000px',
        maxHeight: '90%',
        overflow: 'auto',
        color: '#fff',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '3px solid #8b7355',
          paddingBottom: '15px'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#ffcc00', fontSize: '32px' }}>
              🏪 Merchant's Shop
            </h2>
            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
              "Welcome, adventurer! Browse my finest wares!"
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '24px',
              color: '#ffcc00',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              💰 {playerGold} Gold
            </div>
            <button 
              onClick={onClose}
              style={{
                backgroundColor: '#8b4513',
                border: '2px solid #654321',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Leave Shop
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setSelectedTab('buy')}
            style={{
              flex: 1,
              backgroundColor: selectedTab === 'buy' ? '#8b7355' : '#3a3530',
              border: '2px solid #8b7355',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            🛒 Buy
          </button>
          <button
            onClick={() => setSelectedTab('sell')}
            style={{
              flex: 1,
              backgroundColor: selectedTab === 'sell' ? '#8b7355' : '#3a3530',
              border: '2px solid #8b7355',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            💰 Sell
          </button>
        </div>
        
        {/* Buy Tab */}
        {selectedTab === 'buy' && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, color: '#ffcc00' }}>
                Available Items
              </h3>
              <button
                onClick={refreshStock}
                style={{
                  backgroundColor: '#4a7c59',
                  border: '2px solid #2d5a3a',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                🔄 Refresh Stock (50 💰)
              </button>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '10px'
            }}>
              {shopInventory.map((item) => {
                const canAfford = playerGold >= (item.value || 0);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    style={{
                      border: `3px solid ${getRarityColor(item.rarity)}`,
                      borderRadius: '10px',
                      padding: '15px',
                      backgroundColor: selectedItem === item.id ? 'rgba(255, 204, 0, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: canAfford ? 1 : 0.6
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{
                      color: getRarityColor(item.rarity),
                      fontWeight: 'bold',
                      fontSize: '16px',
                      marginBottom: '8px'
                    }}>
                      {item.name}
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#aaa',
                      marginBottom: '8px'
                    }}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                    
                    {item.stats && (
                      <div style={{
                        fontSize: '11px',
                        color: '#4ade80',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat}>+{value} {stat}</div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{
                      fontSize: '12px',
                      color: '#888',
                      marginBottom: '10px'
                    }}>
                      Stock: {item.stock}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBuy(item);
                      }}
                      disabled={!canAfford || item.stock === 0}
                      style={{
                        width: '100%',
                        backgroundColor: canAfford && item.stock > 0 ? '#ffcc00' : '#555',
                        border: 'none',
                        color: canAfford && item.stock > 0 ? '#000' : '#888',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: canAfford && item.stock > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {item.stock === 0 ? 'Out of Stock' : `Buy ${item.value} 💰`}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {/* Sell Tab */}
        {selectedTab === 'sell' && (
          <>
            <h3 style={{ margin: '0 0 15px 0', color: '#ffcc00' }}>
              Your Inventory
            </h3>
            
            {playerInventory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '50px',
                color: '#888',
                fontSize: '16px'
              }}>
                Your inventory is empty. Go adventure and find some loot!
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '10px'
              }}>
                {playerInventory.map((item) => {
                  const sellValue = Math.floor((item.value || 0) * 0.5);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      style={{
                        border: `3px solid ${getRarityColor(item.rarity)}`,
                        borderRadius: '10px',
                        padding: '15px',
                        backgroundColor: selectedItem === item.id ? 'rgba(255, 204, 0, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{
                        color: getRarityColor(item.rarity),
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '8px'
                      }}>
                        {item.name}
                      </div>
                      
                      <div style={{
                        fontSize: '12px',
                        color: '#aaa',
                        marginBottom: '8px'
                      }}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </div>
                      
                      {item.stats && (
                        <div style={{
                          fontSize: '11px',
                          color: '#4ade80',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}>
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <div key={stat}>+{value} {stat}</div>
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSell(item);
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: '#4ade80',
                          border: 'none',
                          color: '#000',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        Sell {sellValue} 💰
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
