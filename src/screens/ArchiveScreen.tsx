import React from 'react';
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
  const [upgrades, setUpgrades] = React.useState(gsm.upgrades);
  const [availableXP, setAvailableXP] = React.useState(gsm.totalXP - gsm.spentXP);

  const purchaseUpgrade = (key: keyof typeof gsm.upgrades, cost: number) => {
    if (availableXP >= cost && gsm.upgrades[key] < 5) {
      am.playUiClick();
      gsm.spentXP += cost;
      gsm.upgrades[key] += 1;
      gsm.saveXP();
      setUpgrades({ ...gsm.upgrades });
      setAvailableXP(gsm.totalXP - gsm.spentXP);
    }
  };

  const getCommandText = () => {
    if (archiveCategory === 'NONE') return 'ls -R /ARCHIVE/';
    return `cat /ARCHIVE/${archiveCategory}/${infoTab.replace(' ', '_')}.log`;
  };

  const handleCategorySelect = (cat: string, initialTab: string) => {
    am.playUiClick();
    setArchiveCategory(cat);
    setInfoTab(initialTab);
    setIsTypingComplete(false);
  };

  return (
    <div className="encyclopedia ui-layer">
      <div className="command-header">
        <span className="prompt">&gt;</span>
        <TerminalText 
          key={`archive-title-${archiveCategory}-${infoTab}`} 
          text={getCommandText()} 
          speed={20}
          onComplete={() => setIsTypingComplete(true)} 
        />
      </div>

      <div className="enc-content">
        {/* GLOBAL NAVIGATION HEADER */}
        <div className="info-tabs" style={{ justifyContent: 'center', borderBottom: '1px solid #222', paddingBottom: '15px', marginBottom: '20px' }}>
          <button className={archiveCategory === 'TACTICAL' ? 'active' : ''} onClick={() => handleCategorySelect('TACTICAL', 'VIRAL DB')}>TACTICAL_DB</button>
          <button className={archiveCategory === 'HANDBOOK' ? 'active' : ''} onClick={() => handleCategorySelect('HANDBOOK', 'LOGIC')}>SYSTEM_HANDBOOK</button>
          <button className={archiveCategory === 'MANIFEST' ? 'active' : ''} onClick={() => handleCategorySelect('MANIFEST', 'LORE')}>MAINFRAME_MANIFEST</button>
        </div>

        {archiveCategory === 'NONE' ? (
          <div className="menu-content-centered" style={{ gap: '20px', marginTop: '40px' }}>
            <div style={{ textAlign: 'center', color: '#444', fontSize: '0.7rem', marginBottom: '10px' }}>SELECT DATA BRANCH TO INITIALIZE SCAN...</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '400px' }}>
              <button className="blue-button" onClick={() => handleCategorySelect('TACTICAL', 'VIRAL DB')}>&gt; ACCESS TACTICAL_DATABASE</button>
              <button className="blue-button" onClick={() => handleCategorySelect('HANDBOOK', 'LOGIC')}>&gt; ACCESS SYSTEM_HANDBOOK</button>
              <button className="blue-button" onClick={() => handleCategorySelect('MANIFEST', 'LORE')}>&gt; ACCESS MAINFRAME_MANIFEST</button>
            </div>
          </div>
        ) : (
          <>
            <div className="info-tabs">
              {archiveCategory === 'TACTICAL' && (
                <>
                  <button className={infoTab === 'VIRAL DB' ? 'active' : ''} onClick={() => setInfoTab('VIRAL DB')}>VIRUSES</button>
                  <button className={infoTab === 'PROTOCOLS' ? 'active' : ''} onClick={() => setInfoTab('PROTOCOLS')}>TURRETS</button>
                  <button className={infoTab === 'THREATS' ? 'active' : ''} onClick={() => setInfoTab('THREATS')}>THREATS</button>
                </>
              )}
              {archiveCategory === 'HANDBOOK' && (
                <>
                  <button className={infoTab === 'LOGIC' ? 'active' : ''} onClick={() => setInfoTab('LOGIC')}>LOGIC</button>
                  <button className={infoTab === 'RANKS' ? 'active' : ''} onClick={() => setInfoTab('RANKS')}>RANKS</button>
                  <button className={infoTab === 'UPGRADES' ? 'active' : ''} onClick={() => setInfoTab('UPGRADES')}>UPGRADES</button>
                </>
              )}
              {archiveCategory === 'MANIFEST' && (
                <>
                  <button className={infoTab === 'LORE' ? 'active' : ''} onClick={() => setInfoTab('LORE')}>LORE</button>
                  <button className={infoTab === 'HALL_OF_FAME' ? 'active' : ''} onClick={() => setInfoTab('HALL_OF_FAME')}>RECORDS</button>
                  <button className={infoTab === 'CREDITS' ? 'active' : ''} onClick={() => setInfoTab('CREDITS')}>CREDITS</button>
                </>
              )}
            </div>

            <div className="info-body">
              {infoTab === 'LORE' && (
                <div className="manual-text">
                  <p style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>&gt;&gt; LOG ENTRY: THE SYNTAX COLLAPSE</p>
                  <p>&gt; IN THE YEAR 2048, THE GLOBAL NETWORK EXPERIENCED A CATASTROPHIC RAW-OVERWRITE. THE WORLD'S DATA WAS FRAGMENTED INTO HOSTILE VIRAL SIGNATURES.</p>
                  <p>&gt; THE KERNEL IS THE LAST REMAINING BASTION OF PURE LOGIC. IF IT FALLS, THE DIGITAL UNIVERSE WILL DESCEND INTO PERMANENT ENTROPY.</p>
                  <p>&gt; YOU ARE THE SYSTEM ARCHITECT. YOUR MISSION IS TO DEPLOY DEFENSE NODES AND PURGE THE SWARMS BEFORE THEY BREACH THE CORE MEMORY BANKS.</p>
                </div>
              )}
              {infoTab === 'HALL_OF_FAME' && (
                <div className="hof-container">
                  <div className="hof-card"><div className="hof-label">MAX WAVE REACHED</div><div className="hof-value">{highestWave}</div></div>
                  <div className="hof-card"><div className="hof-label">TOTAL VIRUSES PURGED</div><div className="hof-value">{lifetimeKills.toLocaleString()}</div></div>
                  <div className="hof-card"><div className="hof-label">ARCHITECT STATUS</div><div className="hof-value" style={{ color: '#00ff66' }}>{rank}</div></div>
                </div>
              )}
              {infoTab === 'VIRAL DB' && (
                <div className="visual-grid">
                  {[EnemyType.GLIDER, EnemyType.STRIDER, EnemyType.BEHEMOTH, EnemyType.FRACTAL].map(type => {
                    const v = VISUAL_REGISTRY[type];
                    return (
                      <div key={v.name} className="visual-card-large">
                        <div className="card-visual-box" style={{ borderColor: v.colorHex }}>
                          <div className="mini-enemy" style={{ color: v.colorHex }}>
                            <div className={`shape ${v.shape}`} style={v.shape !== 'triangle' ? { background: v.colorHex } : { borderBottomColor: v.colorHex }}></div>
                          </div>
                        </div>
                        <div className="card-detail-box">
                          <div className="label" style={{ color: v.colorHex }}>{v.name}</div>
                          <div className="stats">HP: {v.baseHp} // SPD: {v.speed}x</div>
                          <div className="desc">{v.name === 'GLIDER' ? 'Rapid packet stream. Low integrity.' : v.name === 'STRIDER' ? 'High-velocity unit. 50% Pulse MG Resistance.' : v.name === 'BEHEMOTH' ? 'Heavy bulk data. High defensive priority.' : 'Core-Breaker Boss. High entropy unit.'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {infoTab === 'PROTOCOLS' && (
                <div className="visual-grid">
                  {Object.keys(TOWER_CONFIGS).map(key => {
                    const type = parseInt(key) as TowerType;
                    const cfg = TOWER_CONFIGS[type];
                    const color = `#${cfg.color.toString(16).padStart(6, '0')}`;
                    return (
                      <div key={key} className="visual-card-large">
                        <div className="card-visual-box" style={{ borderColor: color }}>
                          <div className="mini-turret" data-type={type} style={{ transform: 'scale(1.3)' }}>
                            <div className="mini-base"></div>
                            <div className="mini-head">
                              <div className="mini-weapon"></div>
                              <div className="mini-core" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="card-detail-box">
                          <div className="label" style={{ color: color }}>{cfg.name}</div>
                          <div className="stats">DMG: {cfg.damage} // COST: {cfg.cost}c</div>
                          <div className="desc">{type === 0 ? 'Rapid-fire logic pulse.' : type === 1 ? 'Cryo-cycle reduction beam.' : type === 2 ? 'High-voltage bridge.' : type === 3 ? 'Sub-atomic accelerator.' : 'Global system buffer.'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {infoTab === 'UPGRADES' && (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--neon-blue)', paddingBottom: '10px', marginBottom: '15px' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 900, letterSpacing: '1px' }}>FIRMWARE_UPGRADES</span>
                    <span style={{ color: '#fff', fontSize: '0.8rem' }}>AVAILABLE_XP: <span style={{ color: '#00ff66' }}>{availableXP.toLocaleString()}</span></span>
                  </div>
                  
                  <div className="settings-grid">
                    {[
                      { key: 'pulseMgOpt', name: 'PULSE_MG_OPT', desc: '+10% DMG, +0.5 Range per level.', cost: 1500 },
                      { key: 'kernelHardening', name: 'KERNEL_HARDENING', desc: '+5 Max Integrity per level.', cost: 2500 },
                      { key: 'frostOverclock', name: 'FROST_OVERCLOCK', desc: '+10 Frames Slow duration per level.', cost: 2000 },
                      { key: 'tokenMining', name: 'TOKEN_MINING', desc: '+2% Base Interest per level.', cost: 4000 }
                    ].map(u => {
                      const lvl = upgrades[u.key as keyof typeof upgrades];
                      const canAfford = availableXP >= u.cost;
                      const maxed = lvl >= 5;
                      return (
                        <div key={u.key} className="settings-module" style={{ gap: '10px' }}>
                          <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{u.name}</span>
                            <span style={{ color: maxed ? '#00ff66' : '#aaa' }}>Lv {lvl}/5</span>
                          </h3>
                          <div style={{ fontSize: '0.65rem', color: '#888', flex: 1 }}>{u.desc}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.7rem', color: maxed ? '#00ff66' : (canAfford ? 'var(--neon-cyan)' : 'var(--neon-red)') }}>
                              {maxed ? 'MAXIMUM' : `COST: ${u.cost.toLocaleString()} XP`}
                            </span>
                            <button 
                              className="blue-button" 
                              style={{ padding: '6px 12px', fontSize: '0.6rem' }}
                              disabled={!canAfford || maxed}
                              onClick={() => purchaseUpgrade(u.key as any, u.cost)}
                            >
                              {maxed ? 'MAXED' : 'FLASH_ROM'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {infoTab === 'THREATS' && (
                <div className="manual-text">
                  <div className="manual-entry"><span className="entry-label cyan">ELITE SIGNATURES:</span><span className="entry-content">EVERY 5 SWARMS, MINI-BOSSES WITH 3.5x HP MATERIALIZE.</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">GHOST PACKETS:</span><span className="entry-content">INVISIBLE ON THE GRID SENSOR. REVEALED BY FROST RAY.</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">BOSS CORE:</span><span className="entry-content">FRACTAL VIRUSES DEAL 10 UNITS OF DAMAGE TO KERNEL.</span></div>
                </div>
              )}
              {infoTab === 'LOGIC' && (
                <div className="manual-text">
                  <div className="manual-entry"><span className="entry-label cyan">DATA LINKS:</span><span className="entry-content">PLACING IDENTICAL TURRETS ADJACENT FORMS A SYNERGY LINK.</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">OVERCLOCKING:</span><span className="entry-content">TAP ANY PLACED TURRET TO UPGRADE ITS CORE (3 LEVELS).</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">INTEREST:</span><span className="entry-content">MAINTAIN A HIGH TOKEN BALANCE TO EARN 10% INTEREST.</span></div>
                </div>
              )}
              {infoTab === 'RANKS' && (
                <div className="manual-text">
                  <div className="manual-entry"><span className="entry-label cyan">INITIATE:</span><span className="entry-content">STARTING RANK. NO BONUS.</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">SCRIPTER:</span><span className="entry-content">1,000 XP REQUIRED. +50 TOKEN BONUS.</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">SYS_ARCHITECT:</span><span className="entry-content">5,000 XP REQUIRED. +100 TOKEN BONUS.</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">SENIOR_ENGR:</span><span className="entry-content">10,000 XP REQUIRED. +150 TOKEN BONUS.</span></div>
                </div>
              )}
              {infoTab === 'CREDITS' && (
                <div className="manual-text">
                  <div className="manual-entry"><span className="entry-label cyan">ARCHITECT:</span><span className="entry-content">CHRIS MCKINLEY</span></div>
                  <div className="manual-entry"><span className="entry-label cyan">ENGINE:</span><span className="entry-content">SYNTAX V3.5 [ELITE]</span></div>
                  <div style={{ marginTop: '20px', color: '#444', fontSize: '0.6rem' }}>&gt; UNAUTHORIZED REPLICATION PROHIBITED.</div>
                </div>
              )}
            </div>
          </>
        )}
        
        <button className="blue-button back-btn" onClick={() => { am.playUiClick(); onSetScreen('MENU'); setIsTypingComplete(false); }}>RETURN TO ROOT</button>
      </div>
    </div>
  );
};

export default ArchiveScreen;
