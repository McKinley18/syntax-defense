import { useEffect, useState } from 'react';
import { GameContainer } from './game/GameContainer';
import { GameStateManager } from './game/systems/GameStateManager';
import { TowerType, TOWER_CONFIGS } from './game/entities/Tower';
import { VISUAL_REGISTRY } from './game/VisualRegistry';
import './App.css';

type ScreenState = 'MENU' | 'GAME' | 'ABOUT' | 'ENEMIES' | 'TURRETS';
type InfoTab = 'LORE' | 'LOGIC' | 'DIAGNOSTICS';

function App() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(500);
  const [integrity, setIntegrity] = useState(20);
  const [wave, setWave] = useState(1);
  const [waveName, setWaveName] = useState("");
  const [selectedTurret, setSelectedTurret] = useState(0);
  const [game, setGame] = useState<GameContainer | null>(null);
  const [isHardcore, setIsHardcore] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isWaveActive, setIsWaveActive] = useState(false);

  // ATTEMPT ORIENTATION LOCK
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (screen === 'GAME' && (screen as any).orientation?.lock) {
          await (screen as any).orientation.lock('landscape');
        }
      } catch (e) {
        console.warn("Orientation lock not supported on this device/browser.");
      }
    };
    lockOrientation();
  }, [screen]);

  useEffect(() => {
    if (screen === 'GAME' && !game) {
      async function init() {
        const g = await GameContainer.getInstance();
        setGame(g);
        const interval = setInterval(() => {
          const state = GameStateManager.getInstance();
          setCredits(state.credits);
          setIntegrity(state.integrity);
          setWaveName(state.getWaveName());
          setIsHardcore(state.isHardcore);
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

  const startNewGame = (hardcore: boolean = false) => {
    GameStateManager.getInstance().resetGame(hardcore);
    setIsHardcore(hardcore);
    setScreen('GAME');
  };

  const loadGame = () => {
    if (GameStateManager.getInstance().load()) {
      setIsHardcore(GameStateManager.getInstance().isHardcore);
      setScreen('GAME');
    } else {
      alert("CRITICAL_ERROR: NO SAVED_DATA ON LOCAL_MOUNT.");
    }
  };

  useEffect(() => {
    if (game) {
      game.isPaused = isPaused;
    }
  }, [isPaused, game]);

  const isGameOver = integrity <= 0;

  const saveAndQuit = () => {
    GameStateManager.getInstance().save();
    setIsPaused(false);
    setScreen('MENU');
  };

  const quitToMenu = () => {
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

  if (screen === 'MENU') {
    return (
      <div className="main-menu">
        <div className="grid-background">
          <div className="grid-lines"></div>
          <div className="grid-glows">
            <div className="glow-bit comet-right glow-1"></div>
            <div className="glow-bit comet-left glow-2"></div>
            <div className="glow-bit comet-down glow-3"></div>
            <div className="glow-bit comet-up glow-4"></div>
            <div className="grid-sweep"></div>
          </div>
        </div>
        <div className="menu-content-centered">
          <h1 className="menu-title-static">SYNTAX<br/>DEFENSE</h1>
          <div className="menu-options-grid">
            <button onClick={() => startNewGame(false)}>&gt; INITIALIZE_STANDARD</button>
            <button onClick={() => startNewGame(true)} style={{color: '#ff3300', borderColor: '#ff3300'}}>&gt; INITIALIZE_HARDCORE</button>
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
                <button className={infoTab === 'LOGIC' ? 'active' : ''} onClick={() => setInfoTab('LOGIC')}>LOGIC</button>
                <button className={infoTab === 'DIAGNOSTICS' ? 'active' : ''} onClick={() => setInfoTab('DIAGNOSTICS')}>DATA</button>
              </div>
              <div className="info-body">
                {infoTab === 'LORE' && (
                  <div className="lore-text">
                    <p>&gt;&gt; LOG_ENTRY: INTRUSION DETECTED IN KERNEL_0.</p>
                    <p>&gt;&gt; SYSTEM_ANOMALIES_DETECTED:</p>
                    <p>1. [ OVERCLOCK ]: TURRET FIRE RATES +50%.</p>
                    <p>2. [ LAG_SPIKE ]: VIRAL SPEED -30%.</p>
                    <p>3. [ SYSTEM_DRAIN ]: TURRET RANGE -20%.</p>
                    <p>&gt;&gt; DIRECTIVE: PROTECT THE ROOT.</p>
                  </div>
                )}
                {infoTab === 'LOGIC' && (
                  <div className="logic-text">
                    <p>[ WAVE_SHIFT ]: PATHS RECONFIGURE EVERY LEVEL.</p>
                    <p>[ BUDGET ]: 10% INTEREST ON UNSPENT TOKENS.</p>
                    <p>[ HARDCORE ]: NO INTEREST. +50% COSTS.</p>
                  </div>
                )}
                {infoTab === 'DIAGNOSTICS' && (
                  <div className="diag-text">
                    <div>BUILD: v1.6.0</div>
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
                <div key={config.name} className="visual-card">
                  <div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div>
                  <div className="label">{config.name}</div>
                  <div className="desc">PRIORITY: {config.priority}</div>
                </div>
              ))}
            </div>
          )}
          {screen === 'TURRETS' && (
            <div className="visual-grid">
              {Object.values(TOWER_CONFIGS).map(t => (
                <div key={t.name} className="visual-card">
                  <div className="mini-turret" style={{ '--turret-color': `#${t.color.toString(16).padStart(6,'0')}` } as any}>
                    <div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core"></div></div>
                  </div>
                  <div className="label">{t.name}</div>
                  <div className="desc">{t.cost}c // DMG: {t.damage}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="back-btn" onClick={() => setScreen('MENU')}>[ TERMINATE ]</button>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div className="orientation-warning">
        <div className="warning-icon">🔄</div>
        <div className="warning-text">SYSTEM_DISPLAY_OPTIMIZATION_REQUIRED</div>
        <div className="warning-subtext">[ PLEASE_ROTATE_DEVICE_TO_LANDSCAPE_TO_INITIALIZE_MAINFRAME ]</div>
      </div>
      <div id="game-container"></div>
      
      <div className="game-overlay">
        {/* GAME OVER OVERLAY */}
        {isGameOver && (
          <div className="pause-overlay game-over">
            <div className="pause-content">
              <h2 className="pause-title" style={{color: '#ff3300'}}>CRITICAL_SYSTEM_FAILURE: KERNEL_PANIC</h2>
              <div className="pause-options">
                <button onClick={() => setScreen('MENU')}>[ RETURN_TO_ROOT_MENU ]</button>
              </div>
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
                <button onClick={quitToMenu} style={{color: '#ff3300', borderColor: '#ff3300'}}>[ ABANDON ]</button>
              </div>
            </div>
          </div>
        )}

        {/* PRE-WAVE INTEL OVERLAY */}
        {!isWaveActive && !isPaused && (
          <div className="pre-wave-overlay">
            <div className="intel-header">SWARM_SIGNATURES_DETECTED</div>
            <div className="intel-icons">
              {game?.waveManager.getUpcomingEnemyTypes().map(type => {
                const config = VISUAL_REGISTRY[type];
                return (
                  <div key={type} className="intel-icon-box">
                    <div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div>
                    <span className="intel-label">{config.name}</span>
                  </div>
                );
              })}
            </div>
            <button className="massive-exec-button" onClick={executeWave}>[ EXECUTE_DEFENSE_PROTOCOL ]</button>
          </div>
        )}

        {GameStateManager.getInstance().activeGlitch !== 'NONE' && (
          <div className={`glitch-banner ${GameStateManager.getInstance().activeGlitch}`}>
            GLITCH: {GameStateManager.getInstance().activeGlitch}
          </div>
        )}

        {/* UNIFIED TACTICAL DASHBOARD (BOTTOM ONLY) */}
        <div className="tactical-dashboard">
          <div className="dashboard-left">
            <button className="exec-button pause-btn" onClick={() => setIsPaused(true)}>[ PAUSE ]</button>
            <div className="wave-label">{waveName} // LVL_{wave}</div>
          </div>

          <div className="dashboard-center">
            <div className="turret-grid-horizontal">
              {[TowerType.PULSE_MG, TowerType.FROST_RAY, TowerType.BLAST_NOVA, TowerType.RAILGUN].map(type => {
                const cfg = TOWER_CONFIGS[type];
                const cost = isHardcore ? Math.floor(cfg.cost * 1.5) : cfg.cost;
                const canAfford = credits >= cost;
                return (
                  <div 
                    key={type} 
                    className={`slim-turret-card ${selectedTurret === type ? 'active' : ''} ${!canAfford ? 'dimmed' : ''}`} 
                    onClick={() => selectTurret(type)}
                  >
                    <div className="mini-turret" style={{ '--turret-color': `#${cfg.color.toString(16).padStart(6,'0')}` } as any}>
                      <div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core"></div></div>
                    </div>
                    <div className="slim-card-info">
                      <span className="name">{cfg.name}</span>
                      <span className="stats">DMG:{cfg.damage} // RNG:{cfg.range}sq</span>
                      <span className="cost">{cost}c</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-right">
            <div className="stat-row">
              <span className="label">TOKENS:</span>
              <span className="credits-value">{credits}</span>
            </div>
            <div className="integrity-stack">
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
