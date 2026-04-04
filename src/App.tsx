import { useEffect, useState } from 'react';
import { GameContainer } from './game/GameContainer';
import { GameStateManager } from './game/systems/GameStateManager';
import { TowerType, TOWER_CONFIGS } from './game/entities/Tower';
import './App.css';

type ScreenState = 'MENU' | 'GAME' | 'ABOUT' | 'ENEMIES' | 'TURRETS';
type InfoTab = 'LORE' | 'LOGIC' | 'DIAGNOSTICS';

function App() {
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [infoTab, setInfoTab] = useState<InfoTab>('LORE');
  const [credits, setCredits] = useState(500);
  const [integrity, setIntegrity] = useState(20);
  const [wave, setWave] = useState(0);
  const [waveName, setWaveName] = useState("");
  const [selectedTurret, setSelectedTurret] = useState(0);
  const [game, setGame] = useState<GameContainer | null>(null);
  const [isHardcore, setIsHardcore] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = screenWidth < 600;

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
          <div className="menu-options">
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
                    <p>&gt;&gt; LOG_ENTRY: INTRUSION DETECTED IN KERNEL_0. VIRAL GEOMETRY PROPAGATING THROUGH DATA LANES.</p>
                    <p>&gt;&gt; SYSTEM_ANOMALIES_DETECTED:</p>
                    <p>1. [ OVERCLOCK ]: TURRET FIRE RATES INCREASED BY 50%.</p>
                    <p>2. [ LAG_SPIKE ]: VIRAL PROPAGATION SPEEDS REDUCED BY 30%.</p>
                    <p>3. [ SYSTEM_DRAIN ]: TURRET RANGE EFFICIENCY REDUCED BY 20%.</p>
                    <p>&gt;&gt; DIRECTIVE: PROTECT THE ROOT AT ALL COSTS.</p>
                  </div>
                )}
                {infoTab === 'LOGIC' && (
                  <div className="logic-text">
                    <p>[ WAVE_SHIFT ]: RECONFIGURING DATA LANES TO TRAP VIRAL LOADS.</p>
                    <p>[ BUDGET_RECYCLE ]: NO CREDITS ARE RETURNED ON NODE DISSOLUTION. EARN INTEREST ON UNSPENT CREDITS.</p>
                    <p>[ HARDCORE_MODE ]: 1000c START. NO INTEREST. +50% PROTOCOL COSTS.</p>
                  </div>
                )}
                {infoTab === 'DIAGNOSTICS' && (
                  <div className="diag-text">
                    <div>BUILD: SYNTAX_DEFENSE_v1.3.0</div>
                    <div>STATUS: {integrity > 5 ? 'FUNCTIONAL' : 'CRITICAL'}</div>
                    <div className="blink">READY_FOR_EXECUTION...</div>
                  </div>
                )}
              </div>
            </div>
          )}
          {screen === 'ENEMIES' && (
            <div className="visual-grid">
              <div className="visual-card"><div className="shape circle"></div><div className="label">GLIDER</div><div className="desc">PRIORITY: LOW</div></div>
              <div className="visual-card"><div className="shape triangle"></div><div className="label">STRIDER</div><div className="desc">PRIORITY: MED</div></div>
              <div className="visual-card"><div className="shape square"></div><div className="label">BEHEMOTH</div><div className="desc">PRIORITY: HIGH</div></div>
              <div className="visual-card"><div className="shape hexagon"></div><div className="label">FRACTAL</div><div className="desc">PRIORITY: CRITICAL</div></div>
            </div>
          )}
          {screen === 'TURRETS' && (
            <div className="visual-grid">
              {Object.values(TOWER_CONFIGS).map(t => (
                <div key={t.name} className="visual-card">
                  <div className="turret-preview" style={{ background: `#${t.color.toString(16).padStart(6,'0')}` }}></div>
                  <div className="label">{t.name}</div>
                  <div className="desc">{t.cost} CREDITS</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="back-btn" onClick={() => setScreen('MENU')}>[ TERMINATE_LINK ]</button>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div className="orientation-warning">
        <div className="warning-icon">🔄</div>
        <div className="warning-text">CRITICAL_ERROR: SYSTEM_OUTPUT_WIDTH_INSUFFICIENT.<br/><br/>[ PLEASE_ROTATE_DEVICE_TO_LANDSCAPE ]</div>
      </div>
      <div id="game-container"></div>
      
      <div className="game-overlay">
        {/* PAUSE OVERLAY */}
        {isPaused && (
          <div className="pause-overlay">
            <div className="pause-content">
              <h2 className="pause-title">SESSION_PAUSED</h2>
              <div className="pause-options">
                <button onClick={() => setIsPaused(false)}>[ RESUME_EXECUTION ]</button>
                <button onClick={saveAndQuit}>[ SAVE_PROGRESS_AND_EXIT ]</button>
                <button onClick={quitToMenu} style={{color: '#ff3300', borderColor: '#ff3300'}}>[ TERMINATE_WITHOUT_SAVING ]</button>
              </div>
            </div>
          </div>
        )}

        {/* GLITCH ALERT OVERLAY */}
        {GameStateManager.getInstance().activeGlitch !== 'NONE' && (
          <div className={`glitch-banner ${GameStateManager.getInstance().activeGlitch}`}>
            SYSTEM_ANOMALY: {GameStateManager.getInstance().activeGlitch}_DETECTED
          </div>
        )}

        {/* RESPONSIVE 2-LINE TACTICAL MATRIX BANNER */}
        <div className="terminal-header-matrix">
          <div className="matrix-row">
            <div className="matrix-cell left" style={{ display: 'flex', gap: '10px' }}>
              <button className="exec-button" onClick={() => setIsPaused(true)}>[ PAUSE ]</button>
              <button className="exec-button" onClick={executeNextWave}>
                {isSmallScreen ? "> EXEC_WAVE" : "> EXECUTE_NEXT_WAVE_CMD"}
              </button>
            </div>
            <div className="matrix-cell center label">TOKENS</div>
            <div className="matrix-cell right label">{isSmallScreen ? "INTEGRITY" : "SYSTEM_INTEGRITY"}</div>
          </div>
          
          <div className="matrix-row">
            <div className="matrix-cell left wave-info">
              {waveName} // LVL_{wave}
            </div>
            <div className="matrix-cell center value credits-value">
              {credits}
            </div>
            <div className="matrix-cell right integrity-stack">
              <div className="integrity-bar-small">
                <div className="integrity-fill" style={{ width: `${(integrity / 20) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="tactical-hub">
          <div className="defense-section">
            <div className="hub-label">DEFENSE_PROTOCOLS</div>
            <div className="turret-grid">
              {[TowerType.PULSE_MG, TowerType.FROST_RAY, TowerType.BLAST_NOVA, TowerType.RAILGUN].map(type => {
                const cfg = TOWER_CONFIGS[type];
                const cost = isHardcore ? Math.floor(cfg.cost * 1.5) : cfg.cost;
                return (
                  <div key={type} className={`turret-card ${selectedTurret === type ? 'active' : ''}`} data-type={type} onClick={() => selectTurret(type)}>
                    <div className="turret-visual-box"><div className="mini-turret" style={{ '--turret-color': `#${cfg.color.toString(16).padStart(6,'0')}` } as any}><div className="mini-base"></div><div className="mini-head"><div className="mini-weapon"></div><div className="mini-core"></div></div></div></div>
                    <div className="card-info"><div className="card-header" style={{ color: `#${cfg.color.toString(16).padStart(6, '0')}` }}>{cfg.name}</div><div className="card-stats">DMG: {cfg.damage}</div><div className="cost" style={{ color: isHardcore ? '#ff3300' : '#00ffff' }}>{cost}c</div></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="intel-section">
            <div className="hub-label">VIRAL_INTEL</div>
            <div className="intel-monitor">
              <div className="intel-grid">
                {game?.waveManager.getUpcomingEnemyTypes().map(type => (
                  <div key={type} className="intel-card"><div className={`shape ${type === 0 ? 'circle' : type === 1 ? 'triangle' : type === 2 ? 'square' : 'hexagon'}`}></div><div className="intel-name">{type === 0 ? 'GLIDER' : type === 1 ? 'STRIDER' : type === 2 ? 'BEHEMOTH' : 'FRACTAL'}</div></div>
                ))}
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
