import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { TOWER_CONFIGS, TowerType, Tower } from '../entities/Tower';
import { AudioManager } from '../systems/AudioManager';

export interface ITacticalWaveManager {
    prepTimer: number;
}

// --- HARDENED ASSET BLOCK ---
const OctagonBase = ({ color, isLocked }: { color: string, isLocked: boolean }) => (
    <path d="M12 4 L28 4 L36 12 V28 L28 36 L12 36 L4 28 V12 Z" fill="#0a0a0a" stroke={isLocked ? "#222" : "#333"} strokeWidth="2" />
);

const TechnicalTurretIcon: React.FC<{ type: TowerType, color: number, isLocked: boolean }> = ({ type, color, isLocked }) => {
    const c = isLocked ? "#333" : `#${color.toString(16).padStart(6, '0')}`;
    switch(type) {
        case TowerType.PULSE_NODE: 
            return <svg viewBox="0 0 40 40" fill="none"><OctagonBase color={c} isLocked={isLocked} /><rect x="14" y="2" width="4" height="18" fill="#1a1a1a" stroke={c} strokeWidth="1.5" /><rect x="22" y="2" width="4" height="18" fill="#1a1a1a" stroke={c} strokeWidth="1.5" /><rect x="13" y="2" width="6" height="3" fill={c} /><rect x="21" y="2" width="6" height="3" fill={c} /></svg>;
        case TowerType.SONIC_IMPULSE: 
            return <svg viewBox="0 0 40 40" fill="none"><OctagonBase color={c} isLocked={isLocked} /><path d="M10 15 A 15 15 0 0 1 30 15" stroke={c} strokeWidth="4" strokeLinecap="round" /><circle cx="20" cy="12" r="3" fill={c} /><path d="M15 25 L25 25 L20 15 Z" fill="#222" /></svg>;
        case TowerType.STASIS_FIELD: 
            return <svg viewBox="0 0 40 40" fill="none"><OctagonBase color={c} isLocked={isLocked} /><circle cx="20" cy="20" r="12" stroke={c} strokeWidth="2" strokeOpacity={isLocked ? 0.2 : 0.6} /><circle cx="20" cy="20" r="8" stroke={c} strokeWidth="3" /><circle cx="20" cy="20" r="4" fill={isLocked ? "#222" : "#fff"} /></svg>;
        case TowerType.PRISM_BEAM: 
            return <svg viewBox="0 0 40 40" fill="none"><OctagonBase color={c} isLocked={isLocked} /><path d="M20 5 L32 25 L8 25 Z" fill="#1a1a1a" stroke={c} strokeWidth="2" /><circle cx="20" cy="18" r="6" fill={c} fillOpacity={isLocked ? 0.1 : 0.5} stroke={isLocked ? "#333" : "#fff"} /></svg>;
        case TowerType.RAIL_CANNON: 
            return <svg viewBox="0 0 40 40" fill="none"><OctagonBase color={c} isLocked={isLocked} /><rect x="16" y="2" width="2" height="30" fill="#050505" stroke={c} strokeWidth="2" /><rect x="22" y="2" width="2" height="30" fill="#050505" stroke={c} strokeWidth="2" /><rect x="14" y="10" width="12" height="2" fill={c} fillOpacity={isLocked ? 0.1 : 0.6} /></svg>;
        case TowerType.VOID_PROJECTOR: 
            return <svg viewBox="0 0 40 40" fill="none"><OctagonBase color={c} isLocked={isLocked} /><path d="M10 10 L15 15 M30 10 L25 15 M10 30 L15 25 M30 30 L25 25" stroke={c} strokeWidth="3" /><circle cx="20" cy="20" r="8" fill="#000" stroke={c} strokeWidth="2" /><circle cx="20" cy="20" r="4" fill={c} /></svg>;
        default: return null;
    }
};

