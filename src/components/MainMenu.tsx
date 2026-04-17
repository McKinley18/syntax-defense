import React, { useState, useEffect, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { NeuralBrain } from '../systems/NeuralBrain';

export const MainMenu: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [showUI, setShowUI] = useState(false);
    const [isGlobalFlickering, setGlobalFlickering] = useState(false);
    const [isTitleGlitched, setIsTitleGlitched] = useState(false);
    
    const [uptime, setUptime] = useState(0);
    const [entropy, setEntropy] = useState(0.042);
    const [vitals, setVitals] = useState<{id: number, text: string, isRed?: boolean}[]>([]);

    useEffect(() => {
        // --- ATMOSPHERIC IGNITION TIMELINE ---
        const t1 = setTimeout(() => {
            setShowTitle(true);
            AudioManager.getInstance().startMusic();
        }, 200);
        const t2 = setTimeout(() => setIsInitialized(true), 2200);
        const t3 = setTimeout(() => setShowUI(true), 2400);

        const utv = setInterval(() => setUptime(prev => prev + 1), 1000);
        const etv = setInterval(() => setEntropy(prev => Math.max(0, prev + (Math.random()*0.01 - 0.005))), 2000);

        return () => {
            [t1, t2, t3].forEach(clearTimeout);
            clearInterval(utv);
            clearInterval(etv);
        };
    }, []);

    useEffect(() => {
        if (!showUI) return;
        const itv = setInterval(() => {
            const logs = ["MEM_SYNC: OK", "NET_ACK: OK", "CPU_STABLE", "IO_BRIDGE_READY", "KERN_LINK: 1", "CRYPT_V: SECURE"];
            const text = logs[Math.floor(Math.random() * logs.length)];
            setVitals(prev => [...prev.slice(-4), { id: Date.now(), text }]);
        }, 1200);
        return () => clearInterval(itv);
    }, [showUI]);

    const handleInteraction = () => {
        AudioManager.getInstance().playUiClick();
        setGlobalFlickering(true);
        setTimeout(() => setGlobalFlickering(false), 80);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const menuItems = [
        { 
            label: 'INFILTRATE CORE', id: 'INIT', log: 'EXE: NEW_SESSION.BIN', 
            action: () => {
                handleInteraction();
                // --- NEURAL BRAIN ACTIVATION ---
                NeuralBrain.getInstance().initializeSession();
                
                StateManager.instance.resetSession();
                const hasSeenTutorial = localStorage.getItem('syndef_tutorial_v19');
                if (hasSeenTutorial) {
                    StateManager.instance.currentWave = 1;
                    StateManager.instance.transitionTo(AppState.WAVE_COMPLETED);
                } else {
                    StateManager.instance.transitionTo(AppState.GAME_PREP);
                }
            }, 
            primary: true, status: 'NEW'
        },
        { 
            label: 'RESUME SESSION', id: 'RESUME', log: 'EXE: RESTORE_ARCHIVE.BIN', 
            action: () => { 
                handleInteraction();
                const data = StateManager.instance.loadGame();
                if (data) StateManager.instance.transitionTo(AppState.GAME_PREP);
            },
            status: StateManager.instance.hasSaveData() ? 'SAFE' : 'NULL',
            disabled: !StateManager.instance.hasSaveData()
        },
        { label: 'SYSTEM ARCHIVE', id: 'ARCHIVE', log: 'DB: FETCH_VIRAL_INTEL', action: () => StateManager.instance.transitionTo(AppState.ARCHIVE) },
        { label: 'SYSTEM DIAGNOSTICS', id: 'DIAG', log: 'BIN: CONFIG_PREFS', action: () => StateManager.instance.transitionTo(AppState.DIAGNOSTICS) }
    ];

    return (
        <div className="main-menu" style={{ 
            backgroundColor: '#000', color: '#00ffff', height: '100%', width: '100%', 
            display: 'flex', flexDirection: 'column', fontFamily: "'Courier New', Courier, monospace", 
            position: 'relative', overflow: 'hidden' 
        }}>
            
            {/* 1. NEURAL BACKGROUND */}
            <div style={{ position: 'absolute', inset: 0, opacity: isInitialized ? 1 : 0, transition: 'opacity 2.5s ease-in-out', pointerEvents: 'none' }}>
                <MenuBackground isFlickering={isGlobalFlickering} />
            </div>
            
            {/* 2. SYSTEM VITALS */}
            <div style={{ opacity: showUI ? 0.8 : 0, transition: 'opacity 1.5s ease-out' }}>
                <div style={{ position: 'absolute', top: '1.2rem', left: '2.0rem', zIndex: 10, color: '#00ffff', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ARCHITECT @ SYNTAX_CORE:~/ROOT$
                </div>
                <div style={{ position: 'absolute', top: '1.2rem', right: '2.0rem', zIndex: 10, textAlign: 'right', fontSize: '0.75rem' }}>
                    <div>UPTIME: {formatTime(uptime)}</div>
                    <div>ENTROPY: {entropy.toFixed(3)}%</div>
                    <div>THREAT_LEVEL: <span style={{ color: '#00ff66', fontWeight: 900 }}>NOMINAL</span></div>
                </div>
            </div>

            {/* 3. CENTER CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, paddingTop: 'min(10vh, 5rem)' }}>
                {showTitle && (
                    <h1 className={`menu-title-2d ${isTitleGlitched ? 'anomaly-glitch' : ''}`} style={{ 
                        fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', 
                        letterSpacing: '0.15rem', 
                        margin: 0,
                        color: '#00ffff', 
                        fontWeight: 900,
                        textShadow: '0 0 1.5rem rgba(0,255,255,0.4)',
                        animation: 'title-entry-2d 1.5s cubic-bezier(0.2, 0, 0.2, 1) forwards'
                    }}>
                        SYNTAX DEFENSE
                    </h1>
                )}

                {/* THE COMPACT 2D COMMAND WINDOW */}
                <div style={{
                    marginTop: '1rem',
                    width: '28rem',
                    background: 'rgba(0,0,0,0.92)',
                    border: '1px solid rgba(0,255,255,0.15)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.1rem',
                    opacity: showUI ? 1 : 0,
                    transform: `translateY(${showUI ? '0' : '2rem'})`,
                    transition: 'all 1.2s cubic-bezier(0.2, 0, 0.2, 1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    zIndex: 2
                }}>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(0,255,255,0.4)', marginBottom: '0.6rem', letterSpacing: '2px', borderBottom: '1px solid rgba(0,255,255,0.1)', paddingBottom: '0.4rem' }}>
                        COMMAND_INTERFACE_V1.5
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map((item, idx) => (
                            <button key={item.id} onClick={item.action} disabled={item.disabled}
                                style={{
                                    background: item.primary ? 'rgba(0,255,255,0.08)' : 'transparent', 
                                    border: `1px solid ${item.disabled ? '#222' : 'rgba(0,255,255,0.1)'}`,
                                    color: item.disabled ? '#444' : '#fff', padding: '0.6rem 1.2rem', fontSize: '0.9rem',
                                    cursor: item.disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s ease-out'
                                }}
                                onMouseEnter={(e) => !item.disabled && (e.currentTarget.style.borderColor = '#00ffff', e.currentTarget.style.background = 'rgba(0,255,255,0.12)')}
                                onMouseLeave={(e) => !item.disabled && (e.currentTarget.style.borderColor = 'rgba(0,255,255,0.1)', e.currentTarget.style.background = item.primary ? 'rgba(0,255,255,0.08)' : 'transparent')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ opacity: 0.3, fontSize: '0.65rem' }}>0{idx + 1}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 900, letterSpacing: '2px' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.5rem', color: '#00ffff', opacity: 0.5 }}>{item.log}</span>
                                    </div>
                                </div>
                                {item.status && <span style={{ fontSize: '0.6rem', color: '#00ffff', border: '1px solid #00ffff44', padding: '0.1rem 0.5rem', fontWeight: 900 }}>{item.status}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. NEURAL LOGS */}
            <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', zIndex: 10, opacity: showUI ? 0.6 : 0, transition: 'opacity 1s' }}>
                {vitals.map((v) => (
                    <div key={v.id} style={{ fontSize: '0.7rem', color: '#00ffff', marginBottom: '0.3rem', letterSpacing: '0.08rem' }}>
                        &gt; {v.text}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes title-entry-2d {
                    from { opacity: 0; transform: scale(0.95) translateY(2rem); filter: blur(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
                }
            `}</style>
        </div>
    );
};
