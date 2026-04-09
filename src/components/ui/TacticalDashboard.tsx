import React from 'react';
import { TOWER_CONFIGS, TowerType } from '../../game/entities/Tower';

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
  return (
    <div className="tactical-dashboard">
      {/* LEFT: LOGISTICS */}
      <div className="dashboard-left">
        <div className="control-grid">
          {/* ROW 1: MISSION + SWARM */}
          <div className="dash-item-v">
            <span className="dash-label">MISSION</span>
            <span className="dash-val-large" style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem' }}>{waveName}</span>
          </div>
          <div className="dash-item-v">
            <span className="dash-label">SWARM</span>
            <span className="dash-val-large" style={{ fontSize: '0.7rem' }}>{wave}</span>
          </div>

          {/* ROW 2: CONTROLS */}
          <button className="blue-button compact-btn" onClick={onPause}>PAUSE</button>
          <button className={`blue-button compact-btn ${isFastForward ? 'active' : ''}`} onClick={onToggleFastForward}>
            {isFastForward ? '2X' : '1X'}
          </button>

          {/* ROW 3: VITAL REPAIR */}
          <button 
            className="blue-button compact-btn" 
            style={{ gridColumn: 'span 2', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}
            onClick={onRepair}
            disabled={credits < repairCost || integrity >= 20}
          >
            REPAIR_KERNEL ({repairCost}c)
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
                onClick={() => unlocked && onSelectTurret(type)}
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
                {!unlocked && <div className="protocol-lock-overlay">🔒</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: SYSTEM VITALS */}
      <div className="dashboard-right">
        <div className="status-stack">
          <div className="status-integrity-line">
            <div className="dash-label">KERNEL_INTEGRITY</div>
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
