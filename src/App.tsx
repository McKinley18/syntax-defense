import { useEffect, useState, useRef } from 'react';
import { GameContainer } from './game/GameContainer';
import { GameStateManager, type GameMode, type WaveSummary, type GlitchType } from './game/systems/GameStateManager';
import { Tower, TowerType, TOWER_CONFIGS } from './game/entities/Tower';
import { EnemyType } from './game/entities/Enemy';
import { VISUAL_REGISTRY } from './game/VisualRegistry';
import { AudioManager } from './game/systems/AudioManager';
import { MusicManager } from './game/systems/MusicManager';
import { TILE_SIZE, MapManager } from './game/systems/MapManager';
import './App.css';

type ScreenState = 'BOOT' | 'MENU' | 'GAME' | 'ARCHIVE' | 'MODES' | 'SETTINGS';
type ArchiveCategory = 'NONE' | 'TACTICAL' | 'HANDBOOK' | 'MANIFEST';
type InfoTab = 'LORE' | 'VIRAL DB' | 'PROTOCOLS' | 'SYSTEM MODES' | 'THREATS' | 'LOGIC' | 'RANKS' | 'HALL_OF_FAME' | 'CREDITS';

const TerminalText = ({ text, speed = 15, onComplete, delay = 0 }: { text: string, speed?: number, onComplete?: () => void, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let isCancelled = false;
    const startTimeout = setTimeout(() => {
      if (isCancelled) return;
      let i = 0;
      const interval = setInterval(() => {
        if (isCancelled) { clearInterval(interval); return; }
        setDisplayedText(text.slice(0, i));
        if (i > 0 && i <= text.length && text[i-1] !== ' ') {
          AudioManager.getInstance().playTypeClick();
        }
        i++;
        if (i > text.length) {
          clearInterval(interval);
          setIsFinished(true);
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }, speed);
      return () => { isCancelled = true; clearInterval(interval); };
    }, delay);
    return () => { isCancelled = true; clearTimeout(startTimeout); };
  }, [text, speed, delay]);

  return (
    <span>
      {displayedText}
      {!isFinished && <span className="terminal-cursor"></span>}
    </span>
  );
};

