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
          if (g.waveManager) setWave(g.waveManager.waveNumber);
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

  const executeNextWave = () => {
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
        <div className="menu-content">
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
                    <div>BUILD: v1.5.0</div>
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
        <div className="warning-text">CRITICAL_ERROR: SYSTEM_OUTPUT_WIDTH_INSUFFICIENT.<br/><br/>[ ROTATE DEVICE ]</div>
      </div>
      <div id="game-container"></div>
      
      <div className="game-overlay">
        {isPaused && (
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

        {GameStateManager.getInstance().activeGlitch !== 'NONE' && (
          <div className={`glitch-banner ${GameStateManager.getInstance().activeGlitch}`}>
            GLITCH: {GameStateManager.getInstance().activeGlitch}
          </div>
        )}

        {/* NEW VERTICAL TACTICAL SIDEBAR */}
        <div className="tactical-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">CORE_STATUS</div>
            <div className="sidebar-stat">
              <span className="label">TOKENS</span>
              <span className="credits-value">{credits}</span>
            </div>
            <div className="integrity-stack">
              <span className="label">INTEGRITY</span>
              <div className="integrity-bar-small">
                <div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <button className="exec-button" onClick={() => setIsPaused(true)}>[ PAUSE ]</button>
            <button className="exec-button" onClick={executeNextWave} style={{borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)'}}>
              [ EXEC_WAVE ]
            </button>
            <div className="wave-info-sidebar">{waveName}<br/>LVL_{wave}</div>
          </div>

          <div className="sidebar-label">DEFENSE_PROTOCOLS</div>
          <div className="sidebar-turrets">
            {[TowerType.PULSE_MG, TowerType.FROST_RAY, TowerType.BLAST_NOVA, TowerType.RAILGUN].map(type => {
              const cfg = TOWER_CONFIGS[type];
              const cost = isHardcore ? Math.floor(cfg.cost * 1.5) : cfg.cost;
              return (
                <div key={type} className={`turret-card ${selectedTurret === type ? 'active' : ''}`} data-type={type} onClick={() => selectTurret(type)}>
                  <div className="mini-turret" style={{ '--turret-color': `#${cfg.color.toString(16).padStart(6,'0')}` } as any}>
                    <div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core"></div></div>
                  </div>
                  <div className="card-info">
                    <div className="card-header">{cfg.name}</div>
                    <div className="cost">{cost}c</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">VIRAL_INTEL</div>
            <div className="intel-monitor">
              <div className="intel-grid">
                {game?.waveManager.getUpcomingEnemyTypes().map(type => {
                  const config = VISUAL_REGISTRY[type];
                  return (
                    <div key={type} className="intel-card">
                      <div className={`shape ${config.shape}`} style={{ background: config.colorHex }}></div>
                    </div>
                  );
                })}
              </div>
              <div className="scanner-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
