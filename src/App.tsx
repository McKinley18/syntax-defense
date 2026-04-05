import { useEffect, useState } from 'react';
import { GameContainer } from './game/GameContainer';
import { GameStateManager } from './game/systems/GameStateManager';
import type { GameMode } from './game/systems/GameStateManager';
import { TowerType, TOWER_CONFIGS } from './game/entities/Tower';
import { VISUAL_REGISTRY } from './game/VisualRegistry';
import './App.css';

type ScreenState = 'MENU' | 'GAME' | 'ABOUT' | 'ENEMIES' | 'TURRETS';
type InfoTab = 'LORE' | 'LOGIC' | 'DIAGNOSTICS' | 'MODES' | 'THREATS';

function App() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(500);
  const [integrity, setIntegrity] = useState(20);
  const [wave, setWave] = useState(1);
  const [waveName, setWaveName] = useState("");
  const [selectedTurret, setSelectedTurret] = useState(0);
  const [game, setGame] = useState<GameContainer | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [repairCost, setRepairCost] = useState(500);
  const [gameMode, setGameMode] = useState<GameMode>('STANDARD');
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        const screenObj = window.screen as any;
        if (screen === 'GAME' && screenObj.orientation?.lock) {
          await screenObj.orientation.lock('landscape');
        }
      } catch (e) { }
    };
    lockOrientation();
  }, [screen]);

  useEffect(() => {
    if (screen === 'GAME' && !game) {
      async function init() {
        const g = await GameContainer.getInstance();
        setGame(g);
        
        // CHECK TUTORIAL STATUS
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
        return () => clearInterval(interval);
      }
      init();
    }
  }, [screen, game]);

  useEffect(() => {
    if (game) game.isPaused = isPaused;
  }, [isPaused, game]);

  const isGameOver = integrity <= 0;

  const startNewGame = (mode: GameMode) => {
    GameStateManager.getInstance().resetGame(mode);
    setScreen('GAME');
  };

  const loadGame = () => {
    if (GameStateManager.getInstance().load()) {
      setScreen('GAME');
    } else {
      alert("CRITICAL_ERROR: NO SAVED_DATA ON LOCAL_MOUNT.");
    }
  };

  const saveAndQuit = () => {
    GameStateManager.getInstance().save();
    if (game) {
      game.app.destroy(true, { children: true, texture: true });
      const container = document.getElementById('game-container');
      if (container) container.innerHTML = '';
      setGame(null);
    }
    setIsPaused(false);
    setScreen('MENU');
  };

  const quitToMenu = () => {
    if (game) {
      game.app.destroy(true, { children: true, texture: true });
      const container = document.getElementById('game-container');
      if (container) container.innerHTML = '';
      setGame(null);
    }
    setIsPaused(false);
    setScreen('MENU');
  };

  const selectTurret = (type: number) => {
    setSelectedTurret(type);
    if (game?.towerManager) {
      game.towerManager.startPlacement(type as any);
    }
  };

  const executeWave = () => {
    game?.waveManager.startWave();
  };

  const repairKernel = () => {
    GameStateManager.getInstance().repairKernel();
  };

  const useDataPurge = () => {
    if (credits >= 1000 && game?.waveManager) {
      GameStateManager.getInstance().addCredits(-1000);
      game.waveManager.dataPurge();
    }
  };

  const dismissTutorial = (permanent: boolean) => {
    if (permanent) localStorage.setItem('syntax_tutorial_done', 'true');
    setShowTutorial(false);
  };

  const isUnlocked = (type: TowerType) => {
    if (type === TowerType.PULSE_MG) return true;
    if (type === TowerType.FROST_RAY) return wave >= 4;
    if (type === TowerType.BLAST_NOVA) return wave >= 8;
    if (type === TowerType.RAILGUN) return wave >= 15;
    if (type === TowerType.TESLA_LINK) return wave >= 20;
    return false;
  };

  const getSystemStatus = () => {
    if (integrity > 15) return { text: "STATUS: STABLE", color: "#00ffcc" };
    if (integrity > 5) return { text: "STATUS: DEGRADED", color: "#ffcc00" };
    return { text: "STATUS: CRITICAL", color: "#ff3300" };
  };

  if (screen === 'MENU') {
    return (
      <div className="main-menu">
        <div className="grid-background">
          <div className="grid-lines"></div>
          <div className="grid-glows">
            <div className="glow-bit comet-right glow-1" style={{top: '10%', left: '-5%'}}></div>
            <div className="glow-bit comet-left glow-2" style={{top: '30%', left: '105%'}}></div>
            <div className="glow-bit comet-down glow-3" style={{top: '-5%', left: '50%'}}></div>
            <div className="glow-bit comet-up glow-4" style={{top: '105%', left: '80%'}}></div>
            <div className="grid-sweep"></div>
          </div>
        </div>
        <div className="menu-content-centered">
          <h1 className="menu-title-static">SYNTAX<br/>DEFENSE</h1>
          <div className="menu-options-grid">
            <button onClick={() => startNewGame('STANDARD')}>&gt; INITIALIZE_STANDARD</button>
            <button onClick={() => startNewGame('HARDCORE')} style={{color: '#ff3300', borderColor: '#ff3300'}}>&gt; INITIALIZE_HARDCORE</button>
            <button onClick={() => startNewGame('ENDLESS')}>&gt; INITIALIZE_ENDLESS</button>
            <button onClick={() => startNewGame('SUDDEN_DEATH')} style={{color: '#ffcc00', borderColor: '#ffcc00'}}>&gt; SUDDEN_DEATH</button>
            <button onClick={() => startNewGame('ECO_CHALLENGE')}>&gt; ECO_CHALLENGE</button>
            <button onClick={loadGame}>&gt; RESTORE_SESSION</button>
            <button onClick={() => setScreen('ENEMIES')}>&gt; VIRAL_DATABASE</button>
            <button onClick={() => setScreen('TURRETS')}>&gt; DEFENSE_PROTOCOLS</button>
            <button onClick={() => setScreen('ABOUT')}>&gt; SYSTEM_INFO</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'ENEMIES' || screen === 'TURRETS' || screen === 'ABOUT') {
    return (
      <div className="encyclopedia">
        <div className="enc-header">[ MAINFRAME_DATA_ARCHIVE // {screen} ]</div>
        <div className="enc-content">
          {screen === 'ABOUT' && (
            <div className="info-hub">
              <div className="info-tabs">
                <button className={infoTab === 'LORE' ? 'active' : ''} onClick={() => setInfoTab('LORE')}>LORE</button>
                <button className={infoTab === 'MODES' ? 'active' : ''} onClick={() => setInfoTab('MODES')}>MODES</button>
                <button className={infoTab === 'THREATS' ? 'active' : ''} onClick={() => setInfoTab('THREATS')}>THREATS</button>
                <button className={infoTab === 'LOGIC' ? 'active' : ''} onClick={() => setInfoTab('LOGIC')}>LOGIC</button>
                <button className={infoTab === 'DIAGNOSTICS' ? 'active' : ''} onClick={() => setInfoTab('DIAGNOSTICS')}>DATA</button>
              </div>
              <div className="info-body">
                {infoTab === 'LORE' && (
                  <div className="lore-text">
                    <p>&gt;&gt; LOG_ENTRY: INTRUSION DETECTED IN KERNEL_0.</p>
                    <p>&gt;&gt; SYSTEM_EVOLUTION V1.8.0 DETECTED.</p>
                    <p>1. [ REPAIR_KERNEL ]: BUY REPAIRS AT SCALING COSTS.</p>
                    <p>2. [ DATA_LINKS ]: ADJACENT IDENTICAL TURRETS GAIN +10% DMG.</p>
                    <p>3. [ PERFECT_WAVE ]: +2% INTEREST FOR ZERO LEAKS.</p>
                  </div>
                )}
                {infoTab === 'MODES' && (
                  <div className="modes-text">
                    <p>[ SUDDEN_DEATH ]: 1 INTEGRITY. NO REPAIRS.</p>
                    <p>[ ECO_CHALLENGE ]: 0 TOKENS PER KILL. INTEREST ONLY.</p>
                    <p>[ ENDLESS ]: NO LEVEL CAP. MAX SCALING.</p>
                  </div>
                )}
                {infoTab === 'THREATS' && (
                  <div className="threats-text">
                    <p>[ ELITES ]: 3.5x HP MINI-BOSSES. 2.5x REWARD.</p>
                    <p>[ GHOST_PACKETS ]: INVISIBLE UNLESS REVEALED BY FROST/TESLA.</p>
                  </div>
                )}
                {infoTab === 'LOGIC' && (
                  <div className="logic-text">
                    <p>[ OVERCLOCKING ]: TAP PLACED TURRETS TO UPGRADE (MAX LVL 3).</p>
                    <p>[ INTEREST ]: 10% BASE. +2% PER PERFECT WAVE (MAX 20%).</p>
                  </div>
                )}
                {infoTab === 'DIAGNOSTICS' && (
                  <div className="diag-text">
                    <div>BUILD: v1.8.0 [MAIN_EVOLUTION]</div>
                    <div>STATUS: {integrity > 5 ? 'STABLE' : 'CRITICAL'}</div>
                    <div className="blink">READY...</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {screen === 'ENEMIES' && (
            <div className="visual-grid">
              {Object.values(VISUAL_REGISTRY).map(config => (
                <div key={config.name} className="visual-card-large">
                  <div className="card-visual-box"><div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div></div>
                  <div className="card-detail-box">
                    <div className="label">{config.name}</div>
                    <div className="stats">HP: {config.baseHp} // REWARD: {config.reward}c</div>
                    <div className="desc">{config.priority === 'LOW' ? 'SWARM_UNIT' : config.priority === 'MED' ? 'STANDARD_THREAT' : 'HEAVY_DATA_LOAD'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {screen === 'TURRETS' && (
            <div className="visual-grid">
              {Object.values(TOWER_CONFIGS).map((cfg, idx) => (
                <div key={cfg.name} className="visual-card-large" data-type={idx}>
                  <div className="card-visual-box">
                    <div className="mini-turret" style={{ '--turret-color': `#${cfg.color.toString(16).padStart(6,'0')}` } as any}>
                      <div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core"></div></div>
                    </div>
                  </div>
                  <div className="card-detail-box">
                    <div className="label">{cfg.name}</div>
                    <div className="stats">DMG: {cfg.damage} // RNG: {cfg.range}sq</div>
                    <div className="desc">{cfg.cost}c INITIAL // LVL 3 MAX</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="back-btn" onClick={() => setScreen('MENU')}>[ TERMINATE ]</button>
      </div>
    );
  }

  const status = getSystemStatus();

  return (
    <div className="game-wrapper">
      <div className="orientation-warning">
        <div className="warning-icon">🔄</div>
        <div className="warning-text">SYSTEM_DISPLAY_OPTIMIZATION_REQUIRED</div>
        <div className="warning-subtext">[ PLEASE_ROTATE_DEVICE_TO_LANDSCAPE_TO_INITIALIZE_MAINFRAME ]</div>
      </div>
      <div id="game-container"></div>
      
      <div className="game-overlay">
        {showTutorial && (
          <div className="pause-overlay tutorial-popup">
            <div className="pause-content">
              <h2 className="pause-title">SYSTEM_INITIALIZATION</h2>
              <div className="game-summary">
                <p>&gt; DEPLOY NODES TO DEFEND THE KERNEL.</p>
                <p>&gt; NODES DE-MATERIALIZE AFTER EVERY WAVE.</p>
                <p>&gt; TAP PLACED NODES TO OVERCLOCK (UPGRADE).</p>
                <p>&gt; ELITES AND GHOSTS WILL CHALLENGE THE GRID.</p>
              </div>
              <div className="pause-options" style={{marginTop: '20px'}}>
                <button onClick={() => dismissTutorial(false)}>[ GOT IT ]</button>
                <button onClick={() => dismissTutorial(true)} style={{fontSize: '0.5rem'}}>[ DON'T SHOW AGAIN ]</button>
              </div>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="pause-overlay game-over">
            <div className="pause-content">
              <h2 className="pause-title" style={{color: '#ff3300'}}>CRITICAL_SYSTEM_FAILURE: KERNEL_PANIC</h2>
              <button onClick={() => setScreen('MENU')} className="back-btn">[ RETURN_TO_ROOT_MENU ]</button>
            </div>
          </div>
        )}

        {isPaused && !isGameOver && (
          <div className="pause-overlay">
            <div className="pause-content">
              <h2 className="pause-title">PAUSED</h2>
              <div className="pause-options">
                <button onClick={() => setIsPaused(false)}>[ RESUME ]</button>
                <button onClick={saveAndQuit}>[ SAVE & EXIT ]</button>
                <button onClick={quitToMenu} style={{color: '#ff3300'}}>[ ABANDON ]</button>
              </div>
            </div>
          </div>
        )}

        {!isWaveActive && !isPaused && (
          <div className="pre-wave-overlay">
            <div className="intel-header">SWARM_SIGNATURES_DETECTED</div>
            <div className="intel-grid">
              {game?.waveManager.getUpcomingEnemyTypes().map(type => {
                const config = (VISUAL_REGISTRY as any)[type];
                return (
                  <div key={type} className="intel-icon-box">
                    <div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div>
                    <span className="intel-label">{config.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="game-summary">
              <p>&gt; LINK IDENTICAL TURRETS FOR +10% DMG SYNERGY.</p>
              <p>&gt; CURRENT MODE: {gameMode}</p>
            </div>
            <button className="massive-exec-button" onClick={executeWave}>[ EXECUTE_PROTOCOL ]</button>
          </div>
        )}

        <div className="tactical-dashboard">
          <div className="dashboard-left">
            <button className="exec-button pause-btn" onClick={() => setIsPaused(true)}>[ PAUSE ]</button>
            <div className="wave-label">{waveName} // LVL_{wave}</div>
            <button 
              className="repair-button" 
              onClick={repairKernel} 
              disabled={credits < repairCost || integrity >= 20 || gameMode === 'SUDDEN_DEATH'}
            >
              [ REPAIR: {repairCost}c ]
            </button>
          </div>

          <div className="dashboard-center">
            <div className="turret-grid-horizontal">
              {[0, 1, 2, 3, 4].map(type => {
                const cfg = TOWER_CONFIGS[type];
                const unlocked = isUnlocked(type as TowerType);
                const cost = gameMode === 'HARDCORE' ? Math.floor(cfg.cost * 1.5) : (integrity < 10 ? Math.floor(cfg.cost * 0.85) : cfg.cost);
                const canAfford = credits >= cost;
                
                return (
                  <div 
                    key={type} 
                    className={`slim-turret-card ${selectedTurret === type ? 'active' : ''} ${!canAfford ? 'dimmed' : ''} ${!unlocked ? 'locked' : ''}`} 
                    onClick={() => unlocked && selectTurret(type)}
                  >
                    {!unlocked ? (
                      <div className="lock-icon">🔒</div>
                    ) : (
                      <div className="slim-card-info">
                        <span className="name">{cfg.name}</span>
                        <span className="stats">DMG:{cfg.damage}</span>
                        <span className="cost">{cost}c</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="consumable-bar">
              <button className="item-btn" onClick={useDataPurge} disabled={credits < 1000 || !isWaveActive}>
                [ DATA_PURGE: 1000c ]
              </button>
            </div>
          </div>

          <div className="dashboard-right">
            <div className="stat-row">
              <span className="label">TOKENS:</span>
              <span className="credits-value">{credits}</span>
            </div>
            <div className="integrity-stack">
              <div className="system-status-label" style={{color: status.color}}>{status.text}</div>
              <div className="integrity-bar-small">
                <div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
