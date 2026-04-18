import React, { useState, useEffect, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { VISUAL_REGISTRY, EnemyType } from '../VisualRegistry';
import { TOWER_CONFIGS, TowerType } from '../entities/Tower';

// --- NEURAL DECRYPTION COMPONENT ---
const DecryptedText: React.FC<{ text: string, speed?: number, delay?: number }> = ({ text, speed = 40, delay = 0 }) => {
    const [display, setDisplay] = useState("");
    const [isDecrypted, setIsDecrypted] = useState(false);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@&%*";

    useEffect(() => {
        let i = 0;
        let timer: any;
        const wait = setTimeout(() => {
            timer = setInterval(() => {
                if (i < text.length) {
                    setDisplay(prev => {
                        const scrambled = text.split('').map((c, idx) => {
                            if (idx < i) return c;
                            if (c === ' ') return ' ';
                            return chars[Math.floor(Math.random() * chars.length)];
                        }).join('');
                        return scrambled;
                    });
                    i++;
                } else {
                    setDisplay(text);
                    setIsDecrypted(true);
                    clearInterval(timer);
                }
            }, speed);
        }, delay);

        return () => { clearTimeout(wait); clearInterval(timer); };
    }, [text]);

    return <span style={{ opacity: isDecrypted ? 1 : 0.8 }}>{display}</span>;
};

// --- STABLE CSS-BASED ICON COMPONENT ---
const TechIcon: React.FC<{ label: string, color: string }> = ({ label, color }) => (
    <div style={{ 
        width: '2.5rem', height: '2.5rem', border: `1px solid ${color}`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.6rem', color: color, fontWeight: 900, position: 'relative',
        background: 'rgba(0,0,0,0.5)', flexShrink: 0
    }}>
        <div style={{ position: 'absolute', inset: '2px', border: `1px solid ${color}33` }} />
        {label.substring(0, 1)}
    </div>
);

// --- ANIMATED SVG CHARACTER ICONS ---
const ViralIcon: React.FC<{ type: EnemyType, color: string, blurred?: boolean }> = ({ type, color, blurred }) => {
    const style = blurred ? { filter: 'blur(5px) grayscale(1)', opacity: 0.3 } : {};
    switch(type) {
        case EnemyType.GLIDER: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-glider" style={style}>
                <path d="M20 5 L35 32 L20 25 L5 32 Z" fill="transparent" stroke={color} strokeWidth="2" />
                <path d="M20 12 L28 28 L20 23 L12 28 Z" fill={color} opacity="0.4" />
            </svg>
        );
        case EnemyType.STRIDER: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-strider" style={style}>
                <path d="M20 5 L35 12 L35 28 L20 35 L5 28 L5 12 Z" fill="transparent" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="20" r="5" fill="#fff" className="pulse-core" />
                <path d="M20 5 V15 M35 12 L25 18 M35 28 L25 22 M20 35 V25 M5 28 L15 22 M5 12 L15 18" stroke={color} strokeWidth="1" />
            </svg>
        );
        case EnemyType.BEHEMOTH: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-behemoth" style={style}>
                <rect x="8" y="8" width="24" height="24" fill="transparent" stroke={color} strokeWidth="3" />
                <rect x="14" y="14" width="12" height="12" fill={color} className="tank-core" />
                <path d="M8 8 L32 32 M32 8 L8 32" stroke={color} strokeWidth="1" opacity="0.5" />
            </svg>
        );
        case EnemyType.FRACTAL: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-fractal" style={style}>
                <path d="M20 2 L24 16 H38 L26 24 L30 38 L20 30 L10 38 L14 24 L2 16 H16 Z" fill="transparent" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="20" r="4" fill="#fff" />
            </svg>
        );
        case EnemyType.PHANTOM: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-phantom" style={style}>
                <circle cx="20" cy="20" r="15" fill="transparent" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="20" cy="20" r="8" fill="transparent" stroke={color} strokeWidth="2" opacity="0.6" />
                <circle cx="20" cy="20" r="3" fill="#fff" />
            </svg>
        );
        case EnemyType.WORM: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-worm" style={style}>
                <circle cx="10" cy="20" r="6" fill={color} stroke="#fff" strokeWidth="1" className="seg-1" />
                <circle cx="20" cy="20" r="6" fill={color} stroke="#fff" strokeWidth="1" className="seg-2" />
                <circle cx="30" cy="20" r="6" fill={color} stroke="#fff" strokeWidth="1" className="seg-3" />
            </svg>
        );
        case EnemyType.BOSS: return (
            <svg viewBox="0 0 40 40" width="40" height="40" className="viral-boss" style={style}>
                <path d="M20 2 L38 10 V30 L20 38 L2 30 V10 Z" fill="transparent" stroke="#ff3300" strokeWidth="3" />
                <circle cx="20" cy="20" r="10" fill="#000" stroke="#fff" strokeWidth="2" />
                <circle cx="20" cy="20" r="4" fill="#fff" className="boss-eye" />
            </svg>
        );
        default: return null;
    }
};

