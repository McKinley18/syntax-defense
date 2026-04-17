import React, { useState, useEffect, useRef } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { MenuBackground } from './MenuBackground';
import { AudioManager } from '../systems/AudioManager';
import { VISUAL_REGISTRY, EnemyType } from '../VisualRegistry';
import { TextureGenerator } from '../utils/TextureGenerator';
import * as PIXI from 'pixi.js';

// --- NEW TEXTURE-BASED ICON COMPONENT ---
const TextureIcon: React.FC<{ type: EnemyType }> = ({ type }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const init = async () => {
            const app = new PIXI.Application();
            await app.init({
                width: 60, height: 60,
                backgroundAlpha: 0,
                antialias: true,
                resolution: 2 
            });
            
            const tex = TextureGenerator.getInstance().getEnemyTexture(type);
            if (tex) {
                const sprite = new PIXI.Sprite(tex);
                sprite.anchor.set(0.5);
                sprite.position.set(30, 30);
                sprite.scale.set(1.5); // Slightly larger for archive
                app.stage.addChild(sprite);
                
                // Extract to the ref canvas
                const extract = app.renderer.extract.canvas(app.stage);
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0,0,60,60);
                    ctx.drawImage(extract, 0, 0, 60, 60);
                }
            }
            app.destroy(true);
        };
        init();
    }, [type]);

    return <canvas ref={canvasRef} width="60" height="60" style={{ width: '40px', height: '40px' }} />;
};

const TechItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div style={{ padding: '0.8rem', border: '1px solid #00ffff11', background: 'rgba(0,255,255,0.02)' }}>
        <div style={{ fontSize: '0.55rem', color: '#00ffff66', marginBottom: '0.3rem', letterSpacing: '1px' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{value}</div>
    </div>
);

const ThreatVector: React.FC<{ name: string, type: string, speed: string, armor: string, enemyType: EnemyType }> = ({ name, type, speed, armor, enemyType }) => (
    <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{ width: '3rem', height: '3rem', background: '#000', border: '1px solid #00ffff33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TextureIcon type={enemyType} />
            </div>
            <div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 900, marginBottom: '0.2rem' }}>{name}</div>
                <div style={{ color: '#00ff66', fontSize: '0.6rem', fontWeight: 'bold' }}>CLASS: {type}</div>
            </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.55rem', color: '#666' }}>VELOCITY: <span style={{ color: '#aaa' }}>{speed}x</span></div>
            <div style={{ fontSize: '0.55rem', color: '#666' }}>INTEGRITY: <span style={{ color: '#aaa' }}>{armor}HP</span></div>
        </div>
    </div>
);