export const TacticalHUD: React.FC<{ 
    onStartWave: () => void, 
    towerCount?: Record<TowerType, number>,
    waveManager?: ITacticalWaveManager,
    towerManager?: any
}> = ({ onStartWave, towerCount = {}, waveManager, towerManager }) => {
    const [credits, setCredits] = useState(StateManager.instance.credits);
    const [integrity, setIntegrity] = useState(StateManager.instance.integrity);
    const [selectedType, setSelectedType] = useState<TowerType | null>(StateManager.instance.selectedTurretType);
    const [currentWave, setCurrentWave] = useState(StateManager.instance.currentWave);
    const [gameState, setGameState] = useState(StateManager.instance.currentState);
    const [prepTime, setPrepTime] = useState(waveManager?.prepTimer || 0);

    useEffect(() => {
        const itv = setInterval(() => {
            setCredits(StateManager.instance.credits);
            setIntegrity(StateManager.instance.integrity);
            setSelectedType(StateManager.instance.selectedTurretType);
            setCurrentWave(StateManager.instance.currentWave);
            setGameState(StateManager.instance.currentState);
            if (waveManager) setPrepTime(waveManager.prepTimer);
        }, 50); 
        return () => clearInterval(itv);
    }, [waveManager]);

    // --- RESTORED PROTOCOL ---
    const handleRepair = () => {
        if (credits >= 250 && integrity < 20) {
            StateManager.instance.credits -= 250;
            StateManager.instance.integrity = Math.min(20, StateManager.instance.integrity + 5);
            AudioManager.getInstance().playUiClick();
        }
    };

    const selectTurret = (type: TowerType) => {
        const config = TOWER_CONFIGS[type];
        if (currentWave < config.unlockWave) return;
        if (credits < config.cost) return;

        if (StateManager.instance.selectedTurretType === type) {
            StateManager.instance.selectedTurretType = null;
        } else {
            if (towerManager) towerManager.deselectTower();
            StateManager.instance.selectedTurretType = type;
            AudioManager.getInstance().playUiClick();
        }
    };

    const allTurrets = [
        TowerType.PULSE_NODE,
        TowerType.SONIC_IMPULSE,
        TowerType.STASIS_FIELD,
        TowerType.PRISM_BEAM,
        TowerType.RAIL_CANNON,
        TowerType.VOID_PROJECTOR
    ];

    const isCritical = integrity <= 6; 
    const isPrep = gameState === AppState.WAVE_PREP;
    const isWave = gameState === AppState.GAME_WAVE;

    return (
        <div className="ui-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div className="tactical-dashboard">
                <div className="dashboard-content-wrapper">
                    
                    <div className="dashboard-left">
                        <div className="logistics-stack">
                            <div className="control-grid" style={{ marginBottom: '0.4rem', pointerEvents: 'auto' }}>
                                <button className="blue-button" onClick={() => { StateManager.instance.isPaused = !StateManager.instance.isPaused; }}>
                                    {StateManager.instance.isPaused ? 'RESUME' : 'PAUSE'}
                                </button>
                                <button className="blue-button">1X</button>
                            </div>
                            <button 
                                className={`blue-button initiate-btn ${(isWave || isPrep) ? 'disabled' : ''}`} 
                                onClick={onStartWave}
                                style={{ height: '2.2rem', marginTop: '0.2rem', pointerEvents: 'auto' }}
                                disabled={isWave || isPrep}
                            >
                                {isPrep ? `SECURE_AREA [${Math.ceil(prepTime)}s]` : (isWave ? 'ENGAGED' : 'INITIATE_WAVE')}
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-center">
                        <div className="turret-row">
                            {allTurrets.map((type) => {
                                const cfg = TOWER_CONFIGS[type];
                                const isUnlocked = currentWave >= cfg.unlockWave;
                                const canAfford = credits >= cfg.cost;
                                const isActive = selectedType === type;

                                return (
                                    <div 
                                        key={type}
                                        className={`protocol-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''} ${!canAfford && isUnlocked ? 'too-expensive' : ''}`}
                                        onClick={() => { if (isUnlocked) selectTurret(type); }}
                                        style={{ 
                                            pointerEvents: isUnlocked ? 'auto' : 'none',
                                            border: isActive ? '2px solid var(--neon-cyan)' : (isUnlocked ? '1px solid #333' : '1px dashed #222'),
                                            background: isActive ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                                            opacity: isUnlocked ? 1.0 : 0.4
                                        }}
                                    >
                                        <div className="protocol-header" style={{ color: isActive ? 'var(--neon-cyan)' : (isUnlocked ? '#888' : '#444') }}>
                                            {isUnlocked ? cfg.name : "LOCKED"}
                                        </div>
                                        <div className="protocol-visual-container">
                                            <div style={{ width: '2.4rem', height: '2.4rem', filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                                                <TechnicalTurretIcon type={type} color={cfg.color} isLocked={!isUnlocked} />
                                            </div>
                                        </div>
                                        <div className="protocol-footer" style={{ color: isUnlocked ? (canAfford ? 'var(--neon-cyan)' : 'var(--neon-red)') : '#333' }}>
                                            {isUnlocked ? `${cfg.cost}c` : `WAVE_${cfg.unlockWave}`}
                                        </div>
                                        {isActive && <div className="selection-neon-border"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="dashboard-right">
                        <div className="vitals-stack" style={{ transform: 'translateY(-0.3rem)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span className="mission-text-large">WAVE_0{currentWave}</span>
                                <span className="token-text-large" style={{ color: 'var(--neon-cyan)' }}>{credits.toLocaleString()}c</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                <span className="integrity-label">Integrity</span>
                                {isCritical && <span className="critical-tag">[CRITICAL]</span>}
                            </div>
                            <div className="integrity-bar-clean" style={{ marginBottom: '0.6rem' }}>
                                <div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%`, backgroundColor: isCritical ? 'var(--neon-red)' : 'var(--neon-cyan)' }}></div>
                            </div>
                            <button className={`blue-button repair-btn ${credits < 250 || integrity >= 20 ? 'disabled' : ''}`} onClick={handleRepair} disabled={credits < 250 || integrity >= 20} style={{ height: '1.8rem', fontSize: '0.55rem', pointerEvents: 'auto' }}>
                                REPAIR KERNEL (250c)
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
