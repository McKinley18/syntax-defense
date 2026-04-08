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
    <div className="tower-context-overlay ui-layer" onClick={onClose}>
      <div className="tower-context-menu" onClick={(e) => e.stopPropagation()}>
        <div className="context-header">
          <div className="context-title">{selectedTower.config.name}</div>
          <div className="context-level">L{selectedTower.level}</div>
        </div>
        <div className="context-actions">
          <button className="blue-button upgrade-btn" onClick={onUpgrade} disabled={selectedTower.level >= 3 || credits < upgradeCost}>
            <div className="upgrade-info">
              <span>UPGRADE</span>
              {selectedTower.level < 3 && <span className="cost-label">{upgradeCost}c</span>}
            </div>
          </button>
          <button className="blue-button sell-btn" onClick={onSell}><span>SELL</span></button>
        </div>
        <button className="close-context-btn" onClick={onClose}>CLOSE_ACCESS</button>
      </div>
    </div>
  );
};

export default TowerContextMenu;
