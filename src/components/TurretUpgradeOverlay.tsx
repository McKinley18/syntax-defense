import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { Tower, TOWER_CONFIGS, TargetMode } from '../entities/Tower';

export const TurretUpgradeOverlay: React.FC<{ tower: Tower, towerManager: any, onClose: () => void }> = ({ tower, towerManager, onClose }) => {
    const [credits, setCredits] = useState(StateManager.instance.credits);
    const [targetMode, setTargetMode] = useState(tower.targetMode);

    useEffect(() => {
        const itv = setInterval(() => {
            setCredits(StateManager.instance.credits);
        }, 100);
        return () => clearInterval(itv);
    }, []);

    const cost = tower.getUpgradeCost();
    const canAfford = credits >= cost;

    const changeTargetMode = (mode: TargetMode) => {
        tower.targetMode = mode;
        setTargetMode(mode);
    };

    return (
        <div className="upgrade-center-overlay" style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
            zIndex: 10000
        }}>
            <div className="terminal-box" style={{
                width: '24rem', background: 'rgba(0, 10, 25, 0.98)',
                border: '0.15rem solid var(--neon-cyan)', padding: '1.5rem',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                transform: 'translateY(-4rem)'
            }}>
                <div style={{ color: 'var(--neon-cyan)', fontSize: '1rem', fontWeight: 900, borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '0.5rem', letterSpacing: '2px' }}>
                    {tower.config.name} _ CORE_OPTIMIZATION
                </div>

                {/* TARGETING PROTOCOL MODULE */}
                <div className="targeting-module" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.5rem', letterSpacing: '1px' }}>TARGETING_PROTOCOL</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        {[
                            { label: 'FIRST', mode: TargetMode.FIRST },
                            { label: 'STRONG', mode: TargetMode.STRONGEST },
                            { label: 'CLOSE', mode: TargetMode.CLOSEST }
                        ].map((btn) => (
                            <button 
                                key={btn.label}
                                onClick={() => changeTargetMode(btn.mode)}
                                style={{ 
                                    background: targetMode === btn.mode ? 'var(--neon-cyan)' : 'transparent',
                                    color: targetMode === btn.mode ? '#000' : '#888',
                                    border: `1px solid ${targetMode === btn.mode ? 'var(--neon-cyan)' : '#333'}`,
                                    fontSize: '0.7rem', fontWeight: 'bold', padding: '0.4rem', cursor: 'pointer'
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.6rem', color: '#888' }}>CURRENT_TIER</span>
                        <span style={{ fontWeight: 900 }}>TIER_0{tower.tier}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.6rem', color: '#888' }}>NEXT_UPGRADE</span>
                        <span style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>{tower.tier < 3 ? `TIER_0${tower.tier + 1}` : 'MAX'}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="upgrade-stat-box" style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', border: '1px solid #333' }}>
                        <div style={{ fontSize: '0.6rem', color: '#888' }}>LETHALITY</div>
                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{Math.floor(tower.getEffectiveDamage())} <span style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem' }}>+50%</span></div>
                    </div>
                    <div className="upgrade-stat-box" style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', border: '1px solid #333' }}>
                        <div style={{ fontSize: '0.6rem', color: '#888' }}>NETWORK_RADIUS</div>
                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>{Math.floor(tower.getEffectiveRange()/40)} <span style={{ color: 'var(--neon-cyan)' }}>+20%</span></div>
                    </div>
                </div>

                {tower.tier < 3 ? (
                    <button 
                        className={`blue-button ${!canAfford ? 'disabled' : ''}`} 
                        onClick={() => towerManager.upgradeSelectedTower()}
                        disabled={!canAfford}
                        style={{ height: '3.2rem', fontSize: '0.9rem', background: canAfford ? 'var(--neon-cyan)' : '#222', color: canAfford ? '#000' : '#444', fontWeight: 900 }}
                    >
                        INITIATE OVERCLOCK ({cost}c)
                    </button>
                ) : (
                    <div style={{ color: 'var(--neon-cyan)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 900, background: 'rgba(0,255,255,0.1)', padding: '1rem' }}>
                        ELITE_STATUS: MAX_CAPACITY_REACHED
                    </div>
                )}

                <button 
                    className="blue-button" 
                    onClick={onClose}
                    style={{ height: '2.2rem', fontSize: '0.75rem', background: '#333' }}
                >
                    RETURN_TO_COMMAND
                </button>

                {/* SELL PROTOCOL */}
                <button 
                    className="blue-button" 
                    onClick={() => {
                        towerManager.sellSelectedTower();
                        onClose();
                    }}
                    style={{ height: '1.8rem', fontSize: '0.7rem', background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', marginTop: '0.5rem' }}
                >
                    [ RECYCLE_UNIT (+{tower.getRefundValue()}c) ]
                </button>
            </div>
        </div>
    );
};
