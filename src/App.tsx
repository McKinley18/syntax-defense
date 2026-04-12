import { useEffect, useState, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameContainer } from './game/GameContainer';
import { GameStateManager, type GameMode, type WaveSummary } from './game/systems/GameStateManager';
import { Tower } from './game/entities/Tower';
import { AudioManager } from './game/systems/AudioManager';
import { MusicManager } from './game/systems/MusicManager';
import { TILE_SIZE } from './game/systems/MapManager';
import { EnemyType } from './game/entities/Enemy';
import './App.css';

// Screens
import BootScreen from './screens/BootScreen';
import MainMenu from './screens/MainMenu';
import ArchiveScreen from './screens/ArchiveScreen';
import SettingsScreen from './screens/SettingsScreen';
import ModesScreen from './screens/ModesScreen';
import GameScreen from './screens/GameScreen';

// Components
import GridBackground from './components/ui/GridBackground';

type ScreenState = 'BOOT' | 'MENU' | 'GAME' | 'ARCHIVE' | 'MODES' | 'SETTINGS';
type ArchiveCategory = 'NONE' | 'TACTICAL' | 'HANDBOOK' | 'MANIFEST' | 'FIRMWARE';
type InfoTab = 'LORE' | 'VIRAL DB' | 'PROTOCOLS' | 'SYSTEM MODES' | 'THREATS' | 'LOGIC' | 'RANKS' | 'HALL_OF_FAME' | 'CREDITS' | 'UPGRADES';

const DEBUG_SCREEN_OVERRIDE: ScreenState | 'SPLASH' | 'NONE' = 'NONE';

