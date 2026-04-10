import React from 'react';
import { TOWER_CONFIGS, TowerType } from '../../game/entities/Tower';
import { AudioManager } from '../../game/systems/AudioManager';

interface TacticalDashboardProps {
  wave: number;
  waveName: string;
  credits: number;
  integrity: number;
  repairCost: number;
  selectedTurret: number;
  gameMode: string;
  isFastForward: boolean;
  sysStatusColor: string;
  systemStatusText: string;
  isUnlocked: (type: number) => boolean;
  getTowerCount: (type: TowerType) => number;
  onPause: () => void;
  onToggleFastForward: () => void;
  onRepair: () => void;
  onSelectTurret: (type: number) => void;
  firstTurretRef: React.RefObject<HTMLDivElement | null>;
}

const TacticalDashboard: React.FC<TacticalDashboardProps> = ({
  wave,
  waveName,
  credits,
  integrity,
  repairCost,
  selectedTurret,
  gameMode,
  isFastForward,
  sysStatusColor,
  systemStatusText,
  isUnlocked,
  getTowerCount,
  onPause,
  onToggleFastForward,
  onRepair,
  onSelectTurret,
  firstTurretRef
}) => {
  const am = AudioManager.getInstance();

  const getUnlockLevel = (type: number) => {
    if (type === 1) return 3;
    if (type === 2) return 6;
    if (type === 3) return 9;
    if (type === 4) return 12;
    return 0;
  };

  return (
    <div className="tactical-dashboard">
      {/* LEFT: LOGISTICS */}
      <div className="dashboard-left">
        <div className="control-grid">
          <button className="blue-button compact-btn" onClick={() => { am.playUiClick(); onPause(); }}>PAUSE</button>
          <button className={`blue-button compact-btn ${isFastForward ? 'active' : ''}`} onClick={() => { am.playUiClick(); onToggleFastForward(); }}>
            {isFastForward ? '2X >>' : '1X'}
          </button>

          <button 
            className={`blue-button compact-btn repair-protocol-btn ${credits < repairCost || integrity >= 20 ? 'disabled' : ''}`} 
            style={{ gridColumn: 'span 2', marginTop: '2px' }}
            onClick={() => { am.playUiClick(); onRepair(); }}
            disabled={credits < repairCost || integrity >= 20}
          >
            <span className="dash-label" style={{ color: 'inherit', fontSize: '0.5rem' }}>PROTOCOL:</span> REPAIR_KERNEL ({repairCost}c)
          </button>
        </div>
      </div>

      {/* CENTER: DEFENSE PROTOCOLS (THE WHEEL) */}
      <div className="dashboard-center">
        <div className="turret-row">
          {Object.keys(TOWER_CONFIGS).map((key) => {
            const type = parseInt(key) as TowerType;
            const cfg = TOWER_CONFIGS[type];
            const unlocked = isUnlocked(type);
            const count = getTowerCount(type);
            
            return (
              <div 
                key={key}
                ref={type === 0 ? (firstTurretRef as any) : null}
                className={`protocol-card ${selectedTurret === type ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                onClick={() => { if (unlocked) { am.playUiClick(); onSelectTurret(type); } }}
              >
                <div className="protocol-header">{cfg.name}</div>
                <div className="protocol-visual-container">
                  <div className="mini-turret" data-type={type}>
                    <div className="mini-base"></div>
                    <div className="mini-head">
                      <div className="mini-weapon"></div>
                      <div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6, '0')}` }}></div>
                    </div>
                  </div>
                </div>
                <div className="protocol-stats">
                  DMG: {cfg.damage}<br />
                  UNIT: [{count}]
                </div>
                <div className="protocol-footer">{cfg.cost}c</div>
                {!unlocked && (
                  <div className="protocol-lock-overlay">
                    <div className="lock-text">LOCKED</div>
                    <div className="unlock-hint">SWARM {getUnlockLevel(type)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: SYSTEM VITALS */}
      <div className="dashboard-right">
        <div className="status-stack">
          <div className="status-integrity-line">
            <div className="dash-label" style={{ color: 'var(--neon-cyan)', marginBottom: '2px' }}>MISSION: {waveName} [{wave}]</div>
            <div className="integrity-bar-clean">
              <div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%`, backgroundColor: sysStatusColor }}></div>
            </div>
            <div className="status-text-line" style={{ color: sysStatusColor }}>{systemStatusText}</div>
          </div>
          
          <div className="status-credit-line">
            <span className="val">{credits.toLocaleString()}</span>
            <span className="lbl">TOKENS</span>
          </div>

          <div className="status-mission-line">
            <span className="dash-label">MODE:</span> {gameMode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalDashboard;
