import React, { useState, useEffect, useRef } from 'react';
import TerminalText from './TerminalText';
import { StateManager, AppState } from '../../core/StateManager';
import { AudioManager } from '../../systems/AudioManager';

interface PhaseConfig {
    id: number;
    text: string;
    color: string;
    speed: number;
    delay: number;
    isUser?: boolean;
    isCommand?: boolean;
    clearBefore?: boolean;
    waitForNext?: number;
    append?: boolean;
}

export const BootSequence: React.FC = () => {
    const [currentIdx, setCurrentIdx] = useState(-1);
    const [internalProgress, setInternalProgress] = useState(-1);
    const [chaosText, setChaosText] = useState("SCANNING");
    const [isGlitching, setIsGlitching] = useState(false);
    const [isRedMode, setRedMode] = useState(false);
    const [bgMetrics, setBgMetrics] = useState<string[]>([]);
    
    const hasStarted = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // MASTER PHASE DEFINITIONS
    const phases: PhaseConfig[] = [
        { id: 101, text: "auth --request-access --identity=ARCHITECT", color: "#fff", speed: 40, delay: 500, isUser: true, isCommand: true },
        { id: 102, text: "ACCESS_REQUEST_RECEIVED... SCANNING_BIOMETRICS...", color: "#00ff66", speed: 20, delay: 400 },
        { id: 103, text: " AUTHORIZED.", color: "#00ff66", speed: 20, delay: 1200, append: true },
        { id: 104, text: "WELCOME BACK, ARCHITECT.", color: "#00ff66", speed: 30, delay: 400, waitForNext: 1500 },
        
        { id: 201, text: "sys --mount-tactical-logic --force", color: "#fff", speed: 40, delay: 1000, isUser: true, isCommand: true, clearBefore: true },
        { id: 202, text: "VERIFYING_MOUNT_POINT: /dev/core_kernel ...", color: "#00ff66", speed: 20, delay: 400 },
        { id: 203, text: " [READY]", color: "#00ff66", speed: 20, delay: 1500, append: true },
        { id: 204, text: "MOUNTING_LOGIC_PACKETS... INITIATING_DOWNLOAD.", color: "#00ff66", speed: 30, delay: 400, waitForNext: 500 },
        { id: 205, text: "PROGRESS_LOADER", color: "#00ff66", speed: 0, delay: 0 },
        
        { id: 206, text: "PACKET_01: KERNEL_CORE... [OK]", color: "#00ff66", speed: 20, delay: 0, waitForNext: 800 },
        { id: 207, text: "PACKET_02: TACTICAL_ASSETS... [OK]", color: "#00ff66", speed: 20, delay: 0, waitForNext: 800 },
        { id: 208, text: "PACKET_03: NEURAL_MESH... [OK]", color: "#00ff66", speed: 20, delay: 0, waitForNext: 800 },
        { id: 209, text: "PACKET_04: CRYPTO_KEY... [OK]", color: "#00ff66", speed: 20, delay: 0, waitForNext: 1000 },
        
        { id: 210, text: "Status: Successful.", color: "#00ff66", speed: 30, delay: 0, waitForNext: 500 },
        { id: 211, text: "Access: Granted.", color: "#00ff66", speed: 30, delay: 0, waitForNext: 1500 },

        { id: 301, text: "sys --scan-integrity --deep", color: "#fff", speed: 40, delay: 800, isUser: true, isCommand: true, clearBefore: true },
        { id: 302, text: "SCANNING_SECTORS [0x1-0x3] ... OK", color: "#00ff66", speed: 10, delay: 800 },
        { id: 303, text: ">> MALICIOUS_DATA_DETECTED: [STORM_LEVEL_7]", color: "#00ff66", speed: 30, delay: 400 },
        { id: 304, text: "Proceed with automated containment? (Y/N)", color: "#00ff66", speed: 30, delay: 400 },
        { id: 305, text: "Y", color: "#fff", speed: 150, delay: 1000, append: true, isUser: true, isCommand: true, waitForNext: 1200 },
        { id: 306, text: "INITIATING_AUTOMATED_CONTAINMENT...", color: "#00ff66", speed: 30, delay: 400 },
        { id: 307, text: " [FAILED]", color: "#00ff66", speed: 30, delay: 1500, append: true },
        { id: 308, text: "sys --purge-auto --all --force", color: "#fff", speed: 40, delay: 1000, isUser: true, isCommand: true },
        
        { id: 309, text: "FORCING_PURGE...", color: "#fff", speed: 30, delay: 600, waitForNext: 1200 },
        { id: 310, text: "ERROR_0x88... UNABLE_TO_CONTAIN... OVERLOAD_DETECTED...", color: "#ff3300", speed: 15, delay: 0 },
        { id: 311, text: "CRITICAL_ERROR: MANUAL_PURGE_FAILED [KERNEL_OVERLOAD]", color: "#ff3300", speed: 30, delay: 800 },
        
        { id: 312, text: "INITIATING_SAFE_MODE_SEQUENCE... [CRITICAL_FAILURE]", color: "#ff3300", speed: 30, delay: 400 },
        { id: 313, text: "RELINQUISHING_SYSTEM_CONTROL... MANUAL_DEFENSE_REQUIRED.", color: "#ff3300", speed: 30, delay: 400, waitForNext: 800 },
        { id: 314, text: "EXIT_BUTTON", color: "#ff3300", speed: 0, delay: 0 }
    ];

    // Telemetry Loops
    useEffect(() => {
        const itv = setInterval(() => {
            const hex = () => Math.floor(Math.random()*65535).toString(16).toUpperCase().padStart(4, '0');
            setBgMetrics(prev => [...prev.slice(-12), `0x${hex()} : ${hex()} : OK`]);
        }, 400);
        return () => clearInterval(itv);
    }, []);

    useEffect(() => {
        if (!isRedMode) return;
        const itv = setInterval(() => {
            const processes = ["OVERFLOW", "SEG_FAULT", "MEM_LEAK", "NULL_PTR", "CORE_DUMP", "STACK_SMASH"];
            setChaosText(processes[Math.floor(Math.random() * processes.length)] + ": 0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase());
        }, 150);
        return () => clearInterval(itv);
    }, [isRedMode]);

    const startSequence = () => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        // GESTURE LOCK: Force resume upon first user click
        AudioManager.getInstance().resume().then(() => {
            console.log("[BootSequence] Audio Engine Active.");
            setCurrentIdx(0);
        });
    };

    const nextPhase = () => {
        setCurrentIdx(prev => prev + 1);
    };

    useEffect(() => {
        if (currentIdx >= 0 && currentIdx < phases.length) {
            const p = phases[currentIdx];
            if (p.id === 310) { 
                setRedMode(true);
                setIsGlitching(true);
                setTimeout(() => setIsGlitching(false), 400);
            }
            if (p.text === "PROGRESS_LOADER") {
                setInternalProgress(0);
                const timer = setInterval(() => {
                    setInternalProgress(v => {
                        if (v >= 100) {
                            clearInterval(timer);
                            setTimeout(nextPhase, 1200);
                            return 100;
                        }
                        return v + 1;
                    });
                }, 30);
            }
        }
    }, [currentIdx]);

    const onPhaseComplete = (idx: number) => {
        if (idx !== currentIdx) return;
        const phase = phases[idx];
        if (phase.text === "PROGRESS_LOADER" || phase.text === "EXIT_BUTTON") return;
        const waitTime = phase.waitForNext || 0;
        setTimeout(nextPhase, waitTime);
    };

    const getVisibleIndices = () => {
        if (currentIdx === -1) return [];
        let startIdx = 0;
        for (let i = 0; i <= currentIdx; i++) {
            if (phases[i].clearBefore) startIdx = i;
        }
        
        // --- SLIDING WINDOW LAW: Max 8 blocks of text ---
        const totalIndices = Array.from({ length: currentIdx - startIdx + 1 }, (_, i) => startIdx + i);
        // Filtering appends: appends count as part of the parent block
        const blockIndices = totalIndices.filter(i => !phases[i].append);
        if (blockIndices.length > 8) {
            const cutoff = blockIndices[blockIndices.length - 8];
            return totalIndices.filter(i => i >= cutoff);
        }
        
        return totalIndices;
    };

    return (
        <div style={{
            backgroundColor: '#000', width: '100%', height: '100%', padding: '30px', boxSizing: 'border-box',
            fontFamily: "'Courier New', monospace", fontSize: '14px', color: isRedMode ? '#ff3300' : '#00ff66',
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
            animation: isGlitching ? 'glitch-distortion 0.4s' : 'none'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '8px', borderBottom: `1px solid ${isRedMode ? '#ff3300' : '#00ff66'}`, paddingBottom: '4px', zIndex: 1, fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
                [ AUTH_LOGON_SESSION ]
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', opacity: 0.8, zIndex: 1 }}>
                <div>{isRedMode ? `CRITICAL_FAILURE@${chaosText}` : 'ARCHITECT@SYNTAX_CORE:~/BOOT$'}</div>
                <div>THREAT_LEVEL: {isRedMode ? 'CRITICAL' : (currentIdx >= 15 ? 'ELEVATED' : 'STABLE')}</div>
            </div>

            <div style={{ flex: 1, zIndex: 1, marginTop: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                {currentIdx === -1 && (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <button onClick={startSequence} style={{ backgroundColor: 'transparent', color: '#00ff66', border: '1px solid #00ff66', padding: '15px 30px', cursor: 'pointer', fontSize: '18px', fontFamily: 'inherit' }}>
                            [ INITIALIZE SYSTEM ]
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getVisibleIndices().map((idx) => {
                        const p = phases[idx];
                        if (p.append) return null;

                        const findAppends = (start: number) => {
                            const appends = [];
                            let i = start + 1;
                            while (i <= currentIdx && phases[i] && phases[i].append) {
                                appends.push(i);
                                i++;
                            }
                            return appends;
                        };

                        if (p.text === "PROGRESS_LOADER") {
                            return (
                                <div key={p.id} style={{ margin: '10px 0' }}>
                                    <div style={{ width: '300px', height: '20px', border: '1px solid #00ff66', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: '#00ff66', width: `${internalProgress}%` }}></div>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: internalProgress > 50 ? '#000' : '#00ff66', fontWeight: 900 }}>
                                            {internalProgress}% LOADED
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        if (p.text === "EXIT_BUTTON") {
                            return (
                                <div key={p.id} style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={() => StateManager.instance.transitionTo(AppState.STUDIO_SPLASH)} style={{ backgroundColor: 'transparent', border: '2px solid #ff3300', color: '#ff3300', padding: '15px 35px', fontSize: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>
                                        [ ACCESS SYSTEM ROOT ]
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div key={p.id} style={{ color: isRedMode ? '#ff3300' : p.color }}>
                                &gt; <TerminalText text={p.text} speed={p.speed} delay={p.delay} humanTyping={p.isUser} isCommand={p.isCommand} isGlitched={isRedMode} permanentGlitch={true} onComplete={() => onPhaseComplete(idx)} />
                                {findAppends(idx).map(aid => (
                                    <span key={`append-${aid}`} style={{ marginLeft: '8px', color: isRedMode ? '#ff3300' : phases[aid].color }}>
                                        <TerminalText text={phases[aid].text} speed={phases[aid].speed} delay={phases[aid].delay} humanTyping={phases[aid].isUser} isCommand={phases[aid].isCommand} isGlitched={isRedMode} permanentGlitch={true} onComplete={() => onPhaseComplete(aid)} />
                                    </span>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ position: 'absolute', top: '15px', left: '15px', opacity: 0.05, pointerEvents: 'none', textAlign: 'left', fontSize: '10px' }}>
                {bgMetrics.map((m, i) => <div key={`m-l-${i}`}>{m}</div>)}
            </div>

            <style>{`
                @keyframes glitch-distortion { 0% { transform: translate(0); } 20% { transform: translate(-5px, 5px) skew(5deg); filter: hue-rotate(90deg); } 40% { transform: translate(5px, -5px) skew(-5deg); filter: hue-rotate(-90deg); } 60% { transform: translate(-5px, -5px) skew(5deg); } 80% { transform: translate(5px, 5px) skew(-5deg); } 100% { transform: translate(0); } }
                ::-webkit-scrollbar { width: 0px; }
            `}</style>
        </div>
    );
};