function App() {
  // --- 1. STATE & REF DECLARATIONS ---
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [powerState, setPowerState] = useState<'OFF' | 'FLASH' | 'PAUSE' | 'BOOTING' | 'LOADING' | 'READY'>('OFF');
  const [loadProgress, setLoadProgress] = useState(0);
  const [startupLogs, setStartupLogs] = useState<string[]>([]);
  
  const [screen, setScreen] = useState<ScreenState>(DEBUG_SCREEN_OVERRIDE !== 'NONE' && DEBUG_SCREEN_OVERRIDE !== 'SPLASH' ? (DEBUG_SCREEN_OVERRIDE as ScreenState) : 'BOOT');
  const [archiveCategory, setArchiveCategory] = useState<ArchiveCategory>('NONE');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(850);
  const [integrity, setIntegrity] = useState(20);
  const [wave, setWave] = useState(1);
  const [waveName, setWaveName] = useState("");
  const [selectedTurret, setSelectedTurret] = useState(0);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [hoveredTower, setHoveredTower] = useState<Tower | null>(null);
  const [game, setGame] = useState<GameContainer | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFastForward, setIsFastForward] = useState(false);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [repairCost, setRepairCost] = useState(500);
  const [gameMode, setGameMode] = useState<GameMode>('STANDARD');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [sfxMuted, setSfxMuted] = useState(AudioManager.getInstance().isSfxMuted);
  const [ambientMuted, setAmbientMuted] = useState(AudioManager.getInstance().isAmbientMuted);
  const [sfxVolState, setSfxVolState] = useState(AudioManager.getInstance().sfxVolume);
  const [musicVolState, setMusicVolState] = useState(AudioManager.getInstance().musicVolume);
  const [isDistorted, setIsDistorted] = useState(DEBUG_SCREEN_OVERRIDE === 'BOOT');
  
  const [gamePhase, setGamePhase] = useState<string>("PREP");
  const [upcomingEnemies, setUpcomingEnemies] = useState<{ type: EnemyType, count: number }[]>([]);
  const [activeGlitch, setActiveGlitch] = useState<string>('NONE');
  const [waveSummary, setWaveSummary] = useState<WaveSummary>({ totalKills: 0, creditsEarned: 0, interest: 0, scrapValue: 0, integrityLost: 0, points: 0 });
  const [rank, setRank] = useState(GameStateManager.getInstance().architectRank);
  const [lifetimeKills, setLifetimeKills] = useState(0);
  const [highestWave, setHighestWave] = useState(0);
  const [isVictorious] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showWaveSummaryPopup, setShowWaveSummaryPopup] = useState(false);
  const [showCombatIntel, setShowCombatIntel] = useState(false);
  const [showSettingsInGame, setShowSettingsInGame] = useState(false);
  const [skipIntro, setSkipIntro] = useState(localStorage.getItem('syntax_skip_intro') === 'true');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [uptime] = useState(0);
  const [entropy] = useState(0.14);
  const [menuGlitchActive] = useState(false);
  const [showStudioSplash, setShowStudioSplash] = useState(DEBUG_SCREEN_OVERRIDE === 'SPLASH');
  const [studioComplete, setStudioComplete] = useState(!(DEBUG_SCREEN_OVERRIDE === 'SPLASH' || DEBUG_SCREEN_OVERRIDE === 'NONE' || DEBUG_SCREEN_OVERRIDE === 'BOOT'));
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const [bootPhase, setBootPhase] = useState(0); 
  const [enabledTracks, setEnabledTracks] = useState<boolean[]>(new Array(15).fill(true));
  
  const lastTriggeredPhaseRef = useRef(-1);
  const firstTurretRef = useRef<HTMLDivElement>(null);

  const [crtEnabled, setCrtEnabled] = useState(localStorage.getItem('syntax_crt_enabled') !== 'false');
  const [glitchEffectsEnabled, setGlitchEffectsEnabled] = useState(localStorage.getItem('syntax_glitch_enabled') !== 'false');
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(localStorage.getItem('syntax_auto_pause') === 'true');
  const [showAllRanges, setShowAllRanges] = useState(localStorage.getItem('syntax_show_ranges') === 'true');
  const [isTutorialActive, setIsTutorialActive] = useState(localStorage.getItem('syntax_tutorial_done') !== 'true');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tilePos, setTilePos] = useState({ x: -1000, y: -1000, ts: 32 });


  // --- 2. HELPER FUNCTIONS ---

  const initializeSystem = async () => {
    await AudioManager.getInstance().resume();
    AudioManager.getInstance().playPowerOn();
    setSystemInitialized(true);
    
    if (skipIntro) {
      setBootPhase(18);
      setStudioComplete(true);
      setShowStudioSplash(false);
      setScreen('MENU');
    } else {
      setBootPhase(1);
    }
  };

  const openArchive = (t: InfoTab = 'LORE') => {
    AudioManager.getInstance().playUiClick(); setIsTypingComplete(false);
    AudioManager.getInstance().resume();
    let cat: ArchiveCategory = 'NONE';
    if (['VIRAL DB', 'PROTOCOLS', 'THREATS'].includes(t)) cat = 'TACTICAL';
    else if (['LOGIC', 'RANKS', 'UPGRADES'].includes(t)) cat = 'HANDBOOK';
    else if (['LORE', 'HALL_OF_FAME', 'CREDITS'].includes(t)) cat = 'MANIFEST';
    setArchiveCategory(cat); setInfoTab(t); setScreen('ARCHIVE');
  };

  const cleanupGame = () => {
    if (game) { 
      game.destroy(); 
      const c = document.getElementById('game-container'); 
      if (c) c.innerHTML = ''; 
      setGame(null); 
    }
  };

  const quitToMenu = () => { 
    AudioManager.getInstance().playUiClick(); 
    // IF ABANDONING AN ACTIVE GAME (WAVE > 0 AND INTEGRITY > 0)
    const state = GameStateManager.getInstance();
    if (state.currentWave > 0 && state.integrity > 0 && screen === 'GAME') {
        state.deleteSession();
    }
    cleanupGame(); 
    setScreen('MENU'); 
  };
  const startNewGame = async (mode: GameMode = 'STANDARD') => { 
    AudioManager.getInstance().playUiClick(); 
    cleanupGame(); 
    setGameMode(mode); 
    setScreen('GAME'); 
    setIsInitializing(true);
    GameStateManager.getInstance().resetGame(mode, 1); // START AT 1 INTERNALLY
  };

  const loadGameSession = async () => { 
    AudioManager.getInstance().playUiClick(); 
    cleanupGame(); 
    if (GameStateManager.getInstance().loadSession()) {
      setGameMode(GameStateManager.getInstance().gameMode);
      setScreen('GAME'); 
      setIsInitializing(true); 
    }
  };

  const saveAndQuit = () => { 
    if (game) { 
      GameStateManager.getInstance().saveSession(); 
      quitToMenu(); 
    } 
  };
  const executeWave = () => { 
    if (game) { 
      if (isTutorialActive && (tutorialStep === 8 || tutorialStep === 9)) {
        game.waveManager.unlockTutorialSwarm();
        setTutorialStep(10); 
      }
      game.waveManager.prepareWave(true); 
      setIsWaveActive(true); 
    } 
  };
  const toggleFastForward = () => { if (game) { const v = !isFastForward; setIsFastForward(v); game.isFastForward = v; } };

  const repairKernel = () => {
    if (game) {
      if (GameStateManager.getInstance().repairKernel()) {
        AudioManager.getInstance().playRepair();
        setIntegrity(GameStateManager.getInstance().integrity);
        setCredits(GameStateManager.getInstance().credits);
        setRepairCost(GameStateManager.getInstance().repairCost);
      } else {
        AudioManager.getInstance().playUiDeny();
      }
    }
  };

  const selectTurret = (type: number) => { 
    if (game) { 
      AudioManager.getInstance().playUiClick(); 
      setSelectedTurret(type); 
      if (type === -1) {
        game.towerManager.cancelPlacement();
      } else {
        game.towerManager.startPlacement(type as any); 
      }
    } 
  };
  const handleUpgrade = (tower: Tower) => { 
    if (game && game.towerManager.tryUpgradeTower(tower)) { 
      setCredits(GameStateManager.getInstance().credits); 
      setSelectedTower(null); 
    } else { 
      AudioManager.getInstance().playUiDeny(); 
    } 
  };
  const handleSell = (tower: Tower) => { 
    if (game) { 
      game.towerManager.sellTower(tower); 
      setCredits(GameStateManager.getInstance().credits); 
      setSelectedTower(null); 
    } 
  };
  const isUnlocked = (type: number) => GameStateManager.getInstance().isTowerUnlocked(type);

  const toggleSkipIntro = () => { const v = !skipIntro; setSkipIntro(v); localStorage.setItem('syntax_skip_intro', String(v)); };
  const toggleCrt = () => { const v = !crtEnabled; setCrtEnabled(v); localStorage.setItem('syntax_crt_enabled', String(v)); };
  const toggleGlitch = () => { const v = !glitchEffectsEnabled; setGlitchEffectsEnabled(v); localStorage.setItem('syntax_glitch_enabled', String(v)); };
  const toggleAutoPause = () => { const v = !autoPauseEnabled; setAutoPauseEnabled(v); localStorage.setItem('syntax_auto_pause', String(v)); };
  const toggleShowRanges = () => { const v = !showAllRanges; setShowAllRanges(v); localStorage.setItem('syntax_show_ranges', String(v)); };

  const handleSfxVol = (e: React.ChangeEvent<HTMLInputElement>) => { const v = parseFloat(e.target.value); setSfxVolState(v); AudioManager.getInstance().setSfxVolume(v); };
  const handleMusicVol = (e: React.ChangeEvent<HTMLInputElement>) => { const v = parseFloat(e.target.value); setMusicVolState(v); AudioManager.getInstance().setMusicVolume(v); MusicManager.getInstance().setVolume(v); };
  const toggleSfx = () => { const v = !sfxMuted; setSfxMuted(v); AudioManager.getInstance().setSfxMuted(v); };
  const toggleAmbient = () => { const v = !ambientMuted; setAmbientMuted(v); AudioManager.getInstance().setAmbientMuted(v); };
  const previewTrack = (id: number) => MusicManager.getInstance().previewTrack(id);
  const clearStats = () => { GameStateManager.getInstance().clearStats(); setRank(GameStateManager.getInstance().architectRank); setLifetimeKills(0); setHighestWave(0); setResetStatus("DATABASE PURGED."); setTimeout(() => setResetStatus(""), 4000); };

  const toggleTrack = (id: number) => {
    const updated = [...enabledTracks];
    updated[id] = !updated[id];
    setEnabledTracks(updated);
  };

  // --- 3. SIDE EFFECTS ---

  useEffect(() => {
    const handleOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener('resize', handleOrientation);
    handleOrientation();
    return () => window.removeEventListener('resize', handleOrientation);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPowerState('FLASH'), 500);
    const t2 = setTimeout(() => setPowerState('PAUSE'), 1500);
    const t3 = setTimeout(() => {
      setPowerState('BOOTING');
      const logs = [
        "SYNTAX_BIOS v3.5.0 (c) 2048",
        "CPU: LOGIC_CORE_GEN4 @ 5.2GHz",
        "MEM: 64TB QUANTUM_CACHE... OK",
        "IO: VIRTUAL_GRID_ADAPTER... OK",
        "SYS: MOUNTING /ROOT/KERNEL",
        "AUTH: READY_FOR_USER_INIT"
      ];
      let current = 0;
      const itv = setInterval(() => {
        setStartupLogs(prev => [...prev, logs[current]]);
        current++;
        if (current >= logs.length) clearInterval(itv);
      }, 200);
    }, 3500);
    const t4 = setTimeout(() => {
      setPowerState('LOADING');
      const itv = setInterval(() => {
        setLoadProgress(p => {
          if (p >= 100) { clearInterval(itv); return 100; }
          return p + 2;
        });
      }, 30);
    }, 5500);
    const t5 = setTimeout(() => setPowerState('READY'), 7500);
    return () => { [t1,t2,t3,t4,t5].forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (crtEnabled) document.body.classList.remove('no-crt');
    else document.body.classList.add('no-crt');
  }, [crtEnabled]);

  useEffect(() => {
    if (isLandscape && showStudioSplash && systemInitialized && !studioComplete) {
      const timer = setTimeout(() => {
        setShowStudioSplash(false);
        setStudioComplete(true);
        setScreen('MENU');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isLandscape, showStudioSplash, studioComplete, systemInitialized]);

  useEffect(() => {
    if (!isLandscape || !systemInitialized) return;
    if (bootPhase === 0 && lastTriggeredPhaseRef.current < 0) {
        lastTriggeredPhaseRef.current = 0;
        if (skipIntro) { setBootPhase(18); setLoadProgress(100); } 
    }
    else if (bootPhase === 4.5 && lastTriggeredPhaseRef.current < 4.5) {
        lastTriggeredPhaseRef.current = 4.5;
        setTimeout(() => setBootPhase(5), 1000); 
    }
    else if (bootPhase === 13 && lastTriggeredPhaseRef.current < 13) {
        lastTriggeredPhaseRef.current = 13;
        setTimeout(() => setBootPhase(13.4), 1000); 
    }
    else if (bootPhase === 13.4 && lastTriggeredPhaseRef.current < 13.4) {
        lastTriggeredPhaseRef.current = 13.4;
        setTimeout(() => setBootPhase(13.5), 1000); 
    }
    else if (bootPhase === 14.9 && lastTriggeredPhaseRef.current < 14.9) {
        lastTriggeredPhaseRef.current = 14.9;
        setIsDistorted(true); 
        AudioManager.getInstance().playBreach(window.innerWidth / 2, window.innerWidth); 
    }
    else if (bootPhase === 15.2 && lastTriggeredPhaseRef.current < 15.2) {
        lastTriggeredPhaseRef.current = 15.2;
        AudioManager.getInstance().playDramaticGlitch();
    }
    else if (bootPhase === 16 && lastTriggeredPhaseRef.current < 16) {
        lastTriggeredPhaseRef.current = 16;
        AudioManager.getInstance().playDramaticGlitch();
        setTimeout(() => { setIsDistorted(true); }, 100);
        setTimeout(() => { 
            setIsDistorted(false); 
            setBootPhase(18); if (!skipIntro) setScreen('MENU'); 
        }, 400);
    }
  }, [bootPhase, isLandscape, skipIntro, systemInitialized]);

  useEffect(() => { AudioManager.getInstance().init(); }, []);

  useEffect(() => {
    if (screen === 'MENU') {
      const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
      window.addEventListener('mousemove', handleMouse);
      return () => window.removeEventListener('mousemove', handleMouse);
    }
  }, [screen]);

  useEffect(() => {
    if (game && game.waveManager) {
      game.isTutorialActive = isTutorialActive;
      if (game.towerManager) game.towerManager.showAllRanges = showAllRanges;
      game.isPaused = isPaused; 
      game.waveManager.prepareWave(false);
    }
  }, [game, isTutorialActive, showAllRanges, isPaused]);

  useEffect(() => {
    if (isInitializing && screen === 'GAME') {
      const init = async () => {
        const g = await GameContainer.getInstance();
        setGame(g);
        setIsInitializing(false);
        const interval = setInterval(() => {
          const state = GameStateManager.getInstance();
          setCredits(state.credits); setIntegrity(state.integrity);
          setWave(state.currentWave); setWaveName(state.getWaveName());
          setRepairCost(state.repairCost); setGameMode(state.gameMode);
          setGamePhase(state.phase); setWaveSummary(state.lastWaveSummary);
          setRank(state.architectRank); setLifetimeKills(state.lifetimeKills); setHighestWave(state.highestWave);
          setActiveGlitch(state.activeGlitch);
          if (g.waveManager) { setIsWaveActive(g.waveManager.isWaveActive); setUpcomingEnemies(g.waveManager.upcomingEnemies); }
        }, 100);
        return () => clearInterval(interval);
      }
      init();
    }
  }, [screen, isInitializing]);

  useEffect(() => {
    if (game) {
      game.tutorialStep = tutorialStep;
      game.isTutorialActive = isTutorialActive;
    }
    // Force clear selection during early tutorial steps to prevent UI overlap
    if (isTutorialActive && tutorialStep < 5) {
      setSelectedTower(null);
    }
  }, [game, tutorialStep, isTutorialActive]);

  useEffect(() => {
    if (!isTutorialActive || screen !== 'GAME') return;

    let raf: number;
    let retryCount = 0;
    const updatePos = () => {
      if (!game || screen !== 'GAME') return;

      let found = false;
      if (tutorialStep === 1) {
        if (firstTurretRef.current) {
          const rect = firstTurretRef.current.getBoundingClientRect();
          if (rect.width > 0) {
            setTilePos({ 
              x: rect.left + rect.width / 2, 
              y: rect.top + rect.height / 2, 
              ts: 40 
            });
            found = true;
          }
        }
      } else if (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 6) {
          // FORCE ANCHOR: Grid {13, 5}
          const targetX = 13 * TILE_SIZE + TILE_SIZE / 2;
          const targetY = 5 * TILE_SIZE + TILE_SIZE / 2;
          
          if (game && game.viewport) {
            try {
              game.viewport.updateTransform({});
              const screenPos = game.viewport.toGlobal(new PIXI.Point(targetX, targetY));
              if (screenPos && !isNaN(screenPos.x) && screenPos.y > 50) {
                setTilePos({ x: screenPos.x, y: screenPos.y, ts: TILE_SIZE });
                found = true;
              }
            } catch (e) {}
          }
          
          if (!found) {
            setTilePos({ x: targetX, y: targetY, ts: TILE_SIZE });
            found = true;
          }
      } else if (tutorialStep === 9 || tutorialStep === 8) {
        // Point to the EXECUTE DEFENSE button (Bottom Center)
        setTilePos({ 
          x: window.innerWidth / 2, 
          y: window.innerHeight - 40, 
          ts: 120 
        });
        found = true;
      }
 else if (tutorialStep === 11) {
        // Point to the FINISH button (approx center)
        setTilePos({ x: window.innerWidth / 2, y: window.innerHeight * 0.6, ts: 100 });
        found = true;
      }

      if (!found) {
        retryCount++;
        raf = requestAnimationFrame(updatePos);
      }
    };

    setTilePos({ x: 0, y: 0, ts: 0 });
    raf = requestAnimationFrame(updatePos);
    return () => cancelAnimationFrame(raf);
  }, [tutorialStep, isTutorialActive, screen, game]);

  const sysStatusColor = integrity > 15 ? '#00ff66' : integrity > 5 ? '#ffcc00' : '#ff3300';
  const systemStatusText = integrity > 15 ? 'OPTIMAL' : integrity > 5 ? 'COMPROMISED' : 'CRITICAL';
  const hasSave = !!localStorage.getItem('syntax_defense_save');

  // --- 4. RENDER ---

  return (
    <div className="game-wrapper">
      {!isLandscape && (
        <div className="orientation-warning ui-layer" style={{ display: 'flex', zIndex: 200000 }}>
          <div className="rotate-icon">📱</div>
          <h2>LANDSCAPE MODE REQUIRED</h2>
          <p>&gt; PLEASE ROTATE YOUR DEVICE TO INITIALIZE SYSTEM.</p>
        </div>
      )}

      {isLandscape && powerState !== 'READY' && (
        <div className="power-on-container ui-layer">
           {powerState === 'FLASH' && <div className="crt-beam"></div>}
           {powerState === 'BOOTING' && (
             <div className="startup-logs">
               {startupLogs.map((log, i) => <div key={i} className="boot-line">&gt; {log}</div>)}
             </div>
           )}
           {powerState === 'LOADING' && (
             <div className="startup-loading">
               <div className="load-label">STABILIZING_SYSTEM_RESOURCES</div>
               <div className="load-bar-outer"><div className="load-bar-inner" style={{ width: `${loadProgress}%` }}></div></div>
               <div className="load-pct">{loadProgress}%</div>
             </div>
           )}
        </div>
      )}

      {isLandscape && powerState === 'READY' && !systemInitialized && (
        <div className="studio-splash ui-layer" style={{ zIndex: 70000 }}>
          <div className="initialize-prompt">
            <div className="init-scanline"></div>
            <button className="init-button" onClick={initializeSystem}>INITIALIZE SYSTEM</button>
            <div className="init-scanline"></div>
          </div>
        </div>
      )}

      {isLandscape && systemInitialized && screen === 'BOOT' && DEBUG_SCREEN_OVERRIDE === 'NONE' && (
        <BootScreen 
          isDistorted={isDistorted} skipIntro={skipIntro} bootPhase={bootPhase} 
          setBootPhase={setBootPhase}
          onAccessRoot={() => { setShowStudioSplash(true); setScreen('BOOT'); }}
        />
      )}

      {isLandscape && showStudioSplash && !studioComplete && (
        <div className="studio-splash ui-layer" style={{ zIndex: 60000 }}>
          <div className="manifest-wrapper">
            <div className="pillars-bg">
              <div className="pillar p1"></div><div className="pillar p2"></div><div className="pillar p3"></div><div className="pillar p4"></div>
            </div>
            <h1 className="manifest-text">MONOLITH</h1>
            <div className="manifest-subtext">PRESENTS</div>
          </div>
        </div>
      )}

      {isLandscape && studioComplete && (
        <>
          <div id="game-container"></div>      
          {['MENU', 'ARCHIVE', 'MODES', 'SETTINGS'].includes(DEBUG_SCREEN_OVERRIDE === 'NONE' ? screen : (DEBUG_SCREEN_OVERRIDE as ScreenState)) && (
            <GridBackground isDistorted={isDistorted} mousePos={mousePos} />
          )}
          {(DEBUG_SCREEN_OVERRIDE === 'MENU' || (screen === 'MENU' && DEBUG_SCREEN_OVERRIDE === 'NONE')) && (
            <MainMenu 
              hasSave={hasSave} onStartGame={startNewGame} onSetScreen={setScreen} onOpenArchive={openArchive} onLoadGame={loadGameSession}
              hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} uptime={uptime} entropy={entropy} menuGlitchActive={menuGlitchActive}
            />
          )}
          {(DEBUG_SCREEN_OVERRIDE === 'ARCHIVE' || (screen === 'ARCHIVE' && DEBUG_SCREEN_OVERRIDE === 'NONE')) && (
            <ArchiveScreen archiveCategory={archiveCategory} infoTab={infoTab} highestWave={highestWave} lifetimeKills={lifetimeKills} rank={rank} setArchiveCategory={setArchiveCategory} setInfoTab={setInfoTab} setIsTypingComplete={setIsTypingComplete} onSetScreen={setScreen} />
          )}
          {(DEBUG_SCREEN_OVERRIDE === 'SETTINGS' || (screen === 'SETTINGS' && DEBUG_SCREEN_OVERRIDE === 'NONE')) && (
            <SettingsScreen isTypingComplete={isTypingComplete} skipIntro={skipIntro} sfxVolState={sfxVolState} musicVolState={musicVolState} sfxMuted={sfxMuted} ambientMuted={ambientMuted} enabledTracks={enabledTracks} integrity={integrity} lifetimeKills={lifetimeKills} highestWave={highestWave} rank={rank} resetStatus={resetStatus} toggleSkipIntro={toggleSkipIntro} onPurgeTutorial={() => { AudioManager.getInstance().playUiClick(); localStorage.removeItem('syntax_tutorial_done'); setResetStatus("TUTORIAL DATA PURGED."); setTimeout(() => setResetStatus(""), 4000); }} onClearStats={clearStats} handleSfxVol={handleSfxVol} handleMusicVol={handleMusicVol} toggleSfx={toggleSfx} toggleAmbient={toggleAmbient} toggleTrack={toggleTrack} onPreviewTrack={previewTrack} onSetScreen={setScreen} setIsTypingComplete={setIsTypingComplete} crtEnabled={crtEnabled} glitchEffectsEnabled={glitchEffectsEnabled} autoPauseEnabled={autoPauseEnabled} showAllRanges={showAllRanges} toggleCrt={toggleCrt} toggleGlitch={toggleGlitch} toggleAutoPause={toggleAutoPause} toggleShowRanges={toggleShowRanges} />
          )}
          {(DEBUG_SCREEN_OVERRIDE === 'MODES' || (screen === 'MODES' && DEBUG_SCREEN_OVERRIDE === 'NONE')) && (
            <ModesScreen isTypingComplete={isTypingComplete} onStartGame={startNewGame} onSetScreen={setScreen} setIsTypingComplete={setIsTypingComplete} />
          )}
          {(DEBUG_SCREEN_OVERRIDE === 'GAME' || (screen === 'GAME' && DEBUG_SCREEN_OVERRIDE === 'NONE')) && game && (
            <GameScreen game={game} isVictorious={isVictorious} integrity={integrity} credits={credits} isPaused={isPaused} showSettingsInGame={showSettingsInGame} sfxVolState={sfxVolState} musicVolState={musicVolState} gamePhase={gamePhase} waveSummary={waveSummary} wave={wave} showWaveSummaryPopup={showWaveSummaryPopup} isTutorialActive={isTutorialActive} showCombatIntel={showCombatIntel} activeGlitch={activeGlitch} upcomingEnemies={upcomingEnemies} waveName={waveName} tutorialStep={tutorialStep} tilePos={tilePos} selectedTower={selectedTower} hoveredTower={hoveredTower} repairCost={repairCost} selectedTurret={selectedTurret} gameMode={gameMode} isWaveActive={isWaveActive} isFastForward={isFastForward} autoPauseEnabled={autoPauseEnabled} sysStatusColor={sysStatusColor} systemStatusText={systemStatusText} firstTurretRef={firstTurretRef} onQuitToMenu={quitToMenu} onTogglePause={setIsPaused} onShowSettings={setShowSettingsInGame} onSetSfxVol={handleSfxVol} onSetMusicVol={handleMusicVol} onSaveAndQuit={saveAndQuit} onExecuteWave={executeWave} onPrepareWave={(start) => game?.waveManager.prepareWave(start)} onSetShowWaveSummary={setShowWaveSummaryPopup} onSetShowCombatIntel={setShowCombatIntel} onSetTutorialStep={setTutorialStep} onSetHoveredTower={setHoveredTower} onToggleFastForward={toggleFastForward} onRepair={repairKernel} onSelectTurret={selectTurret} onUpgradeTower={handleUpgrade} onSellTower={handleSell} onCloseTowerContext={() => setSelectedTower(null)} isTowerUnlocked={isUnlocked} getTowerCount={(type) => game?.towerManager?.getTowerCount(type) || 0} getUpgradeCost={(tower) => game?.towerManager?.getUpgradeCost(tower) || 0} onFinishTutorial={() => { localStorage.setItem('syntax_tutorial_done', 'true'); setIsTutorialActive(false); const state = GameStateManager.getInstance(); state.currentWave = 1; state.phase = 'PREP'; if (game) game.waveManager.prepareWave(false); setShowCombatIntel(true); }} setSelectedTower={setSelectedTower} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
