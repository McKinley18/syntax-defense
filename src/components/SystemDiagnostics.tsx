import React, { useState, useEffect } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { MusicManager } from '../systems/MusicManager';

export const SystemDiagnostics: React.FC = () => {
    const [settings, setSettings] = useState({
        crt: localStorage.getItem('syntax_crt_enabled') !== 'false',
        glitch: localStorage.getItem('syntax_glitch_enabled') !== 'false',
        autoPause: localStorage.getItem('syntax_auto_pause') === 'true',
        showRanges: localStorage.getItem('syntax_show_ranges') === 'true',
        skipIntro: localStorage.getItem('syntax_skip_intro') === 'true'
    });

    const [enabledTracks, setEnabledTracks] = useState(MusicManager.getInstance().enabledTracks);

    const toggle = (key: keyof typeof settings) => {
        const newVal = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newVal }));
        localStorage.setItem(`syntax_${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`, String(newVal));
    };

    const toggleTrack = (id: number) => {
        MusicManager.getInstance().toggleTrack(id);
        setEnabledTracks([...MusicManager.getInstance().enabledTracks]);
    };

    const previewTrack = (id: number) => {
        MusicManager.getInstance().previewTrack(id);
    };

    return (
        <div className="system-diagnostics" style={{ 
            backgroundColor: '#0a0a0a', 
            color: '#00ffff', 
            height: '100%', 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Courier New', Courier, monospace",
            position: 'relative',
            overflow: 'hidden'
        }}>
            <MenuBackground />
            
            <div style={{ 
                width: 'min(95%, 65rem)', 
                border: '1px solid #00ffff33', 
                backgroundColor: 'rgba(0,0,0,0.95)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1,
                borderRadius: '4px',
                maxHeight: '90vh'
            }}>
                {/* HEADER */}
                <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111' }}>
                    <span style={{ fontWeight: 'bold', letterSpacing: '2px' }}>SYSTEM_DIAGNOSTICS_v2.7</span>
                    <button 
                        onClick={() => {
                            if (StateManager.instance.previousState && (StateManager.instance.previousState === AppState.GAME_PREP || StateManager.instance.previousState === AppState.GAME_WAVE || StateManager.instance.previousState === AppState.WAVE_COMPLETED || StateManager.instance.previousState === AppState.WAVE_PREP)) {
                                StateManager.instance.transitionTo(StateManager.instance.previousState);
                            } else {
                                StateManager.instance.transitionTo(AppState.MAIN_MENU);
                            }
                        }}
                        style={{ background: 'transparent', border: '1px solid #00ffff', color: '#00ffff', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit', marginRight: '10px' }}
                    >
                        [ BACK ]
                    </button>
                    <button 
                        onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}
                        style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        [ EXIT_TO_ROOT ]
                    </button>
                </div>

                <div style={{ padding: '2rem 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', overflowY: 'auto' }}>
                    {/* INTERFACE MODULE */}
                    <div>
                        <div style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>// INTERFACE_PROTOCOLS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <SettingsToggle label="CRT_SCANLINES" active={settings.crt} onToggle={() => toggle('crt')} />
                            <SettingsToggle label="GLITCH_EFFECTS" active={settings.glitch} onToggle={() => toggle('glitch')} />
                            <SettingsToggle label="AUTO_PAUSE" active={settings.autoPause} onToggle={() => toggle('autoPause')} />
                            <SettingsToggle label="SHOW_RANGES" active={settings.showRanges} onToggle={() => toggle('showRanges')} />
                            <SettingsToggle label="SKIP_CINEMATICS" active={settings.skipIntro} onToggle={() => toggle('skipIntro')} />
                        </div>
                    </div>

                    {/* AUDIO MODULE */}
                    <div>
                        <div style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>// AUDIO_SYNTHESIS_TRACKS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <TrackToggle label="01_CORE_LOGIC" active={enabledTracks[0]} onToggle={() => toggleTrack(0)} onPreview={() => previewTrack(0)} />
                            <TrackToggle label="02_NEON_BREACH" active={enabledTracks[1]} onToggle={() => toggleTrack(1)} onPreview={() => previewTrack(1)} />
                            <TrackToggle label="03_LIQUID_DATA" active={enabledTracks[2]} onToggle={() => toggleTrack(2)} onPreview={() => previewTrack(2)} />
                            <TrackToggle label="04_VOID_SIGNAL" active={enabledTracks[3]} onToggle={() => toggleTrack(3)} onPreview={() => previewTrack(3)} />
                            <TrackToggle label="05_GRID_RUNNER" active={enabledTracks[4]} onToggle={() => toggleTrack(4)} onPreview={() => previewTrack(4)} />
                        </div>
                    </div>

                    {/* SYSTEM DIAGNOSTICS */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>// SYSTEM_HARDWARE_RESET</div>
                        <button 
                            style={{ 
                                width: '100%', padding: '1.2rem', 
                                background: 'transparent', border: '1px solid #ff3300', 
                                color: '#ff3300', cursor: 'pointer', 
                                fontFamily: 'inherit', fontWeight: 'bold' 
                            }}
                            onClick={() => {
                                if(window.confirm("CRITICAL: THIS WILL PURGE ALL LOCAL DATA. PROCEED?")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                        >
                            [ PERFORM_TOTAL_PURGE ]
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsToggle: React.FC<{ label: string, active: boolean, onToggle: () => void }> = ({ label, active, onToggle }) => (
    <button 
        onClick={onToggle}
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 1.2rem',
            background: active ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
            border: `1px solid ${active ? '#00ffff' : '#ff6600'}`,
            color: active ? '#00ffff' : '#ff6600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
            fontSize: '0.85rem'
        }}
    >
        <span>{label}</span>
        <span>{active ? 'DISABLE [ACTIVE]' : 'ENABLE [NULL]'}</span>
    </button>
);

const TrackToggle: React.FC<{ label: string, active: boolean, onToggle: () => void, onPreview: () => void }> = ({ label, active, onToggle, onPreview }) => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
            onClick={onToggle}
            style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 1rem',
                background: active ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                border: `1px solid ${active ? '#00ffff' : '#444'}`,
                color: active ? '#00ffff' : '#444',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.8rem'
            }}
        >
            <span>{label}</span>
            <span>{active ? '[ENABLED]' : '[MUTED]'}</span>
        </button>
        <button 
            onClick={onPreview}
            style={{
                padding: '0.6rem 1rem',
                background: 'transparent',
                border: '1px solid #333',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.8rem'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#00ffff'; e.currentTarget.style.borderColor = '#00ffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#333'; e.currentTarget.style.borderColor = '#333'; }}
        >
            [PREVIEW]
        </button>
    </div>
);
