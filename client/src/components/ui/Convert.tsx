import { useState } from "react";
import { LootItem } from "../../lib/gameTypes";

interface ConvertProps {
  onClose: () => void;
}

interface ConversionOption {
  id: string;
  name: string;
  description: string;
  inputRatio: number; // Items per conversion
  outputValue: number; // Gold/materials per conversion
  icon: string;
  type: 'gold' | 'essence' | 'crystal';
}

export default function Convert({ onClose }: ConvertProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedConversion, setSelectedConversion] = useState<string>('gold');
  
  // Mock player inventory (should come from player store)
  const [playerInventory] = useState<LootItem[]>([]);
  
  const conversionOptions: ConversionOption[] = [
    {
      id: 'gold',
      name: 'Convert to Gold',
      description: 'Break down items into pure gold currency',
      inputRatio: 1,
      outputValue: 1, // Multiplier based on item value
      icon: '💰',
      type: 'gold'
    },
    {
      id: 'essence',
      name: 'Extract Essence',
      description: 'Extract magical essence for enchanting',
      inputRatio: 3,
      outputValue: 5,
      icon: '✨',
      type: 'essence'
    },
    {
      id: 'crystal',
      name: 'Crystallize',
      description: 'Convert items into enhancement crystals',
      inputRatio: 5,
      outputValue: 1,
      icon: '💎',
      type: 'crystal'
    }
  ];
  
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
  
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const calculateConversionValue = (): number => {
    const option = conversionOptions.find(opt => opt.id === selectedConversion);
    if (!option) return 0;
    
    const selectedItemsData = playerInventory.filter(item => 
      selectedItems.includes(item.id)
    );
    
    if (selectedItemsData.length < option.inputRatio) return 0;
    
    const totalValue = selectedItemsData.reduce((sum, item) => 
      sum + (item.value || 0), 0
    );
    
    if (option.type === 'gold') {
      return Math.floor(totalValue * 0.75); // 75% of total value
    } else if (option.type === 'essence') {
      return Math.floor(selectedItemsData.length / option.inputRatio) * option.outputValue;
    } else {
      return Math.floor(selectedItemsData.length / option.inputRatio) * option.outputValue;
    }
  };
  
  const handleConvert = () => {
    const value = calculateConversionValue();
    if (value > 0) {
      console.log(`Converting ${selectedItems.length} items to ${value} ${selectedConversion}`);
      // TODO: Implement conversion logic with player store
      setSelectedItems([]);
    }
  };
  
  const canConvert = () => {
    const option = conversionOptions.find(opt => opt.id === selectedConversion);
    if (!option) return false;
    return selectedItems.length >= option.inputRatio;
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
        border: '4px solid #6c63ff',
        borderRadius: '15px',
        padding: '30px',
        width: '1100px',
        maxHeight: '90%',
        overflow: 'auto',
        color: '#fff',
        boxShadow: '0 0 40px rgba(108, 99, 255, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '3px solid #6c63ff',
          paddingBottom: '15px'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#6c63ff', fontSize: '32px' }}>
              ⚗️ Conversion Chamber
            </h2>
            <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
              Transform unwanted items into valuable resources
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#ff4444',
              border: 'none',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '25px' }}>
          {/* Left Panel - Conversion Options */}
          <div style={{ flex: '0 0 300px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#6c63ff' }}>
              Conversion Type
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conversionOptions.map(option => (
                <div
                  key={option.id}
                  onClick={() => setSelectedConversion(option.id)}
                  style={{
                    border: `3px solid ${selectedConversion === option.id ? '#6c63ff' : '#444'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: selectedConversion === option.id ? 'rgba(108, 99, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (selectedConversion !== option.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 99, 255, 0.1)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedConversion !== option.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '10px',
                    textAlign: 'center'
                  }}>
                    {option.icon}
                  </div>
                  
                  <div style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}>
                    {option.name}
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#aaa',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    {option.description}
                  </div>
                  
                  <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#888',
                    textAlign: 'center'
                  }}>
                    Requires {option.inputRatio} item{option.inputRatio > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Panel - Item Selection */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0, color: '#6c63ff' }}>
                Select Items ({selectedItems.length} selected)
              </h3>
              
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setSelectedItems([])}
                  style={{
                    backgroundColor: '#ff4444',
                    border: 'none',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
            
            {playerInventory.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#888',
                fontSize: '16px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                <div>Your inventory is empty</div>
                <div style={{ fontSize: '14px', marginTop: '10px' }}>
                  Collect items from dungeons to convert them here
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px',
                  maxHeight: '450px',
                  overflowY: 'auto',
                  padding: '10px',
                  marginBottom: '20px'
                }}>
                  {playerInventory.map(item => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        style={{
                          border: `3px solid ${isSelected ? '#6c63ff' : getRarityColor(item.rarity)}`,
                          borderRadius: '10px',
                          padding: '12px',
                          backgroundColor: isSelected ? 'rgba(108, 99, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            backgroundColor: '#6c63ff',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}>
                            ✓
                          </div>
                        )}
                        
                        <div style={{
                          color: getRarityColor(item.rarity),
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '6px',
                          wordBreak: 'break-word'
                        }}>
                          {item.name}
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: '#aaa',
                          marginBottom: '6px'
                        }}>
                          {item.type}
                        </div>
                        
                        <div style={{
                          fontSize: '12px',
                          color: '#ffcc00',
                          fontWeight: 'bold'
                        }}>
                          {item.value} 💰
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Conversion Summary */}
                <div style={{
                  backgroundColor: 'rgba(108, 99, 255, 0.1)',
                  border: '2px solid #6c63ff',
                  borderRadius: '10px',
                  padding: '20px',
                  marginTop: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        color: '#6c63ff',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        Conversion Result
                      </div>
                      <div style={{
                        color: '#aaa',
                        fontSize: '14px'
                      }}>
                        {selectedItems.length} items selected
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'right'
                    }}>
                      <div style={{
                        fontSize: '28px',
                        color: '#ffcc00',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        {calculateConversionValue()} {conversionOptions.find(o => o.id === selectedConversion)?.icon}
                      </div>
                      
                      <button
                        onClick={handleConvert}
                        disabled={!canConvert()}
                        style={{
                          backgroundColor: canConvert() ? '#6c63ff' : '#444',
                          border: 'none',
                          color: '#fff',
                          padding: '12px 32px',
                          borderRadius: '8px',
                          cursor: canConvert() ? 'pointer' : 'not-allowed',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (canConvert()) {
                            e.currentTarget.style.backgroundColor = '#8883ff';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (canConvert()) {
                            e.currentTarget.style.backgroundColor = '#6c63ff';
                          }
                        }}
                      >
                        Convert Items
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
