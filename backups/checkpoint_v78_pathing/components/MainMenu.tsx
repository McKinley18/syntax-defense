import React, { useState, useEffect, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { NeuralBrain } from '../systems/NeuralBrain';

type GlitchMode = 'NONE' | 'WORD_1' | 'WORD_2' | 'SPARSE';

export const MainMenu: React.FC = () => {
    // --- CONDITIONAL INITIALIZATION ---
    const isFromSplash = StateManager.instance.previousState === AppState.STUDIO_SPLASH;
    
    const [isInitialized, setIsInitialized] = useState(!isFromSplash);
    const [showTitle, setShowTitle] = useState(!isFromSplash);
    const [showUI, setShowUI] = useState(!isFromSplash);
    
    const [isGlobalFlickering, setGlobalFlickering] = useState(false); 
    const [glitchMode, setGlitchMode] = useState<GlitchMode>('NONE');
    const [isHardwareFlickering, setHardwareFlickering] = useState(false); 
    
    const [uptime, setUptime] = useState(0);
    const [entropy, setEntropy] = useState(0.042);
    const [vitals, setVitals] = useState<{id: number, text: string, isRed?: boolean}[]>([]);

    useEffect(() => {
        let t1: any, t2: any, t3: any;
        
        if (isFromSplash) {
            t1 = setTimeout(() => {
                setShowTitle(true);
                AudioManager.getInstance().startMusic();
            }, 200);
            t2 = setTimeout(() => setIsInitialized(true), 2200);
            t3 = setTimeout(() => setShowUI(true), 2400);
        } else {
            AudioManager.getInstance().startMusic();
        }

        const utv = setInterval(() => setUptime(prev => prev + 1), 1000);
        const etv = setInterval(() => setEntropy(prev => Math.max(0, prev + (Math.random()*0.01 - 0.005))), 2000);

        const gtv = setInterval(() => {
            if (Math.random() < 0.08) {
                const modes: GlitchMode[] = ['WORD_1', 'WORD_2', 'SPARSE'];
                setGlitchMode(modes[Math.floor(Math.random() * modes.length)]);
                setTimeout(() => setGlitchMode('NONE'), 150);
            }
        }, 9000);

        let flickerTimeout: any;
        const runFlickerBurst = async () => {
            if (!isInitialized) return;
            const burstCount = Math.random() < 0.7 ? 1 : 2;
            for (let i = 0; i < burstCount; i++) {
                setHardwareFlickering(true);
                await new Promise(r => setTimeout(r, 30 + Math.random() * 30));
                setHardwareFlickering(false);
                await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
            }
            const nextInterval = 6000 + Math.random() * 12000;
            flickerTimeout = setTimeout(runFlickerBurst, nextInterval);
        };
        flickerTimeout = setTimeout(runFlickerBurst, 5000);

        return () => {
            if (t1) clearTimeout(t1);
            if (t2) clearTimeout(t2);
            if (t3) clearTimeout(t3);
            clearTimeout(flickerTimeout);
            clearInterval(utv);
            clearInterval(etv);
            clearInterval(gtv);
        };
    }, [isInitialized, isFromSplash]);

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
        AudioManager.getInstance().resume();
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

    const renderGlitchedTitle = () => {
        const base1 = "SYNTAX";
        const base2 = "DEFENSE";
        const symbols = ["∑", "λ", "ø", "X", "∆", "§"];
        const glitchWord = (word: string, chance: number) => {
            return word.split('').map(char => 
                Math.random() < chance ? symbols[Math.floor(Math.random() * symbols.length)] : char
            ).join('');
        };
        if (glitchMode === 'WORD_1') return <>{glitchWord(base1, 0.4)} {base2}</>;
        if (glitchMode === 'WORD_2') return <>{base1} {glitchWord(base2, 0.4)}</>;
        if (glitchMode === 'SPARSE') return <>{glitchWord(base1, 0.15)} {glitchWord(base2, 0.15)}</>;
        return <>{base1} {base2}</>;
    };

    const menuItems = [
        { 
            label: 'INFILTRATE CORE', id: 'INIT', log: 'EXE: NEW_SESSION.BIN', 
            action: () => {
                handleInteraction();
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
            {/* BACKGROUND: Fully synchronized with hardware and global flickering */}
            <div style={{ 
                position: 'absolute', inset: 0, 
                opacity: isInitialized ? (isHardwareFlickering ? 0.94 : 1) : 0, 
                transition: isHardwareFlickering ? 'none' : 'opacity 2.5s ease-in-out', 
                filter: isHardwareFlickering ? 'brightness(0.84)' : 'none',
                pointerEvents: 'none' 
            }}>
                <MenuBackground isFlickering={isHardwareFlickering || isGlobalFlickering} />
            </div>
            
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

            {/* 3. CENTER CONTENT: EXPANDED SCALING */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, paddingTop: 'min(20vh, 10rem)', perspective: '1000px' }}>
                {showTitle && (
                    <div style={{ 
                        transform: 'rotateX(35deg) translateZ(50px)', 
                        transformStyle: 'preserve-3d',
                        animation: isFromSplash ? 'title-entry-3d 2s cubic-bezier(0.1, 0, 0.1, 1) forwards' : 'none'
                    }}>
                        <h1 className={`neon-title-3d ${glitchMode !== 'NONE' ? 'anomaly-glitch' : ''}`} style={{ 
                            fontSize: 'clamp(3rem, 10vw, 5.5rem)', 
                            letterSpacing: '0.5rem', 
                            wordSpacing: '-0.2rem',
                            margin: 0,
                            color: glitchMode !== 'NONE' ? '#ff3300' : '#00ffff', 
                            fontWeight: 900,
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            opacity: isHardwareFlickering ? 0.88 : 1,
                            textShadow: glitchMode !== 'NONE' ? '0 0 15px #ff3300' : `
                                0 0 10px #00ffff,
                                0 0 25px #00ffff,
                                0 5px 3px #008888,
                                0 10px 3px #005555,
                                0 15px 40px rgba(0,0,0,0.8)
                            `,
                            filter: isHardwareFlickering ? 'brightness(0.9) contrast(1.1)' : 'contrast(1.2) brightness(1.2)',
                            transition: 'color 0.1s, text-shadow 0.1s, opacity 0.05s'
                        }}>
                            {renderGlitchedTitle()}
                        </h1>
                    </div>
                )}

                <div style={{
                    marginTop: '-2.5rem',
                    width: '32rem',
                    background: 'rgba(10,12,15,0.99)',
                    border: '1px solid rgba(200,210,220,0.4)',
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.1rem',
                    opacity: showUI ? 1 : 0,
                    transform: `translateY(${showUI ? '0' : '2rem'}) translateZ(0)`,
                    transition: isFromSplash ? 'all 1.2s cubic-bezier(0.2, 0, 0.2, 1)' : 'none',
                    boxShadow: '0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,255,255,0.05)',
                    zIndex: 2
                }}>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(200,210,220,0.6)', marginBottom: '0.8rem', letterSpacing: '3px', borderBottom: '1px solid rgba(200,210,220,0.2)', paddingBottom: '0.5rem', fontWeight: 900 }}>
                        SYSTEM_TERMINAL_V1.6_STABLE
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {menuItems.map((item, idx) => (
                            <button key={item.id} onClick={item.action} disabled={item.disabled}
                                style={{
                                    background: item.primary ? 'rgba(255,255,255,0.03)' : 'transparent', 
                                    border: `1px solid ${item.disabled ? '#222' : 'rgba(200,210,220,0.15)'}`,
                                    color: item.disabled ? '#444' : '#eee', padding: '0.6rem 1.4rem', fontSize: '0.95rem',
                                    cursor: item.disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s ease-out'
                                }}
                                onMouseEnter={(e) => !item.disabled && (e.currentTarget.style.borderColor = '#00ffff', e.currentTarget.style.background = 'rgba(0,255,255,0.08)', e.currentTarget.style.color = '#fff')}
                                onMouseLeave={(e) => !item.disabled && (e.currentTarget.style.borderColor = 'rgba(200,210,220,0.15)', e.currentTarget.style.background = item.primary ? 'rgba(255,255,255,0.03)' : 'transparent', e.currentTarget.style.color = '#eee')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                    <span style={{ opacity: 0.2, fontSize: '0.7rem' }}>[{idx + 1}]</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 900, letterSpacing: '2px' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.55rem', color: '#888', opacity: 0.7 }}>{item.log}</span>
                                    </div>
                                </div>
                                {item.status && <span style={{ fontSize: '0.6rem', color: '#00ffff', border: '1px solid #00ffff33', padding: '0.1rem 0.6rem', fontWeight: 900, opacity: 0.8 }}>{item.status}</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', zIndex: 10, opacity: showUI ? 0.6 : 0, transition: 'opacity 1s' }}>
                {vitals.map((v) => (
                    <div key={v.id} style={{ fontSize: '0.7rem', color: '#00ffff', marginBottom: '0.3rem', letterSpacing: '0.08rem' }}>
                        &gt; {v.text}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes title-entry-3d {
                    from { opacity: 0; transform: rotateX(45deg) translateZ(-100px); filter: blur(20px); }
                    to { opacity: 1; transform: rotateX(35deg) translateZ(50px); filter: blur(0); }
                }
                .neon-title-3d {
                    animation: title-flicker 4s infinite;
                }
                .anomaly-glitch {
                    animation: title-jitter-soft 0.18s infinite;
                    filter: brightness(1.3) !important;
                }
                @keyframes title-jitter-soft {
                    0% { transform: translate(0) rotateX(35deg) translateZ(50px); }
                    33% { transform: translate(-1px, 1px) rotateX(35deg) translateZ(50px); }
                    66% { transform: translate(1px, -1px) rotateX(35deg) translateZ(50px); }
                    100% { transform: translate(0) rotateX(35deg) translateZ(50px); }
                }
                @keyframes title-flicker {
                    0%, 100% { opacity: 1; filter: brightness(1.2); }
                    50% { opacity: 0.95; filter: brightness(1.1); }
                    98% { opacity: 1; }
                    99% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};
