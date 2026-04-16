import React, { useState } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { VISUAL_REGISTRY, EnemyType } from '../VisualRegistry';
import { TOWER_CONFIGS, TowerType } from '../entities/Tower';

// --- SUB-COMPONENTS (Defined BEFORE SystemArchive to avoid ReferenceErrors) ---

const LogicItem: React.FC<{ id: string, title: string, body: string, meta: string }> = ({ id, title, body, meta }) => (
    <div style={{ borderLeft: '3px solid #00ffff33', paddingLeft: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#00ffff', opacity: 0.3, fontWeight: 900, fontSize: '1.2rem' }}>{id}</span>
            <span style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.1rem' }}>{title}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.6rem', background: '#00ffff11', padding: '2px 6px', color: '#00ffff66' }}>{meta}</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#888', lineHeight: '1.4' }}>{body}</div>
    </div>
);

const TechItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #111', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ color: '#00ffff66', fontSize: '0.6rem', letterSpacing: '1px' }}>{label}</div>
        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{value}</div>
    </div>
);

const TopologySchematic = () => (
    <svg viewBox="0 0 200 200" width="300" height="300" fill="none" stroke="#00ffff" strokeWidth="0.5">
        <rect x="10" y="40" width="180" height="120" strokeDasharray="2 2" />
        <rect x="10" y="40" width="180" height="20" fill="#00ffff05" />
        <rect x="10" y="130" width="180" height="30" fill="#00ffff05" />
    </svg>
);

const ThreatCard: React.FC<{ name: string, type: string, speed: string, armor: string, reward: number, visual: React.ReactNode, desc: string }> = ({ name, type, speed, armor, reward, visual, desc }) => (
    <div style={{ border: '1px solid #00ffff22', padding: '1.2rem', background: 'rgba(0, 255, 255, 0.03)', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', border: '1px solid #00ffff33', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{visual}</div>
            <div>
                <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1rem' }}>{name}</div>
                <div style={{ fontSize: '0.65rem', color: '#ff3300', letterSpacing: '1px' }}>CLASS: {type}</div>
            </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1rem', height: '2.5rem', overflow: 'hidden' }}>{desc}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#666', borderTop: '1px solid #222', paddingTop: '0.5rem' }}>
            <span>VEL: {speed}</span>
            <span>STR: {armor}</span>
            <span style={{ color: '#00ff66' }}>CR: {reward}</span>
        </div>
    </div>
);

