import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { MusicManager } from '../systems/MusicManager';

export const SystemDiagnostics: React.FC = () => {
    const [skipCine, setSkipCine] = useState(StateManager.instance.skipCinematics);
    const [volume, setVolume] = useState(50);
    const [performanceMode, setPerformanceMode] = useState(true);

    const toggleSkip = () => {
        const newVal = !skipCine;
        setSkipCine(newVal);
        StateManager.instance.setSkipCinematics(newVal);
    };

    return (
        <div className="system-diagnostics" style={{
            position: 'absolute', inset: 0, zIndex: 100, backgroundColor: '#0a0a0a',
            fontFamily: "'Courier New', Courier, monospace", color: '#00ffff',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <MenuBackground />
            
            <div className="diagnostics-window" style={{
                flex: 1, margin: '2rem', border: '1px solid #00ffff33',
                backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', zIndex: 1
            }}>
                {/* HEADER */}
                <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111' }}>
                    <span style={{ fontWeight: 'bold', letterSpacing: '2px' }}>SYSTEM_DIAGNOSTICS_v2.7</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => {
                                if (StateManager.instance.previousState && (StateManager.instance.previousState === AppState.GAME_PREP || StateManager.instance.previousState === AppState.GAME_WAVE || StateManager.instance.previousState === AppState.WAVE_COMPLETED || StateManager.instance.previousState === AppState.WAVE_PREP || StateManager.instance.previousState === AppState.MAIN_MENU)) {
                                    StateManager.instance.transitionTo(StateManager.instance.previousState);
                                } else {
                                    StateManager.instance.transitionTo(AppState.MAIN_MENU);
                                }
                            }}
                            style={{ background: 'transparent', border: '1px solid #00ffff', color: '#00ffff', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            [ BACK ]
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    
                    {/* BOOT PREFERENCES */}
                    <div style={{ width: '22rem', border: '1px solid #222', padding: '1.5rem', background: '#0d0d0d' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>BOOT_PREFERENCES</div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span>SKIP_CINEMATICS</span>
                            <button 
                                onClick={toggleSkip}
                                style={{ background: skipCine ? '#00ffff' : '#222', color: skipCine ? '#000' : '#444', border: 'none', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 900 }}
                            >
                                {skipCine ? 'ACTIVE' : 'OFF'}
                            </button>
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#444', lineHeight: 1.4 }}>
                            ENABLE TO BYPASS KERNEL POWER-ON AND SYSTEM CHECK SEQUENCES. DIRECT HANDOVER TO MAIN_MENU.
                        </div>
                    </div>

                    {/* AUDIO ARCHITECTURE */}
                    <div style={{ width: '22rem', border: '1px solid #222', padding: '1.5rem', background: '#0d0d0d' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>AUDIO_ARCHITECTURE</div>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>MASTER_VOLUME</span>
                                <span>{volume}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#00ffff' }} />
                        </div>
                    </div>

                    {/* HARDWARE ACCELERATION */}
                    <div style={{ width: '22rem', border: '1px solid #222', padding: '1.5rem', background: '#0d0d0d' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>HARDWARE_OPTIMIZATION</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>PERFORMANCE_MODE</span>
                            <button 
                                onClick={() => setPerformanceMode(!performanceMode)}
                                style={{ background: performanceMode ? '#00ffff' : '#222', color: performanceMode ? '#000' : '#444', border: 'none', padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 900 }}
                            >
                                {performanceMode ? 'ENABLED' : 'STABLE'}
                            </button>
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div style={{ marginTop: 'auto', padding: '1rem 2rem', fontSize: '0.7rem', color: '#333', borderTop: '1px solid #222' }}>
                    SYNDEF_KERNEL_DIAGNOSTIC // BUILD_VERSION: 1.0.4.STABLE // SYSTEM_INTEGRITY: NOMINAL
                </div>
            </div>
        </div>
    );
};
