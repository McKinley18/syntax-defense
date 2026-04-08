import React from 'react';
import TerminalText from '../components/TerminalText';
import { VISUAL_REGISTRY } from '../game/VisualRegistry';
import { TOWER_CONFIGS, TowerType } from '../game/entities/Tower';

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
  const getCommandText = () => {
    if (archiveCategory === 'NONE') {
      return 'ls -R /ARCHIVE/';
    }
    const path = `/ARCHIVE/${archiveCategory}/${infoTab}.log`;
    return `cat ${path}`;
  };

  return (
    <div className="encyclopedia ui-layer">
      <div className="enc-header command-header">
        <span className="prompt static-prompt">&gt;</span>
        <TerminalText 
          key={`archive-title-${archiveCategory}-${infoTab}`} 
          text={getCommandText()} 
          speed={25}
          onComplete={() => setIsTypingComplete(true)} 
        />
      </div>
      <div className="enc-content" style={{ pointerEvents: 'auto', opacity: 1 }}>
        <div className="info-hub">
          {archiveCategory === 'NONE' ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <div className="menu-options-grid" style={{ width: '100%', maxWidth: '600px' }}>
                <button className="cyan-menu-btn" onClick={() => { am.playUiClick(); setArchiveCategory('TACTICAL'); setInfoTab('VIRAL DB'); }}>TACTICAL DATABASE</button>
                <button className="cyan-menu-btn" onClick={() => { am.playUiClick(); setArchiveCategory('HANDBOOK'); setInfoTab('LOGIC'); }}>SYSTEM HANDBOOK</button>
                <button className="cyan-menu-btn primary-btn" onClick={() => { am.playUiClick(); setArchiveCategory('MANIFEST'); setInfoTab('LORE'); }}>MAINFRAME MANIFEST</button>
              </div>
            </div>
          ) : (
            <>
              <div className="info-tabs">
                {archiveCategory === 'TACTICAL' && (
                  <>
                    <button className={infoTab === 'VIRAL DB' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('VIRAL DB'); }}>VIRUSES</button>
                    <button className={infoTab === 'PROTOCOLS' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('PROTOCOLS'); }}>TURRETS</button>
                    <button className={infoTab === 'THREATS' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('THREATS'); }}>THREATS</button>
                  </>
                )}
                {archiveCategory === 'HANDBOOK' && (
                  <>
                    <button className={infoTab === 'LOGIC' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('LOGIC'); }}>LOGIC</button>
                    <button className={infoTab === 'RANKS' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('RANKS'); }}>RANKS</button>
                  </>
                )}
                {archiveCategory === 'MANIFEST' && (
                  <>
                    <button className={infoTab === 'LORE' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('LORE'); }}>LORE</button>
                    <button className={infoTab === 'HALL_OF_FAME' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('HALL_OF_FAME'); }}>RECORDS</button>
                    <button className={infoTab === 'CREDITS' ? 'active' : ''} onClick={() => { am.playUiClick(); setInfoTab('CREDITS'); }}>CREDITS</button>
                  </>
                )}
                <button className="back-tab-btn" onClick={() => { am.playUiClick(); setArchiveCategory('NONE'); setIsTypingComplete(false); }} style={{ borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}>BACK</button>
              </div>
              <div className="info-body">
                <>
                  {infoTab === 'LORE' && (
                      <div className="manual-text">
                        <p style={{ color: 'var(--neon-blue)', fontSize: '1rem' }}>&gt;&gt; LOG ENTRY: THE SYNTAX COLLAPSE</p>
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
                        {Object.values(VISUAL_REGISTRY).map(v => (
                          <div key={v.name} className="visual-card-large">
                            <div className="card-visual-box">
                              <div className={`shape ${v.shape}`} style={v.shape === 'triangle' ? { borderBottomColor: v.colorHex } : { background: v.colorHex }}></div>
                            </div>
                            <div className="card-detail-box">
                              <div className="label">{v.name}</div>
                              <div className="stats">HP: {v.baseHp} // SPD: {v.speed}x // PRIORITY: {v.priority}</div>
                              <div className="desc">{v.name === 'GLIDER' ? 'Rapid packet stream. Low integrity.' : v.name === 'STRIDER' ? 'Staggered burst unit. Medium threat.' : v.name === 'BEHEMOTH' ? 'Heavy bulk data. High defensive priority.' : 'Core-Breaker. High entropy Boss unit.'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {infoTab === 'PROTOCOLS' && (
                      <div className="visual-grid">
                        {Object.keys(TOWER_CONFIGS).map(key => {
                          const type = parseInt(key) as TowerType;
                          const cfg = TOWER_CONFIGS[type];
                          return (
                            <div key={key} className="visual-card-large">
                              <div className="card-visual-box">
                                <div className="mini-turret" data-type={type} style={{ transform: 'scale(1.2)' }}>
                                  <div className="mini-base"></div>
                                  <div className="mini-head">
                                    <div className="mini-weapon"></div>
                                    <div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6, '0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6, '0')}` }}></div>
                                  </div>
                                </div>
                              </div>
                              <div className="card-detail-box">
                                <div className="label">{cfg.name}</div>
                                <div className="stats">DMG: {cfg.damage} // RNG: {cfg.range} // COST: {cfg.cost}c</div>
                                <div className="desc">{type === 0 ? 'Rapid-fire logic pulse. Standard frontline defense.' : type === 1 ? 'Cryo-cycle beam. Applies 50% movement reduction.' : type === 2 ? 'High-voltage bridge. Arc damage to 3 adjacent targets.' : type === 3 ? 'Sub-atomic accelerator. High damage + Reveal stealth.' : 'Global system buffer. Grants +25% DMG to all linked nodes.'}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {infoTab === 'THREATS' && (
                      <div className="manual-text">
                        <div className="manual-entry"><span className="entry-label cyan">ELITE SIGNATURES:</span><span className="entry-content">EVERY 5 SWARMS, MINI-BOSSES WITH 3.5x HP MATERIALIZE.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">GHOST PACKETS:</span><span className="entry-content">INVISIBLE ON THE GRID SENSOR. REVEALED BY FROST RAY OR TESLA RADIUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">BOSS CORE:</span><span className="entry-content">FRACTAL VIRUSES DEAL 10 UNITS OF DAMAGE TO KERNEL UPON BREACH.</span></div>
                      </div>
                    )}
                    {infoTab === 'LOGIC' && (
                      <div className="manual-text">
                        <div className="manual-entry"><span className="entry-label cyan">DATA LINKS:</span><span className="entry-content">PLACING IDENTICAL TURRETS ADJACENT FORMS A SYNERGY LINK (+10% DMG).</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">OVERCLOCKING:</span><span className="entry-content">TAP ANY PLACED TURRET TO UPGRADE ITS CORE SYSTEMS (3 LEVELS).</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">INTEREST:</span><span className="entry-content">MAINTAIN A HIGH TOKEN BALANCE TO EARN 10% INTEREST PER SWARM.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">KERNEL OVERDRIVE:</span><span className="entry-content">CORE SHOCKWAVE PURGES NEARBY VIRUSES WHEN INTEGRITY DROPS BELOW 5.</span></div>
                      </div>
                    )}
                    {infoTab === 'RANKS' && (
                      <div className="manual-text">
                        <div className="manual-entry"><span className="entry-label cyan">INITIATE:</span><span className="entry-content">STARTING RANK. NO BONUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">SCRIPTER:</span><span className="entry-content">1,000 XP REQUIRED. +50 TOKEN STARTING BONUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">SYS_ARCHITECT:</span><span className="entry-content">5,000 XP REQUIRED. +100 TOKEN STARTING BONUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">SENIOR_ENGR:</span><span className="entry-content">10,000 XP REQUIRED. +150 TOKEN STARTING BONUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">ELITE_ARCHITECT:</span><span className="entry-content">25,000 XP REQUIRED. +200 TOKEN STARTING BONUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">CORE_GUARDIAN:</span><span className="entry-content">50,000 XP REQUIRED. +300 TOKEN STARTING BONUS.</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">GOD_MOD_ADMIN:</span><span className="entry-content">100,000 XP REQUIRED. +500 TOKEN STARTING BONUS.</span></div>
                        <div style={{ marginTop: '20px', color: '#888', fontSize: '0.7rem' }}>&gt; XP IS EARNED BY COMPLETING WAVES. HARDCORE MODE GRANTS 2x XP PER WAVE.</div>
                      </div>
                    )}
                    {infoTab === 'CREDITS' && (
                      <div className="manual-text">
                        <div className="manual-entry"><span className="entry-label cyan">SYSTEM OWNER:</span><span className="entry-content">CHRIS MCKINLEY</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">ARCHITECT:</span><span className="entry-content">CHRIS MCKINLEY</span></div>
                        <div className="manual-entry"><span className="entry-label cyan">BUILD ENGINE:</span><span className="entry-content">SYNTAX V2.7.0 [ELITE]</span></div>
                        <div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '20px', color: '#666', fontSize: '0.7rem' }}>&gt; ALL SYSTEM ASSETS, CORE LOGIC, AND INTELLECTUAL PROPERTY CONTAINED WITHIN THIS MAINFRAME ARE THE SOLE PROPERTY OF THE SYSTEM OWNER. UNAUTHORIZED REPLICATION OR BREACH OF THIS SYNTAX IS STRICTLY PROHIBITED.</div>
                      </div>
                    )}
                  </>
              </div>
            </>
          )}
        </div>
        <button className="cyan-menu-btn back-btn" onClick={() => { onSetScreen('MENU'); setIsTypingComplete(false); }}>RETURN TO ROOT</button>
      </div>
    </div>
  );
};

export default ArchiveScreen;
