import React, { useEffect, useRef } from 'react';
import { VISUAL_REGISTRY } from '../game/VisualRegistry';
import { EnemyType } from '../game/entities/Enemy';
import { Tower, TowerType } from '../game/entities/Tower';
import TacticalDashboard from '../components/ui/TacticalDashboard';
import TowerContextMenu from '../components/ui/TowerContextMenu';

interface GameScreenProps {
  game: any;
  isVictorious: boolean;
  integrity: number;
  credits: number;
  isPaused: boolean;
  showSettingsInGame: boolean;
  sfxVolState: number;
  musicVolState: number;
  gamePhase: string;
  waveSummary: any;
  wave: number;
  showWaveSummaryPopup: boolean;
  isTutorialActive: boolean;
  showCombatIntel: boolean;
  activeGlitch: string;
  upcomingEnemies: { type: EnemyType, count: number }[];
  waveName: string;
  tutorialStep: number;
  tilePos: { x: number, y: number, ts: number };
  selectedTower: Tower | null;
  hoveredTower: Tower | null;
  repairCost: number;
  selectedTurret: number;
  gameMode: string;
  isWaveActive: boolean;
  isFastForward: boolean;
  autoPauseEnabled: boolean;
  sysStatusColor: string;
  systemStatusText: string;
  firstTurretRef: React.RefObject<HTMLDivElement | null>;
  onQuitToMenu: () => void;
  onTogglePause: (paused: boolean) => void;
  onShowSettings: (show: boolean) => void;
  onSetSfxVol: (e: any) => void;
  onSetMusicVol: (e: any) => void;
  onSaveAndQuit: () => void;
  onExecuteWave: () => void;
  onPrepareWave: (start: boolean) => void;
  onSetShowWaveSummary: (show: boolean) => void;
  onSetShowCombatIntel: (show: boolean) => void;
  onSetTutorialStep: (step: number) => void;
  onToggleFastForward: () => void;
  onRepair: () => void;
  onSelectTurret: (type: number) => void;
  onUpgradeTower: () => void;
  onSellTower: () => void;
  onCloseTowerContext: () => void;
  isTowerUnlocked: (type: number) => boolean;
  getTowerCount: (type: TowerType) => number;
  getUpgradeCost: (tower: Tower) => number;
  onFinishTutorial: () => void;
  setSelectedTower: (tower: Tower | null) => void;
  onSetHoveredTower: (tower: Tower | null) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  game,
  isVictorious,
  integrity,
  credits,
  isPaused,
  showSettingsInGame,
  sfxVolState,
  musicVolState,
  gamePhase,
  waveSummary,
  wave,
  showWaveSummaryPopup,
  isTutorialActive,
  showCombatIntel,
  activeGlitch,
  upcomingEnemies,
  waveName,
  tutorialStep,
  tilePos,
  selectedTower,
  hoveredTower,
  repairCost,
  selectedTurret,
  gameMode,
  isWaveActive,
  isFastForward,
  autoPauseEnabled,
  sysStatusColor,
  systemStatusText,
  firstTurretRef,
  onQuitToMenu,
  onTogglePause,
  onShowSettings,
  onSetSfxVol,
  onSetMusicVol,
  onSaveAndQuit,
  onExecuteWave,
  onPrepareWave,
  onSetShowWaveSummary,
  onSetShowCombatIntel,
  onSetTutorialStep,
  onToggleFastForward,
  onRepair,
  onSelectTurret,
  onUpgradeTower,
  onSellTower,
  onCloseTowerContext,
  isTowerUnlocked,
  getTowerCount,
  getUpgradeCost,
  onFinishTutorial,
  setSelectedTower,
  onSetHoveredTower
}) => {
  const [vitalsUptime, setVitalsUptime] = React.useState(0);
  const [vitalsEntropy, setVitalsEntropy] = React.useState(0.14);

  useEffect(() => {
    const itv = setInterval(() => {
      setVitalsUptime(prev => prev + 1);
      setVitalsEntropy(0.14 + (Math.random() * 0.05));
    }, 1000);
    return () => clearInterval(itv);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!game) return null;

  const tutorialStepRef = useRef(tutorialStep);
  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);

  useEffect(() => {
    if (!game) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === '1' && isTowerUnlocked(0)) onSelectTurret(0);
      else if (e.key === '2' && isTowerUnlocked(1)) onSelectTurret(1);
      else if (e.key === '3' && isTowerUnlocked(2)) onSelectTurret(2);
      else if (e.key === '4' && isTowerUnlocked(3)) onSelectTurret(3);
      else if (e.key === '5' && isTowerUnlocked(4)) onSelectTurret(4);
      else if (e.code === 'Space') {
        e.preventDefault();
        if (showCombatIntel) {
          onExecuteWave();
          onSetShowCombatIntel(false);
        } else if (showWaveSummaryPopup) {
          onSetShowWaveSummary(false); 
          onPrepareWave(true); 
          onSetShowCombatIntel(true);
        } else {
          onTogglePause(!isPaused);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, isTowerUnlocked, onSelectTurret, showCombatIntel, showWaveSummaryPopup, isPaused, onExecuteWave, onSetShowCombatIntel, onSetShowWaveSummary, onPrepareWave, onTogglePause]);

  useEffect(() => {
    if (!game) return;
    
    const handleWaveEnd = () => {
      if (isTutorialActive && tutorialStepRef.current === 5) {
        onSetTutorialStep(6);
      }
      if (autoPauseEnabled && !isTutorialActive) {
        onTogglePause(true);
      }
    };

    const handleTowerPlaced = () => {
      if (isTutorialActive && tutorialStepRef.current === 3) {
        onSetTutorialStep(4);
      }
      onSelectTurret(-1);
    };

    const handleTowerSelected = (t: Tower) => {
      setSelectedTower(t);
    };

    const handleTowerHover = (t: Tower | null) => {
      onSetHoveredTower(t);
    };

    game.waveManager.onWaveEnd = handleWaveEnd;
    game.towerManager.onTowerPlaced = handleTowerPlaced;
    game.towerManager.onTowerSelected = handleTowerSelected;
    game.towerManager.onTowerHover = handleTowerHover;

  }, [game, isTutorialActive, tutorialStep, onSetTutorialStep, setSelectedTower, onSetHoveredTower]);

  return (
    <div className="game-overlay-active ui-layer">
      {isVictorious && (
        <div className="pause-overlay-locked" style={{ zIndex: 40000 }}>
          <div className="pause-content" style={{ borderColor: '#00ff66', display: 'flex', flexDirection: 'column' }}>
            <h2 className="pause-title" style={{ color: '#00ff66' }}>SYSTEM SECURED</h2>
            <div className="game-summary">
              <p>&gt; ALL HOSTILE DATA PACKETS PURGED.</p>
              <p>&gt; KERNEL INTEGRITY: {integrity}/20</p>
              <p>&gt; FINAL TOKENS: {credits}</p>
            </div>
            <button className="blue-button back-btn" onClick={onQuitToMenu} style={{ marginTop: '20px' }}>RETURN TO ROOT</button>
          </div>
        </div>
      )}
      {integrity <= 0 && (
        <div className="pause-overlay-locked">
          <div className="pause-content" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="pause-title" style={{ color: '#ff3300' }}>CRITICAL SYSTEM FAILURE</h2>
            <button className="blue-button back-btn" onClick={onQuitToMenu}>RETURN TO ROOT</button>
          </div>
        </div>
      )}
      {isPaused && integrity > 0 && !isVictorious && (
        <div className="pause-overlay-locked">
          {!showSettingsInGame ? (
            <div className="pause-content small-pause">
              <h2 className="pause-title">SYSTEM PAUSED</h2>
              <div className="pause-options grid-options">
                <button className="blue-button" onClick={() => onTogglePause(false)}>RESUME</button>
                <button className="blue-button" onClick={() => onShowSettings(true)}>SETTINGS</button>
                <button className="blue-button" onClick={() => { onTogglePause(false); }}>HOW TO PLAY</button>
                <button className="blue-button" onClick={onSaveAndQuit} disabled={isWaveActive} style={{ opacity: isWaveActive ? 0.5 : 1 }}>SAVE & EXIT</button>
                <button className="blue-button" onClick={onQuitToMenu} style={{ background: 'rgba(255, 51, 0, 0.2)', borderColor: '#ff3300', gridColumn: 'span 2' }}>ABANDON</button>
              </div>
            </div>
          ) : (
            <div className="pause-content small-pause">
              <h2 className="pause-title">SETTINGS</h2>
              <div className="manual-text" style={{ width: '100%', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem' }}>SFX VOLUME</span>
                  <input type="range" min="0" max="1" step="0.05" value={sfxVolState} onChange={onSetSfxVol} style={{ width: '100px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem' }}>MUSIC VOLUME</span>
                  <input type="range" min="0" max="1" step="0.05" value={musicVolState} onChange={onSetMusicVol} style={{ width: '100px' }} />
                </div>
              </div>
              <button className="blue-button" onClick={() => onShowSettings(false)} style={{ width: '100%' }}>BACK</button>
            </div>
          )}
        </div>
      )}
      {gamePhase === 'PREP' && waveSummary && wave >= 1 && showWaveSummaryPopup && !isPaused && integrity > 0 && !isTutorialActive && (
        <div className="victory-overlay ui-layer ultra-compact">
          <div className="popup-title">SWARM {wave} PURGED</div>
          
          <div className="stats-row-compact">
            <div className="stats-item-mini"><div className="lbl">KILLS</div><div className="val">+{waveSummary.totalKills}</div></div>
            <div className="stats-item-mini"><div className="lbl">TOKENS</div><div className="val">+{Math.abs(waveSummary.kills)}c</div></div>
            <div className="stats-item-mini"><div className="lbl">POINTS</div><div className="val">+{waveSummary.points}</div></div>
            <div className="stats-item-mini"><div className="lbl">TOTAL</div><div className="val">+{waveSummary.total}c</div></div>
          </div>
          
          <button className="massive-exec-button compact-btn-long" onClick={() => { onSetShowWaveSummary(false); onPrepareWave(true); onSetShowCombatIntel(true); }}>NEXT MISSION INTEL</button>
        </div>
      )}
      {gamePhase === 'PREP' && !showWaveSummaryPopup && showCombatIntel && !isPaused && integrity > 0 && !isTutorialActive && (
        <div className="pre-wave-overlay ui-layer ultra-compact">
          <div className="popup-title">SWARM DATA DETECTED</div>
          
          <div className="manual-text" style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center', marginBottom: '5px' }}>
            SCANNING MISSION: {waveName}
          </div>

          {activeGlitch !== 'NONE' && (
            <div className="glitch-warning-box">
              <div style={{ color: 'var(--neon-red)', fontWeight: 900, fontSize: '0.65rem' }}>CAUTION: {activeGlitch} MALFUNCTION</div>
              <div style={{ fontSize: '0.55rem', color: '#aaa', marginTop: '2px' }}>
                {activeGlitch === 'OVERCLOCK' ? "SYSTEM STRESS: ALL NODES FIRING 20% SLOWER." : 
                 activeGlitch === 'LAG_SPIKE' ? "NETWORK LATENCY: VIRUS VELOCITY REDUCED BY 30%." :
                 "SYSTEM DRAIN: KERNEL REPAIR PROTOCOLS DISABLED."}
              </div>
            </div>
          )}

          <div className="intel-row-horizontal" style={{ margin: '5px 0' }}>
            {upcomingEnemies.map((entry, idx) => {
              const reg = VISUAL_REGISTRY[entry.type];
              if (!reg) return null;
              return (
                <div key={idx} className="intel-card-minimal" style={{ padding: '4px 8px', gap: '5px' }}>
                  <div className="mini-enemy" style={{ width: '20px', height: '20px' }}>
                    <div className={`shape ${reg.shape}`} style={reg.shape === 'triangle' ? { borderBottomColor: reg.colorHex, borderBottomWidth: '14px', borderLeftWidth: '7px', borderRightWidth: '14px' } : { background: reg.colorHex, width: '14px', height: '14px' }}></div>
                  </div>
                  <div className="intel-label-small" style={{ fontSize: '0.55rem' }}>{reg.name} x{entry.count}</div>
                </div>
              );
            })}
          </div>
          <button className="massive-exec-button compact-btn-long" onClick={() => { onExecuteWave(); onSetShowCombatIntel(false); }}>EXECUTE DEFENSE</button>
        </div>
      )}

      {isTutorialActive && !isPaused && (
        <div className="tutorial-ui ui-layer">
          {tutorialStep === 0 && (
            <div className="tutorial-window">
              <div className="popup-title" style={{ color: 'var(--neon-red)' }}>THREAT DETECTED</div>
              <div className="manual-text" style={{ fontSize: '0.8rem', color: '#fff', textAlign: 'center', margin: '10px 0' }}>
                &gt; WARNING: VIRAL DATA INTRUSION DETECTED.<br /><br />
                SYSTEM ARCHITECT: INITIALIZE DEFENSE PROTOCOLS IMMEDIATELY.
              </div>
              <button className="massive-exec-button" onClick={() => onSetTutorialStep(1)}>INITIALIZE</button>
            </div>
          )}
          {tutorialStep === 1 && (
            <>
              <div className="tutorial-pointer" style={{ left: tilePos.x, top: tilePos.y - 65 }}>SELECT PULSE MG PROTOCOL</div>
              <div className="tutorial-highlight" style={{ left: tilePos.x - 45, top: tilePos.y - 55, width: 90, height: 110 }}></div>
            </>
          )}
          {tutorialStep === 2 && (
            <div className="tutorial-window">
              <div className="popup-title">DEFENSE NODES</div>
              <div className="manual-text" style={{ fontSize: '0.75rem', color: '#fff', textAlign: 'center', margin: '10px 0' }}>
                &gt; NODES PURGE THREATS WITHIN THEIR LOGIC RADIUS (CYAN CIRCLE).<br /><br />
                STRATEGIC OVERLAP AND THROUGHPUT ARE KEY TO CORE SURVIVAL.
              </div>
              <button className="massive-exec-button" onClick={() => onSetTutorialStep(3)}>CONTINUE</button>
            </div>
          )}
          {tutorialStep === 3 && (
            <>
              <div className="tutorial-pointer" style={{ left: tilePos.x, top: tilePos.y - (tilePos.ts / 2) - 10 }}>DEPLOY NODE AT HIGHLIGHTED LOCATION</div>
              <div className="tutorial-highlight" style={{ left: tilePos.x - (tilePos.ts / 2), top: tilePos.y - (tilePos.ts / 2), width: tilePos.ts, height: tilePos.ts }}></div>
            </>
          )}
          {tutorialStep === 4 && (
            <div className="tutorial-window">
              <div className="popup-title">SYSTEM UPGRADES</div>
              <div className="manual-text" style={{ fontSize: '0.75rem', color: '#fff', textAlign: 'center', margin: '10px 0' }}>
                &gt; NODES CAN BE OVERCLOCKED FOR INCREASED THROUGHPUT.<br /><br />
                CLICK 'CONTINUE' TO START THE TEST PURGE.
              </div>
              <button className="massive-exec-button" onClick={() => {
                game.waveManager.startWave();
                onSetTutorialStep(5);
              }}>CONTINUE</button>
            </div>
          )}
          {tutorialStep === 5 && <div className="tutorial-ui-empty"></div>}
          {tutorialStep === 6 && (
            <div className="tutorial-window scrollable">
              <div className="popup-title" style={{ color: '#00ff66' }}>PURGE SUCCESSFUL</div>
              
              <div className="manual-text" style={{ fontSize: '0.75rem', color: '#fff', textAlign: 'left', margin: '10px 0', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                  <div className="mini-kernel-container" style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '18px', height: '16px', background: '#00ffcc', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', border: '1px solid #fff' }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 900 }}>SYNTAX KERNEL</span><br />
                    Protect this core to maintain continuity.
                  </div>
                </div>

                <p>&gt; <span style={{ color: 'var(--neon-red)' }}>VITALS:</span> Monitor <b>Integrity</b> (Bottom Right). Use <b>Repair</b> (Bottom Left) if breached.</p>
                <p>&gt; <span style={{ color: 'var(--neon-cyan)' }}>ECONOMY:</span> Hold tokens to earn <b>10% Interest</b> at wave end.</p>

                <div style={{ marginTop: '15px' }}>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: 900, display: 'block', marginBottom: '5px' }}>THREAT SIGNATURES</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[
                      { type: EnemyType.GLIDER, desc: "Standard packet stream." },
                      { type: EnemyType.STRIDER, desc: "50% Pulse MG resistance." },
                      { type: EnemyType.BEHEMOTH, desc: "Heavy bulk tank unit." },
                      { type: EnemyType.FRACTAL, desc: "Boss Core. 10 Kernel Dmg." }
                    ].map(v => {
                      const reg = VISUAL_REGISTRY[v.type];
                      return (
                        <div key={reg.name} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', border: '1px solid #222', display: 'flex', alignItems: 'center', gap: '10px' }} data-enemy={v.type}>
                          <div className="mini-enemy">
                            <div className={`shape ${reg.shape}`} style={reg.shape !== 'triangle' ? { background: reg.colorHex } : { borderBottomColor: reg.colorHex }}></div>
                          </div>
                          <div style={{ fontSize: '0.6rem' }}><b style={{ color: reg.colorHex }}>{reg.name}:</b> {v.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button className="massive-exec-button" onClick={onFinishTutorial}>FINISH ONBOARDING</button>
            </div>
          )}
        </div>
      )}

      {selectedTower && !isPaused && integrity > 0 && (
        <TowerContextMenu
          selectedTower={selectedTower}
          credits={credits}
          upgradeCost={getUpgradeCost(selectedTower)}
          onUpgrade={onUpgradeTower}
          onSell={onSellTower}
          onClose={onCloseTowerContext}
        />
      )}

      {integrity <= 0 && (
        <div className="victory-overlay" style={{ borderColor: 'var(--neon-red)' }}>
          <div className="popup-title" style={{ color: 'var(--neon-red)' }}>SYSTEM_OFFLINE</div>
          <div className="manual-text" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--neon-red)', fontWeight: 900 }}>&gt; CRITICAL BREACH: CORE_INTEGRITY_TERMINATED</p>
            <p>&gt; THE MAINFRAME HAS DESCENDED INTO PERMANENT ENTROPY.</p>
            
            <div className="stats-grid" style={{ marginTop: '20px' }}>
              <div className="stats-item">
                <div className="stats-label">FINAL_SWARM</div>
                <div className="stats-value">{wave}</div>
              </div>
              <div className="stats-item">
                <div className="stats-label">TOTAL_SCORE</div>
                <div className="stats-value" style={{ color: 'var(--neon-red)' }}>{credits.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <button className="massive-exec-button" style={{ background: 'var(--neon-red)' }} onClick={onQuitToMenu}>RETURN TO ROOT</button>
        </div>
      )}

      {hoveredTower && !selectedTower && !isPaused && integrity > 0 && (
        <div className="hover-stats-box">
          <div className="hover-header">
            <span>{hoveredTower.config.name.toUpperCase()}</span>
            <span>v{hoveredTower.level}.0</span>
          </div>
          <div className="hover-row"><span>&gt; DMG_OUTPUT</span><span className="val">{hoveredTower.config.damage * (hoveredTower.level === 2 ? 1.25 : hoveredTower.level === 3 ? 1.5 : 1)}</span></div>
          <div className="hover-row"><span>&gt; FIRE_RATE</span><span className="val">{(60 / hoveredTower.config.rate).toFixed(1)}Hz</span></div>
          <div className="hover-row" style={{ marginTop: '4px', borderTop: '1px dashed #222', paddingTop: '4px' }}>
            <span>&gt; TOTAL_PURGED</span>
            <span className="val green">{Math.floor(hoveredTower.totalDamageDealt)}</span>
          </div>
        </div>
      )}

      <TacticalDashboard
        wave={wave}
        waveName={waveName}
        credits={credits}
        integrity={integrity}
        repairCost={repairCost}
        selectedTurret={selectedTurret}
        gameMode={gameMode}
        isFastForward={isFastForward}
        sysStatusColor={sysStatusColor}
        systemStatusText={systemStatusText}
        isUnlocked={isTowerUnlocked}
        getTowerCount={getTowerCount}
        onPause={() => onTogglePause(true)}
        onToggleFastForward={onToggleFastForward}
        onRepair={onRepair}
        onSelectTurret={onSelectTurret}
        firstTurretRef={firstTurretRef}
      />
    </div>
  );
};

export default GameScreen;
