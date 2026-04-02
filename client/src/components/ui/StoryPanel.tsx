import React, { useState } from "react";
import { useStory } from "../../lib/stores/useStory";
import { usePlayer } from "../../lib/stores/usePlayer";
import { StoryZone, StoryMission } from "../../lib/StorySystem";

interface StoryPanelProps {
  onClose: () => void;
}

const RARITY_HEX: Record<string, string> = {
  common: '#c0c0c0',
  uncommon: '#1eff00',
  rare: '#0070dd',
  epic: '#a335ee',
  legendary: '#ff8000',
};

function MissionCard({
  mission,
  active,
  onSelect,
  onComplete,
}: {
  mission: StoryMission;
  active: boolean;
  onSelect: () => void;
  onComplete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: active
          ? '2px solid #ffaa00'
          : mission.completed
          ? '2px solid #44aa44'
          : '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px',
        padding: '12px 14px',
        backgroundColor: active
          ? 'rgba(255,170,0,0.08)'
          : mission.completed
          ? 'rgba(68,170,68,0.06)'
          : 'rgba(255,255,255,0.03)',
        cursor: mission.completed ? 'default' : 'pointer',
        marginBottom: '10px',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: mission.completed ? '#44cc44' : active ? '#ffaa00' : '#e0d0ff',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {mission.completed ? '✅' : active ? '▶' : '○'} {mission.title}
          </div>
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
            {mission.description}
          </div>
          <div>
            {mission.objectives.map((obj, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: mission.completed ? '#44aa44' : '#aaa',
                  fontSize: '11px',
                  marginBottom: '2px',
                }}
              >
                <span style={{ color: mission.completed ? '#44aa44' : '#555' }}>
                  {mission.completed ? '✓' : '–'}
                </span>
                {obj}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: '12px', textAlign: 'right', minWidth: '80px' }}>
          <div style={{ color: '#ffcc44', fontSize: '11px', marginBottom: '2px' }}>
            💰 {mission.reward.gold.toLocaleString()}
          </div>
          <div style={{ color: '#88ccff', fontSize: '11px', marginBottom: '2px' }}>
            ⭐ {mission.reward.experience.toLocaleString()} XP
          </div>
          {mission.reward.essence && (
            <div style={{ color: '#cc88ff', fontSize: '11px', marginBottom: '2px' }}>
              ✨ {mission.reward.essence} Essence
            </div>
          )}
          {mission.reward.crystals && (
            <div style={{ color: '#44ddff', fontSize: '11px' }}>
              💠 {mission.reward.crystals} Crystals
            </div>
          )}
        </div>
      </div>
      {active && !mission.completed && (
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          style={{
            marginTop: '10px',
            width: '100%',
            backgroundColor: 'rgba(255,170,0,0.15)',
            border: '1px solid #ffaa00',
            color: '#ffaa00',
            padding: '6px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          ✦ Complete Mission (demo)
        </button>
      )}
    </div>
  );
}

function ZoneTab({
  zone,
  selected,
  onClick,
  playerLevel,
}: {
  zone: StoryZone;
  selected: boolean;
  onClick: () => void;
  playerLevel: number;
}) {
  const locked = playerLevel < zone.requiredLevel;

  return (
    <button
      onClick={locked ? undefined : onClick}
      style={{
        backgroundColor: selected
          ? zone.accentColor + '33'
          : 'transparent',
        border: selected
          ? `2px solid ${zone.accentColor}`
          : locked
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: locked ? 'not-allowed' : 'pointer',
        color: locked ? '#444' : selected ? '#fff' : '#aaa',
        fontSize: '11px',
        textAlign: 'left' as const,
        transition: 'all 0.15s',
        width: '100%',
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: locked ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: '18px' }}>{zone.icon}</span>
      <div>
        <div style={{ fontWeight: selected ? 'bold' : 'normal', fontSize: '12px' }}>
          {zone.name}
        </div>
        <div style={{ color: '#666', fontSize: '10px' }}>
          {locked ? `🔒 Level ${zone.requiredLevel} required` : zone.subtitle}
        </div>
      </div>
      {zone.completed && (
        <span style={{ marginLeft: 'auto', color: '#44cc44', fontSize: '14px' }}>✓</span>
      )}
    </button>
  );
}

export default function StoryPanel({ onClose }: StoryPanelProps) {
  const { zones, currentZoneId, activeMissionId, advanceToZone, completeMission, setActiveMission } = useStory();
  const { level, gainExperience, addGold } = usePlayer();
  const [selectedZoneId, setSelectedZoneId] = useState(currentZoneId);

  const selectedZone = zones.find(z => z.id === selectedZoneId) ?? zones[0];
  const progressPct = Math.min(
    100,
    Math.max(0, ((level - selectedZone.requiredLevel) / Math.max(1, selectedZone.maxLevel - selectedZone.requiredLevel)) * 100)
  );

  const handleMissionComplete = (mission: StoryMission) => {
    completeMission(mission.id);
    gainExperience(mission.reward.experience);
    addGold(mission.reward.gold);
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
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#0a0c18',
          border: '2px solid rgba(100,80,200,0.35)',
          borderRadius: '16px',
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          color: '#fff',
          boxShadow: '0 0 60px rgba(80,50,200,0.3), 0 20px 60px rgba(0,0,0,0.7)',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 22px',
            background: 'linear-gradient(135deg, #12102a 0%, #0a0818 100%)',
            borderBottom: '1px solid rgba(100,80,200,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📖</span>
            <div>
              <h2 style={{ margin: 0, color: '#cc88ff', fontSize: '20px', letterSpacing: '1px' }}>
                STORY ARC & AREA PROGRESSION
              </h2>
              <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                Chapter {zones.find(z => z.id === currentZoneId)?.chapter ?? 1} of 10 — Your current zone:{' '}
                <span style={{ color: '#cc88ff' }}>
                  {zones.find(z => z.id === currentZoneId)?.name}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#aaa',
              padding: '7px 14px',
              borderRadius: '7px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left sidebar — zone list */}
          <div
            style={{
              width: '240px',
              flexShrink: 0,
              padding: '16px 14px',
              borderRight: '1px solid rgba(100,80,200,0.15)',
              overflowY: 'auto',
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                color: '#888',
                fontSize: '10px',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              ZONES
            </div>
            {zones.map((zone) => (
              <ZoneTab
                key={zone.id}
                zone={zone}
                selected={selectedZoneId === zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                playerLevel={level}
              />
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* Zone header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${selectedZone.bgColor}, rgba(0,0,0,0.6))`,
                border: `1px solid ${selectedZone.accentColor}44`,
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '36px' }}>{selectedZone.icon}</span>
                <div>
                  <div
                    style={{
                      color: selectedZone.accentColor,
                      fontSize: '10px',
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      marginBottom: '3px',
                    }}
                  >
                    {selectedZone.subtitle.toUpperCase()}
                  </div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>
                    {selectedZone.name}
                  </h3>
                  <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>
                    Level {selectedZone.requiredLevel}–{selectedZone.maxLevel === 99 ? '∞' : selectedZone.maxLevel}
                  </div>
                </div>
                {selectedZone.completed && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: 'rgba(68,170,68,0.2)',
                      border: '1px solid #44aa44',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: '#44cc44',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    ✅ Zone Completed
                  </div>
                )}
              </div>

              <p style={{ color: '#bbb', fontSize: '13px', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                {selectedZone.lore}
              </p>

              {/* Zone progress bar */}
              {level >= selectedZone.requiredLevel && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: selectedZone.accentColor, fontSize: '11px', fontWeight: 'bold' }}>
                      ZONE PROGRESS
                    </span>
                    <span style={{ color: '#aaa', fontSize: '11px' }}>
                      Level {level} / {selectedZone.maxLevel === 99 ? '∞' : selectedZone.maxLevel}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${selectedZone.accentColor}88, ${selectedZone.accentColor})`,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              )}
              {level < selectedZone.requiredLevel && (
                <div
                  style={{
                    color: '#ff6644',
                    fontSize: '12px',
                    marginTop: '8px',
                    backgroundColor: 'rgba(255,50,0,0.1)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,50,0,0.2)',
                    display: 'inline-block',
                  }}
                >
                  🔒 Requires Level {selectedZone.requiredLevel}
                </div>
              )}
            </div>

            {/* Boss section */}
            <div
              style={{
                backgroundColor: 'rgba(200,50,50,0.08)',
                border: '1px solid rgba(200,50,50,0.2)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  color: '#ff6644',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  marginBottom: '6px',
                }}
              >
                ☠️ ZONE BOSS
              </div>
              <div style={{ color: '#ffaa88', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                {selectedZone.bossName}
              </div>
              <div style={{ color: '#bbb', fontSize: '12px', lineHeight: '1.5' }}>
                {selectedZone.bossDescription}
              </div>
            </div>

            {/* Missions */}
            <div>
              <div
                style={{
                  color: '#888',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  marginBottom: '12px',
                }}
              >
                STORY MISSIONS
              </div>
              {selectedZone.missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  active={activeMissionId === mission.id}
                  onSelect={() =>
                    !mission.completed && setActiveMission(
                      activeMissionId === mission.id ? null : mission.id
                    )
                  }
                  onComplete={() => handleMissionComplete(mission)}
                />
              ))}
            </div>

            {/* Advance zone button */}
            {selectedZoneId !== currentZoneId && !selectedZone.completed && selectedZone.unlocked && (
              <button
                onClick={() => advanceToZone(selectedZoneId)}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  background: `linear-gradient(135deg, ${selectedZone.accentColor}66, ${selectedZone.accentColor}99)`,
                  border: `2px solid ${selectedZone.accentColor}`,
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                ▶ Travel to {selectedZone.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
