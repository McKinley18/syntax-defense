import { useEffect, useState, useRef } from 'react';
import { GameContainer } from './game/GameContainer';
import { GameStateManager, type GameMode, type WaveSummary, type GlitchType } from './game/systems/GameStateManager';
import { Tower, TowerType } from './game/entities/Tower';
import { AudioManager } from './game/systems/AudioManager';
import { MusicManager } from './game/systems/MusicManager';
import { TILE_SIZE } from './game/systems/MapManager';
import { EnemyType } from './game/VisualRegistry';
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

function App() {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleOrientation);
    handleOrientation();
    return () => window.removeEventListener('resize', handleOrientation);
  }, []);

  const [screen, setScreen] = useState<ScreenState>('BOOT');
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
  const [isDistorted, setIsDistorted] = useState(false);
  const [gamePhase, setGamePhase] = useState<string>("PREP");
  const [upcomingEnemies, setUpcomingEnemies] = useState<{ type: EnemyType, count: number }[]>([]);
  const [activeGlitch, setActiveGlitch] = useState<GlitchType>('NONE');
  const [waveSummary, setWaveSummary] = useState<WaveSummary>({ kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0, points: 0 });
  const [rank, setRank] = useState(GameStateManager.getInstance().architectRank);
  const [lifetimeKills, setLifetimeKills] = useState(0);
  const [highestWave, setHighestWave] = useState(0);
  const [isVictorious, setIsVictorious] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [showWaveSummaryPopup, setShowWaveSummaryPopup] = useState(false);
  const [showCombatIntel, setShowCombatIntel] = useState(false);
  const [showSettingsInGame, setShowSettingsInGame] = useState(false);
  const [skipIntro, setSkipIntro] = useState(localStorage.getItem('syntax_skip_intro') === 'true');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [uptime, setUptime] = useState(0);
  const [entropy, setEntropy] = useState(0.14);
  const [menuGlitchActive, setMenuGlitchActive] = useState(false);
  const [showStudioSplash, setShowStudioSplash] = useState(true);
  const [studioComplete, setStudioComplete] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (screen !== 'MENU') return;
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [screen]);

  const [bootPhase, setBootPhase] = useState(0); 
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isReadyGlitched, setIsReadyGlitched] = useState(false);
  const [enabledTracks, setEnabledTracks] = useState<boolean[]>(new Array(15).fill(true));
  const bootLogIndexRef = useRef(0);
  const lastTriggeredPhaseRef = useRef(-1);

  const [crtEnabled, setCrtEnabled] = useState(localStorage.getItem('syntax_crt_enabled') !== 'false');
  const [glitchEffectsEnabled, setGlitchEffectsEnabled] = useState(localStorage.getItem('syntax_glitch_enabled') !== 'false');
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(localStorage.getItem('syntax_auto_pause') === 'true');
  const [showAllRanges, setShowAllRanges] = useState(localStorage.getItem('syntax_show_ranges') === 'true');

  const toggleCrt = () => { const v = !crtEnabled; setCrtEnabled(v); localStorage.setItem('syntax_crt_enabled', String(v)); };
  const toggleGlitch = () => { const v = !glitchEffectsEnabled; setGlitchEffectsEnabled(v); localStorage.setItem('syntax_glitch_enabled', String(v)); };
  const toggleAutoPause = () => { const v = !autoPauseEnabled; setAutoPauseEnabled(v); localStorage.setItem('syntax_auto_pause', String(v)); };
  const toggleShowRanges = () => { const v = !showAllRanges; setShowAllRanges(v); localStorage.setItem('syntax_show_ranges', String(v)); };

  useEffect(() => {
    if (crtEnabled) document.body.classList.remove('no-crt');
    else document.body.classList.add('no-crt');
  }, [crtEnabled]);

  useEffect(() => {
    if (isLandscape && showStudioSplash && !studioComplete) {
      const timer = setTimeout(() => {
        setShowStudioSplash(false);
        setStudioComplete(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isLandscape, showStudioSplash, studioComplete]);

  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const firstTurretRef = useRef<HTMLDivElement>(null);
  const [tilePos, setTilePos] = useState({ x: 0, y: 0, ts: 40 });

  useEffect(() => {
    if (game) {
      game.isTutorialActive = isTutorialActive;
      game.towerManager.showAllRanges = showAllRanges;
      game.isPaused = isPaused; 
      game.waveManager.prepareWave(false);
    }
  }, [game, isTutorialActive, showAllRanges, isPaused]);

  useEffect(() => {
    if (screen !== 'MENU') return;
    const updateDiag = setInterval(() => {
      setUptime(prev => prev + 1);
      setEntropy(Math.max(0, 0.14 + (Math.random() * 0.05 - 0.025)));
    }, 1000);
    const triggerGlitch = () => {
      if (!glitchEffectsEnabled) { setMenuGlitchActive(false); return; }
      setMenuGlitchActive(true);
      setTimeout(() => setMenuGlitchActive(false), 100 + Math.random() * 150);
      setTimeout(triggerGlitch, 30000 + Math.random() * 30000);
    };
    const initialGlitch = setTimeout(triggerGlitch, 20000 + Math.random() * 10000);
    return () => { clearInterval(updateDiag); clearTimeout(initialGlitch); };
  }, [screen, glitchEffectsEnabled]);

  // BOOT LOGIC EFFECT
  useEffect(() => {
    if (!isLandscape || !studioComplete) return;
    
    if (bootPhase === 0 && lastTriggeredPhaseRef.current < 0) {
        lastTriggeredPhaseRef.current = 0;
        if (skipIntro) {
            setBootPhase(18);
            setBootProgress(100);
        } else {
            setBootPhase(1);
        }
    }
    else if (bootPhase === 1 && lastTriggeredPhaseRef.current < 1) {
        lastTriggeredPhaseRef.current = 1;
    }
    else if (bootPhase === 2 && lastTriggeredPhaseRef.current < 2) {
        lastTriggeredPhaseRef.current = 2;
        setTimeout(() => setBootPhase(3), 1000);
    }
    else if (bootPhase === 4 && lastTriggeredPhaseRef.current < 4) {
        lastTriggeredPhaseRef.current = 4;
        setTimeout(() => setBootPhase(4.1), 800);
    }
    else if (bootPhase === 4.2 && lastTriggeredPhaseRef.current < 4.2) {
        lastTriggeredPhaseRef.current = 4.2;
        setTimeout(() => setBootPhase(4.5), 2000);
    }
    else if (bootPhase === 4.5 && lastTriggeredPhaseRef.current < 4.5) {
        lastTriggeredPhaseRef.current = 4.5;
        setBootLogs([]);
        setBootPhase(5); 
    }
    else if (bootPhase === 5 && lastTriggeredPhaseRef.current < 5) {
        lastTriggeredPhaseRef.current = 5;
        setTimeout(() => setBootPhase(6.1), 1200);
    }
    else if (bootPhase === 6.1 && lastTriggeredPhaseRef.current < 6.1) {
        lastTriggeredPhaseRef.current = 6.1;
    }
    else if (bootPhase === 6.2 && lastTriggeredPhaseRef.current < 6.2) {
        lastTriggeredPhaseRef.current = 6.2;
        setTimeout(() => setBootPhase(6.5), 1000);
    }
    else if (bootPhase === 6.5 && lastTriggeredPhaseRef.current < 6.5) {
        lastTriggeredPhaseRef.current = 6.5;
    }
    else if (bootPhase === 6.6 && lastTriggeredPhaseRef.current < 6.6) {
        lastTriggeredPhaseRef.current = 6.6;
        const timer = setInterval(() => {
            setBootProgress(p => { 
                if (p >= 100) { 
                    clearInterval(timer); 
                    setTimeout(() => setBootPhase(7), 800); 
                    return 100; 
                } 
                return p + 1;
            });
        }, 60);
        return () => clearInterval(timer);
    } 
    else if (bootPhase === 7 && lastTriggeredPhaseRef.current < 7) {
        lastTriggeredPhaseRef.current = 7;
        const logs = [
            "UPLOADING KERNEL_MODULES... [OK]", "MOUNTING TACTICAL_ASSETS... [OK]",
            "SYNCHRONIZING CORE_LOGIC... [OK]", "ESTABLISHING ENCRYPTED_UPLINK... [OK]"
        ];
        bootLogIndexRef.current = 0;
        const itv = setInterval(() => {
            if (bootLogIndexRef.current < logs.length) { 
                setBootLogs(prev => [...prev, logs[bootLogIndexRef.current]]); 
                if (audioReady) AudioManager.getInstance().playTypeClick(); 
                bootLogIndexRef.current++; 
            } else { 
                clearInterval(itv); 
                setTimeout(() => setBootPhase(9), 1200); 
            }
        }, 600);
        return () => clearInterval(itv);
    }
    else if (bootPhase === 9 && lastTriggeredPhaseRef.current < 9) {
        lastTriggeredPhaseRef.current = 9;
    }
    else if (bootPhase === 11 && lastTriggeredPhaseRef.current < 11) {
        lastTriggeredPhaseRef.current = 11;
        setTimeout(() => setBootPhase(12), 800);
    }
    else if (bootPhase === 12 && lastTriggeredPhaseRef.current < 12) {
        lastTriggeredPhaseRef.current = 12;
    }
    else if (bootPhase === 13 && lastTriggeredPhaseRef.current < 13) {
        lastTriggeredPhaseRef.current = 13;
        setTimeout(() => setBootPhase(13.4), 2000);
    }
    else if (bootPhase === 13.4 && lastTriggeredPhaseRef.current < 13.4) {
        lastTriggeredPhaseRef.current = 13.4;
        setBootLogs([]);
        setTimeout(() => setBootPhase(13.5), 1000); 
    }
    else if (bootPhase === 13.5 && lastTriggeredPhaseRef.current < 13.5) {
        lastTriggeredPhaseRef.current = 13.5;
    }
    else if (bootPhase === 14 && lastTriggeredPhaseRef.current < 14) {
        lastTriggeredPhaseRef.current = 14;
        if (audioReady) AudioManager.getInstance().playDramaticGlitch();
        setTimeout(() => setBootPhase(14.1), 1200);
    }
    else if (bootPhase === 14.1 && lastTriggeredPhaseRef.current < 14.1) {
        lastTriggeredPhaseRef.current = 14.1;
        setTimeout(() => setBootPhase(14.5), 1500); 
    }
    else if (bootPhase === 14.6 && lastTriggeredPhaseRef.current < 14.6) {
        lastTriggeredPhaseRef.current = 14.6;
        setTimeout(() => setBootPhase(14.7), 1500); 
    }
    else if (bootPhase === 14.8 && lastTriggeredPhaseRef.current < 14.8) {
        lastTriggeredPhaseRef.current = 14.8;
        setTimeout(() => setBootPhase(14.9), 800); 
    }
    else if (bootPhase === 15 && lastTriggeredPhaseRef.current < 15) {
        lastTriggeredPhaseRef.current = 15;
        setTimeout(() => {
            setBootPhase(15.2);
            if (audioReady) AudioManager.getInstance().playDramaticGlitch();
        }, 1800);
    }
    else if (bootPhase === 15.4 && lastTriggeredPhaseRef.current < 15.4) {
        lastTriggeredPhaseRef.current = 15.4;
        setTimeout(() => {
            setBootPhase(15.5);
            if (audioReady) AudioManager.getInstance().playDramaticGlitch();
        }, 1200);
    }
    else if (bootPhase === 16 && lastTriggeredPhaseRef.current < 16) {
        lastTriggeredPhaseRef.current = 16;
        const am = AudioManager.getInstance();
        setTimeout(() => { setIsReadyGlitched(true); setIsDistorted(true); if (audioReady) am.playGlitchBuzz(); }, 100);
        setTimeout(() => { 
            setIsReadyGlitched(false); 
            setIsDistorted(false); 
            setBootPhase(18); 
            if (!skipIntro) setScreen('MENU'); 
        }, 400);
    }
  }, [bootPhase, audioReady, isLandscape, studioComplete, skipIntro]);

  useEffect(() => {
    const itv = setInterval(() => {
      const ready = AudioManager.getInstance().isReady();
      setAudioReady(ready);
    }, 100);
    return () => clearInterval(itv);
  }, [screen]);

  const wakeAudioSystem = async () => {
    await AudioManager.getInstance().resume();
    if (bootPhase === 0) setBootPhase(1);
    if (screen === 'BOOT' && bootPhase >= 18) setScreen('MENU');
  };

  useEffect(() => { if (screen === 'MENU') AudioManager.getInstance().init(); }, [screen]);

  const openArchive = (t: InfoTab = 'LORE') => {
    AudioManager.getInstance().playUiClick(); 
    setIsTypingComplete(false);
    AudioManager.getInstance().resume();
    let cat: ArchiveCategory = 'NONE';
    if (['VIRAL DB', 'PROTOCOLS', 'THREATS'].includes(t)) cat = 'TACTICAL';
    else if (['LOGIC', 'RANKS', 'UPGRADES'].includes(t)) cat = 'HANDBOOK';
    else if (['LORE', 'HALL_OF_FAME', 'CREDITS'].includes(t)) cat = 'MANIFEST';
    setArchiveCategory(cat); setInfoTab(t); setScreen('ARCHIVE');
  };

  const cleanupGame = () => {
    if (game) { game.destroy(); const c = document.getElementById('game-container'); if (c) c.innerHTML = ''; setGame(null); }
    setShowWaveSummaryPopup(false); setShowCombatIntel(false); setShowSettingsInGame(false); setSelectedTower(null);
  };

  const startNewGame = (mode: GameMode) => {
    AudioManager.getInstance().playUiClick(); cleanupGame();
    // PURGE OLD SESSION DATA FOR FRESH START
    localStorage.removeItem('syntax_defense_save');
    
    if (localStorage.getItem('syntax_tutorial_done') !== 'true') {
      GameStateManager.getInstance().resetGame(mode, 0); setIsTutorialActive(true); setTutorialStep(0);
    } else { GameStateManager.getInstance().resetGame(mode); setShowCombatIntel(true); }
    setIsVictorious(false); setScreen('GAME');
  };

  const [hasSave, setHasSave] = useState(localStorage.getItem('syntax_defense_save') !== null);
  useEffect(() => {
    const itv = setInterval(() => { setHasSave(localStorage.getItem('syntax_defense_save') !== null); }, 1000);
    return () => clearInterval(itv);
  }, []);

  const quitToMenu = () => { AudioManager.getInstance().playUiClick(); cleanupGame(); setIsPaused(false); setScreen('MENU'); };
  
  const loadGameSession = () => { 
    wakeAudioSystem(); AudioManager.getInstance().playUiClick(); cleanupGame(); 
    const saveData = GameStateManager.getInstance().load();
    if (saveData) { setIsVictorious(false); setScreen('GAME'); } 
    else { setResetStatus("CRITICAL ERROR: NO SAVED DATA."); setTimeout(() => setResetStatus(""), 4000); setScreen('SETTINGS'); } 
  };

  const saveAndQuit = () => { 
    if (!game) return;
    AudioManager.getInstance().playUiClick(); 
    const towerData = game.towerManager.towers.map(t => ({
      type: t.type,
      x: t.container.x,
      y: t.container.y,
      level: t.level
    }));
    GameStateManager.getInstance().save(towerData); 
    quitToMenu(); 
  };

  const executeWave = () => { if (game) { game.waveManager.startWave(); setShowCombatIntel(false); } };
  const toggleFastForward = () => { setIsFastForward(!isFastForward); if (game) game.isFastForward = !isFastForward; };

  const systemStatusText = integrity > 15 ? "STATUS: STABLE" : integrity > 5 ? "STATUS: DEGRADED" : "STATUS: CRITICAL";
  const sysStatusColor = integrity > 15 ? "#00ffcc" : integrity > 5 ? "#ffcc00" : "#ff3300";

  useEffect(() => {
    if (!isTutorialActive) return;
    const update = () => {
      if (tutorialStep === 1 && firstTurretRef.current) {
        const rect = firstTurretRef.current.getBoundingClientRect();
        // POINT TO CENTER OF TURRET BOX
        if (rect.width > 0) setTilePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, ts: 0 });
      } else if ((tutorialStep === 2 || tutorialStep === 3) && game) {
        const wp = { x: 10 * TILE_SIZE + TILE_SIZE/2, y: 6 * TILE_SIZE + TILE_SIZE/2 };
        const globalPos = game.viewport.toGlobal(wp);
        setTilePos({ x: globalPos.x, y: globalPos.y, ts: TILE_SIZE });
      }
    };
    update();
    const inv = setInterval(update, 100);
    return () => clearInterval(inv);
  }, [isTutorialActive, tutorialStep, game]);

  const selectTurret = (type: number) => {
    if (isTutorialActive && tutorialStep === 1 && type !== 0) return;
    if (type === -1) { setSelectedTurret(-1); if (game?.towerManager) game.towerManager.cancelPlacement(); return; }
    AudioManager.getInstance().playUiClick(); setSelectedTurret(type);
    if (game?.towerManager) game.towerManager.startPlacement(type as TowerType);
    if (isTutorialActive && tutorialStep === 1) setTutorialStep(2);
  };

  const isUnlocked = (type: number) => {
    // ENFORCE TUTORIAL RESTRICTION
    if (isTutorialActive && tutorialStep <= 1) return type === 0;
    return GameStateManager.getInstance().isTowerUnlocked(type);
  };

  useEffect(() => {
    if (screen === 'GAME' && !game && !isInitializing) {
      async function init() {
        setIsInitializing(true); 
        const g = await GameContainer.getInstance(); 
        const saveData = localStorage.getItem('syntax_defense_save');
        if (saveData) {
          const parsed = JSON.parse(saveData);
          if (parsed.towers && Array.isArray(parsed.towers)) {
            parsed.towers.forEach((td: any) => {
              const tower = new Tower(td.type, td.x, td.y);
              for(let i=1; i < td.level; i++) tower.upgrade(); 
              g.towerManager.towers.push(tower);
              g.towerLayer.addChild(tower.container);
            });
            (g.towerManager as any).recalculateLinks();
          }
        }
        setGame(g); 
        setIsInitializing(false);
        const interval = setInterval(() => {
          const state = GameStateManager.getInstance(); setCredits(state.credits); setIntegrity(state.integrity); setWaveName(state.getWaveName()); setRepairCost(state.repairCost); setGameMode(state.gameMode); setGamePhase(state.phase); setRank(state.architectRank); setActiveGlitch(state.activeGlitch); setWaveSummary(state.lastWaveSummary); setLifetimeKills(state.lifetimeKills); setHighestWave(state.highestWave);
          if (g.waveManager.isSummaryActive && !showWaveSummaryPopup) { setShowWaveSummaryPopup(true); g.waveManager.isSummaryActive = false; }
          if (g.waveManager) { setWave(g.waveManager.waveNumber); setIsWaveActive(g.waveManager.isWaveActive); setUpcomingEnemies(g.waveManager.upcomingEnemies); }
        }, 100);
        return () => clearInterval(interval);
      }
      init();
    }
  }, [screen, game, isInitializing, showWaveSummaryPopup]);

  const handleSfxVol = (e: any) => { const v = parseFloat(e.target.value); setSfxVolState(v); AudioManager.getInstance().setSfxVolume(v); };
  const handleMusicVol = (e: any) => { const v = parseFloat(e.target.value); setMusicVolState(v); AudioManager.getInstance().setMusicVolume(v); };
  const toggleSfx = () => { AudioManager.getInstance().toggleSfx(); setSfxMuted(AudioManager.getInstance().isSfxMuted); };
  const toggleAmbient = () => { AudioManager.getInstance().toggleAmbient(); setAmbientMuted(AudioManager.getInstance().isAmbientMuted); };
  const previewTrack = (id: number) => { MusicManager.getInstance().previewTrack(id as any); };
  const repairKernel = () => { AudioManager.getInstance().playUiClick(); GameStateManager.getInstance().repairKernel(); };
  const handleUpgrade = () => { if (!selectedTower || !game) return; if (game.towerManager.tryUpgradeTower(selectedTower)) { if (isTutorialActive) setSelectedTower(null); else { const updated = Object.assign(Object.create(Object.getPrototypeOf(selectedTower)), selectedTower); setSelectedTower(updated); } } };
  const handleSell = () => { if (!selectedTower || !game) return; game.towerManager.sellTower(selectedTower); setSelectedTower(null); };

  const toggleSkipIntro = () => { const v = !skipIntro; setSkipIntro(v); localStorage.setItem('syntax_skip_intro', String(v)); };

  const clearStats = () => {
    AudioManager.getInstance().playUiClick();
    localStorage.removeItem('syntax_defense_save');
    window.location.reload();
  };

  const toggleTrack = (id: number) => {
    const updated = [...enabledTracks];
    updated[id] = !updated[id];
    setEnabledTracks(updated);
  };

  return (
    <div className="game-wrapper">
      {!isLandscape ? (
        <div className="orientation-warning ui-layer" style={{ display: 'flex' }}>
          <div className="rotate-icon">📱</div>
          <h2>LANDSCAPE MODE REQUIRED</h2>
          <p>&gt; PLEASE ROTATE YOUR DEVICE TO INITIALIZE SYSTEM.</p>
        </div>
      ) : !studioComplete ? (
        <div className="studio-splash ui-layer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 60000 }}>
          <div className="monolith-monument" style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '30px', opacity: 0, animation: 'fade-in-out 3.5s forwards' }}>
            <div style={{ width: '8px', height: '40px', background: 'var(--neon-cyan)', boxShadow: '0 0 15px var(--neon-cyan)' }}></div>
            <div style={{ width: '16px', height: '75px', background: 'var(--neon-cyan)', boxShadow: '0 0 25px var(--neon-cyan)' }}></div>
            <div style={{ width: '8px', height: '40px', background: 'var(--neon-cyan)', boxShadow: '0 0 15px var(--neon-cyan)' }}></div>
          </div>
          <div style={{ color: 'var(--neon-cyan)', fontSize: '1.8rem', letterSpacing: '16px', fontWeight: 900, textAlign: 'center', animation: 'fade-in-out 3.5s forwards' }}>MONOLITH</div>
          <div style={{ color: '#111', fontSize: '0.5rem', marginTop: '20px', letterSpacing: '8px', fontWeight: 300, animation: 'fade-in-out 3.5s forwards' }}>PRESENTS</div>
        </div>
      ) : screen === 'BOOT' ? (
        <BootScreen 
          isDistorted={isDistorted} skipIntro={skipIntro} bootPhase={bootPhase} 
          bootProgress={bootProgress} bootLogs={bootLogs} 
          isReadyGlitched={isReadyGlitched} 
          wakeAudioSystem={wakeAudioSystem} setBootPhase={setBootPhase}
        />
      ) : (
        <>
          <div id="game-container"></div>      
          {['MENU', 'ARCHIVE', 'MODES', 'SETTINGS', 'GAME'].includes(screen) && (
            <GridBackground isDistorted={isDistorted} mousePos={mousePos} />
          )}
          {screen === 'MENU' && (
            <MainMenu 
              isDistorted={isDistorted} hasSave={hasSave} onStartGame={startNewGame} onSetScreen={setScreen} onOpenArchive={openArchive} onLoadGame={loadGameSession}
              hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} uptime={uptime} entropy={entropy} menuGlitchActive={menuGlitchActive}
              mousePos={mousePos}
            />
          )}
          {screen === 'ARCHIVE' && (
            <ArchiveScreen archiveCategory={archiveCategory} infoTab={infoTab} highestWave={highestWave} lifetimeKills={lifetimeKills} rank={rank} setArchiveCategory={setArchiveCategory} setInfoTab={setInfoTab} setIsTypingComplete={setIsTypingComplete} onSetScreen={setScreen} />
          )}
          {screen === 'SETTINGS' && (
            <SettingsScreen isTypingComplete={isTypingComplete} skipIntro={skipIntro} sfxVolState={sfxVolState} musicVolState={musicVolState} sfxMuted={sfxMuted} ambientMuted={ambientMuted} enabledTracks={enabledTracks} integrity={integrity} lifetimeKills={lifetimeKills} highestWave={highestWave} rank={rank} resetStatus={resetStatus} toggleSkipIntro={toggleSkipIntro} onPurgeTutorial={() => { AudioManager.getInstance().playUiClick(); localStorage.removeItem('syntax_tutorial_done'); setResetStatus("TUTORIAL DATA PURGED."); setTimeout(() => setResetStatus(""), 4000); }} onClearStats={clearStats} handleSfxVol={handleSfxVol} handleMusicVol={handleMusicVol} toggleSfx={toggleSfx} toggleAmbient={toggleAmbient} toggleTrack={toggleTrack} onPreviewTrack={previewTrack} onSetScreen={setScreen} setIsTypingComplete={setIsTypingComplete} crtEnabled={crtEnabled} glitchEffectsEnabled={glitchEffectsEnabled} autoPauseEnabled={autoPauseEnabled} showAllRanges={showAllRanges} toggleCrt={toggleCrt} toggleGlitch={toggleGlitch} toggleAutoPause={toggleAutoPause} toggleShowRanges={toggleShowRanges} />
          )}
          {screen === 'MODES' && (
            <ModesScreen isTypingComplete={isTypingComplete} onStartGame={startNewGame} onSetScreen={setScreen} setIsTypingComplete={setIsTypingComplete} />
          )}
          {screen === 'GAME' && game && (
            <GameScreen game={game} isVictorious={isVictorious} integrity={integrity} credits={credits} isPaused={isPaused} showSettingsInGame={showSettingsInGame} sfxVolState={sfxVolState} musicVolState={musicVolState} gamePhase={gamePhase} waveSummary={waveSummary} wave={wave} showWaveSummaryPopup={showWaveSummaryPopup} isTutorialActive={isTutorialActive} showCombatIntel={showCombatIntel} activeGlitch={activeGlitch} upcomingEnemies={upcomingEnemies} waveName={waveName} tutorialStep={tutorialStep} tilePos={tilePos} selectedTower={selectedTower} hoveredTower={hoveredTower} repairCost={repairCost} selectedTurret={selectedTurret} gameMode={gameMode} isWaveActive={isWaveActive} isFastForward={isFastForward} autoPauseEnabled={autoPauseEnabled} sysStatusColor={sysStatusColor} systemStatusText={systemStatusText} firstTurretRef={firstTurretRef} onQuitToMenu={quitToMenu} onTogglePause={setIsPaused} onShowSettings={setShowSettingsInGame} onSetSfxVol={handleSfxVol} onSetMusicVol={handleMusicVol} onSaveAndQuit={saveAndQuit} onExecuteWave={executeWave} onPrepareWave={(start) => game?.waveManager.prepareWave(start)} onSetShowWaveSummary={setShowWaveSummaryPopup} onSetShowCombatIntel={setShowCombatIntel} onSetTutorialStep={setTutorialStep} onSetHoveredTower={setHoveredTower} onToggleFastForward={toggleFastForward} onRepair={repairKernel} onSelectTurret={selectTurret} onUpgradeTower={handleUpgrade} onSellTower={handleSell} onCloseTowerContext={() => setSelectedTower(null)} isTowerUnlocked={isUnlocked} getTowerCount={(type) => game?.towerManager.getTowerCount(type) || 0} getUpgradeCost={(tower) => game?.towerManager.getUpgradeCost(tower) || 0} onFinishTutorial={() => { localStorage.setItem('syntax_tutorial_done', 'true'); setIsTutorialActive(false); const state = GameStateManager.getInstance(); state.resetGame('STANDARD', 1); state.credits = 850; if (game) game.waveManager.prepareWave(false); setShowCombatIntel(true); }} setSelectedTower={setSelectedTower} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
