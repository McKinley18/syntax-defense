import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { Tower, TowerType, TOWER_CONFIGS, TargetMode } from '../entities/Tower';
import { TowerManager } from '../systems/TowerManager';
import { AudioManager } from '../systems/AudioManager';

interface TurretUpgradeOverlayProps {
    tower: Tower;
    towerManager: TowerManager;
    onClose?: () => void;
}

export const TurretUpgradeOverlay: React.FC<TurretUpgradeOverlayProps> = ({ tower, towerManager, onClose }) => {
    const [credits, setCredits] = useState(StateManager.instance.credits);
    const [tier, setTier] = useState(tower.tier);
    const [targetMode, setTargetMode] = useState(tower.targetMode);

    useEffect(() => {
        const unsubs = [
            StateManager.instance.subscribe('credits', (v) => setCredits(v))
        ];
        return () => unsubs.forEach(fn => fn());
    }, []);

    const handleUpgrade = () => {
        const cost = tower.getUpgradeCost();
        if (credits >= cost && tower.tier < 3) {
            towerManager.upgradeSelectedTower();
            setTier(tower.tier);
            AudioManager.getInstance().playUiClick();
        }
    };

    const handleSell = () => {
        towerManager.sellSelectedTower();
        AudioManager.getInstance().playUiClick();
        if (onClose) onClose();
    };

    const rotateTargetMode = () => {
        const modes = [TargetMode.CLOSEST, TargetMode.STRONGEST, TargetMode.WEAKEST];
        const next = modes[(modes.indexOf(tower.targetMode) + 1) % modes.length];
        tower.targetMode = next;
        setTargetMode(next);
        AudioManager.getInstance().playUiClick();
    };

    const canUpgrade = tower.tier < 3 && credits >= tower.getUpgradeCost();

    return (
        <div style={{
            position: 'absolute', bottom: '10rem', left: '50%', transform: 'translateX(-50%)',
            width: '24rem', background: 'rgba(0,10,25,0.95)', border: '0.15rem solid var(--neon-cyan)',
            padding: '1.2rem', color: '#fff', fontFamily: 'monospace', zIndex: 1000,
            boxShadow: '0 0 40px rgba(0,0,0,0.8)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid #333', paddingBottom: '0.4rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--neon-cyan)' }}>
                    {tower.config.name}_OPTIMIZATION
                </div>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.5 }}>[X]</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>TIER: 0{tier}</span>
                    <span style={{ color: '#00ff66' }}>LETHALITY: {tower.getEffectiveDamage()} DPS</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>RANGE: {tower.getEffectiveRange()}nm</span>
                    <button onClick={rotateTargetMode} style={{ background: 'transparent', border: '1px solid #555', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                        MODE: {TargetMode[targetMode]}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button onClick={handleUpgrade} disabled={!canUpgrade}
                        style={{ flex: 1, height: '2.5rem', background: canUpgrade ? 'var(--neon-cyan)' : '#151515', color: canUpgrade ? '#000' : '#444', border: 'none', fontWeight: 900, cursor: canUpgrade ? 'pointer' : 'not-allowed' }}>
                        {tower.tier < 3 ? `UPGRADE (${tower.getUpgradeCost()}c)` : 'MAX_TIER'}
                    </button>
                    <button onClick={handleSell}
                        style={{ width: '6rem', height: '2.5rem', background: 'transparent', border: '1.5px solid #ff3300', color: '#ff3300', fontWeight: 900, cursor: 'pointer' }}>
                        SELL
                    </button>
                </div>
            </div>
        </div>
    );
};
