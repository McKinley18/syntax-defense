import React, { useState, useEffect, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { TOWER_CONFIGS, TowerType, Tower, TargetMode } from '../entities/Tower';
import { AudioManager } from '../systems/AudioManager';
import { WaveManager } from '../systems/WaveManager';
import { TowerManager } from '../systems/TowerManager';
import { Engine } from '../core/Engine';
import { NeuralBrain } from '../systems/NeuralBrain';

// --- QUANTUM SEGMENTED BAR COMPONENT ---
const SegmentedBar: React.FC<{ progress: number, segments: number, color: string, height?: string }> = ({ progress, segments, color, height = "100%" }) => {
    return (
        <div style={{ display: 'flex', gap: '2px', width: '100%', height: height }}>
            {Array.from({ length: segments }).map((_, i) => {
                const isActive = (i / segments) < progress;
                return (
                    <div key={i} style={{
                        flex: 1, height: '100%', 
                        background: isActive ? color : '#222',
                        boxShadow: isActive ? `0 0 8px ${color}66` : 'none',
                        transition: 'background 0.2s'
                    }} />
                );
            })}
        </div>
    );
};

// --- NEURAL CREDIT STREAM ---
const CreditStream: React.FC<{ value: number }> = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const lastValue = useRef(value);

    useEffect(() => {
        if (value !== lastValue.current) {
            const diff = value - lastValue.current;
            const steps = 15;
            let currentStep = 0;
            const start = lastValue.current;
            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                setDisplay(Math.round(start + diff * progress));
                if (currentStep >= steps) {
                    setDisplay(value);
                    lastValue.current = value;
                    clearInterval(timer);
                }
            }, 30);
            return () => clearInterval(timer);
        }
    }, [value]);

    return <span>{display}</span>;
};

const HudTurretIcon: React.FC<{ type: TowerType, color: string, size?: number }> = ({ type, color, size = 38 }) => {
    const s = size; 
    switch(type) {
        case TowerType.PULSE_NODE: return (
            <svg viewBox="0 0 40 40" width={s} height={s}>
                <rect x="12" y="10" width="4" height="20" fill={color} />
                <rect x="24" y="10" width="4" height="20" fill={color} />
                <circle cx="20" cy="20" r="6" fill="#000" stroke="#444" strokeWidth="2" />
            </svg>
        );
        case TowerType.SONIC_IMPULSE: return (
            <svg viewBox="0 0 40 40" width={s} height={s}>
                <path d="M20 10 A 15 15 0 0 1 35 25" fill="none" stroke={color} strokeWidth="3" />
                <path d="M20 15 A 10 10 0 0 1 30 25" fill="none" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="25" r="4" fill={color} />
            </svg>
        );
        case TowerType.STASIS_FIELD: return (
            <svg viewBox="0 0 40 40" width={s} height={s}>
                <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="20" cy="20" r="8" fill="none" stroke={color} strokeWidth="3" />
                <circle cx="20" cy="20" r="4" fill="#fff" />
            </svg>
        );
        case TowerType.PRISM_BEAM: return (
            <svg viewBox="0 0 40 40" width={s} height={s}>
                <path d="M20 5 L32 30 H8 Z" fill="#1a1a1a" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="18" r="5" fill={color} opacity="0.6" />
            </svg>
        );
        case TowerType.RAIL_CANNON: return (
            <svg viewBox="0 0 40 40" width={s} height={s}>
                <rect x="16" y="5" width="2" height="30" fill={color} />
                <rect x="22" y="5" width="2" height="30" fill={color} />
                <rect x="12" y="20" width="16" height="6" fill="#111" stroke="#444" strokeWidth="1" />
            </svg>
        );
        case TowerType.VOID_PROJECTOR: return (
            <svg viewBox="0 0 40 40" width={s} height={s}>
                <path d="M20 5 L35 20 L20 35 L5 20 Z" fill="none" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="20" r="6" fill="#000" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="20" r="3" fill={color} />
            </svg>
        );
        default: return null;
    }
};

