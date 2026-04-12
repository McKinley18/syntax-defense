import React from 'react';
import TerminalText from '../components/TerminalText';
import { AudioManager } from '../game/systems/AudioManager';

interface SettingsScreenProps {
  isTypingComplete: boolean;
  skipIntro: boolean;
  sfxVolState: number;
  musicVolState: number;
  sfxMuted: boolean;
  ambientMuted: boolean;
  enabledTracks: boolean[];
  integrity: number;
  lifetimeKills: number;
  highestWave: number;
  rank: string;
  resetStatus: string;
  toggleSkipIntro: () => void;
  onPurgeTutorial: () => void;
  onClearStats: () => void;
  handleSfxVol: (e: any) => void;
  handleMusicVol: (e: any) => void;
  toggleSfx: () => void;
  toggleAmbient: () => void;
  toggleTrack: (id: number) => void;
  onPreviewTrack: (id: number) => void;
  onSetScreen: (screen: any) => void;
  setIsTypingComplete: (complete: boolean) => void;
  
  crtEnabled: boolean;
  glitchEffectsEnabled: boolean;
  autoPauseEnabled: boolean;
  showAllRanges: boolean;
  toggleCrt: () => void;
  toggleGlitch: () => void;
  toggleAutoPause: () => void;
  toggleShowRanges: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isTypingComplete,
  skipIntro,
  sfxVolState,
  musicVolState,
  sfxMuted,
  ambientMuted,
  enabledTracks,
  integrity,
  lifetimeKills,
  highestWave,
  rank,
  resetStatus,
  toggleSkipIntro,
  onPurgeTutorial,
  onClearStats,
  handleSfxVol,
  handleMusicVol,
  toggleSfx,
  toggleAmbient,
  toggleTrack,
  onPreviewTrack,
  onSetScreen,
  setIsTypingComplete,
  
