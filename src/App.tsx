import { useEffect, useState } from 'react';
import { GameContainer } from './game/GameContainer';
import { GameStateManager, type GameMode } from './game/systems/GameStateManager';
import { TowerType, TOWER_CONFIGS } from './game/entities/Tower';
import { VISUAL_REGISTRY } from './game/VisualRegistry';
import { AudioManager } from './game/systems/AudioManager';
import './App.css';

type ScreenState = 'MENU' | 'GAME' | 'ARCHIVE' | 'MODES' | 'SETTINGS';
type InfoTab = 'LORE' | 'VIRAL_DB' | 'PROTOCOLS' | 'SYSTEM_MODES' | 'THREATS' | 'LOGIC';

function App() {
  // 1. STABLE STATE HOOKS (TOP LEVEL)
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(500);
  const [integrity, setIntegrity] = useState(20);
  const [wave, setWave] = useState(1);
  const [waveName, setWaveName] = useState("");
  const [selectedTurret, setSelectedTurret] = useState(0);
  const [game, setGame] = useState<GameContainer | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFastForward, setIsFastForward] = useState(false);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [repairCost, setRepairCost] = useState(500);
  const [gameMode, setGameMode] = useState<GameMode>('STANDARD');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(AudioManager.getInstance().isSfxMuted);
  const [ambientMuted, setAmbientMuted] = useState(AudioManager.getInstance().isAmbientMuted);
  const [glitchIndex, setGlitchIndex] = useState(-1);
  const [isDistorted, setIsDistorted] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);

  // 2. STABLE EFFECT HOOKS
  useEffect(() => {
    const handleFirstInteraction = () => {
      AudioManager.getInstance().resume();
      AudioManager.getInstance().startAmbient();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        const screenObj = window.screen as any;
        if (screen !== 'MENU' && screenObj.orientation?.lock) {
          await screenObj.orientation.lock('landscape');
        }
      } catch (e) { }
    };
    lockOrientation();
  }, [screen]);

  useEffect(() => {
    if (screen === 'GAME' && !game && !isInitializing) {
      async function init() {
        setIsInitializing(true);
        const g = await GameContainer.getInstance();
        setGame(g);
        setIsInitializing(false);
        const tutorialDone = localStorage.getItem('syntax_tutorial_done');
        if (!tutorialDone) setShowTutorial(true);

        const interval = setInterval(() => {
          const state = GameStateManager.getInstance();
          setCredits(state.credits);
          setIntegrity(state.integrity);
          setWaveName(state.getWaveName());
          setRepairCost(state.repairCost);
          setGameMode(state.gameMode);
          if (g.waveManager) {
            setWave(g.waveManager.waveNumber);
            setIsWaveActive(g.waveManager.isWaveActive);
          }
        }, 100);

        if (g.towerManager) g.towerManager.startPlacement(0);
        return () => clearInterval(interval);
      }
      init();
    }
  }, [screen, game, isInitializing]);

  useEffect(() => {
    if (game) {
      game.isPaused = isPaused;
      game.isFastForward = isFastForward;
    }
  }, [isPaused, isFastForward, game]);

  useEffect(() => {
    const triggerAtmospheric = () => {
      const type = Math.random();
      if (type < 0.15) {
        setIsDistorted(true);
        setGlitchIndex(Math.floor(Math.random() * 13));
        AudioManager.getInstance().playBreach();
        setTimeout(() => {
          setIsDistorted(false);
          setGlitchIndex(-1);
        }, 300);
      } else if (type < 0.5) {
        setIsFlickering(true);
        setTimeout(() => setIsFlickering(false), 250);
      }
    };
    const interval = setInterval(triggerAtmospheric, 5000);
    return () => clearInterval(interval);
  }, []);

  // 3. CORE ACTION HANDLERS
  const startNewGame = (mode: GameMode) => {
    AudioManager.getInstance().playUiClick();
    GameStateManager.getInstance().resetGame(mode);
    setScreen('GAME');
  };

  const loadGame = () => {
    AudioManager.getInstance().playUiClick();
    if (GameStateManager.getInstance().load()) {
      setScreen('GAME');
    } else {
      alert("CRITICAL_ERROR: NO SAVED_DATA ON LOCAL_MOUNT.");
    }
  };

  const cleanupGame = () => {
    if (game) {
      game.destroy();
      const container = document.getElementById('game-container');
      if (container) container.innerHTML = '';
      setGame(null);
    }
  };

  const saveAndQuit = () => {
    AudioManager.getInstance().playUiClick();
    GameStateManager.getInstance().save();
    cleanupGame();
    setIsPaused(false);
    setScreen('MENU');
  };

  const quitToMenu = () => {
    AudioManager.getInstance().playUiClick();
    cleanupGame();
    setIsPaused(false);
    setScreen('MENU');
  };

  const toggleFastForward = () => {
    AudioManager.getInstance().playUiClick();
    setIsFastForward(!isFastForward);
  };

  const selectTurret = (type: number) => {
    AudioManager.getInstance().playUiClick();
    setSelectedTurret(type);
    if (game?.towerManager) {
      game.towerManager.startPlacement(type as any);
    }
  };

  const executeWave = () => {
    AudioManager.getInstance().playUiClick();
    game?.waveManager.startWave();
  };

  const repairKernel = () => {
    if (GameStateManager.getInstance().repairKernel()) {
      AudioManager.getInstance().playPlacement();
    }
  };

  const useDataPurge = () => {
    if (credits >= 1000 && game?.waveManager) {
      AudioManager.getInstance().playPurge();
      GameStateManager.getInstance().addCredits(-1000);
      game.waveManager.dataPurge();
    }
  };

  const dismissTutorial = (permanent: boolean) => {
    AudioManager.getInstance().playUiClick();
    if (permanent) localStorage.setItem('syntax_tutorial_done', 'true');
    setShowTutorial(false);
  };

  const isUnlocked = (type: number) => {
    if (type === 0) return true;
    if (type === 1) return wave >= 4;
    if (type === 2) return wave >= 8;
    if (type === 3) return wave >= 15;
    if (type === 4) return wave >= 20;
    return false;
  };

  const toggleSfx = () => {
    AudioManager.getInstance().toggleSfx();
    setSfxMuted(AudioManager.getInstance().isSfxMuted);
    AudioManager.getInstance().playUiClick();
  };

  const toggleAmbient = () => {
    AudioManager.getInstance().toggleAmbient();
    setAmbientMuted(AudioManager.getInstance().isAmbientMuted);
    AudioManager.getInstance().playUiClick();
  };

  const openArchive = (tab: InfoTab) => {
    AudioManager.getInstance().playUiClick();
    setInfoTab(tab);
    setScreen('ARCHIVE');
  };

  const systemStatusText = integrity > 15 ? "STATUS: STABLE" : integrity > 5 ? "STATUS: DEGRADED" : "STATUS: CRITICAL";
  const systemStatusColor = integrity > 15 ? "#00ffcc" : integrity > 5 ? "#ffcc00" : "#ff3300";

  return (
    <div className="game-wrapper">
      <div className="orientation-warning"><div className="warning-icon">🔄</div><div className="warning-text">Please rotate your device</div></div>
      <div id="game-container"></div>

      {/* --- HOME MENU --- */}
      {screen === 'MENU' && (
        <div className="main-menu ui-layer">
          <div className={`grid-background ${isDistorted ? 'distorted' : ''}`}><div className="grid-lines"></div><div className="grid-glows"><div className="glow-bit comet-right glow-1" style={{top: '15%'}}></div><div className="glow-bit comet-left glow-2" style={{top: '40%'}}></div><div className="glow-bit comet-down glow-3" style={{left: '30%'}}></div><div className="glow-bit comet-up glow-4" style={{left: '70%'}}></div><div className="grid-sweep"></div></div></div>
          <div className="menu-content-centered">
            <h1 className={`menu-title-static ${isDistorted ? 'glitch-active' : ''} ${isFlickering ? 'flicker-active' : ''}`}>
              {"SYNTAX".split('').map((c, i) => ( <span key={i} style={{ color: glitchIndex === i ? 'var(--neon-red)' : 'inherit' }}>{c}</span> ))}
              <br/>
              {"DEFENSE".split('').map((c, i) => ( <span key={i+6} style={{ color: glitchIndex === (i+6) ? 'var(--neon-red)' : 'inherit' }}>{c}</span> ))}
            </h1>
            <div className="menu-options-grid">
              <button className="cyan-menu-btn primary-btn" onClick={() => startNewGame('STANDARD')}>&gt; INITIALIZE_STANDARD</button>
              <button className="cyan-menu-btn" onClick={() => setScreen('MODES')}>&gt; ADVANCED_PROTOCOLS</button>
              <button className="cyan-menu-btn" onClick={loadGame}>&gt; RESTORE_SESSION</button>
              <button className="cyan-menu-btn" onClick={() => openArchive('VIRAL_DB')}>&gt; VIRAL_DATABASE</button>
              <button className="cyan-menu-btn" onClick={() => openArchive('PROTOCOLS')}>&gt; DEFENSE_PROTOCOLS</button>
              <button className="cyan-menu-btn" onClick={() => setScreen('SETTINGS')}>&gt; SYSTEM_SETTINGS</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'MODES' && (
        <div className="encyclopedia ui-layer">
          <div className="enc-header">[ SELECT_ADVANCED_PROTOCOL ]</div>
          <div className="menu-options-grid" style={{marginTop: '20px'}}>
            <button className="cyan-menu-btn" onClick={() => startNewGame('HARDCORE')} style={{borderColor: '#ff3300'}}>&gt; HARDCORE_MODE</button>
            <button className="cyan-menu-btn" onClick={() => startNewGame('SUDDEN_DEATH')} style={{borderColor: '#ffcc00'}}>&gt; SUDDEN_DEATH</button>
            <button className="cyan-menu-btn" onClick={() => startNewGame('ENDLESS')}>&gt; ENDLESS_LOOP</button>
            <button className="cyan-menu-btn" onClick={() => startNewGame('ECO_CHALLENGE')}>&gt; ECO_CHALLENGE</button>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => setScreen('MENU')}>[ RETURN_TO_ROOT ]</button>
        </div>
      )}

      {screen === 'SETTINGS' && (
        <div className="encyclopedia ui-layer">
          <div className="enc-header">[ SYSTEM_CONFIGURATION_CENTER ]</div>
          <div className="enc-content">
            <div className="info-hub">
              <div className="info-body">
                <div className="manual-text">
                  <h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px'}}>AUDIO_CHANNELS</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,102,255,0.05)', padding: '15px', border: '1px solid #222'}}>
                      <div>
                        <div style={{color: '#fff', fontWeight: 900}}>SFX_ENGINE</div>
                        <div style={{fontSize: '0.6rem', color: '#888'}}>UI Beeps, Tactical SFX, Breaches</div>
                      </div>
                      <button className="blue-button" onClick={toggleSfx} style={{width: '120px'}}>{sfxMuted ? '[ DISABLED ]' : '[ ENABLED ]'}</button>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,102,255,0.05)', padding: '15px', border: '1px solid #222'}}>
                      <div>
                        <div style={{color: '#fff', fontWeight: 900}}>AMBIENT_HUM</div>
                        <div style={{fontSize: '0.6rem', color: '#888'}}>Low-frequency Data Background</div>
                      </div>
                      <button className="blue-button" onClick={toggleAmbient} style={{width: '120px'}}>{ambientMuted ? '[ DISABLED ]' : '[ ENABLED ]'}</button>
                    </div>
                  </div>
                  <h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '40px'}}>SYSTEM_DIAGNOSTICS</h3>
                  <div style={{borderLeft: '4px solid var(--neon-blue)', paddingLeft: '20px', background: 'rgba(0,102,255,0.05)', padding: '20px', marginTop: '20px'}}>
                    <div style={{marginBottom: '10px'}}>BUILD_ID: v2.1.0_ELITE</div>
                    <div style={{marginBottom: '10px'}}>MAINFRAME_STATUS: {systemStatusText}</div>
                    <div style={{marginBottom: '10px'}}>KERNEL_STABILITY: {((integrity / 20) * 100).toFixed(0)}%</div>
                    <div style={{marginBottom: '10px'}}>LATENCY: 0.04ms</div>
                    <div>LOCAL_CACHE: ACTIVE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => setScreen('MENU')}>[ RETURN_TO_ROOT ]</button>
        </div>
      )}

      {screen === 'ARCHIVE' && (
        <div className="encyclopedia ui-layer">
          <div className="enc-header">[ MAINFRAME_DATA_ARCHIVE // {infoTab} ]</div>
          <div className="enc-content">
            <div className="info-hub">
              <div className="info-tabs">
                <button className={infoTab === 'LORE' ? 'active' : ''} onClick={() => setInfoTab('LORE')}>LORE</button>
                <button className={infoTab === 'VIRAL_DB' ? 'active' : ''} onClick={() => setInfoTab('VIRAL_DB')}>VIRUSES</button>
                <button className={infoTab === 'PROTOCOLS' ? 'active' : ''} onClick={() => setInfoTab('PROTOCOLS')}>TURRETS</button>
                <button className={infoTab === 'SYSTEM_MODES' ? 'active' : ''} onClick={() => setInfoTab('SYSTEM_MODES')}>MODES</button>
                <button className={infoTab === 'THREATS' ? 'active' : ''} onClick={() => setInfoTab('THREATS')}>THREATS</button>
                <button className={infoTab === 'LOGIC' ? 'active' : ''} onClick={() => setInfoTab('LOGIC')}>LOGIC</button>
              </div>
              <div className="info-body">
                {infoTab === 'LORE' && (
                  <div className="manual-text">
                    <p style={{color: 'var(--neon-blue)', fontSize: '1rem'}}>&gt;&gt; LOG_ENTRY: THE SYNTAX COLLAPSE</p>
                    <p>&gt; IN THE YEAR 2048, THE GLOBAL NETWORK EXPERIENCED A CATASTROPHIC RAW-OVERWRITE. THE WORLD'S DATA WAS FRAGMENTED INTO HOSTILE VIRAL SIGNATURES.</p>
                    <p>&gt; THE KERNEL IS THE LAST REMAINING BASTION OF PURE LOGIC. IF IT FALLS, THE DIGITAL UNIVERSE WILL DESCEND INTO PERMANENT ENTROPY.</p>
                    <p>&gt; YOU ARE THE SYSTEM ARCHITECT. YOUR MISSION IS TO DEPLOY DEFENSE NODES AND PURGE THE SWARMS BEFORE THEY BREACH THE CORE MEMORY BANKS.</p>
                  </div>
                )}
                {infoTab === 'VIRAL_DB' && (
                  <div className="visual-grid">
                    {Object.values(VISUAL_REGISTRY).map(v => (
                      <div key={v.name} className="visual-card-large">
                        <div className="card-visual-box"><div className={`shape ${v.shape}`} style={{ background: v.colorHex }}></div></div>
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
                    {[0, 1, 2, 3, 4].map(type => {
                      const cfg = TOWER_CONFIGS[type as TowerType];
                      return (
                        <div key={cfg.name} className="visual-card-large" data-type={type}>
                          <div className="card-visual-box"><div className="mini-turret"><div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6,'0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6,'0')}` }}></div></div></div></div>
                          <div className="card-detail-box">
                            <div className="label">{cfg.name}</div>
                            <div className="stats">ATK: {cfg.damage} // RNG: {cfg.range}sq // COST: {cfg.cost}c</div>
                            <div className="desc">{type === 0 ? 'Standard pulse mg. Reliable fire-rate.' : type === 1 ? 'Slows viral flow. Essential for ghost reveal.' : type === 2 ? 'AOE explosive burst. Clears bulk breaches.' : type === 3 ? 'High-density rail shot. Pierces armor.' : 'Chains logic bolts between nearby viruses.'}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {infoTab === 'SYSTEM_MODES' && (
                  <div className="manual-text">
                    <p><span style={{color: 'var(--neon-red)'}}>[ HARDCORE ]:</span> NO INTEREST REWARDS. UNIT COSTS INCREASED BY 50%. STARTING CAPITAL REDUCED. ONLY FOR ELITE SYSTEM ARCHITECTS.</p>
                    <p><span style={{color: 'var(--neon-green)'}}>[ ECO_CHALLENGE ]:</span> VIRUSES PROVIDE ZERO TOKENS UPON DELETION. ALL INCOME IS DERIVED FROM THE 10% INTEREST COMPOUNDING SYSTEM.</p>
                    <p><span style={{color: 'var(--neon-cyan)'}}>[ SUDDEN_DEATH ]:</span> SYSTEM INTEGRITY SET TO 1. A SINGLE VIRAL BREACH WILL TERMINATE THE SESSION IMMEDIATELY.</p>
                    <p><span style={{color: '#fff'}}>[ ENDLESS_LOOP ]:</span> NO LEVEL CAP. VIRAL SIGNATURES GAIN EXPONENTIAL HP MULTIPLIERS AS THE LOOP CONTINUES.</p>
                  </div>
                )}
                {infoTab === 'THREATS' && (
                  <div className="manual-text">
                    <p><span style={{color: 'var(--neon-red)'}}>[ ELITE SIGNATURES ]:</span> EVERY 5 SWARMS, MINI-BOSSES WITH 3.5x HP MATERIALIZE. THEY REQUIRE FOCUSED FIRE-POWER.</p>
                    <p><span style={{color: 'var(--neon-cyan)'}}>[ GHOST PACKETS ]:</span> INVISIBLE ON THE GRID SENSOR. THEY CAN ONLY BE TARGETED WHEN REVEALED BY FROST RAY OR TESLA LINK RADIUS.</p>
                    <p><span style={{color: '#fff'}}>[ BOSS_CORE ]:</span> FRACTAL VIRUSES ARE EXCEPTIONALLY DANGEROUS, DEALING 10 UNITS OF DAMAGE TO KERNEL INTEGRITY UPON BREACH.</p>
                  </div>
                )}
                {infoTab === 'LOGIC' && (
                  <div className="manual-text">
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>[ DATA_LINKS ]:</span> PLACING IDENTICAL TURRETS ADJACENT TO EACH OTHER FORMS A SYNERGY LINK, GRANTING +10% DAMAGE PER LINK (MAX +30%).</p>
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>[ OVERCLOCKING ]:</span> TAP ANY PLACED TURRET TO UPGRADE ITS CORE SYSTEMS. EACH UNIT HAS 3 PROGRESSION LEVELS.</p>
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>[ INTEREST ]:</span> MAINTAIN A HIGH TOKEN BALANCE TO EARN 10% INTEREST AT THE END OF EVERY SWARM.</p>
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>[ KERNEL_OVERDRIVE ]:</span> THE CORE HAS AN AUTOMATIC EMERGENCY SHOCKWAVE THAT PURGES ALL NEARBY VIRUSES WHEN INTEGRITY DROPS BELOW 5.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => setScreen('MENU')}>[ TERMINATE ]</button>
        </div>
      )}

      {screen === 'GAME' && !game && <div className="loading-overlay">INITIALIZING_MAINFRAME...</div>}

      {screen === 'GAME' && game && (
        <div className="game-overlay-active ui-layer">
          {showTutorial && (
            <div className="pause-overlay-locked"><div className="pause-content"><h2 className="pause-title">SYSTEM_INITIALIZATION</h2><div className="game-summary"><p style={{color: '#fff', fontWeight: 900}}>&gt; DEPLOY NODES TO DEFEND THE KERNEL.</p><p style={{color: '#fff', fontWeight: 900}}>&gt; NODES DE-MATERIALIZE AFTER EVERY SWARM.</p><p style={{color: '#fff', fontWeight: 900}}>&gt; TAP PLACED NODES TO OVERCLOCK (UPGRADE).</p><p style={{color: '#fff', fontWeight: 900}}>&gt; ELITES AND GHOSTS WILL CHALLENGE THE GRID.</p></div><div className="pause-options row"><button className="blue-button" onClick={() => dismissTutorial(false)}>[ GOT IT ]</button><button className="blue-button" onClick={() => dismissTutorial(true)} style={{fontSize: '0.5rem'}}>[ DON'T SHOW AGAIN ]</button></div></div></div>
          )}
          {integrity <= 0 && <div className="pause-overlay-locked"><div className="pause-content"><h2 className="pause-title" style={{color: '#ff3300'}}>CRITICAL_SYSTEM_FAILURE</h2><button className="blue-button" onClick={() => setScreen('MENU')}>[ RETURN_TO_ROOT ]</button></div></div>}
          {isPaused && integrity > 0 && <div className="pause-overlay-locked"><div className="pause-content"><h2 className="pause-title">PAUSED</h2><div className="pause-options"><button className="blue-button" onClick={() => setIsPaused(false)}>[ RESUME ]</button><button className="blue-button" onClick={saveAndQuit}>[ SAVE & EXIT ]</button><button className="blue-button" onClick={quitToMenu} style={{background: 'rgba(255, 51, 0, 0.2)', borderColor: '#ff3300'}}>[ ABANDON ]</button></div></div></div>}
          
          {!isWaveActive && !isPaused && integrity > 0 && (
            <div className="pre-wave-overlay">
              <div className="intel-header">SWARM_SIGNATURES_DETECTED</div>
              <div className="intel-grid-horizontal">
                {game?.waveManager.getUpcomingEnemyTypes().map(type => {
                  const config = (VISUAL_REGISTRY as any)[type];
                  return (
                    <div key={type} className="intel-card-modern">
                      <div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div>
                      <span className="intel-label">{config.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="game-summary-slim"><p style={{color: '#fff', fontWeight: 900}}>&gt; LINK IDENTICAL TURRETS FOR +10% DMG SYNERGY.</p></div>
              <button className="blue-button massive-exec-button" onClick={executeWave}>[ EXECUTE_DEFENSE_PROTOCOL ]</button>
            </div>
          )}

          <div className="tactical-dashboard">
            <div className="dashboard-left">
              <div style={{display: 'flex', gap: '5px'}}>
                <button className="blue-button pause-btn" onClick={() => setIsPaused(true)}>[ PAUSE ]</button>
                <button className={`blue-button pause-btn ${isFastForward ? 'active' : ''}`} onClick={toggleFastForward} style={{borderColor: isFastForward ? 'var(--neon-green)' : ''}}>
                  {isFastForward ? '[ 2X ]' : '[ >> ]'}
                </button>
              </div>
              <div className="wave-label">LVL_{wave} // {waveName}</div>
              <button className="blue-button repair-button" onClick={repairKernel} disabled={credits < repairCost || integrity >= 20}>[ REPAIR: {repairCost}c ]</button>
            </div>
            <div className="dashboard-center">
              <div className="turret-row">
                {[0, 1, 2, 3, 4].map(type => {
                  const cfg = TOWER_CONFIGS[type as TowerType];
                  const unlocked = type === 0 || isUnlocked(type); 
                  const cost = gameMode === 'HARDCORE' ? Math.floor(cfg.cost * 1.5) : (integrity < 10 ? Math.floor(cfg.cost * 0.85) : cfg.cost);
                  return (
                    <div key={type} className={`protocol-card ${selectedTurret === type ? 'active' : ''} ${credits < cost ? 'dimmed' : ''} ${!unlocked ? 'locked' : ''}`} data-type={type} onClick={() => unlocked && selectTurret(type)}>
                      {!unlocked && <div className="lock-icon">🔒</div>}
                      <div className="mini-turret"><div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6,'0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6,'0')}` }}></div></div></div>
                      <div className="protocol-info">
                        <span className="name">{cfg.name}</span>
                        <span className="stats">ATK: {cfg.damage} // RNG: {cfg.range}</span>
                        <span className="cost" style={{color: unlocked ? 'var(--neon-cyan)' : '#666'}}>{cost}c</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="dashboard-right">
              <button className="blue-button item-btn" onClick={useDataPurge} disabled={credits < 1000 || !isWaveActive}>[ DATA_PURGE: 1000c ]</button>
              <div className="stat-row"><span className="label">TOKENS:</span><span className="credits-value">{credits}</span></div>
              <div className="integrity-stack">
                <div className="system-status-label" style={{color: systemStatusColor}}>{systemStatusText}</div>
                <div className="integrity-bar-small"><div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%` }}></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
