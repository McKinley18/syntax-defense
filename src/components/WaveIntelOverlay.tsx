import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { AudioManager } from '../systems/AudioManager';

export interface IIntelWaveManager {
    nextWaveIntel: { type: EnemyType, mult: number }[];
    confirmIntel(): void;
}

const VirusIcon = ({ type, color }: { type: EnemyType, color: string }) => {
    switch(type) {
        case EnemyType.GLIDER: return <svg viewBox="0 0 20 20" width="24" height="24"><path d="M10 2 L18 16 L10 13 L2 16 Z" fill={color} /></svg>;
        case EnemyType.STRIDER: return <svg viewBox="0 0 20 20" width="24" height="24"><path d="M10 2 L17 6 V14 L10 18 L3 14 V6 Z" fill={color} /></svg>;
        case EnemyType.BEHEMOTH: return <svg viewBox="0 0 20 20" width="24" height="24"><rect x="4" y="4" width="12" height="12" fill={color} transform="rotate(45 10 10)" /></svg>;
        case EnemyType.FRACTAL: return <svg viewBox="0 0 20 20" width="24" height="24"><path d="M4 10 H16 M10 4 V16 M6 6 L14 14 M14 6 L6 14" stroke={color} strokeWidth="2" /></svg>;
        case EnemyType.PHANTOM: return <svg viewBox="0 0 20 20" width="24" height="24"><circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1" strokeDasharray="2,2" fill="none" /><circle cx="10" cy="10" r="2" fill={color} /></svg>;
        case EnemyType.WORM: return <svg viewBox="0 0 20 20" width="24" height="24"><rect x="4" y="2" width="12" height="16" rx="2" fill={color} /></svg>;
        default: return null;
    }
};

export const WaveIntelOverlay: React.FC<{ waveManager: IIntelWaveManager }> = ({ waveManager }) => {
    const [state, setState] = useState(StateManager.instance.currentState);
    const [currentWave, setCurrentWave] = useState(StateManager.instance.currentWave);

    useEffect(() => {
        const itv = setInterval(() => {
            setState(StateManager.instance.currentState);
            setCurrentWave(StateManager.instance.currentWave);
        }, 100);
        return () => clearInterval(itv);
    }, []);

    if (state !== AppState.WAVE_COMPLETED) return null;

    const counts: Record<number, number> = {};
    waveManager.nextWaveIntel.forEach(entry => {
        const type = entry.type;
        counts[type] = (counts[type] || 0) + 1;
    });

    const s = StateManager.instance;
    const isFirstWave = currentWave === 1 && s.wavePurgedCount === 0 && s.waveCreditsEarned === 0;

    return (
        <div className="intel-overlay" style={{
            position: 'absolute', inset: 0, zIndex: 40000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)', pointerEvents: 'auto', backdropFilter: 'blur(10px)'
        }}>
            <div className="terminal-box" style={{
                width: '32rem', background: 'rgba(0, 10, 25, 0.98)',
                border: '0.15rem solid var(--neon-cyan)', padding: '2rem',
                boxShadow: '0 0 60px rgba(0, 255, 255, 0.15)',
                display: 'flex', flexDirection: 'column', gap: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', opacity: 0.8 }}>
                        &gt; {isFirstWave ? "INITIAL_INFILTRATION_INTEL" : `PREVIOUS_OPERATION_REPORT [WAVE_${currentWave - 1}]`}
                    </div>
                    <button 
                        onClick={() => { AudioManager.getInstance().playUiClick(); s.abortSession(); }}
                        style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', fontSize: '0.65rem', padding: '0.2rem 0.6rem', cursor: 'pointer' }}
                    >
                        [ ABORT_MISSION ]
                    </button>
                </div>

                {!isFirstWave && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid #222' }}>
                            <div style={{ fontSize: '0.55rem', color: '#666', marginBottom: '4px' }}>UNITS_PURGED</div>
                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 900 }}>{s.wavePurgedCount} <span style={{ fontSize: '0.7rem', color: '#444' }}>NODES</span></div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid #222' }}>
                            <div style={{ fontSize: '0.55rem', color: '#666', marginBottom: '4px' }}>DATA_HARVESTED</div>
                            <div style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)', fontWeight: 900 }}>{s.waveCreditsEarned}c</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid #222' }}>
                            <div style={{ fontSize: '0.55rem', color: '#666', marginBottom: '4px' }}>INTEREST_ACCRUED</div>
                            <div style={{ fontSize: '1.2rem', color: '#00ff66', fontWeight: 900 }}>+{s.lastWaveInterest}c</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid #222' }}>
                            <div style={{ fontSize: '0.55rem', color: '#666', marginBottom: '4px' }}>RECONSTRUCTION_GRANT</div>
                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 900 }}>+{s.lastWaveBonus}c</div>
                        </div>
                    </div>
                )}

                <div>
                    <div style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px', marginBottom: '0.8rem', opacity: 0.8 }}>
                        &gt; UPCOMING_THREAT_PROJECTION [WAVE_{currentWave}]
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        {Object.entries(counts).map(([typeStr, count]) => {
                            const type = Number(typeStr) as EnemyType;
                            const cfg = VISUAL_REGISTRY[type];
                            if (!cfg) return null;
                            const color = `#${cfg.color.toString(16).padStart(6, '0')}`;
                            return (
                                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,255,255,0.03)', padding: '10px', border: '1px solid #00ffff11' }}>
                                    <VirusIcon type={type} color={color} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{cfg.name}</span>
                                        <span style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem', fontWeight: 900 }}>x{count}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button 
                    className="blue-button" 
                    onClick={() => { AudioManager.getInstance().playUiClick(); waveManager.confirmIntel(); }}
                    style={{ height: '3.5rem', fontSize: '1.1rem', background: 'var(--neon-cyan)', color: '#000', fontWeight: 900, letterSpacing: '2px', border: 'none', cursor: 'pointer' }}
                >
                    AUTHORIZE_REBUILD
                </button>
            </div>
        </div>
    );
};
