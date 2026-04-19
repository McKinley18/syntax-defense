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

/**
 * TURRET UPGRADE OVERLAY v91.0: Predictive Strategy Module
 * THE REBUILD: Implements Tier Forecasting and high-intensity UI feedback.
 */
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
        const modes = [TargetMode.CLOSEST, TargetMode.FIRST, TargetMode.STRONGEST, TargetMode.WEAKEST];
        const next = modes[(modes.indexOf(tower.targetMode) + 1) % modes.length];
        tower.targetMode = next;
        setTargetMode(next);
        AudioManager.getInstance().playUiClick();
    };

    const currentDamage = tower.getEffectiveDamage();
    const nextMulti = [1.0, 2.0, 4.0];
    const nextDamage = tower.tier < 3 ? tower.config.damage * nextMulti[tower.tier] : currentDamage;
    const canUpgrade = tower.tier < 3 && credits >= tower.getUpgradeCost();

    const getModeLabel = (m: TargetMode) => {
        switch(m) {
            case TargetMode.CLOSEST: return "CLOSEST";
            case TargetMode.FIRST: return "PROGRESS";
            case TargetMode.STRONGEST: return "RESILIENT";
            case TargetMode.WEAKEST: return "VULNERABLE";
            default: return "NONE";
        }
    };

    return (
        <div style={{
            position: 'absolute', bottom: '10rem', left: '50%', transform: 'translateX(-50%)',
            width: '26rem', background: 'rgba(0,10,25,0.98)', border: '0.15rem solid var(--neon-cyan)',
            padding: '1.5rem', color: '#fff', fontFamily: "'Courier New', Courier, monospace", zIndex: 1000,
            boxShadow: '0 0 60px rgba(0,0,0,0.9)', borderRadius: '2px'
        }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--neon-cyan)', letterSpacing: '1px' }}>
                        {tower.config.name}_OPTIMIZATION
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#666', fontWeight: 900 }}>NODE_ID: {Math.floor(tower.container.x)}_{Math.floor(tower.container.y)}</div>
                </div>
                <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #444', color: '#fff', fontSize: '0.7rem', cursor: 'pointer', padding: '0.2rem 0.6rem', fontWeight: 900 }}>[ ESC ]</button>
            </div>

            {/* STATS & FORECASTING */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem', border: '1px solid #222' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 900 }}>LETHALITY_OUTPUT</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--neon-cyan)', fontWeight: 900 }}>[ TIER_0{tier} ]</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                        {currentDamage} 
                        {tower.tier < 3 && (
                            <span style={{ color: '#00ff66', marginLeft: '0.8rem' }}>
                                &gt;&gt; {nextDamage} <span style={{ fontSize: '0.7rem' }}>DPS</span>
                            </span>
                        )}
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #222' }}>
                        <div style={{ fontSize: '0.55rem', color: '#666', marginBottom: '2px' }}>NETWORK_RANGE</div>
                        <div style={{ fontSize: '0.85rem', color: '#fff' }}>{tower.getEffectiveRange()}x NODE</div>
                    </div>
                    <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '0.55rem', color: '#666', marginBottom: '2px' }}>TARGETING_LOGIC</div>
                        <button onClick={rotateTargetMode} style={{ background: 'transparent', border: 'none', color: 'var(--neon-cyan)', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', padding: 0, textAlign: 'left', borderBottom: '1px dashed var(--neon-cyan)', width: 'fit-content' }}>
                            {getModeLabel(targetMode)}
                        </button>
                    </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button onClick={handleUpgrade} disabled={!canUpgrade}
                        style={{ flex: 1, height: '3rem', background: canUpgrade ? 'var(--neon-cyan)' : '#151515', color: canUpgrade ? '#000' : '#444', border: 'none', fontWeight: 900, cursor: canUpgrade ? 'pointer' : 'not-allowed', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        {tower.tier < 3 ? `AUTHORIZE_UPGRADE (${tower.getUpgradeCost()}c)` : 'MAX_OPTIMIZATION'}
                    </button>
                    <button onClick={handleSell}
                        style={{ width: '6rem', height: '3rem', background: 'transparent', border: '1.5px solid #ff3300', color: '#ff3300', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem' }}>
                        RECYCLE
                    </button>
                </div>
            </div>
        </div>
    );
};
