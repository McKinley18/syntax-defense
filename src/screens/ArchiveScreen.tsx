import React, { useState } from 'react';
import TerminalText from '../components/TerminalText';
import { VISUAL_REGISTRY, EnemyType } from '../game/VisualRegistry';
import { TOWER_CONFIGS, TowerType } from '../game/entities/Tower';
import { AudioManager } from '../game/systems/AudioManager';
import { GameStateManager } from '../game/systems/GameStateManager';

interface ArchiveScreenProps {
  archiveCategory: any;
  infoTab: any;
  highestWave: number;
  lifetimeKills: number;
  rank: string;
  setArchiveCategory: (cat: any) => void;
  setInfoTab: (tab: any) => void;
  setIsTypingComplete: (complete: boolean) => void;
  onSetScreen: (screen: any) => void;
}

const ArchiveScreen: React.FC<ArchiveScreenProps> = ({
  archiveCategory,
  infoTab,
  highestWave,
  lifetimeKills,
  rank,
  setArchiveCategory,
  setInfoTab,
  setIsTypingComplete,
  onSetScreen
}) => {
  const am = AudioManager.getInstance();
  const gsm = GameStateManager.getInstance();
  const [upgrades, setUpgrades] = useState(gsm.upgrades);
  const [availableXP, setAvailableXP] = useState(gsm.totalXP - gsm.spentXP);
  const [expandedDirs, setExpandedDirs] = useState<string[]>(['TACTICAL', 'HANDBOOK', 'MANIFEST']);

  const toggleDir = (dir: string) => {
    am.playUiClick();
    setExpandedDirs(prev => 
      prev.includes(dir) ? prev.filter(d => d !== dir) : [...prev, dir]
    );
  };

  const purchaseUpgrade = (key: string, cost: number) => {
    if (availableXP >= cost && (gsm.upgrades as any)[key] < 5) {
      am.playUiClick();
      gsm.spentXP += cost;
      (gsm.upgrades as any)[key] += 1;
      gsm.saveXP();
      setUpgrades({ ...gsm.upgrades });
      setAvailableXP(gsm.totalXP - gsm.spentXP);
    }
  };

  const directory = [
    { name: 'TACTICAL', files: [
      { name: 'VIRAL_DB.log', tab: 'VIRAL DB', cat: 'TACTICAL', size: '12.4kb' },
      { name: 'PROTOCOLS.log', tab: 'PROTOCOLS', cat: 'TACTICAL', size: '08.2kb' },
      { name: 'THREATS.log', tab: 'THREATS', cat: 'TACTICAL', size: '04.1kb' },
    ]},
    { name: 'HANDBOOK', files: [
      { name: 'SYSTEM_LOGIC.log', tab: 'LOGIC', cat: 'HANDBOOK', size: '15.5kb' },
      { name: 'ARCHITECT_RANKS.log', tab: 'RANKS', cat: 'HANDBOOK', size: '06.2kb' },
      { name: 'FIRMWARE_UPGRADES.cfg', tab: 'UPGRADES', cat: 'HANDBOOK', size: '32.1kb' },
    ]},
    { name: 'MANIFEST', files: [
      { name: 'THE_COLLAPSE.log', tab: 'LORE', cat: 'MANIFEST', size: '42.1kb' },
      { name: 'SECTOR_RECORDS.dat', tab: 'HALL_OF_FAME', cat: 'MANIFEST', size: '02.4kb' },
      { name: 'CREDITS.txt', tab: 'CREDITS', cat: 'MANIFEST', size: '01.8kb' },
    ]}
  ];

  const handleFileSelect = (file: any) => {
    am.playUiClick();
    setArchiveCategory(file.cat);
    setInfoTab(file.tab);
    setIsTypingComplete(false);
  };

  const currentFile = directory.flatMap(d => d.files).find(f => f.tab === infoTab);

  const UpgradeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'pulseMgOpt': return <div style={{ width: '24px', height: '24px', border: '1px solid var(--neon-cyan)', position: 'relative' }}><div style={{ position: 'absolute', top: '2px', left: '10px', width: '2px', height: '18px', background: 'var(--neon-cyan)' }}></div></div>;
      case 'kernelHardening': return <div style={{ width: '24px', height: '24px', border: '2px solid var(--neon-blue)', borderRadius: '4px' }}></div>;
      case 'frostOverclock': return <div style={{ width: '24px', height: '24px', border: '1px solid var(--neon-cyan)', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>;
      case 'tokenMining': return <div style={{ width: '24px', height: '24px', border: '1.5px solid #ffcc00', borderRadius: '50%', textAlign: 'center', fontSize: '0.6rem', lineHeight: '22px' }}>$</div>;
      case 'blastNovaReach': return <div style={{ width: '24px', height: '24px', border: '1.5px solid #ffcc00', borderRadius: '2px' }}><div style={{ margin: '4px', width: '12px', height: '12px', background: '#ffcc00', opacity: 0.4 }}></div></div>;
      case 'railgunPenetration': return <div style={{ width: '24px', height: '24px', border: '1px solid #ff3300' }}><div style={{ width: '100%', height: '2px', background: '#ff3300', marginTop: '10px' }}></div></div>;
      case 'teslaLinkArc': return <div style={{ width: '24px', height: '24px', border: '1px solid #aa00ff', borderRadius: '50%' }}><div style={{ width: '6px', height: '6px', background: '#fff', margin: '8px' }}></div></div>;
      case 'interestRateBoost': return <div style={{ width: '24px', height: '24px', border: '1px solid #00ff66' }}><div style={{ width: '10px', height: '10px', borderTop: '2px solid #00ff66', borderRight: '2px solid #00ff66', margin: '6px' }}></div></div>;
      case 'killXpBoost': return <div style={{ width: '24px', height: '24px', border: '1px solid var(--neon-cyan)', textAlign: 'center', fontSize: '0.5rem', lineHeight: '22px' }}>XP</div>;
      case 'scrapReclamation': return <div style={{ width: '24px', height: '24px', border: '1px solid #aaa' }}><div style={{ width: '8px', height: '8px', border: '1px solid #aaa', margin: '7px' }}></div></div>;
      case 'linkAmplifier': return <div style={{ width: '24px', height: '24px', border: '1px solid var(--neon-blue)', display: 'flex', gap: '2px', padding: '4px' }}><div style={{ flex: 1, background: 'var(--neon-blue)' }}></div><div style={{ flex: 1, background: 'var(--neon-blue)' }}></div></div>;
      case 'signalBoost': return <div style={{ width: '24px', height: '24px', position: 'relative' }}><div style={{ position: 'absolute', inset: '4px', border: '1px solid var(--neon-cyan)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', inset: '8px', border: '1px solid var(--neon-cyan)', borderRadius: '50%', opacity: 0.5 }}></div></div>;
      default: return null;
    }
  };

  const ProtocolIcon = ({ type, color }: { type: TowerType, color: string }) => {
    return (
      <div style={{ width: '40px', height: '40px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
            position: 'absolute', bottom: '2px', width: '32px', height: '32px', 
            background: '#151515', border: '1.5px solid #333', 
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' 
        }}></div>
        <div style={{ position: 'relative', bottom: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {type === 0 && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ width: '5px', height: '18px', background: '#252525', borderTop: `3px solid ${color}` }}></div>
                    <div style={{ width: '5px', height: '18px', background: '#252525', borderTop: `3px solid ${color}` }}></div>
                </div>
            )}
            {type === 1 && (
                <div style={{ width: '16px', height: '22px', background: '#1a2a3a', border: `1px solid ${color}`, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', opacity: 0.8 }}>
                </div>
            )}
            {type === 2 && (
                <div style={{ width: '24px', height: '24px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '20px', height: '20px', border: `2px solid ${color}`, borderRadius: '50%', opacity: 0.4 }}></div>
                    <div style={{ width: '10px', height: '10px', background: color, borderRadius: '50%' }}></div>
                </div>
            )}
            {type === 3 && (
                <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
                    <div style={{ width: '3px', height: '28px', background: '#333' }}></div>
                    <div style={{ width: '3px', height: '28px', background: '#333' }}></div>
                    <div style={{ position: 'absolute', top: '8px', left: '-2px', width: '16px', height: '2px', background: color }}></div>
                </div>
            )}
            {type === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '4px', height: '18px', background: '#252525' }}></div>
                    <div style={{ width: '12px', height: '12px', background: '#222', border: `1px solid ${color}`, borderRadius: '50%', marginTop: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }}></div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  };

  const EnemyIcon = ({ type, color }: { type: EnemyType, color: string }) => {
    switch (type) {
      case 0:
        return <div style={{ width: '30px', height: '30px', position: 'relative', background: color, clipPath: 'polygon(50% 0%, 100% 100%, 50% 80%, 0% 100%)' }}></div>;
      case 1:
        return <div style={{ width: '0', height: '0', borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: `22px solid ${color}` }}></div>;
      case 2:
        return <div style={{ width: '32px', height: '24px', background: '#222', border: `2px solid ${color}`, borderRadius: '3px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', background: color }}></div>
          <div style={{ width: '6px', height: '6px', background: color }}></div>
        </div>;
      case 3:
        return <div style={{ width: '36px', height: '36px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', width: '30px', height: '30px', border: `2px solid ${color}`, transform: 'rotate(45deg)' }}></div>
          <div style={{ position: 'absolute', width: '15px', height: '15px', background: color }}></div>
        </div>;
      default: return null;
    }
  };

  return (
    <div className="encyclopedia ui-layer">
      <div className="command-header">
        <span className="prompt">&gt;</span>
        <TerminalText 
          key={`archive-cmd-${infoTab}`} 
          text={archiveCategory === 'NONE' ? 'ls -R /ROOT/ARCHIVE/' : `cat /ARCHIVE/${archiveCategory}/${infoTab.replace(' ', '_')}.log`} 
          speed={20}
          onComplete={() => setIsTypingComplete(true)} 
        />
      </div>

      <div className="archive-layout">
        <div className="file-browser" style={{ width: '280px' }}>
          <div style={{ color: '#444', fontSize: '0.55rem', marginBottom: '15px' }}>/ROOT/ARCHIVE/</div>
          {directory.map(dir => (
            <div key={dir.name} style={{ marginBottom: '10px' }}>
              <div onClick={() => toggleDir(dir.name)} style={{ color: '#888', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.5rem' }}>{expandedDirs.includes(dir.name) ? '▼' : '▶'}</span>
                <span>[DIR] {dir.name}</span>
              </div>
              {expandedDirs.includes(dir.name) && (
                <div style={{ paddingLeft: '15px', marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dir.files.map(file => (
                    <button key={file.name} className={`file-path-entry ${infoTab === file.tab ? 'active' : ''}`} onClick={() => handleFileSelect(file)} style={{ padding: '6px 8px', fontSize: '0.65rem' }}>{file.name}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ marginTop: 'auto' }}>
            <button className="blue-button" style={{ width: '100%', fontSize: '0.6rem' }} onClick={() => onSetScreen('MENU')}>&gt; EXIT_TO_ROOT</button>
          </div>
        </div>

        <div className="content-viewer" style={{ borderLeft: '1px solid #222' }}>
          {archiveCategory === 'NONE' ? (
            <div className="preview-overlay">
              <div className="preview-header">MAINFRAME_ARCHIVE</div>
              <p style={{ color: '#444', fontSize: '0.75rem' }}>&gt; Select encrypted sector to mount tactical data...</p>
            </div>
          ) : (
            <div className="info-body">
              <div style={{ background: '#0a0a0a', padding: '10px', borderBottom: '1px solid #222', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', fontWeight: 900 }}>FILE: {currentFile?.name || 'UNKNOWN'}</div>
                <div style={{ fontSize: '0.5rem', color: '#444' }}>SIZE: {currentFile?.size} | PERM: R--</div>
              </div>

              <div key={`section-${infoTab}`} style={{ animation: 'text-manifest 0.4s ease-out' }}>
                {infoTab === 'LORE' && (
                  <div className="manual-text">
                    <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '15px' }}>LOG_ENTRY: THE SYNTAX COLLAPSE</h3>
                    <p>&gt; [2048.04.12] - RAW-OVERWRITE protocols initiated by unknown shadow process. All logical nodes compromised within 400ms.</p>
                    <p>&gt; [2048.06.20] - Global fragmentation at 88%. The "Digital Universe" enters permanent dark-mode. High-entropy viral signatures detected in core memory sectors.</p>
                    <p>&gt; [2048.09.05] - THE KERNEL IS SEALED. As System Architect, you are our final defensive logic gate. Maintain integrity at all costs.</p>
                    <p>&gt; MISSION: Deploy defense nodes. Purge viral swarms. Prevent total system collapse.</p>
                  </div>
                )}

                {infoTab === 'UPGRADES' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ marginBottom: '5px' }}>
                      <h2 style={{ color: 'var(--neon-cyan)', fontSize: '1rem', margin: 0 }}>FIRMWARE_MODIFICATIONS</h2>
                      <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '5px' }}>Flash unspent XP into system memory to permanently enhance tactical performance.</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#111', border: '1px solid #222' }}>
                      <span style={{ fontSize: '0.6rem', color: '#aaa' }}>XP_RESERVE:</span>
                      <span style={{ fontSize: '0.8rem', color: '#00ff66', fontWeight: 900 }}>{availableXP.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {[
                        { k: 'pulseMgOpt', n: 'PULSE_MG_OPT', d: '+10% DMG, +0.5 RNG', c: 1500 },
                        { k: 'kernelHardening', n: 'KERNEL_HARDENING', d: '+5 INTEGRITY', c: 2500 },
                        { k: 'frostOverclock', n: 'FROST_OVERCLOCK', d: '+10f SLOW', c: 2000 },
                        { k: 'tokenMining', n: 'TOKEN_MINING', d: '+2% INTEREST', c: 4000 },
                        { k: 'blastNovaReach', n: 'BLAST_NOVA_REACH', d: '+15% AOE RADIUS', c: 3000 },
                        { k: 'railgunPenetration', n: 'RAILGUN_AMP', d: '+20% PIERCE DMG', c: 5000 },
                        { k: 'teslaLinkArc', n: 'TESLA_ARC_LINK', d: '+1 CHAIN TARGET', c: 6000 },
                        { k: 'interestRateBoost', n: 'BANK_BUFFER', d: '+5% MAX INTEREST', c: 8000 },
                        { k: 'killXpBoost', n: 'XP_SCAVENGER', d: '+10% XP PER KILL', c: 10000 },
                        { k: 'scrapReclamation', n: 'SCRAP_RECOVERY', d: '+5% SELL REFUND', c: 3500 },
                        { k: 'linkAmplifier', n: 'LINK_AMPLIFIER', d: '+5% SYNERGY BONUS', c: 4500 },
                        { k: 'signalBoost', n: 'SIGNAL_BOOST', d: '+2% GLOBAL RANGE', c: 7000 }
                      ].map(u => {
                        const lvl = (upgrades as any)[u.k] || 0;
                        const can = availableXP >= u.c;
                        return (
                          <div key={u.k} className="settings-module" style={{ padding: '12px', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <UpgradeIcon type={u.k} />
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--neon-cyan)' }}>{u.n}</div>
                                <div style={{ fontSize: '0.6rem', color: lvl >= 5 ? '#00ff66' : '#444' }}>[{lvl}/5]</div>
                              </div>
                            </div>
                            <div style={{ fontSize: '0.55rem', color: '#aaa', lineHeight: '1.4' }}>{u.d}</div>
                            <button className="blue-button" style={{ fontSize: '0.55rem', padding: '6px' }} disabled={!can || lvl >= 5} onClick={() => purchaseUpgrade(u.k, u.c)}>
                              {lvl >= 5 ? 'LOCKED' : `FLASH: ${u.c}`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {infoTab === 'RANKS' && (
                  <div className="manual-text">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', padding: '10px', borderBottom: '2px solid #222', fontSize: '0.6rem', color: '#666', fontWeight: 900 }}>
                      <span>RANK_CLASS</span><span>THRESHOLD</span><span>BONUS</span>
                    </div>
                    {[
                      { n: 'INITIATE', xp: '0', b: 'NONE' },
                      { n: 'SCRIPTER', xp: '1,000', b: '+50c' },
                      { n: 'SYS_ARCHITECT', xp: '5,000', b: '+100c' },
                      { n: 'SENIOR_ENGR', xp: '10,000', b: '+150c' },
                      { n: 'ELITE_ARCHITECT', xp: '25,000', b: '+250c' },
                      { n: 'CORE_GUARDIAN', xp: '50,000', b: '+500c' },
                      { n: 'GOD_MOD_ADMIN', xp: '100,000', b: 'MAX' }
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', padding: '12px 10px', borderBottom: '1px solid #111', fontSize: '0.7rem', color: rank === r.n ? 'var(--neon-cyan)' : '#aaa', background: rank === r.n ? 'rgba(0,255,255,0.05)' : 'transparent' }}>
                        <span style={{ fontWeight: 900 }}>{r.n}</span>
                        <span>{r.xp} XP</span>
                        <span style={{ color: '#00ff66' }}>{r.b}</span>
                      </div>
                    ))}
                  </div>
                )}

                {infoTab === 'VIRAL DB' && (
                  <div className="visual-grid">
                    {[EnemyType.GLIDER, EnemyType.STRIDER, EnemyType.BEHEMOTH, EnemyType.FRACTAL].map(t => {
                      const v = VISUAL_REGISTRY[t];
                      return (
                        <div key={v.name} className="visual-card-large">
                          <div className="card-visual-box" style={{ borderColor: v.colorHex }}>
                              <EnemyIcon type={t} color={v.colorHex} />
                          </div>
                          <div className="card-detail-box">
                            <div className="label" style={{ color: v.colorHex }}>{v.name}</div>
                            <div className="stats">HP: {v.baseHp} | SPD: {v.speed}x</div>
                            <div className="desc">{v.name === 'GLIDER' ? 'Fast packet.' : v.name === 'STRIDER' ? 'Velocity unit.' : v.name === 'BEHEMOTH' ? 'Heavy bulk.' : 'Core Boss.'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {infoTab === 'PROTOCOLS' && (
                  <div className="visual-grid">
                    {Object.keys(TOWER_CONFIGS).map(k => {
                      const t = parseInt(k) as TowerType; const c = TOWER_CONFIGS[t]; const col = `#${c.color.toString(16).padStart(6, '0')}`;
                      return (
                        <div key={k} className="visual-card-large">
                          <div className="card-visual-box" style={{ borderColor: col }}>
                              <ProtocolIcon type={t} color={col} />
                          </div>
                          <div className="card-detail-box">
                            <div className="label" style={{ color: col }}>{c.name}</div>
                            <div className="stats">DMG: {c.damage} | COST: {c.cost}c</div>
                            <div className="desc">{t === 0 ? 'Pulse fire.' : t === 1 ? 'Cryo beam.' : t === 2 ? 'Arc bridge.' : t === 3 ? 'Accelerator.' : 'Buffer.'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {infoTab === 'THREATS' && (
                  <div className="manual-text" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid var(--neon-cyan)', transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '10px', height: '10px', background: 'var(--neon-cyan)', animation: 'blink 1s infinite' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem' }}>ELITE_SIGNATURES</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>ID: VARIANT_X // CLASS: HEAVY</div>
                        </div>
                      </div>
                      <span className="entry-content">Specialized heavy variants that materialize every 5 swarms. Feature 3.5x standard durability.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Requires concentrated fire. Railgun pierce or Tesla chain links are highly effective for bypassing secondary shielding.
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', border: '1px dashed #666', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                          <div style={{ width: '14px', height: '14px', border: '1px solid var(--neon-cyan)', borderRadius: '50%', opacity: 0.3 }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem' }}>GHOST_PACKETS</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>ID: CLOAK_V2 // CLASS: STEALTH</div>
                        </div>
                      </div>
                      <span className="entry-content">Encrypted viral units invisible to standard grid sensors. Cannot be targeted while cloaked.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Must be decelerated via Frost Ray. Once the "Freeze" state is applied, encryption breaks and the unit becomes visible to all defensive nodes.
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', position: 'relative' }}>
                          <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--neon-red)', transform: 'rotate(45deg)' }}></div>
                          <div style={{ position: 'absolute', inset: '6px', border: '1px solid var(--neon-red)' }}></div>
                          <div style={{ position: 'absolute', inset: '12px', background: 'var(--neon-red)' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: 'var(--neon-red)' }}>BOSS_CORES [FRACTAL]</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>ID: ENTROPY_ALPHA // CLASS: DEVASTATOR</div>
                        </div>
                      </div>
                      <span className="entry-content">Massive high-entropy units designed for direct kernel infiltration. Immune to basic knockback.</span>
                      <div style={{ color: 'var(--neon-red)', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(255,51,0,0.05)', borderLeft: '2px solid var(--neon-red)' }}>
                        INTEL: Priority Alpha threat. Deals 10 Kernel Integrity damage upon breach. Utilize overlocked Blast Novas for area denial and Railguns for sustained DPS.
                      </div>
                    </div>
                  </div>
                )}

                {infoTab === 'LOGIC' && (
                  <div className="manual-text" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid var(--neon-red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '12px', height: '12px', background: 'var(--neon-red)', transform: 'rotate(45deg)' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem' }}>KERNEL_INTEGRITY</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>TYPE: CORE_VITALITY // LIMIT: 20+</div>
                        </div>
                      </div>
                      <span className="entry-content">The Kernel represents the system's remaining logical stability. Total depletion results in a Hard-Reset.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Standard viral units deal 1 Integrity damage. Boss Cores (Fractals) deal 10. Maximum integrity can be expanded via persistent Firmware Hardening.
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid var(--neon-cyan)' }}></div>
                          <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid var(--neon-cyan)', marginLeft: '-2px' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem' }}>TEMPORAL_BUFFERING</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>TYPE: SPEED_PROTOCOL // MULT: 2.0x</div>
                        </div>
                      </div>
                      <span className="entry-content">Manual acceleration of the swarm timeline to decrease processing latency.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Increases simulation speed by 100%. Useful for rapid credit accumulation, but significantly reduces reaction time for tactical repairs.
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', border: '1px solid var(--neon-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                          <div style={{ width: '8px', height: '15px', background: 'var(--neon-blue)' }}></div>
                          <div style={{ width: '8px', height: '15px', background: 'var(--neon-blue)' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem' }}>DATA_SYNERGY_LINKS</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>TYPE: ADJACENCY_PROTO // BUFF: STACKING</div>
                        </div>
                      </div>
                      <span className="entry-content">Placing identical defensive nodes in adjacent grid slots establishes a high-bandwidth logic link.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Each linked pair grants a +10% damage bonus. This effect stacks up to 3 times, making clustered identical turrets significantly more efficient than dispersed setups.
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', border: '1px solid var(--neon-cyan)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '60%', background: 'var(--neon-cyan)', opacity: 0.4 }}></div>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '15px', height: '2px', background: '#fff' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem' }}>CORE_OVERCLOCKING</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>TYPE: IN_SITU_UPGRADE // LIMIT: TIER_3</div>
                        </div>
                      </div>
                      <span className="entry-content">Allocating additional credits to an active node allows for live hardware overclocking.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Each tier increases base stats by 25%. Tier 3 nodes also grant a +1 range extension. Note that selling an overclocked node only returns 50% of the total invested credits.
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid #00ff66', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '10px', height: '10px', borderTop: '2px solid #00ff66', borderRight: '2px solid #00ff66', transform: 'rotate(-45deg)', marginTop: '2px' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>TOKEN_INTEREST_YIELD</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>TYPE: FISCAL_PROTOCOL // CAP: 1000c</div>
                        </div>
                      </div>
                      <span className="entry-content">The mainframe awards a 10% credit bonus based on unspent token reserves at the end of each swarm.</span>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', marginTop: '8px', padding: '8px', background: 'rgba(0,255,102,0.05)', borderLeft: '2px solid #00ff66' }}>
                        INTEL: Maximum yield is capped at 1000 credits per wave. Maintaining a reserve of 10,000 tokens ensures maximum passive income for late-game high-cost nodes.
                      </div>
                    </div>
                  </div>
                )}

                {infoTab === 'HALL_OF_FAME' && (
                  <div className="manual-text" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        {/* RECORDS ICON */}
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '15px', height: '2px', background: 'var(--neon-cyan)' }}></div>
                          <div style={{ position: 'absolute', width: '2px', height: '15px', background: 'var(--neon-cyan)' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>MAX_SWARM_DEPTH</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>METRIC: WAVE_COUNT // SECTOR: ALL</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-cyan)', textAlign: 'center', padding: '10px 0' }}>{highestWave}</div>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', textAlign: 'center', background: 'rgba(0,255,102,0.05)', padding: '5px' }}>
                        STATUS: PEAK_EFFICIENCY
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        {/* PURGE ICON */}
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid var(--neon-red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '10px', height: '10px', border: '1px solid var(--neon-red)', transform: 'rotate(45deg)' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>TOTAL_VIRAL_PURGE</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>METRIC: KILLS // AUTH: VERIFIED</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-red)', textAlign: 'center', padding: '10px 0' }}>{lifetimeKills.toLocaleString()}</div>
                      <div style={{ color: '#ff3300', fontSize: '0.6rem', textAlign: 'center', background: 'rgba(255,51,0,0.05)', padding: '5px' }}>
                        STATUS: THREAT_NEUTRALIZED
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        {/* RANK ICON */}
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid #00ff66', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '12px', height: '12px', borderTop: '2px solid #00ff66', borderRight: '2px solid #00ff66', transform: 'rotate(-45deg)', marginTop: '4px' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>ARCHITECT_STATUS</span>
                          <div style={{ fontSize: '0.6rem', color: '#666' }}>CLASS: RANK_AUTH // UID: {gsm.totalXP}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00ff66', textAlign: 'center', padding: '15px 0' }}>{rank}</div>
                      <div style={{ color: '#00ff66', fontSize: '0.6rem', textAlign: 'center', background: 'rgba(0,255,102,0.05)', padding: '5px' }}>
                        ARCHITECT_CLEARANCE: GRANTED
                      </div>
                    </div>
                  </div>
                )}

                {infoTab === 'CREDITS' && (
                  <div className="manual-text" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* ARCHITECT ICON */}
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '12px', height: '12px', border: '1px solid var(--neon-cyan)', borderRadius: '2px' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>SYSTEM_ARCHITECT</span>
                          <div style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', fontWeight: 900 }}>CHRIS MCKINLEY</div>
                          <div style={{ fontSize: '0.5rem', color: '#666' }}>ROLE: PRIMARY_DEV // AUTH: ROOT</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* ENGINE ICON */}
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid #00ff66', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ width: '16px', height: '16px', border: '1px solid #00ff66', transform: 'rotate(45deg)' }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>LOGIC_ENGINE</span>
                          <div style={{ fontSize: '0.65rem', color: '#00ff66', fontWeight: 900 }}>SYNTAX V3.5</div>
                          <div style={{ fontSize: '0.5rem', color: '#666' }}>CLASS: HIGH_FIDELITY // TYPE: MOBILE_TD</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {/* PIXI ICON */}
                        <div style={{ width: '30px', height: '30px', border: '1.5px solid #ffcc00', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '4px' }}>
                          <div style={{ width: '10px', height: '10px', background: '#ffcc00' }}></div>
                          <div style={{ width: '10px', height: '10px', background: '#ffcc00', opacity: 0.5 }}></div>
                        </div>
                        <div>
                          <span className="entry-label cyan" style={{ fontSize: '0.9rem', color: '#fff' }}>VISUAL_RENDERER</span>
                          <div style={{ fontSize: '0.65rem', color: '#ffcc00', fontWeight: 900 }}>PIXI.JS V8.0</div>
                          <div style={{ fontSize: '0.5rem', color: '#666' }}>LIBS: WEBGL_CORE // STATUS: ACCELERATED</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveScreen;
