import React, { useState } from "react";
import { useDailyLogin, DAILY_REWARDS } from "../../lib/stores/useDailyLogin";
import { usePlayer } from "../../lib/stores/usePlayer";
import { LootItem } from "../../lib/gameTypes";

const RARITY_COLOR: Record<string, string> = {
  common: '#c0c0c0',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
};

function RewardDayCard({
  day,
  icon,
  description,
  current,
  past,
}: {
  day: number;
  icon: string;
  description: string;
  current: boolean;
  past: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: '10px',
        border: current
          ? '2px solid #ffaa00'
          : past
          ? '2px solid #44aa44'
          : '2px solid rgba(255,255,255,0.1)',
        backgroundColor: current
          ? 'rgba(255,170,0,0.12)'
          : past
          ? 'rgba(68,170,68,0.08)'
          : 'rgba(255,255,255,0.04)',
        padding: '10px 8px',
        textAlign: 'center',
        opacity: past ? 0.7 : 1,
        position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      {past && (
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#44aa44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          ✓
        </div>
      )}
      {current && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#ffaa00',
            color: '#000',
            fontSize: '9px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
        >
          TODAY
        </div>
      )}
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
      <div
        style={{
          fontSize: '10px',
          color: current ? '#ffaa00' : past ? '#44aa44' : '#888',
          fontWeight: 'bold',
          marginBottom: '4px',
        }}
      >
        DAY {day}
      </div>
      <div style={{ fontSize: '9px', color: '#aaa', lineHeight: '1.3' }}>
        {description.split('+').map((part, i) => (
          <div key={i}>{part.trim()}</div>
        ))}
      </div>
    </div>
  );
}

export default function DailyLogin() {
  const { currentStreak, pendingReward, pendingItem, claimReward, dismissModal } =
    useDailyLogin();
  const { addGold } = usePlayer();
  const [claimed, setClaimed] = useState(false);
  const [claimedItem, setClaimedItem] = useState<LootItem | null>(null);

  const dayIndex = ((currentStreak - 1) % 7);

  const handleClaim = () => {
    const result = claimReward();
    addGold(result.gold);
    // essence and crystals would integrate with player store once exposed
    if (result.item) setClaimedItem(result.item);
    setClaimed(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          backgroundColor: '#0d0f1a',
          border: '2px solid rgba(255,170,0,0.4)',
          borderRadius: '16px',
          padding: '28px 32px',
          width: '640px',
          maxWidth: '95vw',
          color: '#fff',
          boxShadow:
            '0 0 60px rgba(255,170,0,0.25), 0 20px 60px rgba(0,0,0,0.7)',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌟</div>
          <h2
            style={{
              margin: 0,
              color: '#ffaa00',
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '3px',
              textShadow: '0 0 20px rgba(255,170,0,0.5)',
            }}
          >
            DAILY LOGIN REWARD
          </h2>
          {currentStreak > 1 && (
            <div
              style={{
                color: '#ff8800',
                fontSize: '13px',
                marginTop: '6px',
              }}
            >
              🔥 {currentStreak}-Day Login Streak!
            </div>
          )}
        </div>

        {/* 7-day calendar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {DAILY_REWARDS.map((reward, i) => (
            <RewardDayCard
              key={reward.day}
              day={reward.day}
              icon={reward.icon}
              description={reward.description}
              current={i === dayIndex}
              past={i < dayIndex}
            />
          ))}
        </div>

        {/* Today's reward detail */}
        {!claimed && pendingReward && (
          <div
            style={{
              backgroundColor: 'rgba(255,170,0,0.06)',
              border: '1px solid rgba(255,170,0,0.25)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#ffaa00', fontSize: '12px', letterSpacing: '2px', marginBottom: '10px' }}>
              TODAY'S REWARD
            </div>
            <div style={{ fontSize: '32px', marginBottom: '6px' }}>{pendingReward.icon}</div>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>
              {pendingReward.description}
            </div>
            {pendingItem && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  border: `1px solid ${RARITY_COLOR[pendingItem.rarity]}44`,
                  display: 'inline-block',
                }}
              >
                <span style={{ color: RARITY_COLOR[pendingItem.rarity], fontWeight: 'bold' }}>
                  {pendingItem.name}
                </span>
                <span style={{ color: '#888', fontSize: '11px', marginLeft: '8px' }}>
                  ({pendingItem.rarity})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Claimed success message */}
        {claimed && (
          <div
            style={{
              backgroundColor: 'rgba(68,170,68,0.12)',
              border: '1px solid rgba(68,170,68,0.35)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
            <div style={{ color: '#44cc44', fontWeight: 'bold', fontSize: '16px' }}>
              Reward Claimed!
            </div>
            {claimedItem && (
              <div style={{ color: '#aaa', fontSize: '12px', marginTop: '6px' }}>
                {claimedItem.name} has been added to your inventory.
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {!claimed ? (
            <button
              onClick={handleClaim}
              style={{
                background: 'linear-gradient(135deg, #cc7700, #ffaa00)',
                border: '2px solid #ffcc44',
                color: '#000',
                padding: '12px 36px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '1px',
                boxShadow: '0 0 20px rgba(255,170,0,0.4)',
              }}
            >
              Claim Reward
            </button>
          ) : (
            <button
              onClick={dismissModal}
              style={{
                background: 'linear-gradient(135deg, #224488, #336699)',
                border: '2px solid #4488cc',
                color: '#fff',
                padding: '12px 36px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              Enter the Dungeon
            </button>
          )}
          {!claimed && (
            <button
              onClick={dismissModal}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#888',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
