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
  repairCost: number;
  selectedTurret: number;
  gameMode: string;
  isWaveActive: boolean;
  isFastForward: boolean;
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
  repairCost,
  selectedTurret,
  gameMode,
  isWaveActive,
  isFastForward,
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
  setSelectedTower
}) => {
  if (!game) return null;

  const tutorialStepRef = useRef(tutorialStep);
  useEffect(() => {
    tutorialStepRef.current = tutorialStep;
  }, [tutorialStep]);

  useEffect(() => {
    if (!game) return;
    
    const handleWaveEnd = () => {
      if (isTutorialActive && tutorialStepRef.current === 5) {
        onSetTutorialStep(6);
      }
    };

    const handleTowerPlaced = () => {
      console.log("Node placed. Tutorial active:", isTutorialActive, "Current step:", tutorialStepRef.current);
      if (isTutorialActive && tutorialStepRef.current === 3) {
        console.log("Advancing to Step 4 (Upgrade Popup)");
        onSetTutorialStep(4);
      }
    };

    const handleTowerSelected = (t: Tower) => {
      setSelectedTower(t);
    };

    const handleTowerUpgraded = () => {
      // No longer needed for tutorial flow
    };

    game.waveManager.onWaveEnd = handleWaveEnd;
    game.towerManager.onTowerPlaced = handleTowerPlaced;
    game.towerManager.onTowerSelected = handleTowerSelected;
    game.towerManager.onTowerUpgraded = handleTowerUpgraded;

  }, [game, isTutorialActive, tutorialStep, onSetTutorialStep, setSelectedTower]);

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
            <button className="cyan-menu-btn back-btn" onClick={onQuitToMenu} style={{ marginTop: '20px' }}>RETURN TO ROOT</button>
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
                <button className="blue-button" onClick={() => { onTogglePause(false); /* show tutorial logic */ }}>HOW TO PLAY</button>
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
        <div className="victory-overlay ui-layer">
          <div className="popup-title">WAVE {wave} COMPLETE</div>
          <div className="manual-text" style={{ textAlign: 'center', marginBottom: '8px', fontSize: '0.9rem', color: '#00ff66' }}>&gt; SWARM PURGE SUCCESSFUL. ANALYSIS COMPLETE.</div>
          <div className="stats-grid">
            <div className="stats-item"><div className="stats-label">ENEMIES DELETED</div><div className="stats-value">+{waveSummary.totalKills}</div></div>
            <div className="stats-item"><div className="stats-label">TOKENS EARNED</div><div className="stats-value">+{Math.abs(waveSummary.kills)}c</div></div>
            <div className="stats-item"><div className="stats-label">POINTS EARNED</div><div className="stats-value">+{waveSummary.points}</div></div>
            <div className="stats-item"><div className="stats-label">TOTAL INCOME</div><div className="stats-value">+{waveSummary.total}c</div></div>
          </div>
          <button className="massive-exec-button" style={{ marginTop: '10px' }} onClick={() => { onSetShowWaveSummary(false); onPrepareWave(true); onSetShowCombatIntel(true); }}>VIEW NEXT SWARM INTEL</button>
        </div>
      )}
      {gamePhase === 'PREP' && !showWaveSummaryPopup && showCombatIntel && !isPaused && integrity > 0 && !isTutorialActive && (
        <div className="pre-wave-overlay ui-layer">
          <div className="popup-title">SWARM DATA DETECTED</div>
          <div className="manual-text" style={{ fontSize: '0.75rem', color: 'var(--neon-blue)', marginBottom: '10px' }}>&gt; ANALYZING MISSION: {waveName}... SCANNING VIRAL SIGNATURES...</div>
          {activeGlitch !== 'NONE' && (
            <div style={{ fontSize: '0.7rem', color: 'var(--neon-red)', textAlign: 'center', fontWeight: 900, border: '1px solid var(--neon-red)', padding: '5px', marginBottom: '10px' }}>CAUTION: SYSTEM {activeGlitch} DETECTED</div>
          )}
          <div className="intel-row-horizontal">
            {upcomingEnemies.map((entry, idx) => {
              const reg = VISUAL_REGISTRY[entry.type];
              if (!reg) return null;
              return (
                <div key={idx} className="intel-card-minimal">
                  <div className="symbol-only">
                    <div className={`shape ${reg.shape}`} style={reg.shape === 'triangle' ? { borderBottomColor: reg.colorHex, borderBottomWidth: '20px', borderLeftWidth: '10px', borderRightWidth: '10px' } : { background: reg.colorHex, width: '20px', height: '20px' }}></div>
                  </div>
                  <div className="intel-label-small">{reg.name} (x{entry.count})</div>
                </div>
              );
            })}
          </div>
          <button className="massive-exec-button" style={{ marginTop: '10px', padding: '10px', fontSize: '0.8rem' }} onClick={() => { onExecuteWave(); onSetShowCombatIntel(false); }}>EXECUTE DEFENSE PROTOCOL</button>
        </div>
      )}

      {isTutorialActive && !isPaused && (
        <div className="tutorial-ui ui-layer">
          {tutorialStep === 0 && (
            <div className="pre-wave-overlay">
              <div className="popup-title" style={{ color: 'var(--neon-red)' }}>THREAT DETECTED</div>
              <div className="manual-text" style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'center', margin: '15px 0' }}>
                &gt; WARNING: VIRAL DATA INTRUSION DETECTED.<br /><br />
                SYSTEM ARCHITECT: INITIALIZE DEFENSE PROTOCOLS IMMEDIATELY.
              </div>
              <button className="massive-exec-button" onClick={() => onSetTutorialStep(1)}>INITIALIZE</button>
            </div>
          )}
          {tutorialStep === 1 && (
            <>
              <div className="tutorial-pointer" style={{ left: tilePos.x, top: tilePos.y - 10 }}>SELECT PULSE MG PROTOCOL</div>
              <div className="tutorial-highlight" style={{ left: tilePos.x - 50, top: tilePos.y, width: 100, height: 115 }}></div>
            </>
          )}
          {tutorialStep === 2 && (
            <div className="pre-wave-overlay">
              <div className="popup-title">DEFENSE NODES</div>
              <div className="manual-text" style={{ fontSize: '0.8rem', color: '#fff', textAlign: 'center', margin: '15px 0' }}>
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
            <div className="pre-wave-overlay">
              <div className="popup-title">SYSTEM UPGRADES</div>
              <div className="manual-text" style={{ fontSize: '0.8rem', color: '#fff', textAlign: 'center', margin: '15px 0' }}>
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
            <div className="pre-wave-overlay" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
              <div className="popup-title" style={{ color: '#00ff66' }}>PURGE SUCCESSFUL</div>
              
              <div className="manual-text" style={{ fontSize: '0.8rem', color: '#fff', textAlign: 'left', margin: '15px 0', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                  <div className="mini-kernel-container" style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', inset: '0', border: '1px solid #0066ff', borderRadius: '50%', opacity: 0.3 }}></div>
                    <div style={{ position: 'absolute', inset: '10px', border: '2px solid #00ffff', borderRadius: '50%', opacity: 0.5, animation: 'rotate-phone 4s infinite linear' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '24px', height: '20px', background: '#00ffcc', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', border: '2px solid #fff' }}></div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 900, fontSize: '1rem' }}>THE SYNTAX KERNEL</span><br />
                    This core is your system's lifeblood. Protect it from viral breaches to maintain operational continuity.
                  </div>
                </div>

                <p>&gt; <span style={{ color: 'var(--neon-red)' }}>HEALTH & VITALS:</span> Monitor the <b>Kernel Integrity</b> bar (red/cyan) at the <b>Bottom Right</b>. Use "REPAIR KERNEL" (Bottom Left) to fix breaches using tokens.</p>
                
                <p>&gt; <span style={{ color: 'var(--neon-cyan)' }}>ECONOMY ENGINE:</span> <b>Tokens</b> (currency) are shown at the <b>Bottom Right</b>. Purging viruses grants bounties. Holding tokens earns <b>10% Interest</b> at wave completion.</p>

                <div style={{ marginTop: '20px' }}>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: 900, display: 'block', marginBottom: '8px' }}>VIRAL DATABASE (THREAT SIGNATURES)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { type: EnemyType.GLIDER, desc: "Standard packet stream. High speed, low bulk." },
                      { type: EnemyType.STRIDER, desc: "Resistant to Pulse MG (50% DMG reduction)." },
                      { type: EnemyType.BEHEMOTH, desc: "Heavy bulk data. High priority, slow movement." },
                      { type: EnemyType.FRACTAL, desc: "Boss Unit. Deals 10 Kernel Damage on breach." }
                    ].map(v => {
                      const reg = VISUAL_REGISTRY[v.type];
                      return (
                        <div key={reg.name} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className={`shape ${reg.shape}`} style={reg.shape === 'triangle' ? { borderBottomColor: reg.colorHex, borderBottomWidth: '16px', borderLeftWidth: '8px', borderRightWidth: '8px', flexShrink: 0 } : { background: reg.colorHex, width: '16px', height: '16px', flexShrink: 0 }}></div>
                          <div style={{ fontSize: '0.7rem' }}>
                            <span style={{ color: reg.colorHex, fontWeight: 900 }}>{reg.name}:</span> {v.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p style={{ marginTop: '20px', color: '#888', fontStyle: 'italic', fontSize: '0.75rem', borderTop: '1px solid #222', paddingTop: '10px' }}>&gt; ARCHITECT: ONBOARDING COMPLETE. ALL DEFENSE PROTOCOLS AUTHORIZED.</p>
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

      <TacticalDashboard
        wave={wave}
        waveName={waveName}
        credits={credits}
        integrity={integrity}
        repairCost={repairCost}
        selectedTurret={selectedTurret}
        gameMode={gameMode}
        isWaveActive={isWaveActive}
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
