import React, { useState } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';

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
                { name: "HUD_LAYOUT", ext: "MAN", size: "18.4kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// INTERFACE_ANNOTATION</div>
                        <div style={{ position: 'relative', width: '100%', height: '20rem', background: 'rgba(0,255,255,0.02)', border: '1px solid #00ffff22', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <DashboardDiagram />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <ManualSection title="[01] RESOURCE_FEED" body="Located TOP-LEFT. Displays your current DATA_CR (Credits). Necessary for authorizing protocol deployments." />
                            <ManualSection title="[02] INTEGRITY_BAR" body="Located TOP-RIGHT. Monitors KERNEL stability. If this gauge reaches zero, the session is terminated." />
                            <ManualSection title="[03] PROTOCOL_DECK" body="Located BOTTOM-CENTER. Your active arsenal. Click an icon to select a turret for deployment." />
                            <ManualSection title="[04] TACTICAL_GRID" body="The central workspace. All viral signatures travel along the designated high-intensity path." />
                        </div>
                    </div>
                )},
                { name: "DEPLOYMENT_MANUAL", ext: "MAN", size: "12.1kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// DEPLOYMENT_WORKFLOW</div>
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ flex: 1, padding: '1.5rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '1rem' }}>STEP_01: SELECTION</div>
                                <p style={{ fontSize: '0.9rem', color: '#888' }}>Identify the threat class. Select a matching protocol from the BOTTOM_DECK. Ensure you have sufficient DATA_CR.</p>
                            </div>
                            <div style={{ flex: 1, padding: '1.5rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                <div style={{ color: '#00ffff', fontWeight: 'bold', marginBottom: '1rem' }}>STEP_02: ANCHORING</div>
                                <p style={{ fontSize: '0.9rem', color: '#888' }}>Hover over an open network node. A cyan preview will appear. Click to lock the protocol to that coordinate.</p>
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: '100%', height: '15rem', background: '#000', border: '1px solid #00ffff33', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <DeploymentVisual />
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
                            <ThreatCard name="GLIDER" type="INFECTOR" speed="2.2" armor="20" visual={<GliderVisual />} desc="High-velocity data packets. [Anim: SIGNAL_FLUTTER]" />
                            <ThreatCard name="STRIDER" type="INFILTRATOR" speed="1.4" armor="45" visual={<StriderVisual />} desc="Tripod scanning units. [Anim: LOCOMOTION_PULSE]" />
                            <ThreatCard name="BEHEMOTH" type="TANK" speed="0.6" armor="250" visual={<BehemothVisual />} desc="Massive armored clusters. [Anim: CORE_THROB]" />
                            <ThreatCard name="FRACTAL" type="SPLITTER" speed="1.1" armor="80" visual={<FractalVisual />} desc="Complex entities that segment. [Anim: GEOMETRIC_ROTATION]" />
                        </div>
                    </div>
                )},
                { name: "PROTOCOLS", ext: "CFG", size: "2.8kb", content: (
                    <div className="archive-content-anim">
                        <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// DEPLOYMENT_ASSETS_ORDINANCE</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ProtocolItem name="PULSE_NODE" visual={<PulseNodeTank />} desc="Tank-style rapid-fire pulse unit." range="4.0 Tiles" />
                            <ProtocolItem name="STASIS_FIELD" visual={<StasisFieldTank />} desc="Temporal interference dish." range="3.0 Tiles" />
                            <ProtocolItem name="RAIL_CANNON" visual={<RailCannonTank />} desc="Magnetic kinetic accelerator." range="8.0 Tiles" />
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
                            <LogicItem id="02" title="DATA_MINING" body="Neutralized viruses release credits for deployments." meta="REWARD: SCALE_VAR" />
                            <LogicItem id="03" title="TOPOLOGY_REGS" body="Anchor protocols to nodes. Avoid viral path and buffer zones." meta="GRID: 40PX_TILE" />
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

const ManualSection: React.FC<{ title: string, body: string }> = ({ title, body }) => (
    <div style={{ border: '1px solid #00ffff11', padding: '1rem', background: 'rgba(0,255,255,0.02)' }}>
        <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>{body}</div>
    </div>
);

const DashboardDiagram = () => (
    <svg viewBox="0 0 400 200" width="100%" height="100%" fill="none" stroke="#00ffff" strokeWidth="1">
        {/* HUD Frame */}
        <rect x="10" y="10" width="380" height="180" strokeOpacity="0.2" rx="4" />
        {/* Top Left: Credits */}
        <rect x="20" y="20" width="80" height="30" strokeWidth="2" />
        <text x="25" y="40" fill="#00ffff" fontSize="10" fontWeight="bold">CREDITS [01]</text>
        <path d="M100 35 L120 35" strokeDasharray="2 2" strokeOpacity="0.5" />
        {/* Top Right: Integrity */}
        <rect x="300" y="20" width="80" height="30" strokeWidth="2" />
        <text x="305" y="40" fill="#00ffff" fontSize="10" fontWeight="bold">INTEGRITY [02]</text>
        <path d="M300 35 L280 35" strokeDasharray="2 2" strokeOpacity="0.5" />
        {/* Bottom Center: Deck */}
        <rect x="120" y="150" width="160" height="35" strokeWidth="2" />
        <text x="155" y="172" fill="#00ffff" fontSize="10" fontWeight="bold">DECK [03]</text>
        {/* Grid Preview */}
        <rect x="120" y="60" width="160" height="80" strokeOpacity="0.1" strokeDasharray="2 2" />
        <text x="165" y="105" fill="#00ffff" fontSize="8" opacity="0.3">GRID_WORKSPACE [04]</text>
    </svg>
);

const DeploymentVisual = () => (
    <svg viewBox="0 0 400 150" width="100%" height="100%" fill="none" stroke="#00ffff" strokeWidth="1">
        <rect x="150" y="50" width="40" height="40" strokeDasharray="4 4" />
        <path d="M170 130 V100" stroke="#00ffff" strokeWidth="2" />
        <circle cx="170" cy="130" r="5" fill="#00ffff" />
        <text x="185" y="135" fill="#00ffff" fontSize="10">USER_INTERACTION</text>
        {/* Preview Ghost */}
        <rect x="155" y="55" width="30" height="30" fill="#00ffff11" stroke="#00ffff33" />
        <text x="200" y="75" fill="#00ffff" fontSize="8" opacity="0.5">PREVIEW_SIGNAL</text>
    </svg>
);

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

const TopologySchematic = () => (
    <svg viewBox="0 0 200 200" width="300" height="300" fill="none" stroke="#00ffff" strokeWidth="0.5">
        <rect x="10" y="40" width="180" height="120" strokeDasharray="2 2" />
        <rect x="10" y="40" width="180" height="20" fill="#00ffff05" />
        <rect x="10" y="130" width="180" height="30" fill="#00ffff05" />
    </svg>
);

const ThreatCard: React.FC<{ name: string, type: string, speed: string, armor: string, visual: React.ReactNode, desc: string }> = ({ name, type, speed, armor, visual, desc }) => (
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
        </div>
    </div>
);

const ProtocolItem: React.FC<{ name: string, visual: React.ReactNode, desc: string, range: string }> = ({ name, visual, desc, range }) => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #222', background: 'rgba(0, 255, 255, 0.02)' }}>
        <div style={{ width: '6rem', height: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #00ffff33', background: '#000', borderRadius: '4px' }}>{visual}</div>
        <div style={{ flex: 1 }}>
            <div style={{ color: '#00ffff', fontWeight: 'bold', fontSize: '1.2rem' }}>[{name}]</div>
            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>{desc}</div>
        </div>
        <div style={{ color: '#00ff66', fontSize: '0.9rem', textAlign: 'right', width: '10rem' }}>{range}</div>
    </div>
);

// --- VIRAL THREAT VISUALS ---
const GliderVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#00ffff" strokeWidth="2"><path d="M20 5 L35 25 L20 20 L5 25 Z" fill="#00ffff33" /></svg>;
const StriderVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#00ffff" strokeWidth="2"><circle cx="20" cy="15" r="8" fill="#00ffff11" /><path d="M12 25 L8 35 M28 25 L32 35 M20 23 V35" /></svg>;
const BehemothVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#00ffff" strokeWidth="3"><rect x="8" y="8" width="24" height="24" rx="2" fill="#00ffff22" /></svg>;
const FractalVisual = () => <svg viewBox="0 0 40 40" width="100%" height="100%" fill="none" stroke="#00ffff" strokeWidth="2"><path d="M20 5 L35 15 V25 L20 35 L5 25 V15 Z" /></svg>;

// --- TOWER VISUALS ---
const TankOctagonBase = () => <path d="M12 4 L28 4 L36 12 V28 L28 36 L12 36 L4 28 V12 Z" fill="#0a0a0a" stroke="#222" strokeWidth="2" />;
const PulseNodeTank = () => <svg viewBox="0 0 40 40"><TankOctagonBase /><circle cx="20" cy="20" r="10" fill="#151515" stroke="#444" /><rect x="14" y="2" width="4" height="18" fill="#222" stroke="#00ffff" /><rect x="22" y="2" width="4" height="18" fill="#222" stroke="#00ffff" /></svg>;
const StasisFieldTank = () => <svg viewBox="0 0 40 40"><TankOctagonBase /><circle cx="20" cy="20" r="10" fill="#151515" stroke="#444" /><path d="M10 15 A 12 12 0 0 1 30 15" stroke="#ffaa00" strokeWidth="4" /></svg>;
const RailCannonTank = () => <svg viewBox="0 0 40 40"><TankOctagonBase /><circle cx="20" cy="20" r="10" fill="#151515" stroke="#444" /><rect x="12" y="2" width="4" height="28" fill="#111" stroke="#ff00ff" /><rect x="24" y="2" width="4" height="28" fill="#111" stroke="#ff00ff" /></svg>;