  crtEnabled,
  glitchEffectsEnabled,
  autoPauseEnabled,
  showAllRanges,
  toggleCrt,
  toggleGlitch,
  toggleAutoPause,
  toggleShowRanges
}) => {
  const am = AudioManager.getInstance();

  const handleAction = (fn: () => void) => {
    am.playUiClick();
    fn();
  };

  const SwitchButton = ({ active, onToggle, activeLabel = 'ACTIVE', inactiveLabel = 'NULL' }: { active: boolean, onToggle: () => void, activeLabel?: string, inactiveLabel?: string }) => (
    <button 
      className={`blue-button track-toggle ${active ? 'enabled' : 'disabled'}`} 
      onClick={() => handleAction(onToggle)} 
      style={{ 
        width: '100%', 
        background: active ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255, 102, 0, 0.1)',
        borderColor: active ? 'var(--neon-cyan)' : '#ff6600',
        color: active ? 'var(--neon-cyan)' : '#ff6600',
        fontWeight: 900,
        letterSpacing: '2px',
        textShadow: active ? '0 0 8px var(--neon-cyan)' : '0 0 8px #ff6600'
      }}
    >
      {active ? `DISABLE [${activeLabel}]` : `ENABLE [${inactiveLabel}]`}
    </button>
  );

  return (
    <div className="encyclopedia ui-layer">
      <div className="enc-header command-header">
        <span className="prompt static-prompt">&gt;</span>
        <TerminalText key="settings-title" text="EDIT: /SYS/CONFIG/USER_PREFS.JSON" speed={30} onComplete={() => setIsTypingComplete(true)} />
      </div>
      {isTypingComplete && (
        <>
          <div className="enc-content" style={{ pointerEvents: 'auto' }}>
            <div className="settings-grid">
              <div className="settings-module">
                <h3>Interface Protocols</h3>
                <div className="setting-row">
                  <div className="setting-label-row">
                    <span>SKIP SYSTEM BOOT</span>
                  </div>
                  <SwitchButton active={skipIntro} onToggle={toggleSkipIntro} activeLabel="BYPASS" inactiveLabel="STABLE" />
                </div>
                <div className="setting-row" style={{ marginTop: '10px', position: 'relative' }}>
                  <div className="setting-label-row"><span>TUTORIAL DATA</span></div>
                  <button className="blue-button" onClick={() => handleAction(onPurgeTutorial)} style={{ borderColor: 'var(--neon-cyan)', width: '100%' }}>PURGE ONBOARDING CACHE</button>
                  {resetStatus && (
                    <div style={{ 
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '100%',
                      background: 'rgba(0,0,0,0.9)',
                      border: '1px solid #00ff66',
                      padding: '5px',
                      color: '#00ff66', 
                      fontSize: '0.6rem', 
                      textAlign: 'center', 
                      marginTop: '5px',
                      zIndex: 10,
                      boxShadow: '0 0 10px rgba(0, 255, 102, 0.3)'
                    }}>
                      &gt; {resetStatus}
                    </div>
                  )}
                </div>
              </div>

              <div className="settings-module">
                <h3>Mainframe Calibration</h3>
                <div className="setting-row">
                  <div className="setting-label-row"><span>CRT SCANLINES</span></div>
                  <SwitchButton active={crtEnabled} onToggle={toggleCrt} activeLabel="ACTIVE" inactiveLabel="NULL" />
                </div>
                <div className="setting-row" style={{ marginTop: '8px' }}>
                  <div className="setting-label-row"><span>GLITCH EFFECTS</span></div>
                  <SwitchButton active={glitchEffectsEnabled} onToggle={toggleGlitch} activeLabel="ACTIVE" inactiveLabel="NULL" />
                </div>
              </div>

              <div className="settings-module" style={{ gridRow: 'span 2' }}>
                <h3>Audio Engine</h3>
                <div className="setting-row">
                  <div className="setting-label-row"><span>SFX MASTER</span><span>{(sfxVolState * 100).toFixed(0)}%</span></div>
                  <input type="range" min="0" max="1" step="0.05" value={sfxVolState} onChange={(e) => { am.playUiClick(); handleSfxVol(e); }} />
                  <button className="blue-button compact-btn" onClick={() => handleAction(toggleSfx)} style={{ marginTop: '5px' }}>{sfxMuted ? 'UNMUTE SFX' : 'MUTE SFX'}</button>
                </div>
                <div className="setting-row">
                  <div className="setting-label-row"><span>MUSIC MASTER</span><span>{(musicVolState * 100).toFixed(0)}%</span></div>
                  <input type="range" min="0" max="1" step="0.05" value={musicVolState} onChange={(e) => { am.playUiClick(); handleMusicVol(e); }} />
                  <button className="blue-button compact-btn" onClick={() => handleAction(toggleAmbient)} style={{ marginTop: '5px' }}>{ambientMuted ? 'UNMUTE MUSIC' : 'MUTE MUSIC'}</button>
                </div>
                <div className="setting-row">
                  <div className="setting-label-row"><span>ACTIVE PLAYLIST</span></div>
                  <div className="track-list">
                    {[
                      'CORE_LOGIC', 'NEON_BREACH', 'LIQUID_DATA', 'VOID_SIGNAL', 'GRID_RUNNER'
                    ].map((name, id) => (
                      <div key={id} className="track-item">
                        <span className="track-name" onClick={() => handleAction(() => onPreviewTrack(id))} style={{ cursor: 'pointer', color: 'var(--neon-cyan)', textDecoration: 'underline' }}>{name}</span>
                        <button className={`blue-button track-toggle ${enabledTracks[id] ? 'enabled' : 'disabled'}`} onClick={() => handleAction(() => toggleTrack(id))}>
                          {enabledTracks[id] ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="settings-module">
                <h3>Combat Protocols</h3>
                <div className="setting-row">
                  <div className="setting-label-row"><span>AUTO-PAUSE (WAVE END)</span></div>
                  <SwitchButton active={autoPauseEnabled} onToggle={toggleAutoPause} activeLabel="ACTIVE" inactiveLabel="OFF" />
                </div>
                <div className="setting-row" style={{ marginTop: '8px' }}>
                  <div className="setting-label-row"><span>PERMANENT RANGE HUD</span></div>
                  <SwitchButton active={showAllRanges} onToggle={toggleShowRanges} activeLabel="ACTIVE" inactiveLabel="OFF" />
                </div>
              </div>

              <div className="settings-module">
                <h3>System Diagnostics</h3>
                <div className="diagnostics-list">
                  <div className="diag-item"><span>BUILD_ID</span><span className="diag-val">v3.4.0_STABLE</span></div>
                  <div className="diag-item"><span>KERNEL_STABILITY</span><span className="diag-val">{((integrity / 20) * 100).toFixed(0)}%</span></div>
                  <div className="diag-item"><span>LIFETIME_PURGES</span><span className="diag-val">{lifetimeKills.toLocaleString()}</span></div>
                  <div className="diag-item"><span>PEAK_WAVE_INDEX</span><span className="diag-val">{highestWave}</span></div>
                  <div className="diag-item"><span>CLEARANCE_LEVEL</span><span className="diag-val" style={{ color: '#00ff66' }}>{rank}</span></div>
                </div>
                <button className="blue-button" onClick={() => handleAction(onClearStats)} style={{ marginTop: '15px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}>PURGE ALL LIFETIME STATS</button>
              </div>
            </div>
          </div>
          <button className="blue-button back-btn" onClick={() => handleAction(() => { onSetScreen('MENU'); setIsTypingComplete(false); })}>RETURN TO ROOT</button>
        </>
      )}
    </div>
  );
};

export default SettingsScreen;