const TurretIcon: React.FC<{ type: TowerType, color: string }> = ({ type, color }) => {
    switch(type) {
        case TowerType.PULSE_NODE: return (
            <svg viewBox="0 0 40 40" width="40" height="40">
                <rect x="12" y="10" width="4" height="20" fill={color} />
                <rect x="24" y="10" width="4" height="20" fill={color} />
                <circle cx="20" cy="20" r="6" fill="#111" stroke="#444" strokeWidth="2" />
            </svg>
        );
        case TowerType.SONIC_IMPULSE: return (
            <svg viewBox="0 0 40 40" width="40" height="40">
                <path d="M20 10 A 15 15 0 0 1 35 25" fill="none" stroke={color} strokeWidth="3" />
                <path d="M20 15 A 10 10 0 0 1 30 25" fill="none" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="25" r="4" fill={color} />
            </svg>
        );
        case TowerType.STASIS_FIELD: return (
            <svg viewBox="0 0 40 40" width="40" height="40">
                <circle cx="20" cy="20" r="15" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="20" cy="20" r="8" fill="none" stroke={color} strokeWidth="3" />
                <circle cx="20" cy="20" r="4" fill="#fff" />
            </svg>
        );
        case TowerType.PRISM_BEAM: return (
            <svg viewBox="0 0 40 40" width="40" height="40">
                <path d="M20 5 L32 30 H8 Z" fill="#1a1a1a" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="18" r="5" fill={color} opacity="0.6" />
            </svg>
        );
        case TowerType.RAIL_CANNON: return (
            <svg viewBox="0 0 40 40" width="40" height="40">
                <rect x="16" y="5" width="2" height="30" fill={color} />
                <rect x="22" y="5" width="2" height="30" fill={color} />
                <rect x="12" y="20" width="16" height="6" fill="#111" stroke="#444" strokeWidth="1" />
            </svg>
        );
        case TowerType.VOID_PROJECTOR: return (
            <svg viewBox="0 0 40 40" width="40" height="40">
                <path d="M20 5 L35 20 L20 35 L5 20 Z" fill="none" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="20" r="6" fill="#000" stroke={color} strokeWidth="2" />
                <circle cx="20" cy="20" r="3" fill={color} />
            </svg>
        );
        default: return null;
    }
};

