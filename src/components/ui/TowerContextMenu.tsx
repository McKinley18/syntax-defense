import React from 'react';
import { Tower } from '../../game/entities/Tower';

interface TowerContextMenuProps {
  selectedTower: Tower;
  credits: number;
  upgradeCost: number;
  onUpgrade: () => void;
  onSell: () => void;
  onClose: () => void;
}

const TowerContextMenu: React.FC<TowerContextMenuProps> = ({
  selectedTower,
  credits,
  upgradeCost,
  onUpgrade,
  onSell,
  onClose
}) => {
  return (
    <div className="tower-context-overlay" onClick={onClose}>
      <div className="tower-context-box" onClick={(e) => e.stopPropagation()}>
        <div className="context-header">
          <span className="context-title">NODE_CONTEXT_v{selectedTower.level}.0</span>
          <button className="close-context" onClick={onClose}>&times;</button>
        </div>
        
        <div className="context-body">
          <div className="node-info">
            <div className="node-name">{selectedTower.config.name.toUpperCase()}</div>
            <div className="node-stats">
              <div>&gt; DMG_OUTPUT: {selectedTower.config.damage * (selectedTower.level === 2 ? 1.25 : selectedTower.level === 3 ? 1.5 : 1)}</div>
              <div>&gt; TOTAL_PURGED: {Math.floor(selectedTower.totalDamageDealt)}</div>
            </div>
          </div>

          <div className="context-actions">
            <button 
              className="blue-button context-btn" 
              onClick={onUpgrade}
              disabled={credits < upgradeCost || selectedTower.level >= 3}
            >
              {selectedTower.level >= 3 ? 'MAX_LEVEL' : `OVERCLOCK: ${upgradeCost}c`}
            </button>
            <button 
              className="blue-button context-btn" 
              onClick={onSell}
              style={{ borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}
            >
              PURGE_NODE
            </button>
          </div>

          <div className="context-log">
            <div className="log-label">SYSTEM_LOG</div>
            <div className="log-text">
              &gt; NODE_STABILITY: 100%<br />
              &gt; FIRMWARE: v{selectedTower.level}.2.4<br />
              &gt; STATUS: OPERATIONAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerContextMenu;
