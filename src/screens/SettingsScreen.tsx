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
                    <span style={{ color: skipIntro ? 'var(--neon-cyan)' : '#666' }}>{skipIntro ? 'ENABLED' : 'DISABLED'}</span>
                  </div>
                  <button className={`blue-button track-toggle ${skipIntro ? 'enabled' : 'disabled'}`} onClick={() => handleAction(toggleSkipIntro)} style={{ width: '100%' }}>{skipIntro ? 'DISABLE' : 'ENABLE'}</button>
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
                  <div className="setting-label-row"><span>CRT SCANLINES</span><span style={{ color: crtEnabled ? 'var(--neon-cyan)' : '#666' }}>{crtEnabled ? 'ACTIVE' : 'NULL'}</span></div>
                  <button className={`blue-button track-toggle ${crtEnabled ? 'enabled' : 'disabled'}`} onClick={() => handleAction(toggleCrt)} style={{ width: '100%' }}>{crtEnabled ? 'DISABLE' : 'ENABLE'}</button>
                </div>
                <div className="setting-row" style={{ marginTop: '8px' }}>
                  <div className="setting-label-row"><span>GLITCH EVENTS</span><span style={{ color: glitchEffectsEnabled ? 'var(--neon-cyan)' : '#666' }}>{glitchEffectsEnabled ? 'ACTIVE' : 'NULL'}</span></div>
                  <button className={`blue-button track-toggle ${glitchEffectsEnabled ? 'enabled' : 'disabled'}`} onClick={() => handleAction(toggleGlitch)} style={{ width: '100%' }}>{glitchEffectsEnabled ? 'DISABLE' : 'ENABLE'}</button>
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
                  <div className="setting-label-row"><span>ACTIVE PLAYLIST (TAP NAME TO PREVIEW)</span></div>
                  <div className="track-list">
                    {[
                      'AMBIENT TECH', 'INDUSTRIAL DEPTH', 'LIQUID DATA', 'CORE SEQUENCER', 'GHOST VOICES', 'UPLINK SYNC',
                      'NEON NIGHTS', 'GRID RUNNER', 'SYSTEM ERROR', 'VIRTUAL HORIZON', 'CORE BREACH',
                      'CYBER PUNK', 'DEEP TECH', 'ACID LOGIC', 'NEURAL NET'
                    ].map((name, id) => (
                      <div key={id} className="track-item">
                        <span className="track-name" onClick={() => handleAction(() => onPreviewTrack(id))} style={{ cursor: 'pointer', color: 'var(--neon-cyan)', textDecoration: 'underline' }}>{name}</span>
                        <button className={`blue-button track-toggle ${enabledTracks[id] ? 'enabled' : 'disabled'}`} onClick={() => handleAction(() => toggleTrack(id))}>
                          {enabledTracks[id] ? 'ACTIVE' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="settings-module">
                <h3>Combat Protocols</h3>
                <div className="setting-row">
                  <div className="setting-label-row"><span>AUTO-PAUSE (WAVE END)</span><span style={{ color: autoPauseEnabled ? 'var(--neon-cyan)' : '#666' }}>{autoPauseEnabled ? 'ACTIVE' : 'OFF'}</span></div>
                  <button className={`blue-button track-toggle ${autoPauseEnabled ? 'enabled' : 'disabled'}`} onClick={() => handleAction(toggleAutoPause)} style={{ width: '100%' }}>{autoPauseEnabled ? 'DISABLE' : 'ENABLE'}</button>
                </div>
                <div className="setting-row" style={{ marginTop: '8px' }}>
                  <div className="setting-label-row"><span>PERMANENT RANGE HUD</span><span style={{ color: showAllRanges ? 'var(--neon-cyan)' : '#666' }}>{showAllRanges ? 'ACTIVE' : 'OFF'}</span></div>
                  <button className={`blue-button track-toggle ${showAllRanges ? 'enabled' : 'disabled'}`} onClick={() => handleAction(toggleShowRanges)} style={{ width: '100%' }}>{showAllRanges ? 'DISABLE' : 'ENABLE'}</button>
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
