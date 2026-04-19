import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { NeuralBrain } from '../systems/NeuralBrain';

/**
 * MAIN MENU v99.25: User Session Tracking
 * DESIGN: Sequential Branding Reveal + Real-time Infiltration Timer.
 */
export const MainMenu: React.FC = () => {
    const [showBranding, setShowBranding] = useState(false);
    const [showUI, setShowUI] = useState(false);
    const [uptime, setUptime] = useState(0); // USER_SESSION_TIMER
    const [entropy, setEntropy] = useState(0.042);
    const [kernelLogs, setKernelLogs] = useState<string[]>(["INIT_KERNEL_LINK...", "MOUNTING_FS_SECTORS...", "NEURAL_READY"]);
    const [isGlitched, setIsGlitched] = useState(false);
    const [glitchedText, setGlitchedText] = useState("SYNTAX DEFENSE");
    
    const titleRef = useRef<HTMLHeadingElement>(null);
    const isFromSplash = StateManager.instance.previousState === AppState.STUDIO_SPLASH;

    const handleSyncMirror = useCallback((alpha: number) => {
        if (titleRef.current) {
            titleRef.current.style.opacity = alpha.toString();
            const activeColor = isGlitched ? '#ff3300' : 'var(--neon-cyan)';
            const shadowColor = isGlitched ? '#880000' : '#008888';
            const blockShadow = `0 1px 0 ${shadowColor}, 0 2px 0 ${shadowColor}, 0 3px 0 ${shadowColor}, 0 4px 0 ${shadowColor}, 0 8px 15px rgba(0,0,0,0.8)`;
            const neonGlow = `0 0 15px ${activeColor}, 0 0 30px ${activeColor}`;
            if (alpha < 0.9) {
                titleRef.current.style.textShadow = `${blockShadow}, 0 0 8px ${activeColor}`;
            } else {
                titleRef.current.style.textShadow = `${blockShadow}, ${neonGlow}`;
            }
            titleRef.current.style.color = isGlitched ? '#ff3300' : 'var(--neon-cyan)';
        }
    }, [isGlitched]);

    useEffect(() => {
        let t1 = setTimeout(() => setShowBranding(true), isFromSplash ? 400 : 50);
        let t2 = setTimeout(() => {
            setShowUI(true);
            AudioManager.getInstance().startMusic();
        }, isFromSplash ? 2200 : 200); 

        // --- SESSION UPTIME CLOCK ---
        const utv = setInterval(() => setUptime(prev => prev + 1), 1000);
        const etv = setInterval(() => setEntropy(prev => Math.max(0, prev + (Math.random()*0.01 - 0.005))), 2000);

        const runGlitch = async () => {
            const symbols = "!@#$%&*<>[]{}01";
            const original = "SYNTAX DEFENSE";
            setIsGlitched(true);
            AudioManager.getInstance().playDataChatter();
            const scrambled = original.split('').map(char => {
                if (char === ' ') return ' ';
                return Math.random() < 0.25 ? symbols[Math.floor(Math.random() * symbols.length)] : char;
            }).join('');
            setGlitchedText(scrambled);
            await new Promise(r => setTimeout(r, 60 + Math.random() * 60));
            setIsGlitched(false);
            setGlitchedText(original);
            setTimeout(runGlitch, 30000 + Math.random() * 90000);
        };
        const gt = setTimeout(runGlitch, 15000);

        const logPool = ["PKT_RECV: 0x884", "LINK_SYNC: 94%", "THREAD_IDLE: 0", "CACHE_PURGE: OK", "GATE_OPEN: 5173", "BUFFER_CLEAN", "CORE_THERMAL: 34C", "AUTH_VERIFIED"];
        const ltv = setInterval(() => {
            setKernelLogs(prev => [...prev, logPool[Math.floor(Math.random() * logPool.length)]].slice(-6));
        }, 1200);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(gt); clearInterval(utv); clearInterval(etv); clearInterval(ltv);
        };
    }, [isFromSplash]);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    const menuItems = [
        { label: 'INFILTRATE CORE', ext: '.BIN', status: 'NEW', action: () => { StateManager.instance.resetSession('STANDARD'); StateManager.instance.transitionTo(AppState.GAME_PREP); }},
        { 
            label: 'RESUME SESSION', 
            ext: '.SAV',
            status: 'LOAD', 
            action: () => { 
                const data = StateManager.instance.loadGame();
                if (data) StateManager.instance.transitionTo(AppState.GAME_PREP);
            },
            disabled: !StateManager.instance.hasSaveData()
        },
        { label: 'HARDCORE_INFILTRATION', ext: '.SYS', status: 'EXTREME', action: () => { StateManager.instance.resetSession('HARDCORE'); StateManager.instance.currentWave = 1; StateManager.instance.transitionTo(AppState.WAVE_COMPLETED); }},
        { label: 'SYSTEM ARCHIVE', ext: '.DB', status: 'DATA', action: () => StateManager.instance.transitionTo(AppState.ARCHIVE) },
        { label: 'SYSTEM DIAGNOSTICS', ext: '.CFG', status: 'ADMIN', action: () => StateManager.instance.transitionTo(AppState.DIAGNOSTICS) }
    ];

    return (
        <div className="main-menu" style={{ 
            backgroundColor: '#000', color: '#00ffff', height: '100%', width: '100%', 
            display: 'flex', flexDirection: 'column', fontFamily: "'Courier New', Courier, monospace", 
            position: 'relative', overflow: 'hidden', alignItems: 'center'
        }}>
            <MenuBackground onSyncFlicker={handleSyncMirror} isVisible={showBranding} />
            
            <div style={{ position: 'absolute', inset: 0, padding: '1.5rem 2.5rem', pointerEvents: 'none', zIndex: 100, opacity: showUI ? 0.8 : 0, transition: 'opacity 2s ease-in' }}>
                <div style={{ position: 'absolute', top: '1.5rem', left: '2.5rem', fontSize: '0.8rem', fontWeight: 900, color: 'var(--neon-cyan)', letterSpacing: '1px', opacity: 0.4 }}>
                    ARCHITECT @ SYNTAX_CORE:~/ROOT$ [LINK_V88.3]
                </div>

                <div style={{ position: 'absolute', top: '1.5rem', right: '2.5rem', textAlign: 'right', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 900, opacity: 0.4 }}>
                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>SESSION_UPTIME: <span style={{ color: '#fff' }}>{formatUptime(uptime)}</span></div>
                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>ENTROPY: <span style={{ color: isGlitched ? '#ff3300' : 'var(--neon-cyan)' }}>{entropy.toFixed(3)}%</span></div>
                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>THREAT_LEVEL: <span style={{ color: isGlitched ? '#ff3300' : '#00ff66', animation: isGlitched ? 'flash-red 0.1s infinite' : 'none' }}>{isGlitched ? 'CRITICAL' : 'NOMINAL'}</span></div>
                </div>

                <div style={{ position: 'absolute', bottom: '1.5rem', left: '2.5rem', fontSize: '0.7rem', color: 'var(--neon-cyan)', display: 'flex', flexDirection: 'column', gap: '4px', fontWeight: 900, opacity: 0.6 }}>
                    {kernelLogs.map((log, idx) => <div key={idx} style={{ animation: 'log-fade 0.5s forwards' }}>&gt; {log}</div>)}
                </div>
                <div style={{ position: 'absolute', bottom: '1.5rem', right: '2.5rem', fontSize: '0.65rem', color: '#222', letterSpacing: '2px' }}>SYNDEF_OS_SECURE_AUTH</div>
            </div>

            <div style={{ height: '8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1200px', zIndex: 10, marginTop: '10vh', opacity: showBranding ? 1 : 0, transition: 'opacity 1s ease-in' }}>
                <h1 ref={titleRef} style={{ 
                    fontSize: '5.5rem', fontWeight: 900, letterSpacing: '1.2rem', color: 'var(--neon-cyan)',
                    transform: 'rotateX(25deg) skewX(-2deg)', transformStyle: 'preserve-3d',
                    transition: 'color 0.1s',
                    wordSpacing: '-3rem'
                }}>
                    {glitchedText}
                </h1>
            </div>

            <div style={{
                width: '42rem', height: '25rem', background: 'rgba(0,10,25,0.96)', border: '1px solid rgba(0,255,255,0.2)',
                boxShadow: '0 0 80px rgba(0,0,0,1.0)', display: 'flex', flexDirection: 'column',
                opacity: showUI ? 1 : 0, transform: showUI ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s cubic-bezier(0.1, 0, 0.1, 1)', zIndex: 20, marginTop: '-1rem' 
            }}>
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid rgba(0,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#101218' }}>
                    <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 900, opacity: 0.5, letterSpacing: '2px' }}>&gt; MAIN_COMMAND_INTERFACE</div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '1rem 3.5rem', justifyContent: 'center' }}>
                    {menuItems.map((item) => (
                        <button key={item.label} disabled={item.disabled}
                            onClick={() => { if(!item.disabled) { AudioManager.getInstance().playUiClick(); item.action(); } }}
                            onMouseEnter={() => !item.disabled && AudioManager.getInstance().playDataChatter()}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: item.disabled ? 'rgba(255,255,255,0.01)' : 'rgba(0,255,255,0.02)', 
                                border: `1px solid ${item.disabled ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,255,0.1)'}`,
                                padding: '1rem 1.8rem', cursor: item.disabled ? 'not-allowed' : 'pointer', color: item.disabled ? '#444' : '#fff',
                                transition: 'all 0.2s ease-out', opacity: item.disabled ? 0.3 : 1
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '2px' }}>{item.label}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', opacity: 0.3, fontWeight: 300 }}>{item.ext}</span>
                            </div>
                            <span style={{ 
                                fontSize: '0.65rem', color: item.disabled ? '#444' : 'var(--neon-cyan)', 
                                border: `1px solid ${item.disabled ? '#222' : 'var(--neon-cyan)'}`, 
                                padding: '0.2rem 0', width: '6rem', textAlign: 'center', display: 'inline-block', flexShrink: 0
                            }}>{item.status}</span>
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                button:not(:disabled):hover { background: rgba(0,255,255,0.15) !important; border-color: var(--neon-cyan) !important; transform: scale(1.02); }
                @keyframes log-fade { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .main-menu::after { 
                    content: " "; position: absolute; inset: 0; pointer-events: none; zIndex: 1000;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.01), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.01)); 
                    background-size: 100% 2px, 3px 100%; 
                }
            `}</style>
        </div>
    );
};
