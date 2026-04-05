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
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(850);
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
  const [gamePhase, setGamePhase] = useState<string>("PREP");
  const [upcomingEnemies, setUpcomingEnemies] = useState<number[]>([]);
  const [waveSummary, setWaveSummary] = useState({ kills: 0, interest: 0, perfectBonus: 0, total: 0 });
  const [rank, setRank] = useState(GameStateManager.getInstance().architectRank);
  const [isVictorious, setIsVictorious] = useState(false);
  const [resetStatus, setResetStatus] = useState("");

  // INTERACTIVE TUTORIAL STATE
  const [tutorialStep, setTutorialStep] = useState(0); // 0: Off, 1: Select MG, 2: Place MG, 3: Execute
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [showTutorialComplete, setShowTutorialComplete] = useState(false);
  const [showRadiusExplanation, setShowRadiusExplanation] = useState(false);
  const [showCombatIntel, setShowCombatIntel] = useState(false);

  useEffect(() => {
    if (game) {
      game.isTutorialActive = isTutorialActive;
      game.tutorialStep = tutorialStep;
    }
  }, [isTutorialActive, tutorialStep, game]);

  // POLLING WAVE STATE TO TRIGGER TUTORIAL END
  useEffect(() => {
    const waveNum = game?.waveManager.waveNumber || 1;
    if (isTutorialActive && gamePhase === 'PREP' && tutorialStep === 3 && waveNum === 2 && !isWaveActive) {
       // Wave 1 finished (the single enemy) and incremented to 2
       setTimeout(() => {
         setShowTutorialComplete(true);
         setIsTutorialActive(false);
         setTutorialStep(0);
       }, 1500); // 1.5s delay to see the destruction
    }
  }, [isTutorialActive, gamePhase, tutorialStep, isWaveActive, game]);

  const wakeAudioSystem = async () => {
    await AudioManager.getInstance().resume();
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      wakeAudioSystem();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
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
        if (!tutorialDone && g.waveManager.waveNumber === 1) {
          setShowTutorial(true);
        }

        // TIE TUTORIAL CALLBACK
        if (g.towerManager) {
          g.towerManager.onTowerPlaced = () => {
            setTutorialStep(prev => prev === 2 ? 3 : prev);
          };
        }

        const interval = setInterval(() => {
          const state = GameStateManager.getInstance();
          setCredits(state.credits);
          setIntegrity(state.integrity);
          setWaveName(state.getWaveName());
          setRepairCost(state.repairCost);
          setGameMode(state.gameMode);
          setGamePhase(state.phase); 
          setRank(state.architectRank);
          setWaveSummary(state.lastWaveSummary);

          if (state.currentWave > 50 && state.gameMode === 'STANDARD') {
            setIsVictorious(true);
            setIsPaused(true);
          }

          if (g.waveManager) {
            setWave(g.waveManager.waveNumber);
            setIsWaveActive(g.waveManager.isWaveActive);
            setUpcomingEnemies(g.waveManager.upcomingEnemies);
          }
        }, 100);

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
        AudioManager.getInstance().playGlitchBuzz();
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

  const startNewGame = (mode: GameMode) => {
    wakeAudioSystem();
    AudioManager.getInstance().playUiClick();
    cleanupGame();
    GameStateManager.getInstance().resetGame(mode);
    setIsVictorious(false);
    setScreen('GAME');
  };

  const loadGame = () => {
    wakeAudioSystem();
    AudioManager.getInstance().playUiClick();
    cleanupGame();
    if (GameStateManager.getInstance().load()) {
      setIsVictorious(false);
      setScreen('GAME');
    } else {
      setResetStatus("CRITICAL ERROR: NO SAVED DATA ON LOCAL MOUNT.");
      setTimeout(() => setResetStatus(""), 4000);
      setScreen('SETTINGS');
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
    setIsFastForward(f => !f);
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

  const selectTurret = (type: number) => {
    if (isTutorialActive && tutorialStep === 1 && type !== 0) return; // ENFORCE PULSE MG

    AudioManager.getInstance().playUiClick();
    setSelectedTurret(type);
    if (game?.towerManager) {
      game.towerManager.startPlacement(type as any);
    }
    
    if (isTutorialActive && tutorialStep === 1 && type === 0) {
      setShowRadiusExplanation(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'GAME' || (isPaused && e.key !== ' ')) return;
      if (e.key === ' ') { setIsPaused(p => !p); AudioManager.getInstance().playUiClick(); }
      else if (e.key.toLowerCase() === 'f') toggleFastForward();
      else if (e.key === '1') selectTurret(0);
      else if (e.key === '2' && isUnlocked(1)) selectTurret(1);
      else if (e.key === '3' && isUnlocked(2)) selectTurret(2);
      else if (e.key === '4' && isUnlocked(3)) selectTurret(3);
      else if (e.key === '5' && isUnlocked(4)) selectTurret(4);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isPaused, wave]);

  const executeWave = () => {
    if (isTutorialActive && tutorialStep === 3 && !showCombatIntel) {
       setShowCombatIntel(true);
       return;
    }
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
    setShowTutorial(false);
    setIsTutorialActive(true);
    setTutorialStep(1);
    if (permanent) localStorage.setItem('syntax_tutorial_done', 'true');
  };

  const isUnlocked = (type: number) => {
    if (type === 0) return true;
    if (type === 1) return wave >= 4;
    if (type === 2) return wave >= 8;
    if (type === 3) return wave >= 15;
    if (type === 4) return wave >= 20;
    return false;
  };

  const openArchive = (tab: InfoTab) => {
    wakeAudioSystem();
    AudioManager.getInstance().playUiClick();
    setInfoTab(tab);
    setScreen('ARCHIVE');
  };

  const systemStatusText = integrity > 15 ? "STATUS: STABLE" : integrity > 5 ? "STATUS: DEGRADED" : "STATUS: CRITICAL";
  const sysStatusColor = integrity > 15 ? "#00ffcc" : integrity > 5 ? "#ffcc00" : "#ff3300";

  return (
    <div className="game-wrapper">
      <div className="orientation-warning"><div className="warning-icon">🔄</div><div className="warning-text">Please rotate your device</div></div>
      <div id="game-container"></div>

      {/* INTERACTIVE TUTORIAL OVERLAYS */}
      {isTutorialActive && (
        <div className="tutorial-mask" style={{ pointerEvents: (tutorialStep === 2 && !showRadiusExplanation && !showCombatIntel) ? 'none' : 'auto' }}>
          <div className="rank-tag" style={{position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 255, 204, 0.1)', border: '1px solid rgba(0, 255, 204, 0.4)', color: 'var(--neon-cyan)', padding: '5px 15px', zIndex: 16000, fontSize: '0.6rem'}}>
            TUTORIAL MODE ACTIVE
          </div>
          {tutorialStep === 1 && !showRadiusExplanation && (
            <>
              {/* TARGET: Pulse MG Card - Widened to 215px */}
              <div className="tutorial-highlight" 
                style={{bottom: '15px', left: '215px', width: '215px', height: '85px', pointerEvents: 'auto', cursor: 'pointer'}}
                onClick={() => selectTurret(0)}
              ></div>
              <div className="tutorial-pointer" style={{bottom: '110px', left: '215px', width: '215px', pointerEvents: 'auto'}}>SELECT PULSE MG</div>
            </>
          )}
          {showRadiusExplanation && (
            <div className="pause-overlay-locked" style={{background: 'rgba(0,0,0,0.4)', zIndex: 17000, pointerEvents: 'auto'}}>
               <div className="pause-content" style={{width: '320px', padding: '15px', background: 'rgba(5, 5, 10, 0.95)', border: '2px solid var(--neon-cyan)', pointerEvents: 'auto'}}>
                  <div className="rank-tag" style={{color: 'var(--neon-cyan)', fontSize: '0.5rem'}}>TACTICAL INTEL</div>
                  <h2 className="pause-title" style={{fontSize: '1rem', margin: '5px 0'}}>RADIUS ENGAGEMENT</h2>
                  <div className="manual-text" style={{fontSize: '0.65rem', lineHeight: '1.4'}}>
                    <p style={{margin: '4px 0', borderBottom: '1px solid #333', paddingBottom: '5px'}}>&gt; THE CYAN CIRCLE INDICATES ENGAGEMENT RANGE.</p>
                    <div style={{marginTop: '10px', display: 'grid', gridTemplateColumns: '60px 1fr', gap: '5px'}}>
                      <span style={{color: 'var(--neon-cyan)'}}>LVL 4:</span> <span>FROST RAY</span>
                      <span style={{color: 'var(--neon-cyan)'}}>LVL 8:</span> <span>TESLA LINK</span>
                      <span style={{color: 'var(--neon-cyan)'}}>LVL 15:</span> <span>GHOST REVEAL</span>
                      <span style={{color: 'var(--neon-cyan)'}}>LVL 20:</span> <span>ARCHITECT CORE</span>
                    </div>
                  </div>
                  <button className="blue-button" onClick={() => {
                    setShowRadiusExplanation(false);
                    setTutorialStep(2);
                  }} style={{marginTop: '15px', padding: '8px 15px', fontSize: '0.6rem'}}>INITIALIZE PLACEMENT</button>
               </div>
            </div>
          )}
          {tutorialStep === 2 && !showRadiusExplanation && (
            <>
              {/* TARGET: Tile (5, 6) */}
              <div className="tutorial-highlight" style={{top: '144px', left: '120px', width: '24px', height: '24px', borderRadius: '0', pointerEvents: 'none'}}></div>
              <div className="tutorial-pointer" style={{top: '55px', left: '57px', width: '150px', pointerEvents: 'none', flexDirection: 'column'}}>
                <span>DEPLOY NODE NEAR PATH</span>
              </div>
            </>
          )}
          {tutorialStep === 3 && !showCombatIntel && !isWaveActive && (
            <>
              <div className="tutorial-highlight" 
                style={{
                  top: 'calc(35% + 85px)', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  width: '360px', 
                  height: '50px', 
                  pointerEvents: 'auto', 
                  cursor: 'pointer'
                }}
                onClick={executeWave}
              ></div>
            </>
          )}
          {tutorialStep === 3 && showCombatIntel && (
            <>
              <div className="pause-overlay-locked" style={{background: 'rgba(0,0,0,0.4)', zIndex: 17000, pointerEvents: 'auto'}}>
                  <div className="pause-content" style={{width: '360px', padding: '20px', background: 'rgba(5, 5, 10, 0.95)', border: '2px solid var(--neon-cyan)', pointerEvents: 'auto'}}>
                      <div className="rank-tag" style={{color: 'var(--neon-cyan)', fontSize: '0.6rem'}}>SECURITY BRIEFING</div>
                      <h2 className="pause-title" style={{fontSize: '1.2rem', margin: '8px 0'}}>SYNTAX MAINFRAME</h2>
                      <div className="manual-text" style={{fontSize: '0.7rem', lineHeight: '1.5'}}>
                        <p style={{margin: '8px 0'}}>&gt; HOSTILE VIRAL PACKETS ATTEMPT TO BREACH THE MAINFRAME BY TRAVERSING FROM LEFT TO RIGHT.</p>
                        <p style={{margin: '8px 0'}}>&gt; THE SYNTAX IS THE CORE OF YOUR SYSTEM. EACH BREACH CAUSES PERMANENT INTEGRITY LOSS.</p>
                        <p style={{margin: '8px 0'}}>&gt; IF INTEGRITY DROPS TO ZERO, THE SYSTEM COLLAPSES. NEUTRALIZE ALL SIGNATURES IMMEDIATELY.</p>
                      </div>
                      <button className="blue-button" onClick={() => {
                        setShowCombatIntel(false);
                        AudioManager.getInstance().playUiClick();
                        game?.waveManager.startWave();
                      }} style={{marginTop: '15px', padding: '10px 20px', fontSize: '0.7rem'}}>COMMENCE DEFENSE</button>
                  </div>
                </div>
            </>
          )}
        </div>
      )}

      {/* --- HOME MENU --- */}
      {screen === 'MENU' && (
        <div className="main-menu ui-layer">
          <div className={`grid-background ${isDistorted ? 'distorted' : ''}`}><div className="grid-lines"></div><div className="grid-glows"><div className="glow-bit comet-right glow-1" style={{top: '15%'}}></div><div className="glow-bit comet-left glow-2" style={{top: '40%'}}></div><div className="glow-bit comet-down glow-3" style={{left: '30%'}}></div><div className="glow-bit comet-up glow-4" style={{left: '70%'}}></div><div className="grid-sweep"></div></div></div>
          <div className="menu-content-centered">
            <div className="rank-tag">RANK: {rank}</div>
            <h1 className={`menu-title-static ${isDistorted ? 'glitch-active' : ''} ${isFlickering ? 'flicker-active' : ''}`}>
              {"SYNTAX".split('').map((c, i) => ( <span key={i} style={{ color: glitchIndex === i ? 'var(--neon-red)' : 'inherit' }}>{c}</span> ))}
              <br/>
              {"DEFENSE".split('').map((c, i) => ( <span key={i+6} style={{ color: glitchIndex === (i+6) ? 'var(--neon-red)' : 'inherit' }}>{c}</span> ))}
            </h1>
            <div className="menu-options-grid compact">
              <button className="cyan-menu-btn primary-btn" onClick={() => startNewGame('STANDARD')}>INITIALIZE STANDARD</button>
              <button className="cyan-menu-btn" onClick={() => { wakeAudioSystem(); setScreen('MODES'); }}>ADVANCED PROTOCOLS</button>
              <button className="cyan-menu-btn" onClick={loadGame}>RESTORE SESSION</button>
              <button className="cyan-menu-btn" onClick={() => openArchive('VIRAL_DB')}>VIRAL DATABASE</button>
              <button className="cyan-menu-btn" onClick={() => openArchive('PROTOCOLS')}>DEFENSE PROTOCOLS</button>
              <button className="cyan-menu-btn" onClick={() => openArchive('LORE')}>SYSTEM INFO</button>
              <button className="cyan-menu-btn" onClick={() => { wakeAudioSystem(); setScreen('SETTINGS'); }}>SYSTEM SETTINGS</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'MODES' && (
        <div className="encyclopedia ui-layer">
          <div className="enc-header">SELECT ADVANCED PROTOCOL</div>
          <div className="menu-options-grid" style={{marginTop: '20px'}}>
            <button className="cyan-menu-btn" onClick={() => startNewGame('HARDCORE')} style={{borderColor: '#ff3300'}}>HARDCORE MODE</button>
            <button className="cyan-menu-btn" onClick={() => startNewGame('SUDDEN_DEATH')} style={{borderColor: '#ffcc00'}}>SUDDEN DEATH</button>
            <button className="cyan-menu-btn" onClick={() => startNewGame('ENDLESS')}>ENDLESS LOOP</button>
            <button className="cyan-menu-btn" onClick={() => startNewGame('ECO_CHALLENGE')}>ECO CHALLENGE</button>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => setScreen('MENU')}>RETURN TO ROOT</button>
        </div>
      )}

      {screen === 'SETTINGS' && (
        <div className="encyclopedia ui-layer">
          <div className="enc-header">SYSTEM CONFIGURATION CENTER</div>
          <div className="enc-content">
            <div className="info-hub">
              <div className="info-body">
                <div className="manual-text">
                  <h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px'}}>AUDIO CHANNELS</h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,102,255,0.05)', padding: '15px', border: '1px solid #222'}}>
                      <div>
                        <div style={{color: '#fff', fontWeight: 900}}>SFX ENGINE</div>
                        <div style={{fontSize: '0.6rem', color: '#888'}}>UI Beeps, Tactical SFX, Breaches</div>
                      </div>
                      <button className="blue-button" onClick={toggleSfx} style={{width: '120px'}}>{sfxMuted ? 'DISABLED' : 'ENABLED'}</button>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,102,255,0.05)', padding: '15px', border: '1px solid #222'}}>
                      <div>
                        <div style={{color: '#fff', fontWeight: 900}}>MUSIC ENGINE</div>
                        <div style={{fontSize: '0.6rem', color: '#888'}}>Rhythmic Cyber-Soundtrack</div>
                      </div>
                      <button className="blue-button" onClick={toggleAmbient} style={{width: '120px'}}>{ambientMuted ? 'DISABLED' : 'ENABLED'}</button>
                    </div>
                  </div>
                  <h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '40px'}}>SYSTEM DIAGNOSTICS</h3>
                  <div style={{borderLeft: '4px solid var(--neon-blue)', paddingLeft: '20px', background: 'rgba(0,102,255,0.05)', padding: '20px', marginTop: '20px'}}>
                    <div style={{marginBottom: '10px'}}>BUILD ID: v2.4.3 ELITE</div>
                    <div style={{marginBottom: '10px'}}>MAINFRAME STATUS: {systemStatusText}</div>
                    <div style={{marginBottom: '10px'}}>KERNEL STABILITY: {((integrity / 20) * 100).toFixed(0)}%</div>
                    <div style={{marginBottom: '10px'}}>LATENCY: 0.04ms</div>
                    <div>LOCAL CACHE: ACTIVE</div>
                  </div>
                  <h3 style={{color: 'var(--neon-blue)', borderBottom: '1px solid #333', paddingBottom: '10px', marginTop: '40px'}}>DEBUG TOOLS</h3>
                  <div style={{marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <button className="blue-button" onClick={() => {
                       localStorage.removeItem('syntax_tutorial_done');
                       setResetStatus("TUTORIAL DATA PURGED. START NEW GAME TO RE-INITIALIZE.");
                       setTimeout(() => setResetStatus(""), 4000);
                    }} style={{width: '200px', borderColor: 'var(--neon-cyan)'}}>RESET TUTORIAL</button>
                    {resetStatus && <span style={{color: 'var(--neon-green)', fontSize: '0.65rem', fontWeight: 900}}>&gt; {resetStatus}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => setScreen('MENU')}>RETURN TO ROOT</button>
        </div>
      )}

      {screen === 'ARCHIVE' && (
        <div className="encyclopedia ui-layer">
          <div className="enc-header">MAINFRAME DATA ARCHIVE // {infoTab}</div>
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
                    <p style={{color: 'var(--neon-blue)', fontSize: '1rem'}}>&gt;&gt; LOG ENTRY: THE SYNTAX COLLAPSE</p>
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
                {infoTab === 'SYSTEM_MODES' && (
                  <div className="manual-text">
                    <p><span style={{color: 'var(--neon-red)'}}>HARDCORE:</span> NO INTEREST REWARDS. UNIT COSTS INCREASED BY 50%. STARTING CAPITAL REDUCED. ONLY FOR ELITE SYSTEM ARCHITECTS.</p>
                    <p><span style={{color: 'var(--neon-green)'}}>ECO CHALLENGE:</span> VIRUSES PROVIDE ZERO TOKENS UPON DELETION. ALL INCOME IS DERIVED FROM THE 10% INTEREST COMPOUNDING SYSTEM.</p>
                    <p><span style={{color: 'var(--neon-cyan)'}}>SUDDEN DEATH:</span> SYSTEM INTEGRITY SET TO 1. A SINGLE VIRAL BREACH WILL TERMINATE THE SESSION IMMEDIATELY.</p>
                    <p><span style={{color: '#fff'}}>ENDLESS LOOP:</span> NO LEVEL CAP. VIRAL SIGNATURES GAIN EXPONENTIAL HP MULTIPLIERS AS THE LOOP CONTINUES.</p>
                  </div>
                )}
                {infoTab === 'THREATS' && (
                  <div className="manual-text">
                    <p><span style={{color: 'var(--neon-red)'}}>ELITE SIGNATURES:</span> EVERY 5 SWARMS, MINI-BOSSES WITH 3.5x HP MATERIALIZE. THEY REQUIRE FOCUSED FIRE-POWER.</p>
                    <p><span style={{color: 'var(--neon-cyan)'}}>GHOST PACKETS:</span> INVISIBLE ON THE GRID SENSOR. THEY CAN ONLY BE TARGETED WHEN REVEALED BY FROST RAY OR TESLA LINK RADIUS.</p>
                    <p><span style={{color: '#fff'}}>BOSS CORE:</span> FRACTAL VIRUSES ARE EXCEPTIONALLY DANGEROUS, DEALING 10 UNITS OF DAMAGE TO KERNEL INTEGRITY UPON BREACH.</p>
                  </div>
                )}
                {infoTab === 'LOGIC' && (
                  <div className="manual-text">
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>DATA LINKS:</span> PLACING IDENTICAL TURRETS ADJACENT TO EACH OTHER FORMS A SYNERGY LINK, GRANTING +10% DAMAGE PER LINK (MAX +30%).</p>
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>OVERCLOCKING:</span> TAP ANY PLACED TURRET TO UPGRADE ITS CORE SYSTEMS. EACH UNIT HAS 3 PROGRESSION LEVELS.</p>
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>INTEREST:</span> MAINTAIN A HIGH TOKEN BALANCE TO EARN 10% INTEREST AT THE END OF EVERY SWARM.</p>
                    <p>&gt; <span style={{color: 'var(--neon-blue)'}}>KERNEL OVERDRIVE:</span> THE CORE HAS AN AUTOMATIC EMERGENCY SHOCKWAVE THAT PURGES ALL NEARBY VIRUSES WHEN INTEGRITY DROPS BELOW 5.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => setScreen('MENU')}>TERMINATE</button>
        </div>
      )}

      {screen === 'GAME' && !game && <div className="loading-overlay">INITIALIZING MAINFRAME...</div>}

      {screen === 'GAME' && game && (
        <div className="game-overlay-active ui-layer">
          {isVictorious && (
            <div className="pause-overlay-locked" style={{zIndex: 40000}}>
              <div className="pause-content" style={{borderColor: 'var(--neon-green)'}}>
                <h2 className="pause-title" style={{color: 'var(--neon-green)'}}>SYSTEM SECURED</h2>
                <div className="game-summary">
                  <p style={{color: '#fff', fontWeight: 900}}>&gt; ALL HOSTILE DATA PACKETS PURGED.</p>
                  <p style={{color: '#fff', fontWeight: 900}}>&gt; KERNEL INTEGRITY: {integrity}/20</p>
                  <p style={{color: '#fff', fontWeight: 900}}>&gt; FINAL TOKENS: {credits}</p>
                </div>
                <button className="cyan-menu-btn" onClick={quitToMenu} style={{marginTop: '20px'}}>RETURN TO ROOT</button>
              </div>
            </div>
          )}
          {showTutorial && !isVictorious && (
            <div className="pause-overlay-locked">
              <div className="pause-content" style={{padding: '15px 25px', maxWidth: '450px', gap: '5px'}}>
                <div className="rank-tag" style={{marginBottom: '0'}}>SYSTEM INITIALIZATION</div>
                <h2 className="pause-title" style={{margin: '0', fontSize: '1.3rem'}}>INSTRUCTIONS</h2>
                <div className="game-summary" style={{marginTop: '2px'}}>
                  <p style={{color: '#fff', fontWeight: 900, margin: '5px 0', fontSize: '0.75rem'}}>&gt; DEPLOYMENT: SELECT A NODE AND TAP A GRID TILE TO BUILD.</p>
                  <p style={{color: '#fff', fontWeight: 900, margin: '5px 0', fontSize: '0.75rem'}}>&gt; OVERCLOCK: TAP PLACED NODES TO UPGRADE CORE SYSTEMS.</p>
                  <p style={{color: '#fff', fontWeight: 900, margin: '5px 0', fontSize: '0.75rem'}}>&gt; RECLAMATION: NODES DE-MATERIALIZE AFTER EVERY SWARM.</p>
                  <p style={{color: '#fff', fontWeight: 900, margin: '5px 0', fontSize: '0.75rem'}}>&gt; SIGNATURES: USE FROST OR TESLA TO REVEAL INVISIBLE GHOSTS.</p>
                  <p style={{color: '#fff', fontWeight: 900, margin: '5px 0', fontSize: '0.75rem'}}>&gt; SYNERGY: BUILD IDENTICAL NODES NEARBY FOR +10% DMG LINKS.</p>
                  <p style={{color: '#fff', fontWeight: 900, margin: '5px 0', fontSize: '0.75rem'}}>&gt; ECONOMY: EARN 10% INTEREST BY SAVING YOUR TOKENS.</p>
                </div>
                <div className="pause-options row" style={{marginTop: '15px'}}>
                  <button className="blue-button" onClick={() => dismissTutorial(false)}>GOT IT</button>
                  <button className="blue-button" onClick={() => dismissTutorial(true)} style={{fontSize: '0.5rem'}}>DON'T SHOW AGAIN</button>
                </div>
              </div>
            </div>
          )}
          {showTutorialComplete && (
            <div className="pause-overlay-locked">
              <div className="pause-content" style={{width: '450px', padding: '25px', border: '2px solid var(--neon-cyan)'}}>
                <div className="rank-tag" style={{background: 'var(--neon-cyan)', color: '#000'}}>INITIALIZATION COMPLETE</div>
                <h2 className="pause-title" style={{marginTop: '10px'}}>MISSION OBJECTIVE</h2>
                <div className="manual-text" style={{fontSize: '0.75rem', lineHeight: '1.6'}}>
                  <p style={{margin: '10px 0'}}>&gt; YOU HAVE SUCCESSFULLY SECURED THE GRID FOR THIS INITIAL SWARM.</p>
                  <p style={{margin: '10px 0'}}>&gt; WARNING: SUBSEQUENT VIRAL PACKETS WILL BE FASTER AND MORE NUMEROUS.</p>
                  <p style={{margin: '10px 0'}}>&gt; RE-DEPLOY YOUR TURRETS WISELY EVERY WAVE TO MANAGE YOUR CAPITAL.</p>
                  <p style={{margin: '10px 0'}}>&gt; MAINTAIN THE SYNTAX. PROTECT THE CORE.</p>
                </div>
                <button className="blue-button" onClick={() => {
                  localStorage.setItem('syntax_tutorial_done', 'true');
                  setShowTutorialComplete(false);
                  quitToMenu(); 
                  startNewGame('STANDARD');
                }} style={{marginTop: '20px', width: '100%', padding: '12px'}}>EXIT TUTORIAL & START REAL GAME</button>
              </div>
            </div>
          )}
          {integrity <= 0 && <div className="pause-overlay-locked"><div className="pause-content"><h2 className="pause-title" style={{color: '#ff3300'}}>CRITICAL SYSTEM FAILURE</h2><button className="blue-button" onClick={() => setScreen('MENU')}>RETURN TO ROOT</button></div></div>}
          {isPaused && integrity > 0 && !isVictorious && <div className="pause-overlay-locked"><div className="pause-content"><h2 className="pause-title">PAUSED</h2><div className="pause-options"><button className="blue-button" onClick={() => setIsPaused(false)}>RESUME</button><button className="blue-button" onClick={saveAndQuit}>SAVE & EXIT</button><button className="blue-button" onClick={quitToMenu} style={{background: 'rgba(255, 51, 0, 0.2)', borderColor: '#ff3300'}}>ABANDON</button></div></div></div>}
          
          {gamePhase === 'PREP' && !isPaused && integrity > 0 && (!isTutorialActive || tutorialStep === 3) && (
            <div className="pre-wave-overlay">
              {wave > 1 && (
                <div className="wave-summary-ledger" style={{width: '100%', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '15px'}}>
                  <div style={{fontSize: '0.7rem', color: 'var(--neon-cyan)', marginBottom: '8px', textAlign: 'center', letterSpacing: '2px'}}>PREVIOUS WAVE ANALYSIS</div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#fff', marginBottom: '4px'}}><span>KILLS:</span> <span style={{color: 'var(--neon-green)'}}>+{waveSummary.kills}c</span></div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#fff', marginBottom: '4px'}}><span>INTEREST:</span> <span style={{color: 'var(--neon-green)'}}>+{waveSummary.interest}c</span></div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#fff', marginBottom: '4px'}}><span>PERFECT BONUS:</span> <span style={{color: waveSummary.perfectBonus > 0 ? 'var(--neon-green)' : '#666'}}>{waveSummary.perfectBonus > 0 ? `+${waveSummary.perfectBonus}c` : '0c'}</span></div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 900, color: 'var(--neon-blue)', marginTop: '8px', borderTop: '1px dashed #333', paddingTop: '8px'}}><span>TOTAL INCOME:</span> <span>+{waveSummary.total}c</span></div>
                </div>
              )}
              <div className="intel-header">SWARM SIGNATURES DETECTED</div>
              <div className="intel-grid-horizontal">
                {upcomingEnemies.map(type => {
                  const config = VISUAL_REGISTRY[type as keyof typeof VISUAL_REGISTRY];
                  return (
                    <div key={type} className="intel-card-modern">
                      <div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div>
                      <span className="intel-label">{config.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="game-summary-slim"><p style={{color: '#fff', fontWeight: 900}}>&gt; LINK IDENTICAL TURRETS FOR +10% DMG SYNERGY.</p></div>
              <button className="blue-button massive-exec-button" onClick={executeWave}>EXECUTE DEFENSE PROTOCOL</button>
            </div>
          )}

          <div className="tactical-dashboard">
            <div className="dashboard-left">
              <div style={{display: 'flex', gap: '5px'}}>
                <button className="blue-button pause-btn" onClick={() => setIsPaused(true)} style={{flexDirection: 'column'}}>
                  <span>PAUSE</span>
                  <span className="hotkey-hint">SPACE</span>
                </button>
                <button className={`blue-button pause-btn ${isFastForward ? 'active' : ''}`} onClick={toggleFastForward} style={{borderColor: isFastForward ? 'var(--neon-green)' : '', flexDirection: 'column'}}>
                  <span>{isFastForward ? '2X' : '>>'}</span>
                  <span className="hotkey-hint">F</span>
                </button>
              </div>
              <div className="wave-label">LVL {isTutorialActive ? 0 : wave} // {isTutorialActive ? 'INIT SEQUENCE' : waveName}</div>
              <button 
                className={`blue-button repair-button ${integrity <= 5 && credits >= repairCost ? 'critical-repair' : ''}`} 
                onClick={repairKernel} 
                disabled={credits < repairCost || integrity >= 20}
              >
                REPAIR: {repairCost}c
              </button>
            </div>
            <div className="dashboard-center">
              <div className="turret-row">
                {[0, 1, 2, 3, 4].map(type => {
                  const cfg = TOWER_CONFIGS[type as TowerType];
                  const unlocked = type === 0 || isUnlocked(type); 
                  
                  let cost = cfg.cost;
                  if (game?.towerManager) {
                    const count = game.towerManager.getTowerCount(type as TowerType);
                    const supplyMultiplier = count >= 4 ? 1.15 : 1.0;
                    cost = Math.floor(cfg.cost * supplyMultiplier);
                    if (gameMode === 'HARDCORE') cost = Math.floor(cost * 1.5);
                    if (integrity < 10 && gameMode !== 'SUDDEN_DEATH') cost = Math.floor(cost * 0.85);
                  } else {
                    cost = gameMode === 'HARDCORE' ? Math.floor(cfg.cost * 1.5) : (integrity < 10 ? Math.floor(cfg.cost * 0.85) : cfg.cost);
                  }
                  
                  return (
                    <div key={type} className={`protocol-card ${selectedTurret === type ? 'active' : ''} ${credits < cost ? 'dimmed' : ''} ${!unlocked ? 'locked' : ''}`} data-type={type} onClick={() => unlocked && selectTurret(type)}>
                      {!unlocked && <div className="lock-icon">🔒</div>}
                      <div className="hotkey-badge">{type + 1}</div>
                      <div className="mini-turret"><div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core" style={{ backgroundColor: `#${cfg.color.toString(16).padStart(6,'0')}`, boxShadow: `0 0 10px #${cfg.color.toString(16).padStart(6,'0')}` }}></div></div></div>
                      <div className="protocol-info">
                        <span className="name">{cfg.name}</span>
                        <span className="stats">PWR: {cfg.damage} // RTE: {cfg.rate * 16}ms</span>
                        <span className="cost">{cost}c</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="dashboard-right">
              <div className="credits-display" style={{display: 'flex', alignItems: 'baseline', gap: '10px', justifyContent: 'flex-end'}}>
                <span className="credits-label" style={{fontSize: '0.8rem'}}>TOKENS:</span>
                <span className="credits-value">{credits}</span>
              </div>
              <div className="integrity-stack">
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.6rem', color: '#fff', marginBottom: '2px'}}>
                  <span style={{color: sysStatusColor, fontWeight: 900}}>{systemStatusText}</span>
                  <span>{integrity}/20</span>
                </div>
                <div className="integrity-bar-small">
                  <div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%`, background: sysStatusColor }}></div>
                </div>
              </div>
              <button className="blue-button item-btn" onClick={useDataPurge} disabled={credits < 1000 || !isWaveActive}>DATA PURGE: 1000c</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