export const SystemArchive: React.FC = () => {
    const folders = [
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
                { name: "VIRAL_DB", ext: "EXE" },
                { name: "HARDWARE_SPECS", ext: "SYS" }
            ]
        },
        {
            name: "AUTHORSHIP",
            files: [
                { name: "CREDITS", ext: "LOG" }
            ]
        }
    ];

    const [currentFolder, setCurrentFolder] = useState(folders[1]);
    const [currentFile, setCurrentFile] = useState(folders[1].files[0]);

    return (
        <div className="system-archive" style={{
            position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#000',
            display: 'flex', fontFamily: "'Courier New', Courier, monospace", position: 'relative'
        }}>
            <MenuBackground />
            
            <div style={{ 
                position: 'absolute', inset: '1.5rem', 
                border: '1px solid #00ffff33', backgroundColor: 'rgba(0,0,0,0.92)',
                display: 'flex', flexDirection: 'column', zIndex: 1, borderRadius: '4px', boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #00ffff33', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#151515' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#00ffff', opacity: 0.5, fontSize: '0.7rem' }}>SYSTEM_ARCHIVE_v2.7</span>
                        <span style={{ color: '#444' }}>|</span>
                        <span style={{ fontSize: '0.8rem' }}>{currentFolder.name} / {currentFile.name}</span>
                    </div>
                    <button 
                        onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}
                        style={{ background: 'transparent', border: '1px solid #ff3300', color: '#ff3300', padding: '0.3rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem' }}
                    >
                        [ EXIT ]
                    </button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* SIDEBAR */}
                    <div style={{ width: '16rem', flexShrink: 0, borderRight: '1px solid #00ffff33', padding: '1rem', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        {folders.map((folder, fIdx) => (
                            <div key={fIdx} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: '#555', fontSize: '0.7rem', marginBottom: '0.5rem', letterSpacing: '2px' }}>[FOLDER] {folder.name}</div>
                                {folder.files.map((file, fileIdx) => (
                                    <button
                                        key={fileIdx}
                                        onClick={() => { setCurrentFolder(folder); setCurrentFile(file); AudioManager.getInstance().playUiClick(); }}
                                        style={{
                                            display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left',
                                            background: currentFile.name === file.name ? 'rgba(0,255,255,0.1)' : 'transparent',
                                            border: 'none', color: currentFile.name === file.name ? '#00ffff' : '#888',
                                            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
                                            borderLeft: currentFile.name === file.name ? '3px solid #00ffff' : '3px solid transparent'
                                        }}
                                    >
                                        {file.name}.{file.ext}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', color: '#00ffff' }}>
                        {currentFile.name === "VIRAL_DB" && (
                            <>
                                <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// THREAT_VECTORS_RECOGNIZED</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1.5rem' }}>
                                    <ThreatVector name="GLIDER" type="SCOUT" speed="1.8" armor="20" enemyType={EnemyType.GLIDER} />
                                    <ThreatVector name="STRIDER" type="LOGIC_BOMB" speed="1.3" armor="50" enemyType={EnemyType.STRIDER} />
                                    <ThreatVector name="WORM" type="PARASITE" speed="1.0" armor="120" enemyType={EnemyType.WORM} />
                                    <ThreatVector name="FRACTAL" type="MALWARE" speed="1.5" armor="80" enemyType={EnemyType.FRACTAL} />
                                    <ThreatVector name="PHANTOM" type="STEALTH" speed="2.4" armor="40" enemyType={EnemyType.PHANTOM} />
                                    <ThreatVector name="BEHEMOTH" type="FORTRESS" speed="0.6" armor="250" enemyType={EnemyType.BEHEMOTH} />
                                    <ThreatVector name="K_CRUSHER" type="TITAN_BOSS" speed="0.4" armor="2500" enemyType={EnemyType.BOSS} />
                                </div>
                            </>
                        )}

                        {currentFile.name === "HARDWARE_SPECS" && (
                            <>
                                <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// CORE_TECH_STACK</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem' }}>
                                    <TechItem label="ENGINE" value="PIXI v8.17.1" />
                                    <TechItem label="INTERFACE" value="React v19.0.0" />
                                    <TechItem label="RUNTIME" value="Vite v8.0.1" />
                                    <TechItem label="LANGUAGE" value="TypeScript v5.9.3" />
                                    <TechItem label="ARCHITECT" value="C. MCKINLEY" />
                                </div>
                            </>
                        )}

                        {currentFile.name === "DEPLOYMENT" && (
                            <div style={{ maxWidth: '40rem' }}>
                                <div style={{ color: '#00ff66', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid #00ff6633', paddingBottom: '0.5rem' }}>// DEPLOYMENT_WORKFLOW</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>1. INITIALIZE</h4>
                                        <p style={{ color: '#888', fontSize: '0.75rem', lineHeight: '1.5' }}>Select a matching protocol from the HUD deck. Requires sufficient DATA_CR.</p>
                                    </div>
                                    <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>2. ANCHOR</h4>
                                        <p style={{ color: '#888', fontSize: '0.75rem', lineHeight: '1.5' }}>Deploy onto active grid nodes. Avoid the primary viral path stream.</p>
                                    </div>
                                    <div style={{ padding: '1.2rem', border: '1px solid #00ffff33', background: 'rgba(0,255,255,0.05)' }}>
                                        <h4 style={{ margin: '0 0 10px 0' }}>3. OPTIMIZE</h4>
                                        <p style={{ color: '#888', fontSize: '0.75rem', lineHeight: '1.5' }}>Click deployed units to initiate overclocking or recycle protocols.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {currentFile.name === "CREDITS" && (
                            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '4px', marginBottom: '1rem' }}>SYNTAX_DEFENSE_v1.1</div>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2rem' }}>A HIGH-FIDELITY TACTICAL SIMULATION</div>
                                <div style={{ color: '#00ff66', fontSize: '0.9rem' }}>ARCHITECTED BY C. MCKINLEY</div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '2rem' }}>OS_KERNEL_STABLE // NO_BREACH_DETECTED</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .system-archive::after { content: \" \"; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 2px, 3px 100%; z-index: 5; pointer-events: none; }
            `}</style>
        </div>
    );
};
