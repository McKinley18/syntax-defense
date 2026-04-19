import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { MusicManager } from '../systems/MusicManager';

/**
 * SYSTEM DIAGNOSTICS v86.0: Enhanced Operator Interface
 * IMPLEMENTS: Dual-Audio Sliders, Track Selection, and Session Resets.
 */
export const SystemDiagnostics: React.FC = () => {
    const [sfxVolume, setSfxVolume] = useState(AudioManager.getInstance().sfxVolume * 100);
    const [musicVolume, setMusicVolume] = useState(0.35 * 100); // Default from MusicManager
    const [uiScale, setUiScale] = useState(StateManager.instance.uiScale);
    const [skipIntro, setSkipIntro] = useState(StateManager.instance.skipCinematics);
    const [tutEnabled, setTutEnabled] = useState(!StateManager.instance.hasSeenTutorial);
    const [enabledTracks, setEnabledTracks] = useState([...MusicManager.getInstance().enabledTracks]);

    const trackNames = [
        "CORE_LOGIC",
        "NEON_BREACH",
        "LIQUID_DATA",
        "VOID_SIGNAL",
        "GRID_RUNNER"
    ];

    const handleBack = () => {
        AudioManager.getInstance().playUiClick();
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
    };

    const updateSfxVolume = (val: number) => {
        setSfxVolume(val);
        AudioManager.getInstance().sfxVolume = val / 100;
        AudioManager.getInstance().playUiClick();
    };

    const updateMusicVolume = (val: number) => {
        setMusicVolume(val);
        MusicManager.getInstance().setVolume(val / 100);
    };

    const updateScale = (val: number) => {
        setUiScale(val);
        StateManager.instance.setUiScale(val);
    };

    const toggleTrack = (id: number) => {
        MusicManager.getInstance().toggleTrack(id);
        setEnabledTracks([...MusicManager.getInstance().enabledTracks]);
        AudioManager.getInstance().playUiClick();
    };

    const previewTrack = (id: number) => {
        MusicManager.getInstance().previewTrack(id);
        AudioManager.getInstance().playDataChatter();
    };

    const toggleIntro = (val: boolean) => {
        setSkipIntro(val);
        StateManager.instance.skipCinematics = val;
        localStorage.setItem('syndef_skip_cinematics', val ? 'true' : 'false');
        AudioManager.getInstance().playUiClick();
    };

    const resetTutorial = () => {
        StateManager.instance.resetTutorial();
        setTutEnabled(true);
        AudioManager.getInstance().playTerminalCommand();
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
                width: 'min(90vw, 65rem)',
                height: 'min(90vh, 50rem)',
                border: '1px solid #00ffff33', backgroundColor: 'rgba(0,10,25,0.98)',
                display: 'flex', flexDirection: 'column', zIndex: 1, borderRadius: '4px', 
                boxShadow: '0 0 80px rgba(0,0,0,1.0)', overflow: 'hidden'
            }}>
                {/* WINDOW HEADER */}
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#101218' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ffff', opacity: 0.5, fontSize: '0.7rem', fontWeight: 900 }}>ADMIN_DIAGNOSTICS_v1.6_STABLE</span>
                        <span style={{ color: '#444' }}>|</span>
                        <span style={{ fontSize: '0.8rem', color: '#fff', letterSpacing: '1px' }}>SYNTAX_CORE / CONFIGURATION.SYS</span>
                    </div>
                    <button onClick={handleBack} style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', padding: '0.4rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 900 }}>
                        [ EXIT_ADMIN ]
                    </button>
                </div>

                <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* 1. AUDIO KINEMATICS */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                            <h2 style={{ fontSize: '0.9rem', color: '#fff', margin: 0, letterSpacing: '3px', fontWeight: 900 }}>AUDIO_KINEMATICS</h2>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #00ffff33, transparent)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ padding: '1rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 900 }}>SFX_LETHALITY</span>
                                    <span style={{ fontSize: '0.8rem', color: themeColor, fontWeight: 900 }}>{sfxVolume}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={sfxVolume} onChange={(e) => updateSfxVolume(Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: themeColor, cursor: 'pointer' }} />
                            </div>

                            <div style={{ padding: '1rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: '#888', fontWeight: 900 }}>SYNTH_WAVE_AMPLITUDE</span>
                                    <span style={{ fontSize: '0.8rem', color: themeColor, fontWeight: 900 }}>{musicVolume.toFixed(0)}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={musicVolume} onChange={(e) => updateMusicVolume(Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: themeColor, cursor: 'pointer' }} />
                            </div>
                        </div>
                    </section>

                    {/* 2. MUSIC ARCHIVE SELECTION */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                            <h2 style={{ fontSize: '0.9rem', color: '#fff', margin: 0, letterSpacing: '3px', fontWeight: 900 }}>MUSIC_ARCHIVE_SELECTION</h2>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #00ffff33, transparent)' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '1rem' }}>
                            {trackNames.map((name, i) => (
                                <div key={i} style={{ 
                                    padding: '0.8rem', border: '1px solid #00ffff22', background: enabledTracks[i] ? 'rgba(0,255,255,0.05)' : 'rgba(0,0,0,0.4)',
                                    display: 'flex', flexDirection: 'column', gap: '0.6rem'
                                }}>
                                    <div style={{ fontSize: '0.7rem', color: enabledTracks[i] ? '#fff' : '#444', fontWeight: 900, textAlign: 'center' }}>{name}</div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button onClick={() => toggleTrack(i)} style={{
                                            flex: 2, fontSize: '0.6rem', padding: '0.4rem', cursor: 'pointer', fontWeight: 900,
                                            background: enabledTracks[i] ? themeColor : 'transparent', color: enabledTracks[i] ? '#000' : themeColor,
                                            border: `1px solid ${themeColor}`
                                        }}>
                                            {enabledTracks[i] ? 'ENABLED' : 'DISABLED'}
                                        </button>
                                        <button onClick={() => previewTrack(i)} style={{
                                            flex: 1, fontSize: '0.6rem', padding: '0.4rem', cursor: 'pointer', fontWeight: 900,
                                            background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444'
                                        }}>
                                            PREV
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. SYSTEM OVERRIDES */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                            <h2 style={{ fontSize: '0.9rem', color: '#fff', margin: 0, letterSpacing: '3px', fontWeight: 900 }}>SYSTEM_OVERRIDES</h2>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #00ffff33, transparent)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 900, marginBottom: '0.2rem' }}>INTRO_CINEMATICS</span>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>Bypass atmospheric hardware ignition.</span>
                                </div>
                                <button onClick={() => toggleIntro(!skipIntro)} style={{
                                    width: '8rem', height: '2.4rem', background: skipIntro ? themeColor : 'transparent',
                                    border: `1px solid ${themeColor}`, color: skipIntro ? '#000' : themeColor,
                                    fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem'
                                }}>
                                    {skipIntro ? '[ BYPASSED ]' : '[ ACTIVE ]'}
                                </button>
                            </div>

                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 900, marginBottom: '0.2rem' }}>TACTICAL_TUTORIAL</span>
                                    <span style={{ fontSize: '0.6rem', color: '#666' }}>Reset primary training protocols.</span>
                                </div>
                                <button onClick={resetTutorial} style={{
                                    width: '8rem', height: '2.4rem', background: 'transparent',
                                    border: `1px solid #fff`, color: '#fff',
                                    fontWeight: 900, cursor: 'pointer', fontSize: '0.75rem'
                                }}>
                                    [ RESET_EXE ]
                                </button>
                            </div>
                        </div>
                    </section>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleBack} style={{
                            width: '28rem', height: '3.5rem', background: themeColor, color: '#000',
                            border: 'none', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer',
                            letterSpacing: '5px', boxShadow: `0 0 30px ${themeColor}66`
                        }}>
                            SAVE_&_EXIT
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