function App() {
  const [screen, setScreen] = useState<ScreenState>('BOOT');
  const [archiveCategory, setArchiveCategory] = useState<ArchiveCategory>('NONE');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(850);
  const [integrity, setIntegrity] = useState(20);
  const [wave, setWave] = useState(1);
  const [waveName, setWaveName] = useState("");
  const [selectedTurret, setSelectedTurret] = useState(0);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
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
  const [sfxVolState, setSfxVolState] = useState(AudioManager.getInstance().sfxVolume);
  const [musicVolState, setMusicVolState] = useState(AudioManager.getInstance().musicVolume);
  const [isDistorted, setIsDistorted] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [gamePhase, setGamePhase] = useState<string>("PREP");
  const [upcomingEnemies, setUpcomingEnemies] = useState<number[]>([]);
  const [activeGlitch, setActiveGlitch] = useState<GlitchType>('NONE');
  const [waveSummary, setWaveSummary] = useState<WaveSummary>({ kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0 });
  const [rank, setRank] = useState(GameStateManager.getInstance().architectRank);
  const [currentXP, setCurrentXP] = useState(GameStateManager.getInstance().totalXP);
  const [nextRankXP, setNextRankXP] = useState(GameStateManager.getInstance().getNextRankXP());
  const [lifetimeKills, setLifetimeKills] = useState(0);
  const [highestWave, setHighestWave] = useState(0);
  const [isVictorious, setIsVictorious] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [showWaveSummaryPopup, setShowWaveSummaryPopup] = useState(false);

  // CINEMATIC BOOT STATE
  const [bootPhase, setBootPhase] = useState(0); 
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [showAuthorized, setShowAuthorized] = useState(false);
  const [showPreserve, setShowPreserve] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [isStatusGlitched, setIsStatusGlitched] = useState(false);
  const [showReadyLine, setShowReadyLine] = useState(false);

  useEffect(() => {
    if (audioReady) return;

    if (bootPhase === 1) { // Connect pause
        setTimeout(() => { setShowAuthorized(true); setBootPhase(2); }, 1500);
    } else if (bootPhase === 2) { // Wait before next command
        setTimeout(() => setBootPhase(3), 1000);
    } else if (bootPhase === 4) { // Initiate pause
        setTimeout(() => { setShowPreserve(true); setBootPhase(5); }, 1500);
    } else if (bootPhase === 5) { // Wait before load bar
        setTimeout(() => setBootPhase(6), 1000);
    } else if (bootPhase === 6) { // Loading Bar
        const timer = setInterval(() => {
            setBootProgress(p => {
                if (p >= 100) { clearInterval(timer); setTimeout(() => setBootPhase(7), 800); return 100; }
                return p + 2;
            });
        }, 40);
        return () => clearInterval(timer);
    } else if (bootPhase === 7) { // System Logs
        const logs = ["MOUNTING KERNEL_CORE_V2.7", "DECRYPTING THREAT_SIGNATURES.DB", "CALIBRATING GRID_SENSOR", "AUTHENTICATING ARCHITECT CLEARANCE"];
        let i = 0;
        const itv = setInterval(() => {
            if (i < logs.length) {
                setBootLogs(prev => [...prev, logs[i]]);
                AudioManager.getInstance().playTypeClick();
                i++;
            } else { clearInterval(itv); setTimeout(() => setBootPhase(8), 1500); }
        }, 700);
        return () => clearInterval(itv);
    } else if (bootPhase === 9) { // Status pause
        setTimeout(() => setBootPhase(10), 2000);
    } else if (bootPhase === 10) { // WIPE GLITCH
        setIsStatusGlitched(true);
        setIsDistorted(true);
        AudioManager.getInstance().playGlitchBuzz();
        setTimeout(() => {
            setIsStatusGlitched(false);
            setIsDistorted(false);
            setStatusText("SUCCESSFUL. CAUTION: THREATS IMMINENT.");
            setBootPhase(11);
        }, 300);
    } else if (bootPhase === 11) { // Wait for final line
        setTimeout(() => setShowReadyLine(true), 1500);
    }
  }, [bootPhase, audioReady]);

  // POLL AUDIO STATUS
  useEffect(() => {
    const itv = setInterval(() => {
      const ready = AudioManager.getInstance().isReady();
      setAudioReady(ready);
      if (ready && screen === 'BOOT') setScreen('MENU');
    }, 100);
    return () => clearInterval(itv);
  }, [screen]);

  const wakeAudioSystem = async () => {
    if (bootPhase >= 11) {
      await AudioManager.getInstance().resume();
      setScreen('MENU');
    }
  };

  useEffect(() => { if (screen === 'MENU') AudioManager.getInstance().init(); }, [screen]);

  // TUTORIAL STATE
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorialComplete, setShowTutorialComplete] = useState(false);
  const [showRadiusExplanation, setShowRadiusExplanation] = useState(false);
  const [showUpgradeBrief, setShowUpgradeBrief] = useState(false);
  const [showGlitchBrief, setShowGlitchBrief] = useState(false);
  const [showCombatIntel, setShowCombatIntel] = useState(false);
  const [showEconomyBrief, setShowEconomyBrief] = useState(false);
  const [tutorialTargetRect, setTutorialTargetRect] = useState<DOMRect | null>(null);
  const firstTurretRef = useRef<HTMLDivElement>(null);
  const placedTurretRef = useRef<{x: number, y: number} | null>(null);
  const dashboardCenterRef = useRef<HTMLDivElement>(null);
  const [tilePos, setTilePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isTutorialActive) return;
    const update = () => {
      if (tutorialStep === 1 && firstTurretRef.current) {
        const rect = firstTurretRef.current.getBoundingClientRect();
        if (rect.width > 0) setTutorialTargetRect(rect);
      } else if (tutorialStep === 2) {
        const ts = MapManager.calculateTileSize();
        setTilePos({ x: 5 * ts, y: (1 + Math.floor(Math.floor(((window.innerHeight - 130) / ts) - 1) / 4) * 2) * ts });
      } else if (tutorialStep === 3 && placedTurretRef.current) { setTilePos(placedTurretRef.current); }
    };
    update();
    const inv = setInterval(update, 100);
    return () => clearInterval(inv);
  }, [isTutorialActive, tutorialStep]);

  useEffect(() => {
    if (game) { game.isTutorialActive = isTutorialActive; game.tutorialStep = tutorialStep; }
  }, [isTutorialActive, tutorialStep, game]);

  const startNewGame = (mode: GameMode) => {
    AudioManager.getInstance().playUiClick(); cleanupGame();
    if (localStorage.getItem('syntax_tutorial_done') !== 'true') {
      GameStateManager.getInstance().currentWave = 0; setIsTutorialActive(true); setTutorialStep(0);
    } else { GameStateManager.getInstance().resetGame(mode); setShowCombatIntel(true); }
    setIsVictorious(false); setScreen('GAME');
  };

  const cleanupGame = () => {
    if (game) { game.destroy(); const c = document.getElementById('game-container'); if (c) c.innerHTML = ''; setGame(null); }
    setShowWaveSummaryPopup(false); setShowCombatIntel(false); setShowSettingsInGame(false); setShowEconomyBrief(false); setShowUpgradeBrief(false); setShowGlitchBrief(false); setSelectedTower(null);
  };

  const quitToMenu = () => { AudioManager.getInstance().playUiClick(); cleanupGame(); setIsPaused(false); setScreen('MENU'); };
  const saveAndQuit = () => { AudioManager.getInstance().playUiClick(); GameStateManager.getInstance().save(); cleanupGame(); setIsPaused(false); setScreen('MENU'); };
  const toggleFastForward = () => { AudioManager.getInstance().playUiClick(); setIsFastForward(f => !f); };
  const toggleSfx = () => { AudioManager.getInstance().toggleSfx(); setSfxMuted(AudioManager.getInstance().isSfxMuted); AudioManager.getInstance().playUiClick(); };
  const toggleAmbient = () => { AudioManager.getInstance().toggleAmbient(); setAmbientMuted(AudioManager.getInstance().isAmbientMuted); AudioManager.getInstance().playUiClick(); };
  const handleSfxVol = (e: any) => { const v = parseFloat(e.target.value); setSfxVolState(v); AudioManager.getInstance().setSfxVolume(v); };
  const handleMusicVol = (e: any) => { const v = parseFloat(e.target.value); setMusicVolState(v); AudioManager.getInstance().setMusicVolume(v); };
  const [enabledTracks, setEnabledTracks] = useState(MusicManager.getInstance().enabledTracks);
  const toggleTrack = (id: number) => { AudioManager.getInstance().playUiClick(); MusicManager.getInstance().toggleTrack(id as any); setEnabledTracks([...MusicManager.getInstance().enabledTracks]); };

  const selectTurret = (type: number) => {
    if (isTutorialActive && tutorialStep === 1 && type !== 0) return;
    AudioManager.getInstance().playUiClick(); setSelectedTurret(type);
    if (game?.towerManager) game.towerManager.startPlacement(type as TowerType);
    if (isTutorialActive && tutorialStep === 1 && type === 0) setShowRadiusExplanation(true);
  };

  useEffect(() => {
    if (screen === 'GAME' && !game && !isInitializing) {
      async function init() {
        setIsInitializing(true); const g = await GameContainer.getInstance(); setGame(g); setIsInitializing(false);
        if (localStorage.getItem('syntax_tutorial_done') !== 'true' && g.waveManager.waveNumber === 0) setShowTutorial(true);
        g.towerManager.onTowerPlaced = () => {
          if (isTutorialActive) {
            const center = g.mapManager.getTileCenter(g.app.renderer.events.pointer.global.x, g.app.renderer.events.pointer.global.y);
            placedTurretRef.current = { x: center.x, y: center.y }; setTutorialStep(3); setShowUpgradeBrief(true);
          }
        };
        g.towerManager.onTowerSelected = (t) => { setSelectedTower(t); if (isTutorialActive && tutorialStep === 3 && t) { setTutorialStep(4); setShowGlitchBrief(true); } };
        const interval = setInterval(() => {
          const state = GameStateManager.getInstance(); setCredits(state.credits); setIntegrity(state.integrity); setWaveName(state.getWaveName()); setRepairCost(state.repairCost); setGameMode(state.gameMode); setGamePhase(state.phase); setRank(state.architectRank); setCurrentXP(state.totalXP); setNextRankXP(state.getNextRankXP()); setActiveGlitch(state.activeGlitch); setWaveSummary(state.lastWaveSummary); setLifetimeKills(state.lifetimeKills); setHighestWave(state.highestWave);
          if (g.waveManager.isSummaryActive && !showWaveSummaryPopup) { setShowCombatIntel(false); setShowEconomyBrief(false); setShowWaveSummaryPopup(true); g.waveManager.isSummaryActive = false; }
          if (state.currentWave > 50 && state.gameMode !== 'ENDLESS') { setIsVictorious(true); setIsPaused(true); }
          if (g.waveManager) { setWave(g.waveManager.waveNumber); setIsWaveActive(g.waveManager.isWaveActive); setUpcomingEnemies(g.waveManager.upcomingEnemies); }
        }, 100);
        return () => clearInterval(interval);
      }
      init();
    }
  }, [screen, game, isInitializing, isTutorialActive, tutorialStep, showWaveSummaryPopup]);

  const executeWave = () => { AudioManager.getInstance().playUiClick(); if (isTutorialActive && tutorialStep === 5) setTutorialStep(6); game?.waveManager.startWave(); };
  const openArchive = (t: InfoTab = 'LORE') => { wakeAudioSystem(); AudioManager.getInstance().playUiClick(); setIsTypingComplete(false); setArchiveCategory('NONE'); setInfoTab(t); setScreen('ARCHIVE'); };
  const loadGameSession = () => { wakeAudioSystem(); AudioManager.getInstance().playUiClick(); cleanupGame(); if (GameStateManager.getInstance().load()) { setIsVictorious(false); setScreen('GAME'); } else { setResetStatus("CRITICAL ERROR: NO SAVED DATA."); setTimeout(() => setResetStatus(""), 4000); setScreen('SETTINGS'); } };

  const systemStatusText = integrity > 15 ? "STATUS: STABLE" : integrity > 5 ? "STATUS: DEGRADED" : "STATUS: CRITICAL";
  const sysStatusColor = integrity > 15 ? "#00ffcc" : integrity > 5 ? "#ffcc00" : "#ff3300";
  const glitchClass = activeGlitch === 'OVERCLOCK' ? 'glitch-overclock' : activeGlitch === 'LAG_SPIKE' ? 'glitch-lag' : activeGlitch === 'SYSTEM_DRAIN' ? 'glitch-drain' : '';

  return (
    <div className="game-wrapper">
      {!audioReady && (
        <div className="audio-splash ui-layer" onClick={wakeAudioSystem}>
          <div className={`boot-container ${isDistorted ? 'distorted red-tint' : ''}`} style={{position: 'absolute', top: '20px', left: '20px', textAlign: 'left', fontFamily: 'monospace'}}>
            <div style={{color: '#00ff66', fontSize: '0.85rem', marginBottom: '8px'}}>
              &gt; <TerminalText text="CONNECT TO REMOTE_DEVICE:" speed={35} onComplete={() => setBootPhase(1)} />
              {bootPhase === 1 && <span className="terminal-cursor"></span>}
              {showAuthorized && <span style={{color: '#00ff66', marginLeft: '5px'}}>[AUTHORIZED]</span>}
            </div>
            {bootPhase >= 3 && (
              <div style={{color: '#00ff66', fontSize: '0.85rem', marginBottom: '15px'}}>
                &gt; <TerminalText text="INITIATE DEFENSE_PROTOCOLS:" speed={30} onComplete={() => setBootPhase(4)} />
                {bootPhase === 4 && <span className="terminal-cursor"></span>}
                {showPreserve && <span style={{color: '#00ff66', marginLeft: '5px'}}>[PRESERVE_SYSTEM]</span>}
              </div>
            )}
            {bootPhase >= 6 && (
              <div style={{width: '250px', height: '15px', border: '1px solid #00ff66', position: 'relative', overflow: 'hidden', marginBottom: '15px'}}>
                <div style={{height: '100%', background: '#00ff66', width: `${bootProgress}%`}}></div>
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: bootProgress > 50 ? '#000' : '#00ff66', fontWeight: 900}}>{bootProgress}% LOADED</div>
              </div>
            )}
            {bootPhase >= 7 && bootLogs.map((log, i) => (
              <div key={i} style={{color: '#00ff66', fontSize: '0.75rem', marginBottom: '4px'}}>&gt; {log}</div>
            ))}
            {bootPhase >= 8 && (
              <div style={{color: isStatusGlitched ? 'var(--neon-red)' : '#00ff66', fontSize: '0.75rem'}}>
                &gt; <TerminalText text="STATUS:" speed={25} onComplete={() => setBootPhase(9)} />
                {bootPhase === 9 && <span className="terminal-cursor"></span>}
                {statusText && <span style={{color: isStatusGlitched ? 'var(--neon-red)' : '#00ff66', marginLeft: '5px'}}>{isStatusGlitched ? "WIPE USER SYSTEM" : statusText}</span>}
              </div>
            )}
            {showReadyLine && (
              <div style={{color: '#00ff66', fontSize: '0.75rem', marginTop: '10px'}}>
                &gt; <TerminalText text="READY TO INITIALIZE SYSTEM" speed={25} onComplete={() => setTimeout(() => setScreen('MENU'), 3000)} />
              </div>
            )}
          </div>
          {isStatusGlitched && (
            <div style={{position: 'fixed', inset: 0, background: 'rgba(255, 51, 0, 0.4)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <h1 className="system-error-msg" style={{fontSize: '6rem', color: '#fff', textShadow: '0 0 20px #ff0000'}}>SYSTEM WIPE</h1>
            </div>
          )}
          {bootPhase >= 11 && (
            <div className="menu-content-centered" style={{pointerEvents: 'none'}}>
                <div className="manual-text" style={{fontSize: '1rem', color: 'var(--neon-blue)', animation: 'error-flash 1s infinite'}}>&gt; CLICK TO INITIALIZE MAINFRAME</div>
            </div>
          )}
        </div>
      )}
      
      <div id="game-container"></div>
      
      {screen === 'MENU' && (
        <div className="main-menu ui-layer">
          <div className="menu-content-centered" style={{transform: 'translateX(-20px)'}}>
            {isDistorted ? (<h1 className="system-error-msg" style={{fontSize: '3rem', margin: '0 0 20px 0'}}>SYSTEM ERROR</h1>) : (<h1 className={`menu-title-static ${isFlickering ? 'flicker-active' : ''}`}>SYNTAX<br/>DEFENSE</h1>)}
            <div className="menu-options-grid compact">
              {isDistorted ? (
                <><button className="cyan-menu-btn" style={{borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}} onClick={() => { startNewGame('STANDARD'); }}>BREACH KERNEL</button><button className="cyan-menu-btn" style={{borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}} onClick={() => { setScreen('MODES'); }}>CORRUPT DATA</button><button className="cyan-menu-btn" style={{borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}} onClick={() => { loadGameSession(); }}>BYPASS SECURITY</button><button className="cyan-menu-btn" style={{borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}} onClick={() => { openArchive('LORE'); }}>EXTRACT LOGS</button><button className="cyan-menu-btn primary-btn" style={{borderColor: 'var(--neon-red)', color: 'var(--neon-red)', gridColumn: 'span 2'}} onClick={() => { setScreen('SETTINGS'); }}>OVERWRITE MEMORY</button></>
              ) : (
                <><button className="cyan-menu-btn primary-btn" onClick={() => { startNewGame('STANDARD'); }}>INITIALIZE STANDARD</button><button className="cyan-menu-btn" onClick={() => { setScreen('MODES'); }}>ADVANCED PROTOCOLS</button><button className="cyan-menu-btn" onClick={() => { loadGameSession(); }}>RESTORE SESSION</button><button className="cyan-menu-btn" onClick={() => { openArchive('LORE'); }}>SYSTEM INFO</button><button className="cyan-menu-btn" onClick={() => { setScreen('SETTINGS'); }}>SYSTEM SETTINGS</button></>
              )}
            </div>
            <div className="rank-tag">RANK: {rank} [{currentXP.toLocaleString()} / {nextRankXP.toLocaleString()} XP]</div>
          </div>
        </div>
      )}

      {screen === 'MODES' && (
        <div className="encyclopedia ui-layer"><div className="enc-header"><TerminalText key="modes-title" text="SELECT ADVANCED PROTOCOL" delay={800} onComplete={() => setIsTypingComplete(true)} /></div>{isTypingComplete && (<><div className="menu-options-grid" style={{marginTop: '20px', maxWidth: '800px', gridTemplateColumns: 'repeat(2, 1fr)'}}><button className="cyan-menu-btn mode-card" onClick={() => startNewGame('HARDCORE')} style={{borderColor: '#ff3300'}}><div className="mode-title">HARDCORE</div><div className="mode-desc">NO INTEREST. 50% UNIT COST INCREASE. REDUCED CAPITAL.</div></button><button className="cyan-menu-btn mode-card" onClick={() => startNewGame('SUDDEN_DEATH')} style={{borderColor: '#ffcc00'}}><div className="mode-title">SUDDEN DEATH</div><div className="mode-desc">CORE INTEGRITY SET TO 1. A SINGLE BREACH ENDS THE SESSION.</div></button><button className="cyan-menu-btn mode-card" onClick={() => startNewGame('ENDLESS')}><div className="mode-title">ENDLESS LOOP</div><div className="mode-desc">NO LEVEL CAP. VIRAL SIGNATURES GAIN EXPONENTIAL HP MULTIPLIERS.</div></button><button className="cyan-menu-btn mode-card" onClick={() => startNewGame('ECO_CHALLENGE')}><div className="mode-title">ECO CHALLENGE</div><div className="mode-desc">NO DELETION BOUNTIES. ALL INCOME FROM 10% INTEREST SYSTEM.</div></button></div><button className="cyan-menu-btn back-btn" onClick={() => { setScreen('MENU'); setIsTypingComplete(false); }}>RETURN TO ROOT</button></>)}</div>
      )}

      {screen === 'SETTINGS' && (
        <div className="encyclopedia ui-layer"><div className="enc-header"><TerminalText key="settings-title" text="SYSTEM CONFIGURATION CENTER" delay={800} onComplete={() => setIsTypingComplete(true)} /></div>{isTypingComplete && (<><div className="enc-content"><div className="info-hub"><div className="info-body"><div className="manual-text"><h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px'}}>AUDIO CHANNELS</h3><div style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px'}}><div className="manual-text" style={{background: 'rgba(0,102,255,0.05)', padding: '15px', border: '1px solid #222'}}><div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}><span>SFX VOLUME</span><span>{(sfxVolState * 100).toFixed(0)}%</span></div><input type="range" min="0" max="1" step="0.05" value={sfxVolState} onChange={handleSfxVol} style={{width: '100%'}} /></div><div className="manual-text" style={{background: 'rgba(0,102,255,0.05)', padding: '15px', border: '1px solid #222'}}><div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}><span>MUSIC VOLUME</span><span>{(musicVolState * 100).toFixed(0)}%</span></div><input type="range" min="0" max="1" step="0.05" value={musicVolState} onChange={handleMusicVol} style={{width: '100px'}} /></div><div style={{display: 'flex', gap: '10px'}}><button className="blue-button" onClick={toggleSfx} style={{flex: 1}}>{sfxMuted ? 'ENABLE SFX' : 'DISABLE SFX'}</button><button className="blue-button" onClick={toggleAmbient} style={{flex: 1}}>{ambientMuted ? 'ENABLE MUSIC' : 'DISABLE MUSIC'}</button></div><h4 style={{color: 'var(--neon-cyan)', marginTop: '20px', fontSize: '0.75rem'}}>SYSTEM PLAYLIST</h4><div className="track-list">{['HYPNOTIC', 'INDUSTRIAL', 'DATA STREAM', 'KERNEL', 'GLITCH TECH', 'UPLINK'].map((name, id) => (<div key={id} className="track-item"><span className="track-name">{name}</span><button className={`blue-button track-toggle ${enabledTracks[id] ? 'enabled' : 'disabled'}`} onClick={() => toggleTrack(id)}>{enabledTracks[id] ? 'ACTIVE' : 'OFF'}</button></div>))}</div></div><h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '40px'}}>SYSTEM DIAGNOSTICS</h3><div style={{borderLeft: '4px solid var(--neon-blue)', paddingLeft: '20px', background: 'rgba(0,102,255,0.05)', padding: '20px', marginTop: '20px'}}><div>BUILD ID: v2.7.0 ELITE</div><div>MAINFRAME STATUS: {systemStatusText}</div><div>KERNEL STABILITY: {((integrity / 20) * 100).toFixed(0)}%</div><div>LIFETIME PURGES: {lifetimeKills}</div><div>RECORD WAVE: {highestWave}</div></div><button className="blue-button" onClick={() => { localStorage.removeItem('syntax_tutorial_done'); setResetStatus("TUTORIAL DATA PURGED. START NEW GAME TO RE-INITIALIZE."); setTimeout(() => setResetStatus(""), 4000); }} style={{width: '200px', borderColor: 'var(--neon-cyan)', marginTop: '20px'}}>RESET TUTORIAL</button>{resetStatus && <div style={{color: '#00ff66', fontSize: '0.65rem', fontWeight: 900, marginTop: '10px'}}>&gt; {resetStatus}</div>}</div></div></div></div><button className="cyan-menu-btn back-btn" onClick={() => { setScreen('MENU'); setIsTypingComplete(false); }}>RETURN TO ROOT</button></>)}</div>
      )}

      {screen === 'ARCHIVE' && (
        <div className="encyclopedia ui-layer"><div className="enc-header"><TerminalText key={`archive-title-${archiveCategory}`} text={archiveCategory === 'NONE' ? "MAINFRAME DATA ARCHIVE" : `ARCHIVE // ${archiveCategory}`} delay={800} onComplete={() => setIsTypingComplete(true)} />{isTypingComplete && archiveCategory !== 'NONE' && <span> // {infoTab}</span>}</div>{isTypingComplete && (<><div className="enc-content"><div className="info-hub">{archiveCategory === 'NONE' ? (<div style={{display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%'}}><div className="menu-options-grid" style={{width: '100%', maxWidth: '600px'}}><button className="cyan-menu-btn" onClick={() => { setArchiveCategory('TACTICAL'); setInfoTab('VIRAL DB'); }}>TACTICAL DATABASE</button><button className="cyan-menu-btn" onClick={() => { setArchiveCategory('HANDBOOK'); setInfoTab('LOGIC'); }}>SYSTEM HANDBOOK</button><button className="cyan-menu-btn primary-btn" onClick={() => { setArchiveCategory('MANIFEST'); setInfoTab('LORE'); }}>MAINFRAME MANIFEST</button></div></div>) : (<><div className="info-tabs">{archiveCategory === 'TACTICAL' && ( <><button className={infoTab === 'VIRAL DB' ? 'active' : ''} onClick={() => { setInfoTab('VIRAL DB'); }}>VIRUSES</button><button className={infoTab === 'PROTOCOLS' ? 'active' : ''} onClick={() => { setInfoTab('PROTOCOLS'); }}>TURRETS</button><button className={infoTab === 'THREATS' ? 'active' : ''} onClick={() => { setInfoTab('THREATS'); }}>THREATS</button></> )}{archiveCategory === 'HANDBOOK' && ( <><button className={infoTab === 'LOGIC' ? 'active' : ''} onClick={() => { setInfoTab('LOGIC'); }}>LOGIC</button><button className={infoTab === 'RANKS' ? 'active' : ''} onClick={() => { setInfoTab('RANKS'); }}>RANKS</button></> )}{archiveCategory === 'MANIFEST' && ( <><button className={infoTab === 'LORE' ? 'active' : ''} onClick={() => { setInfoTab('LORE'); }}>LORE</button><button className={infoTab === 'HALL_OF_FAME' ? 'active' : ''} onClick={() => { setInfoTab('HALL_OF_FAME'); }}>RECORDS</button><button className={infoTab === 'CREDITS' ? 'active' : ''} onClick={() => { setInfoTab('CREDITS'); }}>CREDITS</button></> )}<button className="back-tab-btn" onClick={() => { setArchiveCategory('NONE'); setIsTypingComplete(false); }} style={{borderColor: 'var(--neon-red)', color: 'var(--neon-red)'}}>BACK</button></div><div className="info-body">{infoTab === 'LORE' && ( <div className="manual-text"><p style={{color: 'var(--neon-blue)', fontSize: '1rem'}}>&gt;&gt; LOG ENTRY: THE SYNTAX COLLAPSE</p><p>&gt; IN THE YEAR 2048, THE GLOBAL NETWORK EXPERIENCED A CATASTROPHIC RAW-OVERWRITE. THE WORLD'S DATA WAS FRAGMENTED INTO HOSTILE VIRAL SIGNATURES.</p><p>&gt; THE KERNEL IS THE LAST REMAINING BASTION OF PURE LOGIC. IF IT FALLS, THE DIGITAL UNIVERSE WILL DESCEND INTO PERMANENT ENTROPY.</p><p>&gt; YOU ARE THE SYSTEM ARCHITECT. YOUR MISSION IS TO DEPLOY DEFENSE NODES AND PURGE THE SWARMS BEFORE THEY BREACH THE CORE MEMORY BANKS.</p></div> )}{infoTab === 'HALL_OF_FAME' && (<div className="hof-container"><div className="hof-card"><div className="hof-label">MAX WAVE REACHED</div><div className="hof-value">{highestWave}</div></div><div className="hof-card"><div className="hof-label">TOTAL VIRUSES PURGED</div><div className="hof-value">{lifetimeKills.toLocaleString()}</div></div><div className="hof-card"><div className="hof-label">ARCHITECT STATUS</div><div className="hof-value" style={{color: '#00ff66'}}>{rank}</div></div></div>)}{infoTab === 'VIRAL DB' && ( <div className="visual-grid">{Object.values(VISUAL_REGISTRY).map(v => ( <div key={v.name} className="visual-card-large"><div className="card-visual-box"><div className={`shape ${v.shape}`} style={v.shape === 'triangle' ? { borderBottomColor: v.colorHex } : { background: v.colorHex }}></div></div><div className="card-detail-box"><div className="label">{v.name}</div><div className="stats">HP: {v.baseHp} // SPD: {v.speed}x // PRIORITY: {v.priority}</div><div className="desc">{ v.name === 'GLIDER' ? 'Rapid packet stream. Low integrity.' : v.name === 'STRIDER' ? 'Staggered burst unit. Medium threat.' : v.name === 'BEHEMOTH' ? 'Heavy bulk data. High defensive priority.' : 'Core-Breaker. High entropy Boss unit.' }</div></div></div> ))}</div> )}{infoTab === 'PROTOCOLS' && ( <div className="visual-grid">{Object.keys(TOWER_CONFIGS).map(key => { const type = parseInt(key) as TowerType; const cfg = TOWER_CONFIGS[type]; return ( <div key={key} className="visual-card-large"><div className="card-visual-box"><div className="mini-turret" data-type={type} style={{transform: 'scale(1.2)'}}><div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6,'0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6,'0')}` }}></div></div></div></div><div className="card-detail-box"><div className="label">{cfg.name}</div><div className="stats">DMG: {cfg.damage} // RNG: {cfg.range} // COST: {cfg.cost}c</div><div className="desc">{ type === 0 ? 'Rapid-fire logic pulse. Standard frontline defense.' : type === 1 ? 'Cryo-cycle beam. Applies 50% movement reduction.' : type === 2 ? 'High-voltage bridge. Arc damage to 3 adjacent targets.' : type === 3 ? 'Sub-atomic accelerator. High damage + Reveal stealth.' : 'Global system buffer. Grants +25% DMG to all linked nodes.' }</div></div></div> ); })}</div> )}{infoTab === 'THREATS' && ( <div className="manual-text"><div className="manual-entry"><span className="entry-label cyan">ELITE SIGNATURES:</span><span className="entry-content">EVERY 5 SWARMS, MINI-BOSSES WITH 3.5x HP MATERIALIZE.</span></div><div className="manual-entry"><span className="entry-label cyan">GHOST PACKETS:</span><span className="entry-content">INVISIBLE ON THE GRID SENSOR. REVEALED BY FROST RAY OR TESLA RADIUS.</span></div><div className="manual-entry"><span className="entry-label cyan">BOSS CORE:</span><span className="entry-content">FRACTAL VIRUSES DEAL 10 UNITS OF DAMAGE TO KERNEL UPON BREACH.</span></div></div> )}{infoTab === 'LOGIC' && ( <div className="manual-text"><div className="manual-entry"><span className="entry-label cyan">DATA LINKS:</span><span className="entry-content">PLACING IDENTICAL TURRETS ADJACENT FORMS A SYNERGY LINK (+10% DMG).</span></div><div className="manual-entry"><span className="entry-label cyan">OVERCLOCKING:</span><span className="entry-content">TAP ANY PLACED TURRET TO UPGRADE ITS CORE SYSTEMS (3 LEVELS).</span></div><div className="manual-entry"><span className="entry-label cyan">INTEREST:</span><span className="entry-content">MAINTAIN A HIGH TOKEN BALANCE TO EARN 10% INTEREST PER SWARM.</span></div><div className="manual-entry"><span className="entry-label cyan">KERNEL OVERDRIVE:</span><span className="entry-content">CORE SHOCKWAVE PURGES NEARBY VIRUSES WHEN INTEGRITY DROPS BELOW 5.</span></div></div> )}{infoTab === 'RANKS' && ( <div className="manual-text"><div className="manual-entry"><span className="entry-label cyan">INITIATE:</span><span className="entry-content">STARTING RANK. NO BONUS.</span></div><div className="manual-entry"><span className="entry-label cyan">SCRIPTER:</span><span className="entry-content">1,000 XP REQUIRED. +50 TOKEN STARTING BONUS.</span></div><div className="manual-entry"><span className="entry-label cyan">SYS_ARCHITECT:</span><span className="entry-content">5,000 XP REQUIRED. +100 TOKEN STARTING BONUS.</span></div><div className="manual-entry"><span className="entry-label cyan">SENIOR_ENGR:</span><span className="entry-content">10,000 XP REQUIRED. +150 TOKEN STARTING BONUS.</span></div><div className="manual-entry"><span className="entry-label cyan">ELITE_ARCHITECT:</span><span className="entry-content">25,000 XP REQUIRED. +200 TOKEN STARTING BONUS.</span></div><div className="manual-entry"><span className="entry-label cyan">CORE_GUARDIAN:</span><span className="entry-content">50,000 XP REQUIRED. +300 TOKEN STARTING BONUS.</span></div><div className="manual-entry"><span className="entry-label cyan">GOD_MOD_ADMIN:</span><span className="entry-content">100,000 XP REQUIRED. +500 TOKEN STARTING BONUS.</span></div><div style={{marginTop: '20px', color: '#888', fontSize: '0.7rem'}}>&gt; XP IS EARNED BY COMPLETING WAVES. HARDCORE MODE GRANTS 2x XP PER WAVE.</div></div> )}{infoTab === 'CREDITS' && ( <div className="manual-text"><div className="manual-entry"><span className="entry-label cyan">SYSTEM OWNER:</span><span className="entry-content">CHRIS MCKINLEY</span></div><div className="manual-entry"><span className="entry-label cyan">ARCHITECT:</span><span className="entry-content">CHRIS MCKINLEY</span></div><div className="manual-entry"><span className="entry-label cyan">BUILD ENGINE:</span><span className="entry-content">SYNTAX V2.7.0 [ELITE]</span></div><div style={{marginTop: '30px', borderTop: '1px solid #222', paddingTop: '20px', color: '#666', fontSize: '0.7rem'}}>&gt; ALL SYSTEM ASSETS, CORE LOGIC, AND INTELLECTUAL PROPERTY CONTAINED WITHIN THIS MAINFRAME ARE THE SOLE PROPERTY OF THE SYSTEM OWNER. UNAUTHORIZED REPLICATION OR BREACH OF THIS SYNTAX IS STRICTLY PROHIBITED.</div></div> )}</div></>)}</div></div></>)}</div>
      )}
      <div id="game-container"></div>
      
      {screen === 'GAME' && game && (
        <div className="game-overlay-active ui-layer">
          {isVictorious && (
            <div className="pause-overlay-locked" style={{zIndex: 40000}}><div className="pause-content" style={{borderColor: '#00ff66'}}><h2 className="pause-title" style={{color: '#00ff66'}}>SYSTEM SECURED</h2><div className="game-summary"><p>&gt; ALL HOSTILE DATA PACKETS PURGED.</p><p>&gt; KERNEL INTEGRITY: {integrity}/20</p><p>&gt; FINAL TOKENS: {credits}</p></div><button className="cyan-menu-btn" onClick={quitToMenu} style={{marginTop: '20px'}}>RETURN TO ROOT</button></div></div>
          )}
          {integrity <= 0 && <div className="pause-overlay-locked"><div className="pause-content"><h2 className="pause-title" style={{color: '#ff3300'}}>CRITICAL SYSTEM FAILURE</h2><button className="blue-button" onClick={quitToMenu}>RETURN TO ROOT</button></div></div>}
          {isPaused && integrity > 0 && !isVictorious && (
            <div className="pause-overlay-locked">
              {!showSettingsInGame ? (
                <div className="pause-content small-pause"><h2 className="pause-title">SYSTEM PAUSED</h2><div className="pause-options grid-options"><button className="blue-button" onClick={() => setIsPaused(false)}>RESUME</button><button className="blue-button" onClick={() => setShowSettingsInGame(true)}>SETTINGS</button><button className="blue-button" onClick={() => { setIsPaused(false); setShowTutorial(true); }}>HOW TO PLAY</button><button className="blue-button" onClick={saveAndQuit} disabled={isWaveActive} style={{opacity: isWaveActive ? 0.5 : 1}}>SAVE & EXIT</button><button className="blue-button" onClick={quitToMenu} style={{background: 'rgba(255, 51, 0, 0.2)', borderColor: '#ff3300', gridColumn: 'span 2'}}>ABANDON</button></div></div>
              ) : (
                <div className="pause-content small-pause"><h2 className="pause-title">SETTINGS</h2><div className="manual-text" style={{width: '100%', marginBottom: '10px'}}><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}><span style={{fontSize: '0.7rem'}}>SFX VOLUME</span><input type="range" min="0" max="1" step="0.05" value={sfxVolState} onChange={handleSfxVol} style={{width: '100px'}} /></div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: '0.7rem'}}>MUSIC VOLUME</span><input type="range" min="0" max="1" step="0.05" value={musicVolState} onChange={handleMusicVol} style={{width: '100px'}} /></div></div><button className="blue-button" onClick={() => setShowSettingsInGame(false)} style={{width: '100%'}}>BACK</button></div>
              )}
            </div>
          )}
          {gamePhase === 'PREP' && waveSummary && wave >= 1 && showWaveSummaryPopup && !isPaused && integrity > 0 && !isTutorialActive && (
            <div className="victory-overlay ui-layer"><div className="popup-title">WAVE {wave} COMPLETE</div><div className="manual-text" style={{textAlign: 'center', marginBottom: '8px', fontSize: '0.9rem', color: '#00ff66'}}>&gt; SWARM PURGE SUCCESSFUL. ANALYSIS COMPLETE.</div><div className="stats-grid"><div className="stats-item"><div className="stats-label">ENEMIES DELETED</div><div className="stats-value">+{waveSummary.totalKills}</div></div><div className="stats-item"><div className="stats-label">TOKENS EARNED</div><div className="stats-value">+{Math.abs(waveSummary.kills)}c</div></div><div className="stats-item"><div className="stats-label">INTEREST CREDIT</div><div className="stats-value">+{waveSummary.interest}c</div></div><div className="stats-item"><div className="stats-label">TOTAL INCOME</div><div className="stats-value">+{waveSummary.total}c</div></div></div><button className="massive-exec-button" style={{marginTop: '10px'}} onClick={() => { setShowWaveSummaryPopup(false); game?.waveManager.prepareWave(true); setShowCombatIntel(true); }}>VIEW NEXT SWARM INTEL</button></div>
          )}
          {gamePhase === 'PREP' && !showWaveSummaryPopup && showCombatIntel && !isPaused && integrity > 0 && !isTutorialActive && (
            <div className="pre-wave-overlay ui-layer"><div className="popup-title">SWARM DATA DETECTED</div><div className="manual-text" style={{fontSize: '0.75rem', color: 'var(--neon-blue)', marginBottom: '10px'}}>&gt; ANALYZING MISSION: {waveName}... SCANNING VIRAL SIGNATURES...</div>{activeGlitch !== 'NONE' && ( <div style={{fontSize: '0.7rem', color: 'var(--neon-red)', textAlign: 'center', fontWeight: 900, border: '1px solid var(--neon-red)', padding: '5px', marginBottom: '10px'}}>CAUTION: SYSTEM {activeGlitch} DETECTED</div> )}<div className="intel-row-horizontal">{upcomingEnemies.map((type, idx) => { const reg = VISUAL_REGISTRY[type as EnemyType]; if (!reg) return null; return (<div key={idx} className="intel-card-minimal"><div className="symbol-only"><div className={`shape ${reg.shape}`} style={reg.shape === 'triangle' ? { borderBottomColor: reg.colorHex, borderBottomWidth: '20px', borderLeftWidth: '10px', borderRightWidth: '10px' } : { background: reg.colorHex, width: '20px', height: '20px' }}></div></div><div className="intel-label-small">{reg.name}</div></div>); })}</div><button className="massive-exec-button" style={{marginTop: '10px', padding: '10px', fontSize: '0.8rem'}} onClick={() => { executeWave(); setShowCombatIntel(false); }}>EXECUTE DEFENSE PROTOCOL</button></div>
          )}
          <div className="tactical-dashboard">
            <div className="dashboard-left"><div className="control-grid"><button className="blue-button compact-btn" onClick={() => setIsPaused(true)}>PAUSE</button><button className={`blue-button compact-btn ${isFastForward ? 'active' : ''}`} onClick={toggleFastForward} style={{borderColor: isFastForward ? '#00ff66' : ''}}>FWD &gt;&gt;</button><button className={`blue-button compact-btn ${integrity <= 5 && credits >= repairCost ? 'critical-repair' : ''}`} onClick={repairKernel} disabled={credits < repairCost || integrity >= 20}>REPAIR: {repairCost}c</button><button className="blue-button compact-btn" onClick={useDataPurge} disabled={credits < 1000 || !isWaveActive}>PURGE: 1000c</button></div></div>
            <div className="dashboard-center" ref={dashboardCenterRef}><div className="turret-row">{[0, 1, 2, 3, 4].map(type => { const cfg = TOWER_CONFIGS[type as TowerType]; const unlocked = type === 0 || isUnlocked(type); let cost = cfg.cost; if (game?.towerManager) { const count = game.towerManager.getTowerCount(type as TowerType); cost = Math.floor(cfg.cost * (count >= 4 ? 1.15 : 1.0)); if (gameMode === 'HARDCORE') cost = Math.floor(cost * 1.5); if (integrity < 10 && gameMode !== 'SUDDEN_DEATH') cost = Math.floor(cost * 0.85); } else { cost = gameMode === 'HARDCORE' ? Math.floor(cfg.cost * 1.5) : (integrity < 10 ? Math.floor(cfg.cost * 0.85) : cfg.cost); } return (<div key={type} ref={type === 0 ? firstTurretRef : null} className={`protocol-card ${selectedTurret === type ? 'active' : ''} ${credits < cost ? 'dimmed' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => unlocked && selectTurret(type)}><div className="protocol-header">{cfg.name}</div><div className="protocol-visual-container"><div className="mini-turret" data-type={type}><div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6,'0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6,'0')}` }}></div></div></div>{!unlocked && <div className="protocol-lock-overlay">🔒</div>}</div><div className="protocol-stats">DMG: {cfg.damage}</div><div className="protocol-footer">{cost}c</div></div>); })}</div></div>
            <div className="dashboard-right"><div className="status-stack"><div className="status-mission-line">LVL {isTutorialActive ? 0 : wave} // {isTutorialActive ? 'INIT' : waveName}</div><div className="status-credit-line"><span className="val">{credits}</span><span className="lbl"> TOKENS</span></div><div className="status-integrity-line"><div className="integrity-bar-clean"><div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%`, background: sysStatusColor }}></div></div><div className="status-text-line" style={{color: sysStatusColor}}>{systemStatusText}</div></div></div></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
