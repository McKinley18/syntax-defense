import React, { useState, useEffect, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';

interface VitalLine {
  id: number;
  text: string;
  isRed?: boolean;
}

export const MainMenu: React.FC = () => {
    const [uptime, setUptime] = useState(0);
    const [entropy, setEntropy] = useState(0.14);
    const [vitals, setVitals] = useState<VitalLine[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [hasSave, setHasSave] = useState(StateManager.instance.hasSaveData());
    const [titleText, setTitleText] = useState("SYNTAX DEFENSE");
    const [isTitleGlitched, setIsTitleGlitched] = useState(false);
    const [isThreatCritical, setIsThreatCritical] = useState(false);
    
    const [showTitle, setShowTitle] = useState(false);
    const [showPlatform, setShowPlatform] = useState(false);
    const [showHud, setShowHud] = useState(false);

    const idRef = useRef(0);
    const lastTextRef = useRef("");

    useEffect(() => {
        AudioManager.getInstance().startMusic();
        
        const t1 = setTimeout(() => setShowTitle(true), 100);
        const t2 = setTimeout(() => setShowPlatform(true), 1300);
        const t3 = setTimeout(() => setShowHud(true), 2000);

        const upTimer = setInterval(() => setUptime(prev => prev + 1), 1000);
        const entTimer = setInterval(() => setEntropy(0.14 + Math.random() * 0.05), 2000);
        
        const lines = ["MEM_PTR: 0x8F2", "SYSCALL_OK", "DATA_SYNC: 100%", "SOCKET_INIT", "DAEMON_RESP", "FIREWALL: UP"];
        const symbols = ["Ω", "¥", "Σ", "Δ", "Ξ", "Ψ", "Ø"];

        const vitalTimer = setInterval(() => {
            if (!showHud) return;
            const isAnomaly = Math.random() < 0.08;
            let nextText = lines[Math.floor(Math.random() * lines.length)];
            
            if (isAnomaly) {
                // UNIFIED 125ms (1/8 SECOND) BURST
                const duration = 125; 
                const anomalyID = idRef.current++;
                const breachText = `BREACH_DETECTED: 0x${Math.random().toString(16).substr(2, 3).toUpperCase()}`;
                
                setIsThreatCritical(true);
                setIsTitleGlitched(true);
                
                // Title Glitch Transformation
                const original = "SYNTAX DEFENSE";
                const chars = original.split("");
                const index = Math.floor(Math.random() * chars.length);
                if (chars[index] !== " ") chars[index] = symbols[Math.floor(Math.random() * symbols.length)];
                setTitleText(chars.join(""));

                // Vitals Glitch Line
                const newLine = { id: anomalyID, text: breachText, isRed: true };
                setVitals(prev => [newLine, ...prev].slice(0, 5));

                // SYNCED RESTORE
                setTimeout(() => {
                    setIsThreatCritical(false);
                    setIsTitleGlitched(false);
                    setTitleText("SYNTAX DEFENSE");
                    setVitals(prev => prev.filter(v => v.id !== anomalyID));
                }, duration);

            } else {
                const newLine = { id: idRef.current++, text: nextText, isRed: false };
                setVitals(prev => [newLine, ...prev].slice(0, 5));
            }
        }, 2500);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
            clearInterval(upTimer); clearInterval(entTimer); clearInterval(vitalTimer);
        };
    }, [showHud]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const menuItems = [
        { 
            label: 'INFILTRATE CORE', 
            id: 'INIT', 
            log: 'EXE: NEW_SESSION.BIN', 
            action: () => {
                StateManager.instance.resetSession();
                const hasSeenTutorial = localStorage.getItem('syndef_tutorial_v19');
                if (hasSeenTutorial) {
                    StateManager.instance.currentWave = 1;
                    StateManager.instance.transitionTo(AppState.WAVE_COMPLETED);
                } else {
                    StateManager.instance.transitionTo(AppState.GAME_PREP);
                }
            }, 
            primary: true, status: 'NEW', size: '14.2kb', ext: 'EXE' 
        },
        { 
            label: 'RESUME SESSION', id: 'RESUME', log: 'EXE: RESTORE_ARCHIVE.BIN', 
            action: () => { if(hasSave) StateManager.instance.loadGame(); }, 
            status: hasSave ? 'READY' : 'NULL', size: '08.1kb', ext: 'BIN', disabled: !hasSave, highlight: hasSave 
        },
        { label: 'SYSTEM ARCHIVE', id: 'INFO', log: 'EXTRACT: SYSTEM_LOGS.DB', action: () => StateManager.instance.transitionTo(AppState.ARCHIVE), status: 'ARCHIVED', size: '128kb', ext: 'DB' },
        { label: 'SYSTEM DIAGNOSTICS', id: 'SETTINGS', log: 'OVERWRITE: USER_PREFS.JSON', action: () => StateManager.instance.transitionTo(AppState.DIAGNOSTICS), status: 'ACTIVE', size: '04.2kb', ext: 'JSON' }
    ];

    return (
        <div className="main-menu" style={{ backgroundColor: '#0a0a0a', color: '#00ffff', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Courier New', Courier, monospace", position: 'relative', overflow: 'hidden' }}>
            <MenuBackground />
            
            {showHud && (
                <div style={{ animation: 'fade-in 0.5s forwards' }}>
                    <div style={{ position: 'absolute', top: '1.2rem', left: '2.0rem', zIndex: 10, color: '#00ffff', fontSize: '0.85rem', fontWeight: 'bold', opacity: 0.4 }}>
                        ARCHITECT @ SYNTAX_CORE:~/ROOT$
                    </div>
                    <div style={{ position: 'absolute', top: '1.2rem', right: '2.0rem', zIndex: 10, textAlign: 'right', opacity: 0.4, fontSize: '0.75rem' }}>
                        <div>UPTIME: {formatTime(uptime)}</div>
                        <div>ENTROPY: {entropy.toFixed(3)}%</div>
                        <div>THREAT_LEVEL: <span style={{ color: isThreatCritical ? '#ff3300' : '#00ff66', opacity: 1, fontWeight: isThreatCritical ? 900 : 400 }}>{isThreatCritical ? 'CRITICAL' : 'NOMINAL'}</span></div>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, perspective: '60rem', paddingTop: 'min(14vh, 9rem)' }}>
                {showTitle && (
                    <h1 className={`menu-title-3d ${isTitleGlitched ? 'anomaly-glitch' : 'flicker-text'}`} style={{ 
                        fontSize: '4.5rem', 
                        letterSpacing: '0.8rem', 
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: '0.4rem',
                        marginLeft: 0,
                        color: isTitleGlitched ? '#ff3300' : '#00ffff', 
                        transform: 'rotateX(20deg)', 
                        textShadow: isTitleGlitched ? '0 0 1rem #ff3300' : '0 0 0.8rem #00ffff, 0 0 1.5rem rgba(0, 255, 255, 0.6)',
                        transition: 'color 0.05s',
                        animation: 'title-ignition 0.8s ease-out forwards'
                    }}>
                        {titleText}
                    </h1>
                )}

                {showPlatform && (
                    <div className="terminal-platform" style={{ width: '30rem', border: '0.06rem solid #00ffff33', backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: '0.3rem', animation: 'fade-in-up 0.6s forwards' }}>
                        <div style={{ paddingTop: '0.5rem', paddingRight: '1rem', paddingBottom: '0.5rem', paddingLeft: '1rem', backgroundColor: '#151515', borderBottom: '0.06rem solid #00ffff33', fontSize: '0.6rem', opacity: 0.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>SYSTEM_EXECUTABLES_V2.7</span>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <div className="dot dot-red"></div>
                                <div className="dot dot-yellow"></div>
                                <div className="dot dot-green"></div>
                            </div>
                        </div>
                        <div style={{ paddingTop: '1rem', paddingRight: '1rem', paddingBottom: '1rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={item.action}
                                    disabled={(item as any).disabled}
                                    onMouseEnter={() => setHoveredNode(item.log)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    style={{
                                        display: 'flex', width: '100%', backgroundColor: 'transparent', border: 'none', 
                                        color: (item as any).disabled ? '#222' : (item as any).highlight ? '#00ffff' : '#00ffffcc',
                                        paddingTop: '0.4rem',
                                        paddingRight: 0,
                                        paddingBottom: '0.4rem',
                                        paddingLeft: hoveredNode === item.log ? '1.0rem' : 0, 
                                        cursor: (item as any).disabled ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '1.0rem', textAlign: 'left', alignItems: 'center',
                                        transition: 'all 0.2s', borderLeft: hoveredNode === item.log ? '0.25rem solid #00ffff' : '0.25rem solid transparent'
                                    }}
                                >
                                    <span style={{ width: '4.5rem', fontSize: '0.7rem', opacity: (item as any).disabled ? 0.2 : 0.6 }}>{item.size}</span>
                                    <span style={{ flex: 1, fontWeight: (item as any).highlight ? 900 : 400 }}>{item.label}<span style={{ opacity: 0.4, marginLeft: '0.3rem', fontSize: '0.75rem' }}>.{item.ext}</span></span>
                                    <span style={{ color: (item as any).disabled ? '#222' : '#00ff66', fontSize: '0.8rem' }}>[{item.status}]</span>
                                </button>
                            ))}
                            <div style={{ marginTop: '1.2rem', paddingTop: '1.0rem', borderTop: '0.06rem solid #222', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#00ff66', marginRight: '0.8rem' }}>&gt;</span>
                                <span style={{ color: '#00ffff' }}>{hoveredNode || 'AWAITING_INPUT...'}</span>
                                <span className="terminal-cursor"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showHud && (
                <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', zIndex: 10, animation: 'fade-in 0.8s forwards' }}>
                    {vitals.map((v) => (
                        <div key={v.id} style={{ fontSize: '0.75rem', color: v.isRed ? '#ff3300' : '#00ffff', opacity: v.isRed ? 1.0 : 0.3, marginBottom: '0.3rem', letterSpacing: '0.08rem', fontWeight: v.isRed ? 900 : 400 }}>
                            &gt; {v.text}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; }
                .dot-red { background-color: #ff5f56; box-shadow: 0 0 0.4rem rgba(255,95,86,0.5); }
                .dot-yellow { background-color: #ffbd2e; box-shadow: 0 0 0.4rem rgba(255,189,46,0.5); }
                .dot-green { background-color: #27c93f; box-shadow: 0 0 0.4rem rgba(39,201,63,0.5); }

                .terminal-cursor {
                    width: 0.5rem; height: 1.1rem; background-color: #00ffff;
                    display: inline-block; margin-left: 0.5rem;
                    animation: cursor-blink 1s step-end infinite;
                }
                @keyframes cursor-blink { 50% { opacity: 0; } }

                .flicker-text { animation: soft-flicker 8s linear infinite; }
                @keyframes soft-flicker {
                    0%, 4%, 19%, 21%, 60%, 62%, 80%, 82%, 100% { opacity: 1; }
                    2%, 20%, 61%, 81% { opacity: 0.85; }
                }

                @keyframes title-ignition {
                    0% { opacity: 0; filter: blur(10px); text-shadow: 0 0 0 #fff; }
                    10% { opacity: 1; filter: blur(0); }
                    15% { opacity: 0.2; }
                    20% { opacity: 1; text-shadow: 0 0 2rem #00ffff; }
                    30% { opacity: 0.5; }
                    40% { opacity: 1; }
                    100% { opacity: 1; }
                }

                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .anomaly-glitch { animation: title-jitter 0.05s infinite; }
                @keyframes title-jitter {
                    0% { transform: rotateX(20deg) translateX(0); }
                    50% { transform: rotateX(20deg) translateX(-3px); }
                    100% { transform: rotateX(20deg) translateX(3px); }
                }
            `}</style>
        </div>
    );
};
