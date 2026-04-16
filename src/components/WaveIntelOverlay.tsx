import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';

// Interface to break circular dependency
export interface IIntelWaveManager {
    nextWaveIntel: EnemyType[];
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

    // Count enemy types in next wave
    const counts: Record<number, number> = {};
    waveManager.nextWaveIntel.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
    });

    return (
        <div className="intel-overlay" style={{
            position: 'absolute', inset: 0, zIndex: 40000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)', pointerEvents: 'auto'
        }}>
            <div className="terminal-box" style={{
                width: '28rem', background: 'rgba(0, 10, 25, 0.98)',
                border: '0.15rem solid var(--neon-cyan)', padding: '2rem',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
            }}>
                <div style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', fontWeight: 900, borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '0.5rem', textAlign: 'center' }}>
                    NEXT_WAVE_INTEL [WAVE_{currentWave.toString().padStart(2, '0')}]
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {Object.entries(counts).map(([typeStr, count]) => {
                        const type = Number(typeStr) as EnemyType;
                        const cfg = VISUAL_REGISTRY[type];
                        const color = `#${cfg.color.toString(16).padStart(6, '0')}`;
                        return (
                            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                                <VirusIcon type={type} color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{cfg.name}</span>
                                    <span style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem', fontWeight: 900 }}>x{count}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button 
                    className="blue-button" 
                    onClick={() => waveManager.confirmIntel()}
                    style={{ height: '3rem', fontSize: '1rem', background: 'var(--neon-cyan)', color: '#000', fontWeight: 900 }}
                >
                    ACKNOWLEDGE & READY
                </button>
            </div>
        </div>
    );
};