const ProtocolItem: React.FC<{ name: string, cost: number, visual: React.ReactNode, desc: string, range: string }> = ({ name, cost, visual, desc, range }) => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #222', background: 'rgba(0, 255, 255, 0.02)' }}>
        <div style={{ width: '6rem', height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #00ffff33', background: '#000', borderRadius: '4px' }}>{visual}</div>
        <div style={{ flex: 1 }}>
            <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.2rem' }}>[{name}]</div>
            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>{desc}</div>
        </div>
        <div style={{ textAlign: 'right', width: '10rem' }}>
            <div style={{ color: '#00ff66', fontSize: '1.1rem', fontWeight: 'bold' }}>{cost} CR</div>
            <div style={{ color: '#00ffff', fontSize: '0.8rem', opacity: 0.6 }}>RANGE: {range}</div>
        </div>
    </div>
);

// --- VIRAL THREAT VISUALS ---
const GliderVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" strokeWidth="2"><path d="M20 5 L35 32 L20 25 L5 32 Z" fill="#00ffff" /></svg>;
const StriderVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5"><circle cx="20" cy="20" r="12" fill="#00ff66" /></svg>;
const BehemothVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" strokeWidth="2"><rect x="8" y="8" width="24" height="24" fill="#ff3300" /></svg>;
const FractalVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5"><circle cx="20" cy="20" r="12" fill="#ff00ff" /></svg>;
const PhantomVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5"><circle cx="20" cy="20" r="12" fill="#888888" /></svg>;
const WormVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5"><circle cx="20" cy="20" r="12" fill="#ffff00" /></svg>;

// --- TOWER VISUALS ---
const TankOctagonBase = (props: { color?: string }) => (
    <g>
        <path d="M12 4 L28 4 L36 12 V28 L28 36 L12 36 L4 28 V12 Z" fill="#0a0a0a" stroke="#333" strokeWidth="2" />
        <rect x="15" y="15" width="10" height="10" stroke="#1a1a1a" strokeWidth="1" />
    </g>
);

const PulseNodeTank = () => (
    <svg viewBox="0 0 40 40">
        <TankOctagonBase />
        <rect x="12" y="2" width="4" height="18" fill="#1a1a1a" stroke="#00ffff" strokeWidth="1.5" />
        <rect x="24" y="2" width="4" height="18" fill="#1a1a1a" stroke="#00ffff" strokeWidth="1.5" />
        <rect x="11" y="2" width="6" height="3" fill="#00ffff" />
        <rect x="23" y="2" width="6" height="3" fill="#00ffff" />
        <circle cx="20" cy="20" r="6" fill="#111" stroke="#444" strokeWidth="2" />
    </svg>
);

const SonicImpulseTank = () => (
    <svg viewBox="0 0 40 40">
        <TankOctagonBase />
        <path d="M5 15 A 18 18 0 0 1 35 15" stroke="#00ff66" strokeWidth="4" fill="none" />
        <circle cx="20" cy="15" r="4" fill="#00ff66" />
        <path d="M10 20 L30 20 L20 10 Z" fill="#222" />
    </svg>
);

const StasisFieldTank = () => (
    <svg viewBox="0 0 40 40">
        <TankOctagonBase />
        <circle cx="20" cy="20" r="12" stroke="#00ffff" strokeWidth="2" strokeOpacity="0.6" fill="none" />
        <circle cx="20" cy="20" r="8" stroke="#00ffff" strokeWidth="3" fill="none" />
        <circle cx="20" cy="20" r="5" fill="#fff" stroke="#00ffff" strokeWidth="1" />
    </svg>
);

const PrismBeamTank = () => (
    <svg viewBox="0 0 40 40">
        <TankOctagonBase />
        <path d="M20 2 L32 20 L8 20 Z" fill="#1a1a1a" stroke="#ff3300" strokeWidth="2" />
        <circle cx="20" cy="12" r="6" fill="#ff3300" fillOpacity="0.5" stroke="#fff" strokeWidth="1" />
    </svg>
);

const RailCannonTank = () => (
    <svg viewBox="0 0 40 40">
        <TankOctagonBase />
        <rect x="15" y="2" width="2" height="28" fill="#050505" stroke="#ff00ff" strokeWidth="2" />
        <rect x="23" y="2" width="2" height="28" fill="#050505" stroke="#ff00ff" strokeWidth="2" />
        <rect x="12" y="16" width="16" height="8" fill="#111" stroke="#444" strokeWidth="1" />
    </svg>
);

// --- MAIN COMPONENT ---

interface ArchiveFile {
    name: string;
    size: string;
    ext: string;
    content: React.ReactNode;
}

interface ArchiveFolder {
    name: string;
    files: ArchiveFile[];
}

export const SystemArchive: React.FC = () => {
    const [selectedFolder, setSelectedFolder] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<number>(0);

    const archiveData: ArchiveFolder[] = [
        {
            name: "OPERATIONAL_BRIEF",
            files: [
                { name: "DEPLOYMENT_MANUAL", ext: "MAN", size: "12.1kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// DEPLOYMENT_WORKFLOW</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem' }}>01: SELECTION</div>
                                <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Select a matching protocol from the HUD deck. Requires sufficient DATA_CR.</p>
                            </div>
                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem' }}>02: ANCHORING</div>
                                <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Click an empty node to lock the protocol. Turrets cannot overlap or block paths.</p>
                            </div>
                            <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.5rem' }}>03: OPTIMIZE</div>
                                <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Click a deployed turret to authorize TIER_UP upgrades. Enhances Damage and Range.</p>
                            </div>
                        </div>
                    </div>
                )}
            ]
        },
        {
            name: "TACTICAL",
            files: [
                { name: "VIRAL_DB", ext: "LOG", size: "4.2kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// THREAT_VECTORS_RECOGNIZED</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <ThreatCard 
                                name={VISUAL_REGISTRY[EnemyType.GLIDER].name} 
                                type="INFECTOR" 
                                speed={VISUAL_REGISTRY[EnemyType.GLIDER].speed.toString()} 
                                armor={VISUAL_REGISTRY[EnemyType.GLIDER].hp.toString()} 
                                reward={VISUAL_REGISTRY[EnemyType.GLIDER].reward}
                                visual={<GliderVisual />} 
                                desc="High-velocity data packets. Standard viral ingress unit." 
                            />
                            <ThreatCard 
                                name={VISUAL_REGISTRY[EnemyType.STRIDER].name} 
                                type="INFILTRATOR" 
                                speed={VISUAL_REGISTRY[EnemyType.STRIDER].speed.toString()} 
                                armor={VISUAL_REGISTRY[EnemyType.STRIDER].hp.toString()} 
                                reward={VISUAL_REGISTRY[EnemyType.STRIDER].reward}
                                visual={<StriderVisual />} 
                                desc="Tripod scanning units with moderate integrity shielding." 
                            />
                            <ThreatCard 
                                name={VISUAL_REGISTRY[EnemyType.BEHEMOTH].name} 
                                type="TANK" 
                                speed={VISUAL_REGISTRY[EnemyType.BEHEMOTH].speed.toString()} 
                                armor={VISUAL_REGISTRY[EnemyType.BEHEMOTH].hp.toString()} 
                                reward={VISUAL_REGISTRY[EnemyType.BEHEMOTH].reward}
                                visual={<BehemothVisual />} 
                                desc="Massive armored clusters. Extremely resilient to pulse fire." 
                            />
                            <ThreatCard 
                                name={VISUAL_REGISTRY[EnemyType.FRACTAL].name} 
                                type="GEOMETRIC" 
                                speed={VISUAL_REGISTRY[EnemyType.FRACTAL].speed.toString()} 
                                armor={VISUAL_REGISTRY[EnemyType.FRACTAL].hp.toString()} 
                                reward={VISUAL_REGISTRY[EnemyType.FRACTAL].reward}
                                visual={<FractalVisual />} 
                                desc="Complex entities that oscillate between network layers." 
                            />
                            <ThreatCard 
                                name={VISUAL_REGISTRY[EnemyType.PHANTOM].name} 
                                type="SPECTER" 
                                speed={VISUAL_REGISTRY[EnemyType.PHANTOM].speed.toString()} 
                                armor={VISUAL_REGISTRY[EnemyType.PHANTOM].hp.toString()} 
                                reward={VISUAL_REGISTRY[EnemyType.PHANTOM].reward}
                                visual={<PhantomVisual />} 
                                desc="Hyper-speed entities with low integrity but high evasion." 
                            />
                            <ThreatCard 
                                name={VISUAL_REGISTRY[EnemyType.WORM].name} 
                                type="CORRUPTOR" 
                                speed={VISUAL_REGISTRY[EnemyType.WORM].speed.toString()} 
                                armor={VISUAL_REGISTRY[EnemyType.WORM].hp.toString()} 
                                reward={VISUAL_REGISTRY[EnemyType.WORM].reward}
                                visual={<WormVisual />} 
                                desc="Serpentine data strings designed for rapid kernel breach." 
                            />
                        </div>
                    </div>
                )},
                { name: "PROTOCOLS", ext: "CFG", size: "2.8kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// DEPLOYMENT_ASSETS_ORDINANCE</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ProtocolItem 
                                name={TOWER_CONFIGS[TowerType.PULSE_NODE].name} 
                                cost={TOWER_CONFIGS[TowerType.PULSE_NODE].cost}
                                visual={<PulseNodeTank />} 
                                desc="Standard rapid-fire pulse unit. High reliability, moderate damage." 
                                range={`${TOWER_CONFIGS[TowerType.PULSE_NODE].range.toFixed(1)} Tiles`} 
                            />
                            <ProtocolItem 
                                name={TOWER_CONFIGS[TowerType.SONIC_IMPULSE].name} 
                                cost={TOWER_CONFIGS[TowerType.SONIC_IMPULSE].cost}
                                visual={<SonicImpulseTank />} 
                                desc="Emits sonic waves that ripple through enemy clusters." 
                                range={`${TOWER_CONFIGS[TowerType.SONIC_IMPULSE].range.toFixed(1)} Tiles`} 
                            />
                            <ProtocolItem 
                                name={TOWER_CONFIGS[TowerType.STASIS_FIELD].name} 
                                cost={TOWER_CONFIGS[TowerType.STASIS_FIELD].cost}
                                visual={<StasisFieldTank />} 
                                desc="Temporal interference dish. Slows data movement within its radius." 
                                range={`${TOWER_CONFIGS[TowerType.STASIS_FIELD].range.toFixed(1)} Tiles`} 
                            />
                            <ProtocolItem 
                                name={TOWER_CONFIGS[TowerType.PRISM_BEAM].name} 
                                cost={TOWER_CONFIGS[TowerType.PRISM_BEAM].cost}
                                visual={<PrismBeamTank />} 
                                desc="Continuous thermal laser. Bypasses standard viral shielding." 
                                range={`${TOWER_CONFIGS[TowerType.PRISM_BEAM].range.toFixed(1)} Tiles`} 
                            />
                            <ProtocolItem 
                                name={TOWER_CONFIGS[TowerType.RAIL_CANNON].name} 
                                cost={TOWER_CONFIGS[TowerType.RAIL_CANNON].cost}
                                visual={<RailCannonTank />} 
                                desc="Magnetic kinetic accelerator. Devastating long-range capability." 
                                range={`${TOWER_CONFIGS[TowerType.RAIL_CANNON].range.toFixed(1)} Tiles`} 
                            />
                        </div>
                    </div>
                )}
            ]
        },
        {
            name: "HANDBOOK",
            files: [
                { name: "SYSTEM_LOGIC", ext: "DAT", size: "14.5kb", content: (
                    <div className="archive-content-anim" style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '0', right: '0', opacity: 0.1, pointerEvents: 'none' }}>
                            <TopologySchematic />
                        </div>
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// CORE_LOGIC_HANDBOOK</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <LogicItem id="01" title="KERNEL_INTEGRITY" body="Health of your local partition. Reaching 0 results in termination." meta="STATUS: CRITICAL" />
                            <LogicItem id="02" title="DATA_MINING" body="Neutralized viruses release credits for deployments. Bonuses awarded for wave completion." meta="REWARD: SCALE_VAR" />
                            <LogicItem id="03" title="TOPOLOGY_REGS" body="Anchor protocols to nodes. Avoid viral path and buffer zones." meta="GRID: 40PX_TILE" />
                        </div>
                    </div>
                )}
            ]
        },
        {
            name: "SYSTEM_METADATA",
            files: [
                { name: "CREDITS", ext: "LOG", size: "1.2kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// ARCHITECT_ATTRIBUTION</div>
                        <div style={{ padding: '2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)', marginBottom: '2rem' }}>
                            <div style={{ color: '#00ffff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>PRIMARY ARCHITECT: C. McKinley</div>
                            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Responsible for the core simulation logic, quantum grid architecture, and the visual restoration of the Syntax Defense Kernel.
                            </p>
                        </div>
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// CORE_TECH_STACK</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <TechItem label="ENGINE" value="PIXI.js v8.17.1" />
                            <TechItem label="INTERFACE" value="React v19.0.0" />
                            <TechItem label="RUNTIME" value="Vite v8.0.1" />
                            <TechItem label="LANGUAGE" value="TypeScript v5.9.3" />
                        </div>
                    </div>
                )}
            ]
        }
    ];

    const currentFolder = archiveData[selectedFolder];
    const currentFile = currentFolder.files[selectedFile];

    return (
        <div className="system-archive" style={{ 
            backgroundColor: '#0a0a0a', color: '#00ffff', height: '100%', width: '100%',
            display: 'flex', fontFamily: "'Courier New', Courier, monospace", position: 'relative', overflow: 'hidden'
        }}>
            <MenuBackground />
            <div className="full-screen-scan"></div>
            <div style={{ 
                position: 'absolute', inset: '3rem', 
                border: '1px solid #00ffff33', backgroundColor: 'rgba(0,0,0,0.92)',
                display: 'flex', flexDirection: 'column', zIndex: 1, borderRadius: '4px', boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
                <div style={{ padding: '0.8rem 2rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#151515' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ffff', opacity: 0.5 }}>SYSTEM_ARCHIVE_v2.7</span>
                        <span style={{ color: '#444' }}>|</span>
                        <span style={{ fontSize: '0.9rem' }}>{currentFolder.name} / {currentFile.name}.{currentFile.ext}</span>
                    </div>
                    <button 
                        onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}
                        style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', padding: '0.4rem 1.2rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    >
                        [ EXIT_TO_ROOT ]
                    </button>
                </div>
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ width: '22rem', borderRight: '1px solid #00ffff33', padding: '1.5rem', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        {archiveData.map((folder, fIdx) => (
                            <div key={folder.name} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: '#555', fontSize: '0.7rem', marginBottom: '0.5rem', letterSpacing: '2px' }}>[FOLDER] {folder.name}</div>
                                {folder.files.map((file, fileIdx) => (
                                    <button
                                        key={file.name}
                                        onClick={() => { setSelectedFolder(fIdx); setSelectedFile(fileIdx); AudioManager.getInstance().playDataChatter(); }}
                                        style={{
                                            display: 'flex', width: '100%', textAlign: 'left',
                                            background: (selectedFolder === fIdx && selectedFile === fileIdx) ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                                            border: 'none', color: (selectedFolder === fIdx && selectedFile === fileIdx) ? '#00ffff' : '#00ffff66',
                                            padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.2s', alignItems: 'center',
                                            borderLeft: (selectedFolder === fIdx && selectedFile === fileIdx) ? '2px solid #00ffff' : '2px solid transparent'
                                        }}
                                    >
                                        <span style={{ flex: 1 }}>&gt; {file.name}</span>
                                        <span style={{ fontSize: '0.6rem', color: '#333' }}>{file.ext}</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1rem 3rem', backgroundColor: '#0d0d0d', borderBottom: '1px solid #222', display: 'flex', gap: '3rem', fontSize: '0.7rem', color: '#444' }}>
                            <div>FILE_ID: 0x{((selectedFolder + 1) * 10 + selectedFile).toString(16).toUpperCase()}</div>
                            <div>SIZE: {currentFile.size}</div>
                            <div>STATUS: UNRESTRICTED</div>
                        </div>
                        <div className="info-body" style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                            {currentFile.content}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes content-slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .archive-content-anim { animation: content-slide-up 0.4s ease-out forwards; }
                .info-body::-webkit-scrollbar { width: 4px; }
                .info-body::-webkit-scrollbar-thumb { background: #00ffff33; }
                .full-screen-scan { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 2px, 3px 100%; z-index: 5; }
            `}</style>
        </div>
    );
};
