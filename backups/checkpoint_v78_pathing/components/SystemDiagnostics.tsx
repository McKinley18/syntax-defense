import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';

/**
 * SYSTEM DIAGNOSTICS v52.0: Industrial Admin Interface
 * Refined to match System Archive theme with windowed architecture and atmospheric depth.
 */
export const SystemDiagnostics: React.FC = () => {
    const [volume, setVolume] = useState(AudioManager.getInstance().sfxVolume * 100);
    const [uiScale, setUiScale] = useState(StateManager.instance.uiScale);
    const [skipIntro, setSkipIntro] = useState(StateManager.instance.skipCinematics);
    const [tutEnabled, setTutEnabled] = useState(!StateManager.instance.hasSeenTutorial);

    const handleBack = () => {
        AudioManager.getInstance().playUiClick();
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
    };

    const updateVolume = (val: number) => {
        setVolume(val);
        AudioManager.getInstance().sfxVolume = val / 100;
        AudioManager.getInstance().playUiClick();
    };

    const updateScale = (val: number) => {
        setUiScale(val);
        StateManager.instance.setUiScale(val);
    };

    const toggleIntro = (val: boolean) => {
        setSkipIntro(val);
        StateManager.instance.skipCinematics = val;
        localStorage.setItem('syndef_skip_cinematics', val ? 'true' : 'false');
        AudioManager.getInstance().playUiClick();
    };

    const toggleTutorial = (val: boolean) => {
        setTutEnabled(val);
        StateManager.instance.hasSeenTutorial = !val;
        if (val) {
            localStorage.removeItem('syndef_tutorial_v19');
        } else {
            localStorage.setItem('syndef_tutorial_v19', 'true');
        }
        AudioManager.getInstance().playUiClick();
    };

    const themeColor = 'var(--neon-cyan)';

    return (
        <div className="system-diagnostics" style={{
            position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#000',
            display: 'flex', fontFamily: "'Courier New', Courier, monospace",
            alignItems: 'center', justifyContent: 'center'
        }}>
            <MenuBackground />
            
            <div style={{ 
                position: 'absolute', inset: '4rem', 
                border: '1px solid #00ffff33', backgroundColor: 'rgba(0,10,25,0.96)',
                display: 'flex', flexDirection: 'column', zIndex: 1, borderRadius: '4px', 
                boxShadow: '0 0 60px rgba(0,0,0,0.9)', overflow: 'hidden', maxWidth: '55rem', maxHeight: '42rem'
            }}>
                {/* WINDOW HEADER */}
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#151515' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ffff', opacity: 0.5, fontSize: '0.7rem' }}>ADMIN_DIAGNOSTICS_v1.4</span>
                        <span style={{ color: '#444' }}>|</span>
                        <span style={{ fontSize: '0.8rem', color: '#fff', letterSpacing: '1px' }}>SYSTEM_CORE / CONFIGURATION.SYS</span>
                    </div>
                    <button 
                        onClick={handleBack}
                        style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', padding: '0.4rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 900 }}
                    >
                        [ EXIT_ADMIN ]
                    </button>
                </div>

                <div style={{ flex: 1, padding: '3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    {/* SECTION: HARDWARE CALIBRATION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '4rem', height: '1px', background: 'linear-gradient(to right, transparent, #00ffff)' }} />
                            <h2 style={{ fontSize: '1rem', color: '#fff', margin: 0, letterSpacing: '3px', fontWeight: 900 }}>HARDWARE_CALIBRATION</h2>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #00ffff, transparent)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 900 }}>AUDIO_LETHALITY_LEVEL</span>
                                    <span style={{ fontSize: '0.8rem', color: themeColor, fontWeight: 900 }}>{volume}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={volume} onChange={(e) => updateVolume(Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: themeColor, cursor: 'pointer' }} />
                            </div>

                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 900 }}>INTERFACE_RENDER_SCALE</span>
                                    <span style={{ fontSize: '0.8rem', color: themeColor, fontWeight: 900 }}>{uiScale.toFixed(1)}x</span>
                                </div>
                                <input type="range" min="0.8" max="1.5" step="0.1" value={uiScale} onChange={(e) => updateScale(Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: themeColor, cursor: 'pointer' }} />
                            </div>
                        </div>
                    </section>

                    {/* SECTION: SUBSYSTEM OVERRIDES */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '4rem', height: '1px', background: 'linear-gradient(to right, transparent, #00ffff)' }} />
                            <h2 style={{ fontSize: '1rem', color: '#fff', margin: 0, letterSpacing: '3px', fontWeight: 900 }}>SUBSYSTEM_OVERRIDES</h2>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #00ffff, transparent)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div style={{ padding: '1.5rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 900, marginBottom: '0.2rem' }}>INTRO_CINEMATICS</span>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>Bypass atmospheric hardware ignition.</span>
                                </div>
                                <button onClick={() => toggleIntro(!skipIntro)} style={{
                                    width: '8rem', height: '2.4rem', background: skipIntro ? themeColor : 'transparent',
                                    border: `1px solid ${themeColor}`, color: skipIntro ? '#000' : themeColor,
                                    fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s'
                                }}>
                                    {skipIntro ? '[ BYPASSED ]' : '[ ACTIVE ]'}
                                </button>
                            </div>

                            <div style={{ padding: '1.5rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 900, marginBottom: '0.2rem' }}>TACTICAL_TUTORIAL</span>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>Primary training overlay deployment.</span>
                                </div>
                                <button onClick={() => toggleTutorial(!tutEnabled)} style={{
                                    width: '8rem', height: '2.4rem', background: tutEnabled ? themeColor : 'transparent',
                                    border: `1px solid ${themeColor}`, color: tutEnabled ? '#000' : themeColor,
                                    fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s'
                                }}>
                                    {tutEnabled ? '[ ACTIVE ]' : '[ SUPPRESSED ]'}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* FOOTER ACTION */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleBack} style={{
                            width: '24rem', height: '3.5rem', background: themeColor, color: '#000',
                            border: 'none', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer',
                            letterSpacing: '5px', boxShadow: `0 0 30px ${themeColor}44`,
                            transition: 'transform 0.1s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            COMMIT_CHANGES_&_EXIT
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .system-diagnostics::after { content: \" \"; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 2px, 3px 100%; z-index: 5; pointer-events: none; }
                input[type=range] { appearance: none; background: #111; height: 4px; border-radius: 2px; }
                input[type=range]::-webkit-slider-thumb { appearance: none; height: 16px; width: 8px; background: var(--neon-cyan); border: 1px solid #fff; cursor: pointer; box-shadow: 0 0 10px var(--neon-cyan); }
            `}</style>
        </div>
    );
};
