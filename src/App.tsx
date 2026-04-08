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
type ArchiveCategory = 'NONE' | 'TACTICAL' | 'HANDBOOK' | 'MANIFEST';
type InfoTab = 'LORE' | 'VIRAL DB' | 'PROTOCOLS' | 'SYSTEM MODES' | 'THREATS' | 'LOGIC' | 'RANKS' | 'HALL_OF_FAME' | 'CREDITS';

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
  const [isInitializing, setIsInitializing] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(AudioManager.getInstance().isSfxMuted);
  const [ambientMuted, setAmbientMuted] = useState(AudioManager.getInstance().isAmbientMuted);
  const [sfxVolState, setSfxVolState] = useState(AudioManager.getInstance().sfxVolume);
  const [musicVolState, setMusicVolState] = useState(AudioManager.getInstance().musicVolume);
  const [isDistorted, setIsDistorted] = useState(false);
  const [isFlickering] = useState(false);
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

  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const firstTurretRef = useRef<HTMLDivElement>(null);

  const [tilePos, setTilePos] = useState({ x: 0, y: 0, ts: 40 });

  useEffect(() => {
    if (game) {
      game.isTutorialActive = isTutorialActive;
      game.waveManager.prepareWave(false);
    }
  }, [game, isTutorialActive]);

  const [bootPhase, setBootPhase] = useState(localStorage.getItem('syntax_skip_intro') === 'true' ? 18 : 0); 
  const [bootProgress, setBootProgress] = useState(localStorage.getItem('syntax_skip_intro') === 'true' ? 100 : 0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isReadyGlitched, setIsReadyGlitched] = useState(false);

  useEffect(() => {
    if (screen !== 'MENU') return;
    const updateDiag = setInterval(() => {
      setUptime(prev => prev + 1);
      setEntropy(Math.max(0, 0.14 + (Math.random() * 0.05 - 0.025)));
    }, 1000);

    const triggerGlitch = () => {
      setMenuGlitchActive(true);
      setTimeout(() => setMenuGlitchActive(false), 100 + Math.random() * 150);
      const nextDelay = 30000 + Math.random() * 30000; // Random interval 30-60s
      setTimeout(triggerGlitch, nextDelay);
    };
    const initialGlitch = setTimeout(triggerGlitch, 20000 + Math.random() * 10000); // Initial delay 20-30s

    return () => { clearInterval(updateDiag); clearTimeout(initialGlitch); };
  }, [screen]);

  useEffect(() => {
    if (audioReady) return;
    if (bootPhase === 1) setTimeout(() => setBootPhase(2), 600);
    else if (bootPhase === 3) setTimeout(() => setBootPhase(4), 800);
    else if (bootPhase === 4) setTimeout(() => setBootPhase(5), 600);
    else if (bootPhase === 6) {
        const timer = setInterval(() => {
            setBootProgress(p => { if (p >= 100) { clearInterval(timer); setTimeout(() => setBootPhase(7), 800); return 100; } return p + 2; });
        }, 30);
        return () => clearInterval(timer);
    } else if (bootPhase === 7) {
        const logs = [
            "UPLOADING KERNEL_MODULES... [OK]",
            "MOUNTING TACTICAL_ASSETS... [OK]",
            "SYNCHRONIZING CORE_LOGIC... [OK]"
        ];
        let i = 0;
        const itv = setInterval(() => {
            if (i < logs.length) { setBootLogs(prev => [...prev, logs[i]]); AudioManager.getInstance().playTypeClick(); i++; }
            else { clearInterval(itv); setTimeout(() => setBootPhase(9), 800); }
        }, 600);
        return () => clearInterval(itv);
    } else if (bootPhase === 10) setTimeout(() => setBootPhase(11), 800);
    else if (bootPhase === 12) setTimeout(() => setBootPhase(13), 1000);
    else if (bootPhase === 14) setTimeout(() => setBootPhase(15), 1500);
    else if (bootPhase === 16) {
        // VIRUS LEAK STUTTER: 400ms "WIPE USER SYSTEM" GLITCH
        const am = AudioManager.getInstance();
        setTimeout(() => { setIsReadyGlitched(true); setIsDistorted(true); am.playGlitchBuzz(); }, 200);
        setTimeout(() => { setIsReadyGlitched(false); setIsDistorted(false); setBootPhase(18); }, 600);
    }
  }, [bootPhase, audioReady]);

  useEffect(() => {
    const itv = setInterval(() => {
      const ready = AudioManager.getInstance().isReady();
      setAudioReady(ready);
      if (ready && screen === 'BOOT') setScreen('MENU');
    }, 100);
    return () => clearInterval(itv);
  }, [screen]);

  const wakeAudioSystem = async () => {
    await AudioManager.getInstance().resume();
    if (screen === 'BOOT' && bootPhase >= 18) setScreen('MENU');
  };

  useEffect(() => { if (screen === 'MENU') AudioManager.getInstance().init(); }, [screen]);

  const openArchive = (t: InfoTab = 'LORE') => {
    AudioManager.getInstance().playUiClick(); 
    setIsTypingComplete(false);
    AudioManager.getInstance().resume();
    let cat: ArchiveCategory = 'NONE';
    if (['VIRAL DB', 'PROTOCOLS', 'THREATS'].includes(t)) cat = 'TACTICAL';
    else if (['LOGIC', 'RANKS'].includes(t)) cat = 'HANDBOOK';
    else if (['LORE', 'HALL_OF_FAME', 'CREDITS'].includes(t)) cat = 'MANIFEST';
    setArchiveCategory(cat); setInfoTab(t); setScreen('ARCHIVE');
  };

  const cleanupGame = () => {
    if (game) { game.destroy(); const c = document.getElementById('game-container'); if (c) c.innerHTML = ''; setGame(null); }
    setShowWaveSummaryPopup(false); setShowCombatIntel(false); setShowSettingsInGame(false); setSelectedTower(null);
  };

  const startNewGame = (mode: GameMode) => {
    AudioManager.getInstance().playUiClick(); cleanupGame();
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
    if (GameStateManager.getInstance().load()) { setIsVictorious(false); setScreen('GAME'); } 
    else { setResetStatus("CRITICAL ERROR: NO SAVED DATA."); setTimeout(() => setResetStatus(""), 4000); setScreen('SETTINGS'); } 
  };

  const saveAndQuit = () => { AudioManager.getInstance().playUiClick(); GameStateManager.getInstance().save(); quitToMenu(); };
  const executeWave = () => { if (game) { game.waveManager.startWave(); setShowCombatIntel(false); } };
  const toggleFastForward = () => { setIsFastForward(!isFastForward); if (game) game.isFastForward = !isFastForward; };

  const systemStatusText = integrity > 15 ? "STATUS: STABLE" : integrity > 5 ? "STATUS: DEGRADED" : "STATUS: CRITICAL";
  const sysStatusColor = integrity > 15 ? "#00ffcc" : integrity > 5 ? "#ffcc00" : "#ff3300";

  useEffect(() => {
    if (!isTutorialActive) return;
    const update = () => {
      if (tutorialStep === 1 && firstTurretRef.current) {
        const rect = firstTurretRef.current.getBoundingClientRect();
        if (rect.width > 0) setTilePos({ x: rect.left + rect.width / 2, y: rect.top, ts: 0 });
      } else if ((tutorialStep === 2 || tutorialStep === 3) && game) {
        // Force highlight to Row 6, Column 10 (logical)
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
    
    // DESELECT LOGIC
    if (selectedTurret === type) {
        setSelectedTurret(-1);
        if (game?.towerManager) game.towerManager.cancelPlacement();
        AudioManager.getInstance().playUiClick();
        return;
    }

    AudioManager.getInstance().playUiClick(); setSelectedTurret(type);
    if (game?.towerManager) game.towerManager.startPlacement(type as TowerType);
    if (isTutorialActive && tutorialStep === 1) {
        console.log("Advancing to Tutorial Step 2 (Intel Popup)");
        setTutorialStep(2);
    }
  };

  useEffect(() => {
    if (screen === 'GAME' && !game && !isInitializing) {
      async function init() {
        setIsInitializing(true); const g = await GameContainer.getInstance(); setGame(g); setIsInitializing(false);
        const interval = setInterval(() => {
          const state = GameStateManager.getInstance(); setCredits(state.credits); setIntegrity(state.integrity); setWaveName(state.getWaveName()); setRepairCost(state.repairCost); setGameMode(state.gameMode); setGamePhase(state.phase); setRank(state.architectRank); setCurrentXP(state.totalXP); setNextRankXP(state.getNextRankXP()); setActiveGlitch(state.activeGlitch); setWaveSummary(state.lastWaveSummary); setLifetimeKills(state.lifetimeKills); setHighestWave(state.highestWave);
          if (g.waveManager.isSummaryActive && !showWaveSummaryPopup) { setShowWaveSummaryPopup(true); g.waveManager.isSummaryActive = false; }
          if (g.waveManager) { setWave(g.waveManager.waveNumber); setIsWaveActive(g.waveManager.isWaveActive); setUpcomingEnemies(g.waveManager.upcomingEnemies); }
        }, 100);
        return () => clearInterval(interval);
      }
      init();
    }
  }, [screen, game, isInitializing, showWaveSummaryPopup]);

  useEffect(() => {
    // Moved to GameScreen.tsx for consolidation
  }, [game, isTutorialActive, tutorialStep]);

  const handleSfxVol = (e: any) => { const v = parseFloat(e.target.value); setSfxVolState(v); AudioManager.getInstance().setSfxVolume(v); };
  const handleMusicVol = (e: any) => { const v = parseFloat(e.target.value); setMusicVolState(v); AudioManager.getInstance().setMusicVolume(v); };
  const toggleSfx = () => { AudioManager.getInstance().toggleSfx(); setSfxMuted(AudioManager.getInstance().isSfxMuted); };
  const toggleAmbient = () => { AudioManager.getInstance().toggleAmbient(); setAmbientMuted(AudioManager.getInstance().isAmbientMuted); };
  const [enabledTracks, setEnabledTracks] = useState(MusicManager.getInstance().enabledTracks);
  const toggleTrack = (id: number) => { MusicManager.getInstance().toggleTrack(id as any); setEnabledTracks([...MusicManager.getInstance().enabledTracks]); };
  const toggleSkipIntro = () => { const newVal = !skipIntro; setSkipIntro(newVal); localStorage.setItem('syntax_skip_intro', String(newVal)); };
  const isUnlocked = (type: number) => GameStateManager.getInstance().isTowerUnlocked(type);
  const repairKernel = () => { AudioManager.getInstance().playUiClick(); GameStateManager.getInstance().repairKernel(); };
  const handleUpgrade = () => { 
    if (!selectedTower || !game) return; 
    if (game.towerManager.tryUpgradeTower(selectedTower)) { 
      if (isTutorialActive) setSelectedTower(null); 
      else setSelectedTower({...selectedTower} as Tower); 
    } 
  };
  const handleSell = () => { if (!selectedTower || !game) return; game.towerManager.sellTower(selectedTower); setSelectedTower(null); };

  return (
    <div className="game-wrapper">
      {!audioReady && (
        <BootScreen 
          isDistorted={isDistorted}
          skipIntro={skipIntro}
          bootPhase={bootPhase}
          bootProgress={bootProgress}
          bootLogs={bootLogs}
          isReadyGlitched={isReadyGlitched}
          wakeAudioSystem={wakeAudioSystem}
          setBootPhase={setBootPhase}
        />
      )}

      <div id="game-container"></div>
      
      {screen === 'MENU' && <GridBackground isDistorted={isDistorted} isFlickering={isFlickering} />}

      {screen === 'MENU' && (
        <MainMenu 
          isDistorted={isDistorted}
          hasSave={hasSave}
          onStartGame={startNewGame}
          onSetScreen={setScreen}
          onOpenArchive={openArchive}
          onLoadGame={loadGameSession}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          uptime={uptime}
          entropy={entropy}
          menuGlitchActive={menuGlitchActive}
        />
      )}

      {screen === 'ARCHIVE' && (
        <ArchiveScreen 
          archiveCategory={archiveCategory}
          infoTab={infoTab}
          highestWave={highestWave}
          lifetimeKills={lifetimeKills}
          rank={rank}
          setArchiveCategory={setArchiveCategory}
          setInfoTab={setInfoTab}
          setIsTypingComplete={setIsTypingComplete}
          onSetScreen={setScreen}
        />
      )}

      {screen === 'SETTINGS' && (
        <SettingsScreen 
          isTypingComplete={isTypingComplete}
          skipIntro={skipIntro}
          sfxVolState={sfxVolState}
          musicVolState={musicVolState}
          sfxMuted={sfxMuted}
          ambientMuted={ambientMuted}
          enabledTracks={enabledTracks}
          integrity={integrity}
          lifetimeKills={lifetimeKills}
          highestWave={highestWave}
          rank={rank}
          resetStatus={resetStatus}
          toggleSkipIntro={toggleSkipIntro}
          onPurgeTutorial={() => { localStorage.removeItem('syntax_tutorial_done'); setResetStatus("TUTORIAL DATA PURGED. START NEW GAME TO RE-INITIALIZE."); setTimeout(() => setResetStatus(""), 4000); }}
          handleSfxVol={handleSfxVol}
          handleMusicVol={handleMusicVol}
          toggleSfx={toggleSfx}
          toggleAmbient={toggleAmbient}
          toggleTrack={toggleTrack}
          onSetScreen={setScreen}
          setIsTypingComplete={setIsTypingComplete}
        />
      )}

      {screen === 'MODES' && (
        <ModesScreen 
          isTypingComplete={isTypingComplete}
          onStartGame={startNewGame}
          onSetScreen={setScreen}
          setIsTypingComplete={setIsTypingComplete}
        />
      )}

      {screen === 'GAME' && game && (
        <GameScreen 
          game={game}
          isVictorious={isVictorious}
          integrity={integrity}
          credits={credits}
          isPaused={isPaused}
          showSettingsInGame={showSettingsInGame}
          sfxVolState={sfxVolState}
          musicVolState={musicVolState}
          gamePhase={gamePhase}
          waveSummary={waveSummary}
          wave={wave}
          showWaveSummaryPopup={showWaveSummaryPopup}
          isTutorialActive={isTutorialActive}
          showCombatIntel={showCombatIntel}
          activeGlitch={activeGlitch}
          upcomingEnemies={upcomingEnemies}
          waveName={waveName}
          tutorialStep={tutorialStep}
          tilePos={tilePos}
          selectedTower={selectedTower}
          repairCost={repairCost}
          selectedTurret={selectedTurret}
          gameMode={gameMode}
          isWaveActive={isWaveActive}
          isFastForward={isFastForward}
          sysStatusColor={sysStatusColor}
          systemStatusText={systemStatusText}
          firstTurretRef={firstTurretRef}
          onQuitToMenu={quitToMenu}
          onTogglePause={setIsPaused}
          onShowSettings={setShowSettingsInGame}
          onSetSfxVol={handleSfxVol}
          onSetMusicVol={handleMusicVol}
          onSaveAndQuit={saveAndQuit}
          onExecuteWave={executeWave}
          onPrepareWave={(start) => game?.waveManager.prepareWave(start)}
          onSetShowWaveSummary={setShowWaveSummaryPopup}
          onSetShowCombatIntel={setShowCombatIntel}
          onSetTutorialStep={setTutorialStep}
          onToggleFastForward={toggleFastForward}
          onRepair={repairKernel}
          onSelectTurret={selectTurret}
          onUpgradeTower={handleUpgrade}
          onSellTower={handleSell}
          onCloseTowerContext={() => setSelectedTower(null)}
          isTowerUnlocked={isUnlocked}
          getTowerCount={(type) => game?.towerManager.getTowerCount(type) || 0}
          getUpgradeCost={(tower) => game?.towerManager.getUpgradeCost(tower) || 0}
          onFinishTutorial={() => {
            localStorage.setItem('syntax_tutorial_done', 'true');
            setIsTutorialActive(false);
            const state = GameStateManager.getInstance();
            state.resetGame('STANDARD', 1);
            state.credits = 850; // Mandate: precisely 850 tokens.
            if (game) game.waveManager.prepareWave(false);
            setShowCombatIntel(true);
          }}
          setSelectedTower={setSelectedTower}
        />
      )}
    </div>
  );
}

export default App;