export const TacticalHUD: React.FC<{ onStartWave: () => void, waveManager?: WaveManager, towerManager?: TowerManager }> = ({ onStartWave, waveManager, towerManager }) => {
    const [credits, setCredits] = useState(StateManager.instance.credits);
    const [integrity, setIntegrity] = useState(StateManager.instance.integrity);
    const [currentWave, setCurrentWave] = useState(StateManager.instance.currentWave);
    const [waveName, setWaveName] = useState(StateManager.instance.waveName);
    const [gameState, setGameState] = useState(StateManager.instance.currentState);
    const [isBreaching, setIsBreaching] = useState(false);
    const [gameSpeed, setGameSpeed] = useState(StateManager.instance.gameSpeed);
    const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
    const [waveProgress, setWaveProgress] = useState(0);
    const [prepCountdown, setPrepCountdown] = useState(0);
    const [isAlert, setIsAlert] = useState(false);
    const [sessionSeed, setSessionSeed] = useState(NeuralBrain.getInstance().currentProfile?.seed || "NONE");
    const [projectedYield, setProjectedYield] = useState(0);

    const [leftBuffer, setLeftBuffer] = useState("0px");
    const [rightBuffer, setRightBuffer] = useState("0px");
    const [hudHeight, setHudHeight] = useState("0px");
    const [sideSectionWidth, setSideSectionWidth] = useState("0px");
    const [centerSectionWidth, setCenterSectionWidth] = useState("0px");
    const [logisticsSubWidth, setLogisticsSubWidth] = useState("0px");

    useEffect(() => {
        const unsubs = [
            StateManager.instance.subscribe('credits', (v) => setCredits(v)),
            StateManager.instance.subscribe('integrity', (v) => setIntegrity(v)),
            StateManager.instance.subscribe('state', (v) => setGameState(v)),
            StateManager.instance.subscribe('breach', (v) => setIsBreaching(v)),
            StateManager.instance.subscribe('waveName', (v) => setWaveName(v))
        ];

        const updateRootScaling = () => {
            const vw = window.innerWidth;
            const engine = Engine.instance;
            if (!engine.app || !engine.app.stage) return;
            const scale = engine.app.stage.scale.x;
            const stageX = engine.app.stage.x;
            const tileWidth = 40 * scale; 

            setHudHeight(`${4 * tileWidth}px`);
            setSideSectionWidth(`${9 * tileWidth}px`);
            setCenterSectionWidth(`${17 * tileWidth}px`);
            setLogisticsSubWidth(`${4.2 * tileWidth}px`);
            setLeftBuffer(`${stageX + (1 * tileWidth)}px`);
            setRightBuffer(`${vw - (stageX + (39 * tileWidth))}px`);
        };

        const heartbeat = setInterval(() => {
            if (waveManager) {
                const total = waveManager.totalWaveUnits;
                const active = waveManager.enemies.length;
                setWaveProgress(total > 0 ? (total - active) / total : 0);
                setPrepCountdown(Math.ceil(waveManager.prepTimer));

                // FISCAL PROJECTION (v52.0)
                const rewards = waveManager.getRemainingRewards();
                const bonus = waveManager.getEndWaveBonus();
                const interest = Math.floor(StateManager.instance.credits * 0.02);
                setProjectedYield(rewards + bonus + interest);
            }
            if (towerManager) setSelectedTower(towerManager.selectedTower);
            setIsAlert(StateManager.instance.nearKernelAlert);
            setGameSpeed(StateManager.instance.gameSpeed);
            setCurrentWave(StateManager.instance.currentWave);
            updateRootScaling();
        }, 100); 

        window.addEventListener('resize', updateRootScaling);
        updateRootScaling();
        return () => { 
            unsubs.forEach(fn => fn());
            clearInterval(heartbeat);
            window.removeEventListener('resize', updateRootScaling); 
        };
    }, [waveManager, towerManager]);

    const isWave = gameState === AppState.GAME_WAVE;
    const isPrep = gameState === AppState.WAVE_PREP || gameState === AppState.GAME_PREP;
    const themeColor = integrity <= 6 ? 'var(--neon-red)' : isPrep ? 'var(--neon-cyan)' : isWave ? '#00ff66' : 'var(--neon-cyan)';

    const [hoveredProtocol, setHoveredProtocol] = useState<TowerType | null>(null);
    const activeInfoType = hoveredProtocol ?? (selectedTower?.type || null);
    const activeInfo = activeInfoType !== null ? TOWER_CONFIGS[activeInfoType] : null;

    const getTargetModeLabel = (mode: TargetMode) => {
        switch(mode) {
            case TargetMode.CLOSEST: return "CLOSEST";
            case TargetMode.FIRST: return "PROGRESS";
            case TargetMode.WEAKEST: return "VULNERABLE";
            case TargetMode.STRONGEST: return "RESILIENT";
            default: return "NONE";
        }
    };

    return (
        <div className={`ui-layer ${isBreaching ? 'breach-glitch' : ''}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            
            <div className="tactical-dashboard" style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: hudHeight, 
                display: 'flex', alignItems: 'stretch', backgroundColor: 'rgba(0,10,25,0.98)', borderTop: `0.15rem solid ${themeColor}`,
                zIndex: 100, pointerEvents: 'auto', boxShadow: '0 -10px 40px rgba(0,0,0,0.8)'
            }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', paddingLeft: leftBuffer, paddingRight: rightBuffer, paddingTop: '0.8rem', paddingBottom: '0.8rem' }}>
                    
                    {/* 1. STATUS MODULE */}
                    <div className="module-box" style={{ width: sideSectionWidth, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <div style={{ fontSize: '0.65rem', color: themeColor, letterSpacing: '2px', fontWeight: 900 }}>SIMULATION_STATUS</div>
                            <div style={{ fontSize: '0.5rem', color: '#666', fontWeight: 900 }}>SEED_{sessionSeed}</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', gap: '0.6rem' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <button onClick={() => { StateManager.instance.isPaused = !StateManager.instance.isPaused; }} 
                                    style={{ flex: 1, fontSize: '0.75rem', background: 'rgba(0,255,255,0.05)', border: `1.5px solid ${themeColor}`, color: themeColor, cursor: 'pointer', fontWeight: 900 }}>
                                    {StateManager.instance.isPaused ? 'RESUME' : 'PAUSE'}
                                </button>
                                <button onClick={() => { StateManager.instance.gameSpeed = StateManager.instance.gameSpeed === 1.0 ? 2.0 : 1.0; }} 
                                    style={{ flex: 1, fontSize: '0.75rem', background: 'rgba(0,255,255,0.05)', border: `1.5px solid ${themeColor}`, color: gameSpeed > 1 ? '#00ff66' : themeColor, cursor: 'pointer', fontWeight: 900 }}>
                                    {gameSpeed}X
                                </button>
                            </div>
                            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button className="initiate-btn" onClick={onStartWave} disabled={isWave}
                                    style={{ flex: 1, fontSize: '0.8rem', background: (isWave) ? '#151515' : themeColor, color: (isWave) ? '#000' : '#000', fontWeight: 900, border: 'none', cursor: 'pointer' }}>
                                    {isPrep ? 'AUTHORIZE_NOW' : 'AUTHORIZE_WAVE'}
                                </button>
                                {/* HIGH-INTENSITY COUNTDOWN (v52.0) */}
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', border: `1px solid ${themeColor}`, fontSize: '0.85rem', color: isPrep ? 'var(--neon-cyan)' : '#fff', fontWeight: 900 }}>
                                    {isPrep ? `PREP_CLOCK: ${prepCountdown}s` : `ACTIVE: ${waveName}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. PROTOCOL DECK / SELECTION */}
                    <div className="module-box" style={{ width: centerSectionWidth, flexShrink: 0, border: `1px solid ${selectedTower ? 'var(--neon-cyan)' : themeColor + '33'}`, background: selectedTower ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)', padding: '0.6rem', display: 'flex', flexDirection: 'column', borderRadius: '3px' }}>
                        <div style={{ fontSize: '0.65rem', color: themeColor, textAlign: 'center', marginBottom: '0.4rem', fontWeight: 900, letterSpacing: '2px' }}>PROTOCOL_DECK</div>
                        {!selectedTower ? (
                            <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
                                <div style={{ width: '10rem', flexShrink: 0, borderRight: '1px solid #222', paddingRight: '0.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {activeInfo ? (
                                        <>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{activeInfo.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>LETHALITY: <span style={{ color: '#fff' }}>{activeInfo.damage}</span></div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>RANGE: <span style={{ color: '#fff' }}>{activeInfo.range}x</span></div>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: '0.65rem', color: '#333', textAlign: 'center' }}>SELECT_PROTOCOL</div>
                                    )}
                                </div>
                                <div className="turret-scroll-area" style={{ flex: 1, display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                                    {Object.values(TowerType).filter(v => typeof v === 'number').map((type) => {
                                        const cfg = TOWER_CONFIGS[type as TowerType];
                                        const isLocked = currentWave < cfg.unlockWave;
                                        return (
                                            <div key={type} 
                                                onMouseEnter={() => setHoveredProtocol(type as TowerType)}
                                                onMouseLeave={() => setHoveredProtocol(null)}
                                                onPointerDown={() => !isLocked && towerManager?.initiatePlacement(type as TowerType)}
                                                className="protocol-card-interactive"
                                                style={{
                                                    flex: '0 0 6.5rem', height: '100%', border: `1px solid #333`,
                                                    background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.2 : 1, transition: 'transform 0.2s',
                                                    touchAction: 'none'
                                                }}>
                                                <HudTurretIcon type={type as TowerType} color={`#${cfg.color.toString(16).padStart(6, '0')}`} size={32} />
                                                <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 900 }}>{cfg.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: credits >= cfg.cost ? 'var(--neon-cyan)' : 'var(--neon-red)', fontWeight: 900 }}>{cfg.cost}c</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ width: '4.5rem', height: '4.5rem', background: '#000', border: '1.5px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HudTurretIcon type={selectedTower.type} color={`#${selectedTower.config.color.toString(16).padStart(6, '0')}`} size={42} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{selectedTower.config.name}_PROTOCOL</div>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>PURGED: <span style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>{selectedTower.killCount}</span></div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>TIER: <span style={{ color: '#fff', fontWeight: 900 }}>0{selectedTower.tier}</span></div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>TARGET: <span onClick={() => selectedTower.cycleTargetMode()} style={{ color: 'var(--neon-cyan)', fontWeight: 900, cursor: 'pointer', borderBottom: '1px dashed var(--neon-cyan)' }}>{getTargetModeLabel(selectedTower.targetMode)}</span></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem' }}>
                                        <button onClick={() => towerManager?.upgradeSelectedTower()} disabled={selectedTower.tier >= 3} style={{ flex: 1, height: '2.2rem', background: selectedTower.tier >= 3 ? '#222' : 'var(--neon-cyan)', color: '#000', border: 'none', fontSize: '0.8rem', fontWeight: 900, cursor: selectedTower.tier >= 3 ? 'not-allowed' : 'pointer' }}>
                                            {selectedTower.tier >= 3 ? 'MAX_TIER' : `UPGRADE (${selectedTower.getUpgradeCost()}c)`}
                                        </button>
                                        <button onClick={() => { towerManager?.sellSelectedTower(); setSelectedTower(null); }} style={{ width: '5rem', height: '2.2rem', background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>RECYCLE</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. LOGISTICS HUB */}
                    <div className="module-box" style={{ width: sideSectionWidth, flexShrink: 0, display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: logisticsSubWidth, display: 'flex', flexDirection: 'column', borderRight: '2px solid #222', paddingRight: '0.5rem' }}>
                            <div style={{ fontSize: '0.7rem', color: themeColor, marginBottom: '0.4rem', letterSpacing: '1px', fontWeight: 900, textAlign: 'right' }}>{isAlert ? <span style={{ color: 'red' }}>!_BREACH_DETECTED_!</span> : "LOGISTICS"}</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.1rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 900 }}>DATA_CREDITS</div>
                                    <div style={{ fontSize: '2.4rem', color: 'var(--neon-cyan)', fontWeight: 900, lineHeight: 1 }}><CreditStream value={credits} /></div>
                                    {/* HIGH-VISIBILITY PROJECTION (v52.0) */}
                                    <div style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', fontWeight: 900, marginTop: '0.3rem', borderTop: '1px solid rgba(0,255,255,0.2)', paddingTop: '0.2rem' }}>
                                        YIELD_PROJ: +{projectedYield}c
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ width: logisticsSubWidth, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.7rem', color: themeColor, marginBottom: '0.5rem', letterSpacing: '1px', fontWeight: 900, textAlign: 'right' }}>VITALITY</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 900 }}>INTEGRITY</span><span style={{ fontSize: '1.6rem', color: themeColor, fontWeight: 900 }}>{Math.round((integrity / 20) * 100)}%</span></div>
                                <div style={{ width: '100%', height: '1rem' }}><SegmentedBar progress={integrity / 20} segments={10} color={themeColor} /></div>
                                <button onClick={() => StateManager.instance.attemptRepair()} disabled={credits < 250 || integrity >= 20} style={{ height: '1.8rem', background: 'transparent', border: `2px solid ${credits < 250 ? '#222' : '#ff3300'}`, color: credits < 250 ? '#333' : '#ff3300', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 900, marginTop: '0.2rem' }}>[ REPAIR_PATCH ]</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .protocol-card-interactive:hover:not(:disabled) { transform: scale(1.05); border-color: var(--neon-cyan) !important; background: rgba(0,255,255,0.1) !important; }
                ::-webkit-scrollbar { width: 0px; }
            `}</style>
        </div>
    );
};