const DefenseProtocol: React.FC<{ type: TowerType }> = ({ type }) => {
    const cfg = TOWER_CONFIGS[type];
    const color = `#${cfg.color.toString(16).padStart(6, '0')}`;
    
    // TACTICAL SYNERGY DATA
    const synergies: Record<number, string> = {
        [TowerType.PULSE_NODE]: "HIGH_FREQ: Pair with Stasis for early corridor dominance.",
        [TowerType.SONIC_IMPULSE]: "DISRUPTOR: 2x damage against Strider logic cores.",
        [TowerType.STASIS_FIELD]: "ANCHOR: Essential for Rail Cannon targeting alignment.",
        [TowerType.PRISM_BEAM]: "THERMAL: Sustained heat purges WORM parasitic segments.",
        [TowerType.RAIL_CANNON]: "KINETIC: Bypasses BEHEMOTH armor; requires lead distance.",
        [TowerType.VOID_PROJECTOR]: "ULTIMATE: Total erasure of any signature in range."
    };

    return (
        <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', background: '#000', border: '1px solid #00ffff33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TurretIcon type={type} color={color} />
                </div>
                <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 900 }}>{cfg.name}_PROTOCOL</div>
                    <div style={{ color: color, fontSize: '0.6rem', fontWeight: 'bold' }}>UNLOCK_WAVE: {cfg.unlockWave}</div>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #222' }}>
                    <div style={{ fontSize: '0.55rem', color: '#666' }}>LETHALITY</div>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{cfg.damage} DPS</div>
                </div>
                <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.3)', border: '1px solid #222' }}>
                    <div style={{ fontSize: '0.55rem', color: '#666' }}>NETWORK_RADIUS</div>
                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{cfg.range}x NODE</div>
                </div>
            </div>

            <div style={{ marginTop: '0.8rem', padding: '0.5rem', background: 'rgba(0,255,255,0.05)', borderLeft: '2px solid var(--neon-cyan)' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--neon-cyan)', fontWeight: 900, marginBottom: '2px' }}>TACTICAL_SYNERGY</div>
                <div style={{ fontSize: '0.65rem', color: '#aaa' }}>{synergies[type]}</div>
            </div>
        </div>
    );
};

