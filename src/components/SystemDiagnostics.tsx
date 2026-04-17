import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { AudioManager } from '../systems/AudioManager';

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
    };

    const updateScale = (val: number) => {
        setUiScale(val);
        StateManager.instance.setUiScale(val);
    };

    const toggleIntro = (val: boolean) => {
        setSkipIntro(val);
        // Direct Preference Update
        StateManager.instance.skipCinematics = val;
        localStorage.setItem('syndef_skip_cinematics', val ? 'true' : 'false');
    };

    const toggleTutorial = (val: boolean) => {
        setTutEnabled(val);
        // Logic match with recordTutorialSeen
        StateManager.instance.hasSeenTutorial = !val;
        if (val) {
            localStorage.removeItem('syndef_tutorial_v19');
        } else {
            localStorage.setItem('syndef_tutorial_v19', 'true');
        }
    };

    return (
        <div style={{
            backgroundColor: '#050505', color: '#00ffff', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', position: 'relative'
        }}>
            <div className="terminal-box" style={{
                width: '32rem', padding: '2rem', background: 'rgba(0,10,25,0.95)',
                border: '0.15rem solid var(--neon-cyan)', boxShadow: '0 0 40px rgba(0,255,255,0.2)'
            }}>
                <h1 style={{ fontSize: '1.4rem', marginBottom: '2rem', borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '0.5rem' }}>
                    SYSTEM_DIAGNOSTICS
                </h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>AUDIO_LEVEL: {volume}%</span>
                        <input type="range" min="0" max="100" value={volume} onChange={(e) => updateVolume(Number(e.target.value))} style={{ width: '12rem' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>INTERFACE_SCALE: {uiScale.toFixed(1)}x</span>
                        <input type="range" min="0.8" max="1.5" step="0.1" value={uiScale} onChange={(e) => updateScale(Number(e.target.value))} style={{ width: '12rem' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>INTRO_CINEMATIC:</span>
                        <button onClick={() => toggleIntro(!skipIntro)} style={{
                            width: '12rem', height: '2rem', background: skipIntro ? 'transparent' : 'var(--neon-cyan)',
                            border: '1px solid var(--neon-cyan)', color: skipIntro ? 'var(--neon-cyan)' : '#000',
                            fontWeight: 900, cursor: 'pointer'
                        }}>
                            {skipIntro ? '[ BYPASS ]' : '[ ENABLED ]'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>TACTICAL_TUTORIAL:</span>
                        <button onClick={() => toggleTutorial(!tutEnabled)} style={{
                            width: '12rem', height: '2rem', background: tutEnabled ? 'var(--neon-cyan)' : 'transparent',
                            border: '1px solid var(--neon-cyan)', color: tutEnabled ? '#000' : 'var(--neon-cyan)',
                            fontWeight: 900, cursor: 'pointer'
                        }}>
                            {tutEnabled ? '[ ACTIVE ]' : '[ SUPPRESSED ]'}
                        </button>
                    </div>
                </div>

                <button onClick={handleBack} className="blue-button" style={{ marginTop: '2.5rem', height: '3rem', fontSize: '1.1rem', background: 'var(--neon-cyan)', color: '#000', border: 'none', letterSpacing: '2px' }}>
                    SAVE & EXIT
                </button>
            </div>
        </div>
    );
};
