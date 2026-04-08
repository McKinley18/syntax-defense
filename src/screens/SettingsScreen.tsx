import React from 'react';
import TerminalText from '../components/TerminalText';

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
  setIsTypingComplete
}) => {
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
                  <button className={`blue-button track-toggle ${skipIntro ? 'enabled' : 'disabled'}`} onClick={toggleSkipIntro} style={{ width: '100%' }}>{skipIntro ? 'DISABLE' : 'ENABLE'}</button>
                </div>
                <div className="setting-row" style={{ marginTop: '10px' }}>
                  <div className="setting-label-row"><span>TUTORIAL DATA</span></div>
                  <button className="blue-button" onClick={onPurgeTutorial} style={{ borderColor: 'var(--neon-cyan)', width: '100%' }}>PURGE ONBOARDING CACHE</button>
                  {resetStatus && <div style={{ color: '#00ff66', fontSize: '0.6rem', textAlign: 'center', marginTop: '5px' }}>&gt; {resetStatus}</div>}
                </div>
              </div>
              <div className="settings-module" style={{ gridRow: 'span 2' }}>
                <h3>Audio Engine</h3>
                <div className="setting-row">
                  <div className="setting-label-row"><span>SFX MASTER</span><span>{(sfxVolState * 100).toFixed(0)}%</span></div>
                  <input type="range" min="0" max="1" step="0.05" value={sfxVolState} onChange={handleSfxVol} />
                  <button className="blue-button compact-btn" onClick={toggleSfx} style={{ marginTop: '5px' }}>{sfxMuted ? 'UNMUTE SFX' : 'MUTE SFX'}</button>
                </div>
                <div className="setting-row">
                  <div className="setting-label-row"><span>MUSIC MASTER</span><span>{(musicVolState * 100).toFixed(0)}%</span></div>
                  <input type="range" min="0" max="1" step="0.05" value={musicVolState} onChange={handleMusicVol} />
                  <button className="blue-button compact-btn" onClick={toggleAmbient} style={{ marginTop: '5px' }}>{ambientMuted ? 'UNMUTE MUSIC' : 'MUTE MUSIC'}</button>
                </div>
                <div className="setting-row">
                  <div className="setting-label-row"><span>ACTIVE PLAYLIST (TAP NAME TO PREVIEW)</span></div>
                  <div className="track-list">
                    {['HYPNOTIC', 'INDUSTRIAL', 'DATA STREAM', 'KERNEL', 'GLITCH TECH', 'UPLINK'].map((name, id) => (
                      <div key={id} className="track-item">
                        <span className="track-name" onClick={() => onPreviewTrack(id)} style={{ cursor: 'pointer', color: 'var(--neon-cyan)', textDecoration: 'underline' }}>{name}</span>
                        <button className={`blue-button track-toggle ${enabledTracks[id] ? 'enabled' : 'disabled'}`} onClick={() => toggleTrack(id)}>
                          {enabledTracks[id] ? 'ACTIVE' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
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
                <button className="blue-button" onClick={onClearStats} style={{ marginTop: '15px', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}>PURGE ALL LIFETIME STATS</button>
              </div>
            </div>
          </div>
          <button className="cyan-menu-btn back-btn" onClick={() => { onSetScreen('MENU'); setIsTypingComplete(false); }}>RETURN TO ROOT</button>
        </>
      )}
    </div>
  );
};

export default SettingsScreen;