const ThreatVector: React.FC<{ name: string, type: string, speed: string, armor: string, enemyType: EnemyType, intel: string, weak: string }> = ({ name, type, speed, armor, enemyType, intel, weak }) => {
    const isDiscovered = StateManager.instance.isDiscovered(enemyType);
    const cfg = VISUAL_REGISTRY[enemyType];
    const color = `#${cfg.color.toString(16).padStart(6, '0')}`;

    return (
        <div style={{ padding: '1.2rem', border: `1px solid ${isDiscovered ? '#00ffff33' : '#222'}`, background: isDiscovered ? 'rgba(0,255,255,0.05)' : 'rgba(255,255,255,0.01)', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                <div style={{ width: '3rem', height: '3rem', background: '#000', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ViralIcon type={enemyType} color={color} blurred={!isDiscovered} />
                </div>
                <div>
                    <div style={{ color: isDiscovered ? '#fff' : '#444', fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                        {isDiscovered ? name : 'ENCRYPTED_SIGNATURE'}
                    </div>
                    <div style={{ color: isDiscovered ? '#00ff66' : '#222', fontSize: '0.6rem', fontWeight: 'bold' }}>CLASS: {isDiscovered ? type : '???' }</div>
                </div>
            </div>
            
            {isDiscovered ? (
                <>
                    <div style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(0,0,0,0.3)', fontSize: '0.7rem', color: '#aaa', lineHeight: '1.4' }}>
                        <DecryptedText text={intel} speed={20} />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#ff3300', fontWeight: 900 }}>
                        WEAKNESS: <span style={{ color: '#fff', fontWeight: 400 }}>{weak}</span>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.55rem', color: '#666' }}>VELOCITY: <span style={{ color: '#aaa' }}>{speed}x</span></div>
                        <div style={{ fontSize: '0.55rem', color: '#666' }}>INTEGRITY: <span style={{ color: '#aaa' }}>{armor}HP</span></div>
                    </div>
                </>
            ) : (
                <div style={{ marginTop: '1rem', textAlign: 'center', padding: '1rem', border: '1px dashed #222', fontSize: '0.6rem', color: '#333' }}>
                    AWAITING_IN_GAME_ENCOUNTER_FOR_DECRYPTION
                </div>
            )}
        </div>
    );
};

export const SystemArchive: React.FC = () => {
    const folders = [
        {
            name: "INTELLIGENCE",
            files: [
                { name: "SITUATION_BRIEF", ext: "LOG" }
            ]
        },
        {
            name: "OPERATIONAL_BRIEF",
            files: [
                { name: "DEPLOYMENT", ext: "MAN" },
                { name: "TACTICAL_HUD", ext: "DOC" }
            ]
        },
        {
            name: "TACTICAL",
            files: [
                { name: "DEFENSE_PROTOCOLS", ext: "BIN" },
                { name: "VIRAL_DB", ext: "EXE" },
                { name: "HARDWARE_SPECS", ext: "SYS" }
            ]
        }
    ];

    const [currentFolder, setCurrentFolder] = useState(folders[0]);
    const [currentFile, setCurrentFile] = useState(folders[0].files[0]);

    return (
        <div className="system-archive" style={{
            position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#000',
            display: 'flex', fontFamily: "'Courier New', Courier, monospace"
        }}>
            <MenuBackground />
            
            <div style={{ 
                position: 'absolute', inset: '1.5rem', 
                border: '1px solid #00ffff33', backgroundColor: 'rgba(0,0,0,0.95)',
                display: 'flex', flexDirection: 'column', zIndex: 1, borderRadius: '4px', 
                boxShadow: '0 0 50px rgba(0,0,0,0.8)', overflow: 'hidden'
            }}>
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#151515' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ffff', opacity: 0.5, fontSize: '0.7rem' }}>SYSTEM_ARCHIVE_v3.5</span>
                        <span style={{ color: '#444' }}>|</span>
                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>{currentFolder.name} / {currentFile.name}.{currentFile.ext}</span>
                    </div>
                    <button 
                        onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}
                        style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', padding: '0.3rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem' }}
                    >
                        [ EXIT_ARCHIVE ]
                    </button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ width: '16rem', flexShrink: 0, borderRight: '1px solid #00ffff33', padding: '1rem', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        {folders.map((folder, fIdx) => (
                            <div key={fIdx} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: '#555', fontSize: '0.65rem', marginBottom: '0.5rem', letterSpacing: '2px' }}>&gt; FOLDER: {folder.name}</div>
                                {folder.files.map((file, fileIdx) => (
                                    <button
                                        key={fileIdx}
                                        onClick={() => { setCurrentFolder(folder); setCurrentFile(file); AudioManager.getInstance().playUiClick(); }}
                                        style={{
                                            display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left',
                                            background: currentFile.name === file.name ? 'rgba(0,255,255,0.1)' : 'transparent',
                                            border: 'none', color: currentFile.name === file.name ? '#00ffff' : '#888',
                                            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
                                            borderLeft: currentFile.name === file.name ? '3px solid #00ffff' : '3px solid transparent',
                                            marginBottom: '2px'
                                        }}
                                    >
                                        {file.name}.{file.ext}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', color: '#00ffff' }}>
                        <div style={{ opacity: 0.3, fontSize: '0.8rem', marginBottom: '1rem' }}>// RESOURCE_ACCESSED: {currentFile.ext}</div>
                        <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 900, letterSpacing: '2px' }} key={currentFile.name}>
                            <DecryptedText text={currentFile.name} speed={50} />
                        </div>
                        <div style={{ width: '6rem', height: '3px', background: '#00ffff', margin: '0.5rem 0 2rem 0' }} />
                        
                        {currentFile.name === "SITUATION_BRIEF" && (
                            <div style={{ maxWidth: '45rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <section>
                                    <div style={{ color: '#00ff66', fontWeight: 900, fontSize: '0.9rem', marginBottom: '0.8rem' }}>MISSION_STATUS: CRITICAL</div>
                                    <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        <DecryptedText speed={15} text="At 0400 hours, the Syntax Defense Kernel suffered a massive synchronization failure. Malicious viral signatures, identified as the 'Storm-7 Variant', have breached the secondary firewall and are now attempting to corrupt the Cybernetic Kernel Core." />
                                    </p>
                                </section>
                                <section style={{ padding: '1.5rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.02)' }}>
                                    <div style={{ color: '#fff', fontWeight: 900, fontSize: '0.8rem', marginBottom: '1rem' }}>OPERATIONAL_OBJECTIVES</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>[1]</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}><span style={{ color: '#fff' }}>CONTAIN_THREAT:</span> Deploy tactical defense protocols across the 40x18 node grid.</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>[2]</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}><span style={{ color: '#fff' }}>PRESERVE_INTEGRITY:</span> Prevent more than 20 viral ingressions into the Kernel Hub.</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>[3]</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}><span style={{ color: '#fff' }}>SYSTEM_RECOVERY:</span> Endure increasingly sophisticated viral waves until kernel stabilization.</div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {currentFile.name === "DEFENSE_PROTOCOLS" && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '1.5rem' }}>
                                <DefenseProtocol type={TowerType.PULSE_NODE} />
                                <DefenseProtocol type={TowerType.SONIC_IMPULSE} />
                                <DefenseProtocol type={TowerType.STASIS_FIELD} />
                                <DefenseProtocol type={TowerType.PRISM_BEAM} />
                                <DefenseProtocol type={TowerType.RAIL_CANNON} />
                                <DefenseProtocol type={TowerType.VOID_PROJECTOR} />
                            </div>
                        )}

                        {currentFile.name === "VIRAL_DB" && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.5rem' }}>
                                <ThreatVector 
                                    name="GLIDER" type="SCOUT" speed="1.8" armor="20" enemyType={EnemyType.GLIDER} 
                                    intel="Lightweight reconnaissance script. High velocity but low structural integrity."
                                    weak="Standard Pulse Nodes provide sufficient coverage."
                                />
                                <ThreatVector 
                                    name="STRIDER" type="LOGIC_BOMB" speed="1.3" armor="50" enemyType={EnemyType.STRIDER} 
                                    intel="Balanced tactical unit. Capable of moderate path navigation speeds."
                                    weak="Vulnerable to high-frequency Sonic Impulse protocols."
                                />
                                <ThreatVector 
                                    name="WORM" type="PARASITE" speed="1.0" armor="120" enemyType={EnemyType.WORM} 
                                    intel="Segmented data-eater. Moves at steady rates with significant health reserves."
                                    weak="Requires sustained Prism Beam exposure for containment."
                                />
                                <ThreatVector 
                                    name="FRACTAL" type="MALWARE" speed="1.5" armor="80" enemyType={EnemyType.FRACTAL} 
                                    intel="Recursive recursive data star. High agility makes it difficult to track."
                                    weak="Susceptible to Stasis Field movement dampening."
                                />
                                <ThreatVector 
                                    name="PHANTOM" type="STEALTH" speed="2.4" armor="40" enemyType={EnemyType.PHANTOM} 
                                    intel="Cloaked high-speed signature. Often bypasses standard defensive grids."
                                    weak="Overcharged Pulse Nodes or rapid-fire Rail Cannons."
                                />
                                <ThreatVector 
                                    name="BEHEMOTH" type="FORTRESS" speed="0.6" armor="250" enemyType={EnemyType.BEHEMOTH} 
                                    intel="Massive armored data block. Slow moving but nearly indestructible."
                                    weak="Concentrated Rail Cannon fire or Elite Tier Void Projectors."
                                />
                                <ThreatVector 
                                    name="K_CRUSHER" type="TITAN_BOSS" speed="0.4" armor="2500" enemyType={EnemyType.BOSS} 
                                    intel="THE KERNEL CRUSHER. A catastrophic system breach entity."
                                    weak="Requires full network Overcharge and Max-Tier defenses."
                                />
                            </div>
                        )}

                        {currentFile.name === "HARDWARE_SPECS" && (
                            <div style={{ maxWidth: '40rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {[
                                        { label: "ENGINE", value: "PIXI.js v8.x" },
                                        { label: "INTERFACE", value: "React v19.0.0" },
                                        { label: "ARCHITECT", value: "C. MCKINLEY" },
                                        { label: "RUNTIME", value: "VITE_V8" },
                                        { label: "GRID_RESOLUTION", value: "40x18_QUANTUM" },
                                        { label: "AUDIO_ENGINE", value: "WEB_AUDIO_v3" }
                                    ].map(item => (
                                        <div key={item.label} style={{ padding: '0.8rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)' }}>
                                            <div style={{ fontSize: '0.55rem', color: '#00ffff66', marginBottom: '0.3rem' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentFile.name === "DEPLOYMENT" && (
                            <div style={{ maxWidth: '45rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <section>
                                    <div style={{ color: '#00ff66', fontWeight: 900, marginBottom: '0.5rem' }}>01_INITIAL_STRATEGY</div>
                                    <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        Viral signatures ingress from the left-most buffer and attempt to navigate the tactical grid to reach the Cybernetic Kernel. Operators must deploy defensive protocols at high-efficiency nodes to neutralize threats before breach occurs.
                                    </p>
                                </section>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ padding: '1rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 900, marginBottom: '0.5rem' }}>[ PROTOCOL_PLACEMENT ]</div>
                                        <ul style={{ color: '#888', fontSize: '0.75rem', paddingLeft: '1.2rem', margin: 0 }}>
                                            <li>Defenses cannot be placed on primary paths.</li>
                                            <li>Each unit has a distinct tactical range.</li>
                                            <li>Overlapping ranges create optimized "Kill Zones".</li>
                                        </ul>
                                    </div>
                                    <div style={{ padding: '1rem', border: '1px solid #ff330033', background: 'rgba(255,51,0,0.05)' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#ff3300', fontWeight: 900, marginBottom: '0.5rem' }}>[ RECYCLE_UNIT ]</div>
                                        <p style={{ color: '#888', fontSize: '0.75rem', margin: 0 }}>
                                            Use the 75% Refund Protocol to reposition defenses as viral paths evolve. Strategic liquidation is key to late-game survival.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentFile.name === "TACTICAL_HUD" && (
                            <div style={{ maxWidth: '45rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <div style={{ color: '#00ff66', fontWeight: 900, marginBottom: '1rem' }}>INTERFACE_SYMBOLS</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <TechIcon label="DATA" color="#00ffff" />
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>DATA_CREDITS</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#666' }}>Currency used for protocol deployment.</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <TechIcon label="CORE" color="#ff3300" />
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>KERNEL_INTEGRITY</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#666' }}>System health. 0% = Total System Collapse.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid #333', padding: '1rem', background: '#0a0a0a' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#444', marginBottom: '0.5rem' }}>OPERATOR_TIP:</div>
                                        <div style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', lineHeight: '1.4' }}>
                                            "Double-tap any active unit to initiate an Overcharge Burst. It increases firing speed by 300% for 3 seconds, followed by a brief cooling period."
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .system-archive::after { content: \" \"; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 2px, 3px 100%; z-index: 5; pointer-events: none; }
                
                /* VIRAL ANIMATIONS */
                .viral-glider { animation: glider-scan 0.1s infinite alternate; }
                @keyframes glider-scan { from { transform: translateX(-1px) skewX(1deg); } to { transform: translateX(1px) skewX(-1deg); } }

                .viral-strider .pulse-core { animation: strider-pulse 1s infinite; }
                @keyframes strider-pulse { 0%, 100% { fill: #fff; transform: scale(1); } 50% { fill: var(--neon-cyan); transform: scale(1.2); } }

                .viral-behemoth .tank-core { animation: behemoth-load 2s infinite ease-in-out; }
                @keyframes behemoth-load { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

                .viral-fractal { animation: fractal-rot 4s infinite linear; }
                @keyframes fractal-rot { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .viral-phantom { animation: phantom-cloak 3s infinite; }
                @keyframes phantom-cloak { 0%, 100% { opacity: 0.1; filter: blur(2px); } 50% { opacity: 0.6; filter: blur(0); } }

                .viral-worm .seg-1 { animation: worm-seg 0.6s infinite 0.0s; }
                .viral-worm .seg-2 { animation: worm-seg 0.6s infinite 0.2s; }
                .viral-worm .seg-3 { animation: worm-seg 0.6s infinite 0.4s; }
                @keyframes worm-seg { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

                .viral-boss .boss-eye { animation: boss-stare 0.05s infinite; }
                @keyframes boss-stare { 0% { fill: #fff; } 50% { fill: #ff3300; } 100% { fill: #fff; } }

                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #00ffff33; }
            `}</style>
        </div>
    );
};
