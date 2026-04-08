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
  isWaveActive: boolean;
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
  isWaveActive,
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
      <div className="dashboard-left">
        <div className="control-grid">
          <button className="blue-button compact-btn" onClick={onPause}>PAUSE</button>
          <button className={`blue-button compact-btn ${isFastForward ? 'active' : ''}`} onClick={onToggleFastForward} style={{ borderColor: isFastForward ? '#00ff66' : '' }}>FWD &gt;&gt;</button>
          <button className={`blue-button compact-btn ${integrity <= 5 && credits >= repairCost ? 'critical-repair' : ''}`} onClick={onRepair} disabled={credits < repairCost || integrity >= 20}>REPAIR: {repairCost}c</button>
          <button className="blue-button compact-btn" onClick={() => { }} disabled={credits < 1000 || !isWaveActive}>PURGE: 1000c</button>
        </div>
      </div>
      <div className="dashboard-center">
        <div className="turret-row">
          {[0, 1, 2, 3, 4].map(type => {
            const cfg = TOWER_CONFIGS[type as TowerType];
            const unlocked = type === 0 || isUnlocked(type);
            let cost = cfg.cost;
            const count = getTowerCount(type as TowerType);
            cost = Math.floor(cfg.cost * (count >= 4 ? 1.15 : 1.0));
            if (gameMode === 'HARDCORE') cost = Math.floor(cost * 1.5);
            if (integrity < 10 && gameMode !== 'SUDDEN_DEATH') cost = Math.floor(cost * 0.85);

            return (
              <div key={type} ref={type === 0 ? firstTurretRef as any : null} className={`protocol-card ${selectedTurret === type ? 'active' : ''} ${credits < cost ? 'dimmed' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => unlocked && onSelectTurret(type)}>
                <div className="protocol-header">{cfg.name}</div>
                <div className="protocol-visual-container">
                  <div className="mini-turret" data-type={type}>
                    <div className="mini-base"></div>
                    <div className="mini-head">
                      <div className="mini-weapon"></div>
                      <div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6, '0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6, '0')}` }}></div>
                    </div>
                  </div>
                  {!unlocked && <div className="protocol-lock-overlay">🔒</div>}
                </div>
                <div className="protocol-stats">DMG: {cfg.damage}</div>
                <div className="protocol-footer">{cost}c</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="dashboard-right">
        <div className="status-stack">
          <div className="status-mission-line">LVL {wave} // {waveName}</div>
          <div className="status-credit-line"><span className="val">{credits}</span><span className="lbl"> TOKENS</span></div>
          <div className="status-integrity-line">
            <div className="integrity-bar-clean"><div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%`, background: sysStatusColor }}></div></div>
            <div className="status-text-line" style={{ color: sysStatusColor }}>{systemStatusText}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalDashboard;
