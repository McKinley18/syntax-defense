import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { MusicManager } from '../systems/MusicManager';
import { AudioManager } from '../systems/AudioManager';

export const SystemDiagnostics: React.FC = () => {
    // SYSTEM STATES
    const [skipCine, setSkipCine] = useState(StateManager.instance.skipCinematics);
    const [hiRes, setHiRes] = useState(StateManager.instance.hiResEnabled);
    const [uiScale, setUiScale] = useState(StateManager.instance.uiScale);
    
    // AUDIO STATES
    const [masterVol, setMasterVol] = useState(AudioManager.getInstance().sfxVolume * 100);
    const [musicVol, setMusicVol] = useState(0.35 * 100);
    const [enabledTracks, setEnabledTracks] = useState([...MusicManager.getInstance().enabledTracks]);

    const handleMasterVolume = (val: number) => {
        setMasterVol(val);
        AudioManager.getInstance().sfxVolume = val / 100;
    };

    const handleMusicVolume = (val: number) => {
        setMusicVol(val);
        MusicManager.getInstance().setVolume(val / 100);
    };

    const handleUiScale = (val: number) => {
        setUiScale(val);
        StateManager.instance.setUiScale(val);
    };

    const toggleTrack = (id: number) => {
        MusicManager.getInstance().toggleTrack(id);
        setEnabledTracks([...MusicManager.getInstance().enabledTracks]);
    };

    const previewTrack = (id: number) => {
        MusicManager.getInstance().previewTrack(id);
    };

    const resetDefaults = () => {
        handleMasterVolume(50);
        handleMusicVolume(35);
        handleUiScale(1.0);
        setHiRes(true);
        setSkipCine(false);
        const allEnabled = new Array(5).fill(true);
        MusicManager.getInstance().enabledTracks = allEnabled;
        setEnabledTracks(allEnabled);
        localStorage.setItem('syntax_enabled_tracks', JSON.stringify(allEnabled));
    };

    const trackNames = [
        "CORE_LOGIC", "NEON_BREACH", "LIQUID_DATA", "VOID_SIGNAL", "GRID_RUNNER"
    ];

    return (
        <div className="system-diagnostics" style={{
            position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#000',
            fontFamily: "'Courier New', Courier, monospace", color: '#00ffff',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <MenuBackground />
            
            <div className="diagnostics-window" style={{
                position: 'relative',
                height: 'calc(100% - 2rem)', // Tighter height
                margin: '1rem auto', // Smaller margin, centered
                width: 'calc(100% - 2rem)', // Width constraint
                maxWidth: '60rem', // Keep centered
                border: '0.06rem solid #00ffff33',
                backgroundColor: 'rgba(0,0,0,0.95)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1,
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
            }}>
                {/* HEADER - Compact */}
                <div style={{ flexShrink: 0, padding: '0.8rem 1.5rem', borderBottom: '0.06rem solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '900', letterSpacing: '2px', fontSize: '1rem' }}>SYSTEM_CORE_CALIBRATION</span>
                        <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>AUTHORITATIVE_PREFERENCE_OVERRIDE_V3.1</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={resetDefaults} style={{ background: 'transparent', border: '0.06rem solid #444', color: '#888', padding: '0.4rem 0.8rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.7rem' }}>
                            [ RESET ]
                        </button>
                        <button 
                            onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}
                            style={{ background: '#00ffff', border: 'none', color: '#000', padding: '0.4rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold', fontSize: '0.8rem' }}
                        >
                            COMMIT
                        </button>
                    </div>
                </div>

                {/* CONTENT BODY - Tighter Gaps */}
                <div className="custom-scrollbar" style={{ 
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(17rem, 1fr))', // Narrower modules
                    gap: '1.2rem',
                    alignContent: 'start'
                }}>
                    
                    {/* AUDIO ARCHITECTURE */}
                    <section className="settings-module">
                        <div className="module-header">AUDIO_SIGNAL_ROUTING</div>
                        <div className="setting-item">
                            <div className="label-row"><span>MASTER_GAIN</span><span>{masterVol}%</span></div>
                            <input type="range" min="0" max="100" value={masterVol} onChange={(e) => handleMasterVolume(parseInt(e.target.value))} />
                        </div>
                        <div className="setting-item">
                            <div className="label-row"><span>NEURAL_MUSIC</span><span>{musicVol}%</span></div>
                            <input type="range" min="0" max="100" value={musicVol} onChange={(e) => handleMusicVolume(parseInt(e.target.value))} />
                        </div>
                    </section>

                    {/* NEURAL TRACK SELECTION */}
                    <section className="settings-module">
                        <div className="module-header">NEURAL_TRACK_MANIFEST</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {trackNames.map((name, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '0.4rem 0.8rem', border: '1px solid #1a1a1a' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div 
                                            onClick={() => toggleTrack(i)}
                                            style={{ width: '10px', height: '12px', border: '1px solid #00ffff', background: enabledTracks[i] ? '#00ffff' : 'transparent', cursor: 'pointer' }}
                                        ></div>
                                        <span style={{ fontSize: '0.7rem', color: enabledTracks[i] ? '#fff' : '#444' }}>{name}</span>
                                    </div>
                                    <button onClick={() => previewTrack(i)} style={{ background: 'transparent', border: 'none', color: '#00ff66', fontSize: '0.55rem', cursor: 'pointer' }}>[ PREVIEW ]</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* INTERFACE & RENDER */}
                    <section className="settings-module">
                        <div className="module-header">INTERFACE_&_RENDER</div>
                        <div className="toggle-row">
                            <div className="label-col"><span>HI_RES_MODE</span><span className="sublabel">SYNC_DPR</span></div>
                            <button onClick={() => {
                                const newVal = !hiRes;
                                setHiRes(newVal);
                                StateManager.instance.setHiRes(newVal);
                            }} className={hiRes ? 'btn-active' : 'btn-off'}>{hiRes ? 'ON' : 'OFF'}</button>
                        </div>
                        <div className="setting-item" style={{ marginTop: '1rem' }}>
                            <div className="label-row"><span>UI_SCALE</span><span>{uiScale.toFixed(2)}x</span></div>
                            <input type="range" min="0.8" max="1.4" step="0.05" value={uiScale} onChange={(e) => handleUiScale(parseFloat(e.target.value))} />
                        </div>
                        <div className="setting-item" style={{ marginTop: '1rem' }}>
                            <div className="label-row"><span>GRID_OPACITY</span><span>{Math.round(StateManager.instance.gridOpacity * 100)}%</span></div>
                            <input type="range" min="0" max="1" step="0.1" value={StateManager.instance.gridOpacity} onChange={(e) => {
                                StateManager.instance.gridOpacity = parseFloat(e.target.value);
                                // Force a re-render of this component to update the percentage display
                                setUiScale(uiScale); 
                            }} />
                        </div>
                    </section>

                    {/* CORE PROTOCOLS */}
                    <section className="settings-module">
                        <div className="module-header">CORE_PROTOCOLS</div>
                        <div className="toggle-row">
                            <div className="label-col"><span>SKIP_CINE</span><span className="sublabel">BYPASS_BOOT</span></div>
                            <button onClick={() => {
                                const newVal = !skipCine;
                                setSkipCine(newVal);
                                StateManager.instance.setSkipCinematics(newVal);
                            }} className={skipCine ? 'btn-danger' : 'btn-off'}>{skipCine ? 'ON' : 'OFF'}</button>
                        </div>
                        <div className="toggle-row">
                            <div className="label-col"><span>TUTORIAL</span><span className="sublabel">RESET_FLAG</span></div>
                            <button onClick={() => { StateManager.instance.resetTutorial(); alert("RESET_OK"); }} className="btn-off" style={{ color: '#00ff66' }}>RESET</button>
                        </div>
                    </section>

                </div>

                {/* FOOTER - Compact */}
                <div style={{ flexShrink: 0, padding: '0.8rem 1.5rem', fontSize: '0.65rem', color: '#444', borderTop: '0.06rem solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050505' }}>
                    <span>SYNDEF_KERNEL_DIAGNOSTIC // STATUS: STABLE</span>
                    <span style={{ opacity: 0.6 }}>1.1.0_PRO // C_MCKINLEY</span>
                </div>
            </div>

            <style>{`
                .settings-module { 
                    border: 1px solid #1a1a1a; padding: 1rem; 
                    background: linear-gradient(180deg, #0d0d0d 0%, #050505 100%);
                }
                .settings-module:hover { border-color: #00ffff33; }
                .module-header { font-size: 0.75rem; font-weight: bold; margin-bottom: 1.2rem; color: #00ffff; border-left: 3px solid #00ffff; padding-left: 8px; }
                .setting-item { margin-bottom: 1rem; }
                .label-row { display: flex; justifyContent: space-between; margin-bottom: 0.4rem; font-size: 0.8rem; }
                .toggle-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
                .label-col { display: flex; flex-direction: column; }
                .sublabel { font-size: 0.55rem; color: #444; }
                
                button { cursor: pointer; transition: all 0.2s; }
                .btn-active { background: #00ffff; color: #000; border: none; padding: 0.3rem 0.8rem; font-weight: bold; min-width: 4rem; font-size: 0.7rem; }
                .btn-off { background: #111; color: #444; border: 1px solid #222; padding: 0.3rem 0.8rem; font-weight: bold; min-width: 4rem; font-size: 0.7rem; }
                .btn-danger { background: #ff3300; color: #fff; border: none; padding: 0.3rem 0.8rem; font-weight: bold; min-width: 4rem; font-size: 0.7rem; }

                input[type=range] { -webkit-appearance: none; background: transparent; width: 100%; }
                input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; background: #1a1a1a; }
                input[type=range]::-webkit-slider-thumb { height: 14px; width: 14px; background: #00ffff; -webkit-appearance: none; margin-top: -5px; }

                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
            `}</style>
        </div>
    );
};
