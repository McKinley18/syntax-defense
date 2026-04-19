import React, { useState, useEffect, useRef } from 'react';
import TerminalText from './TerminalText';
import { StateManager, AppState } from '../core/StateManager';
import { AudioManager } from '../systems/AudioManager';

interface TerminalLine {
    id: string;
    text: string;
    color?: string;
    isCommand?: boolean;
    isUser?: boolean;
    isAppend?: boolean;
    speed?: number;
    delay?: number;
}

interface TerminalRow {
    id: string;
    lines: TerminalLine[];
}

export const BootSequence: React.FC = () => {
    // --- STAGE CONTROL ---
    const [isIgnited, setIsIgnited] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    const [terminalReady, setTerminalReady] = useState(false);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
    
    // --- TERMINAL STREAM ---
    const [rows, setRows] = useState<TerminalRow[]>([]);
    const [isRedMode, setRedMode] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const [internalProgress, setInternalProgress] = useState(0);
    const [showRecovery, setShowRecovery] = useState(false);
    const [showInitializeGate, setShowInitializeGate] = useState(false);
    const [showFinalExit, setShowFinalExit] = useState(false);
    
    // --- SYSTEM METRICS ---
    const [signalStr, setSignalStr] = useState(94);
    const [chaosText, setChaosText] = useState("SCANNING");

    const scrollRef = useRef<HTMLDivElement>(null);
    const rowsRef = useRef<TerminalRow[]>([]);
    const hasStarted = useRef(false);
    
    const MAX_ROWS = 6;
    const lineCompletionResolvers = useRef<Record<string, () => void>>({});

    // 1. KINETIC CRT IGNITION: Splits and reveals UI
    useEffect(() => {
        const boot = async () => {
            await new Promise(r => setTimeout(r, 400));
            setIsIgnited(true); // Dot manifests
            await new Promise(r => setTimeout(r, 600));
            setIsExpanding(true); // Expands horizontally
            await new Promise(r => setTimeout(r, 500));
            setIsSplitting(true); // Splits vertically
            await new Promise(r => setTimeout(r, 600));
            setTerminalReady(true); // Lock final state
            setShowInitializeGate(true);
        };
        boot();

        const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [rows, internalProgress, showInitializeGate, showFinalExit]);

    useEffect(() => {
        const itv = setInterval(() => {
            setSignalStr(prev => Math.min(100, Math.max(80, prev + (Math.random()*4 - 2))));
        }, 1000);
        return () => clearInterval(itv);
    }, []);

    const addLineAndWait = async (line: Omit<TerminalLine, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newLine = { ...line, id };
        
        return new Promise<void>((resolve) => {
            lineCompletionResolvers.current[id] = resolve;
            let newRows = [...rowsRef.current];
            if (newLine.isAppend && newRows.length > 0) {
                const lastRow = newRows[newRows.length - 1];
                lastRow.lines = [...lastRow.lines, newLine];
            } else {
                const newRow: TerminalRow = { id: 'row-' + id, lines: [newLine] };
                newRows.push(newRow);
                if (newRows.length > MAX_ROWS) newRows.shift();
            }
            rowsRef.current = newRows;
            setRows([...newRows]);
        });
    };

    const handleLineComplete = (id: string) => {
        if (lineCompletionResolvers.current[id]) {
            lineCompletionResolvers.current[id]();
            delete lineCompletionResolvers.current[id];
        }
    };

    const authorizeSystem = async () => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        setShowInitializeGate(false);
        await AudioManager.getInstance().resume();
        
        // Music ignition removed from here to follow the "Title-Only" rule.
        await addLineAndWait({ text: "SYNTAX_KERNEL_BOOT_V1.0.4", color: "rgba(255,255,255,0.5)", speed: 40 });
        await new Promise(r => setTimeout(r, 400));
        
        while (window.innerHeight > window.innerWidth) {
            await addLineAndWait({ text: "ORIENTATION_ERROR: LANDSCAPE_REQUIRED", color: "#00ffff", speed: 20 });
            await new Promise(r => setTimeout(r, 2000));
            if (!(window.innerHeight > window.innerWidth)) break;
        }

        await addLineAndWait({ text: "INITIALIZING_SYSTEM_CORE...", color: "#fff", speed: 30 });
        await new Promise(r => setTimeout(r, 1200)); 
        await addLineAndWait({ text: "ESTABLISHING_NEURAL_LINK... [OK]", color: "#00ff66", speed: 25 });
        await new Promise(r => setTimeout(r, 1000));
        
        await addLineAndWait({ text: "SYSTEM_STARTUP_PRECHECK", color: "#00ff66", speed: 20 });
        const bios = [
            "MONOLITH BIOS v4.0.22", "CPU: SYNTAX-CORE @ 4.2GHz ... OK",
            "MEM: 64GB DDR5 VIRTUAL_STACK ... OK", "IO_BRIDGE: ESTABLISHED",
            "MOUNTING NVMe_SECTOR_0 (ROOT) ... DONE", "UI_ENGINE: PIXI_v8_STABLE",
            "SYSTEM_INTEGRITY: 100% NOMINAL"
        ];
        for(let log of bios) {
            await new Promise(r => setTimeout(r, 50));
            await addLineAndWait({ text: log, color: "#00ff66", speed: 10 });
        }
        
        await new Promise(r => setTimeout(r, 1000)); 
        await addLineAndWait({ text: "READY_FOR_OPERATOR_COMMANDS", color: "#00ff66", speed: 30 });
        await new Promise(r => setTimeout(r, 800));
        
        runBreachSequence();
    };

    const runBreachSequence = async () => {
        const breachPhases = [
            { text: "auth --request-access --identity=ARCHITECT", color: "#fff", speed: 40, delay: 500, isUser: true, isCommand: true },
            { text: "ACCESS_REQUEST_RECEIVED... SCANNING_BIOMETRICS...", color: "#00ff66", speed: 20, delay: 400 },
            { text: " AUTHORIZED.", color: "#00ff66", speed: 20, delay: 1500, isAppend: true },
            { text: "WELCOME BACK, ARCHITECT.", color: "#00ff66", speed: 30, delay: 400 },
            { text: "sys --mount-tactical-logic --force", color: "#fff", speed: 40, delay: 800, isUser: true, isCommand: true },
            { text: "VERIFYING_MOUNT_POINT: /dev/core_kernel ... ", color: "#00ff66", speed: 20, delay: 400 },
            { text: "[READY]", color: "#00ff66", speed: 20, delay: 2000, isAppend: true },
            { text: "PROGRESS_LOADER", color: "#00ff66" },
            { text: "PACKET_01: KERNEL_CORE... [OK]", color: "#00ff66", speed: 20 },
            { text: "PACKET_02: TACTICAL_ASSETS... [OK]", color: "#00ff66", speed: 20 },
            { text: "Status: Successful. Access: Granted.", color: "#00ff66", speed: 30 },
            { text: "sys --scan-integrity --deep", color: "#fff", speed: 40, isUser: true, isCommand: true },
            { text: "SCANNING_SECTORS [0x1-0x3] ... ", color: "#00ff66", speed: 10 },
            { text: "OK", color: "#00ff66", isAppend: true, delay: 1800 },
            { text: ">> MALICIOUS_DATA_DETECTED: [STORM_LEVEL_7]", color: "#00ff66", speed: 30 },
            { text: "Proceed with automated containment? ", color: "#00ff66", speed: 30 },
            { text: "Y", color: "#fff", speed: 40, isUser: true, isAppend: true },
            { text: "INITIATING_AUTOMATED_CONTAINMENT... ", color: "#00ff66", speed: 30 },
            { text: "[FAILED]", color: "#ff3300", isAppend: true, delay: 2500 },
            { text: "ERROR_0x88... UNABLE_TO_CONTAIN... OVERLOAD...", color: "#ff3300", speed: 15 },
            { text: "CRITICAL_ERROR: KERNEL_OVERLOAD_DETECTED", color: "#ff3300", speed: 30 },
            { text: "RELINQUISHING_CONTROL... MANUAL_DEFENSE_REQUIRED.", color: "#ff3300", speed: 30 },
            { text: "EXIT_BUTTON", color: "#ff3300" }
        ];

        for(let i=0; i<breachPhases.length; i++) {
            const p = breachPhases[i];
            if (p.delay) await new Promise(r => setTimeout(r, p.delay));

            if (p.text === "PROGRESS_LOADER") {
                setShowRecovery(true);
                for(let prg=0; prg<=100; prg++) {
                    setInternalProgress(prg);
                    await new Promise(r => setTimeout(r, 20));
                }
                setShowRecovery(false);
                await addLineAndWait({ text: "NEURAL_LINK_ESTABLISHED: 100%", color: "#00ff66", speed: 20 });
                continue;
            }
            if (p.text === "EXIT_BUTTON") {
                setShowFinalExit(true);
                continue;
            }
            if (p.text.includes("ERROR") || p.text.includes("FAILED")) {
                setRedMode(true);
                setIsGlitching(true);
                setTimeout(() => setIsGlitching(false), 400);
            }

            await addLineAndWait(p);
            if (!p.isAppend) await new Promise(r => setTimeout(r, 300));
        }
    };

    const themeColor = isRedMode ? '#ff3300' : '#00ff66';

    return (
        <div style={{ backgroundColor: '#000', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            
            {/* 1. TERMINAL CONTENT LAYER (Pre-loaded) */}
            <div style={{ 
                width: '100%', height: '100%', padding: '2.5rem', boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column', 
                animation: isGlitching ? 'glitch-distortion 0.4s' : 'none',
                fontFamily: "'Courier New', monospace",
                color: themeColor,
                opacity: terminalReady ? 1 : 0
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: `1px solid ${themeColor}44`, paddingBottom: '0.8rem' }}>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '2px' }}>[ SYNTAX_TACTICAL_TERMINAL ]</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{isRedMode ? `CRITICAL_FAILURE@${chaosText}` : 'ARCHITECT@SYNTAX_CORE:~/BOOT$'}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <div>SEC_LEVEL: <span style={{ color: isRedMode ? '#ff3300' : '#fff' }}>[{isRedMode ? 'CRITICAL' : 'STABLE'}]</span></div>
                        <div style={{ opacity: 0.8 }}>SIGNAL: {Math.floor(signalStr)}%</div>
                    </div>
                </div>

                <div ref={scrollRef} style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '14px' }}>
                    {showInitializeGate && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button onClick={authorizeSystem} style={{ backgroundColor: 'transparent', color: '#00ff66', border: '2px solid #00ff66', padding: '15px 50px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'inherit', letterSpacing: '2px', boxShadow: '0 0 20px rgba(0,255,102,0.2)' }}>
                                [ INITIALIZE SYSTEM ]
                            </button>
                        </div>
                    )}

                    {rows.map((row) => (
                        <div key={row.id} style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <span style={{ marginRight: '0.5rem', opacity: 0.5, color: themeColor }}>&gt;</span>
                            {row.lines.map((line) => (
                                <span key={line.id} style={{ 
                                    color: isRedMode ? '#ff3300' : (line.color || themeColor),
                                    marginLeft: line.isAppend ? '0.5rem' : '0'
                                }}>
                                    <TerminalText text={line.text} speed={line.speed || 20} humanTyping={line.isUser} isCommand={line.isCommand} isGlitched={isRedMode} permanentGlitch={true} onComplete={() => handleLineComplete(line.id)} />
                                </span>
                            ))}
                        </div>
                    ))}

                    {showRecovery && (
                        <div style={{ margin: '1rem 0' }}>
                            <div style={{ width: '22rem', height: '1.5rem', border: `1px solid ${themeColor}`, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.5)' }}>
                                <div style={{ height: '100%', background: themeColor, width: `${internalProgress}%` }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: internalProgress > 50 ? '#000' : themeColor, fontWeight: 900 }}>
                                    RECOVERY_SYNC: {internalProgress}%
                                </div>
                            </div>
                        </div>
                    )}

                    {showFinalExit && (
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => StateManager.instance.transitionTo(AppState.STUDIO_SPLASH)} style={{ backgroundColor: 'transparent', border: '2px solid #ff3300', color: '#ff3300', padding: '1.2rem 3rem', fontSize: '1.3rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, letterSpacing: '3px', boxShadow: '0 0 20px rgba(255,51,0,0.3)', animation: 'blink 0.8s infinite alternate' }}>
                                [ ACCESS SYSTEM ROOT ]
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. KINETIC SPLIT OVERLAY (Hardware Layer) */}
            {!terminalReady && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1000, pointerEvents: 'none', overflow: 'hidden' }}>
                    {/* Top Mask */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: '#000',
                        transformOrigin: 'top', transform: isSplitting ? 'scaleY(0)' : 'scaleY(1)',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                    {/* Bottom Mask */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: '#000',
                        transformOrigin: 'bottom', transform: isSplitting ? 'scaleY(0)' : 'scaleY(1)',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />

                    {isIgnited && (
                        <>
                            {/* Top Kinetic Line */}
                            <div className="crt-flicker" style={{
                                position: 'absolute', left: '50%', top: '50%',
                                width: isExpanding ? '100%' : '10px', height: '2px',
                                backgroundColor: '#fff', boxShadow: '0 0 15px #fff, 0 0 40px #00ffff',
                                transform: `translate(-50%, -50%) translateY(${isSplitting ? '-50vh' : '0'})`,
                                transition: 'width 0.4s ease-out, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                            {/* Bottom Kinetic Line */}
                            <div className="crt-flicker" style={{
                                position: 'absolute', left: '50%', top: '50%',
                                width: isExpanding ? '100%' : '10px', height: '2px',
                                backgroundColor: '#fff', boxShadow: '0 0 15px #fff, 0 0 40px #ff3300',
                                transform: `translate(-50%, -50%) translateY(${isSplitting ? '50vh' : '0'})`,
                                transition: 'width 0.4s ease-out, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        </>
                    )}
                </div>
            )}

            <style>{`
                .crt-flicker { animation: flicker 0.05s infinite; }
                @keyframes flicker { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 0.9; } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes glitch-distortion { 0% { transform: translate(0); } 20% { transform: translate(-5px, 5px) skew(5deg); filter: hue-rotate(90deg); } 40% { transform: translate(5px, -5px) skew(-5deg); filter: hue-rotate(-90deg); } 60% { transform: translate(-5px, -5px) skew(5deg); } 80% { transform: translate(5px, 5px) skew(-5deg); } 100% { transform: translate(0); } }
                ::-webkit-scrollbar { width: 0px; }
            `}</style>
        </div>
    );
};
