import React from 'react';
import TerminalText from '../components/TerminalText';
import { AudioManager } from '../game/systems/AudioManager';

interface BootScreenProps {
  isDistorted: boolean;
  skipIntro: boolean;
  bootPhase: number;
  bootProgress: number;
  bootLogs: string[];
  secondaryLogs: string[];
  showAuthorized: boolean;
  showPreserve: boolean;
  showSuccessful: boolean;
  showCaution: boolean;
  showImminent: boolean;
  isReadyGlitched: boolean;
  audioReady: boolean;
  wakeAudioSystem: () => void;
  setBootPhase: (phase: number) => void;
}

const BootScreen: React.FC<BootScreenProps> = ({
  isDistorted,
  skipIntro,
  bootPhase,
  bootProgress,
  bootLogs,
  secondaryLogs,
  showAuthorized,
  showPreserve,
  showSuccessful,
  showCaution,
  showImminent,
  isReadyGlitched,
  audioReady,
  wakeAudioSystem,
  setBootPhase
}) => {
  return (
    <div className="audio-splash ui-layer" onClick={() => {
      if (bootPhase === 0 || bootPhase >= 18 || skipIntro) {
        wakeAudioSystem();
      }
    }}>
      {/* PERSISTENT BOOT HEADER */}
      {!skipIntro && (bootPhase > 0 || !audioReady) && (
        <>
          <div className="menu-breadcrumbs" style={{ color: '#444' }}>GUEST@MAINFRAME:~/UNAUTHORIZED$</div>
          <div className="menu-diagnostics" style={{ border: '1px solid rgba(255, 51, 0, 0.1)' }}>
            <div className="diag-line" style={{ color: '#666' }}>SESSION: INSECURE</div>
            <div className="diag-line" style={{ color: bootPhase >= 14 ? 'var(--neon-red)' : '#666' }}>
              THREAT_LEVEL: {bootPhase >= 14 ? 'CRITICAL' : 'SCANNING'}
            </div>
          </div>
        </>
      )}

      <div className={`boot-container ${isDistorted ? 'distorted' : ''}`} style={{ fontFamily: 'monospace' }}>
        {bootPhase === 0 && !skipIntro ? (
          <div 
            onClick={(e) => { e.stopPropagation(); wakeAudioSystem(); }}
            style={{ color: 'var(--neon-cyan)', fontSize: '1rem', cursor: 'pointer', animation: 'pulse 2s infinite', pointerEvents: 'auto', padding: '20px', border: '1px solid var(--neon-cyan)', background: 'rgba(0,0,0,0.9)' }}
          >
            &gt; MAIN_CORE_STABLE<br />
            &gt; SYSTEM_READY: [ INITIALIZE_MAINFRAME ]
          </div>
        ) : !skipIntro ? (
          <>
            {bootPhase >= 1 && (
              <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '8px' }}>
                &gt; <TerminalText text="auth --request-access --identity=ARCHITECT" speed={35} onComplete={() => setBootPhase(2)} />
                {bootPhase === 2 && <span className="terminal-cursor"></span>}
              </div>
            )}
            {bootPhase >= 3 && (
              <div style={{ color: '#00ff66', fontSize: '0.85rem', marginBottom: '16px' }}>
                <TerminalText text="ACCESS_REQUEST_RECEIVED... SCANNING_BIOMETRICS... AUTHORIZED." speed={20} onComplete={() => setBootPhase(4)} />
                {bootPhase === 4 && <span className="terminal-cursor"></span>}
                {bootPhase >= 4 && (
                  <div style={{ color: 'var(--neon-red)', fontSize: '0.6rem', marginTop: '2px', opacity: 0.6, animation: 'hardware-dim 0.5s infinite' }}>&gt;&gt; CAUTION: UNKNOWN_PACKET_DETECTED</div>
                )}
              </div>
            )}
            
            {bootPhase >= 5 && (
              <div style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <TerminalText text="ESTABLISHING SESSION... WELCOME BACK, ARCHITECT." speed={20} onComplete={() => setBootPhase(6)} />
                {bootPhase === 6 && <span className="terminal-cursor"></span>}
              </div>
            )}
            
            {bootPhase >= 6.1 && (
              <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '8px' }}>
                &gt; <TerminalText text="sys --mount-tactical-logic --force" speed={35} onComplete={() => setBootPhase(6.2)} />
                {(bootPhase === 6.2) && <span className="terminal-cursor"></span>}
              </div>
            )}
            {bootPhase >= 6.5 && (
              <div style={{ color: '#00ff66', fontSize: '0.85rem', marginBottom: '12px' }}>
                <TerminalText text="MOUNTING_LOGIC_PACKETS... INITIATING_DOWNLOAD." speed={20} onComplete={() => { if (bootPhase === 6.5) setBootPhase(6.6); }} />
                {bootPhase === 6.5 && <span className="terminal-cursor"></span>}
              </div>
            )}

            {bootPhase >= 6.6 && (
              <div style={{ width: '250px', height: '15px', border: '1px solid #00ff66', position: 'relative', overflow: 'hidden', marginBottom: '15px' }}>
                <div style={{ height: '100%', background: '#00ff66', width: `${bootProgress}%` }}></div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: bootProgress > 50 ? '#000' : '#00ff66', fontWeight: 900 }}>
                  {bootProgress}% LOADED
                </div>
              </div>
            )}
            
            {bootPhase >= 7 && bootLogs.map((log, i) => (
              <div key={i} style={{ color: '#00ff66', fontSize: '0.75rem', marginBottom: '4px' }}>&gt; {log}</div>
            ))}

            {bootPhase >= 10 && (
              <div style={{ color: '#00ff66', fontSize: '0.75rem', marginTop: '10px' }}>
                <div>&gt; <TerminalText text="Status: Successful." speed={25} onComplete={() => setBootPhase(11)} />{bootPhase === 11 && <span className="terminal-cursor"></span>}</div>
                {bootPhase >= 12 && (
                  <div style={{ marginTop: '4px' }}>&gt; <TerminalText text="Access: Granted." speed={25} onComplete={() => setBootPhase(13)} />{bootPhase === 13 && <span className="terminal-cursor"></span>}</div>
                )}
                {bootPhase >= 14 && (
                  <div style={{ marginTop: '8px', color: 'var(--neon-red)', fontSize: '0.85rem' }}>
                    <TerminalText text=">> CRITICAL_ALERT: MALICIOUS_DATA_INBOUND [STORM_LEVEL_7]" speed={25} onComplete={() => setBootPhase(14.1)} />
                    {bootPhase === 14.1 && <span className="terminal-cursor"></span>}
                  </div>
                )}
              </div>
            )}

            {bootPhase >= 14.5 && (
              <div style={{ color: '#fff', fontSize: '0.85rem', marginTop: '12px' }}>
                <TerminalText text="Proceed with manual containment? (Y/N)" speed={35} onComplete={() => setBootPhase(14.6)} isGlitched={true} glitchProbability={0.08} />
                {bootPhase === 14.6 && <span className="terminal-cursor"></span>}
              </div>
            )}

            {bootPhase >= 14.7 && (
              <div style={{ color: '#fff', fontSize: '0.85rem', marginTop: '4px' }}>
                &gt; <TerminalText text="Y" speed={150} onComplete={() => setBootPhase(14.8)} isGlitched={true} />
                {bootPhase === 14.8 && <span className="terminal-cursor"></span>}
              </div>
            )}

            {bootPhase >= 14.9 && (
              <div style={{ color: '#fff', fontSize: '0.85rem', marginTop: '8px' }}>
                &gt; <TerminalText text="sys --purge-auto --all" speed={35} onComplete={() => setBootPhase(15)} isGlitched={true} glitchProbability={0.1} />
                {bootPhase === 15 && <span className="terminal-cursor"></span>}
              </div>
            )}

            {bootPhase >= 15.2 && (
              <div style={{ color: 'var(--neon-red)', fontSize: '0.8rem', marginTop: '8px', fontWeight: 900 }}>
                <TerminalText text="ERROR: AUTO_PURGE_FAILED [GLITCH_OVERLOAD]" speed={20} onComplete={() => setBootPhase(15.4)} isGlitched={true} glitchProbability={0.15} />
              </div>
            )}

            {bootPhase >= 15.5 && (
              <div style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', marginTop: '12px' }}>
                <TerminalText text="MANUAL_OVERRIDE_REQUIRED... STAND_BY_FOR_HANDOFF." speed={20} onComplete={() => setBootPhase(15.6)} isGlitched={true} />
              </div>
            )}

            {bootPhase >= 15.6 && (
              <div style={{ color: '#00ff66', fontSize: '0.75rem', marginTop: '10px' }}>
                &gt; READY TO {isReadyGlitched ? (
                  <span style={{ color: 'var(--neon-red)', fontWeight: 900 }}>WIPE USER SYSTEM</span>
                ) : (
                  "INITIALIZE SYSTEM"
                )}
                {!isReadyGlitched && bootPhase === 15.6 && (
                  <div style={{ marginTop: '15px' }}>
                    <button 
                      className="blue-button" 
                      onClick={() => setBootPhase(16)}
                      style={{ padding: '8px 20px', fontSize: '0.7rem', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}
                    >
                      &gt; INITIALIZE
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <div style={{ color: '#00ff66', fontSize: '0.85rem', marginBottom: '8px' }}>&gt; SYSTEM PRE-AUTHORIZED. [SKIP_BOOT ACTIVE]</div>
            <div style={{ marginTop: '25px' }}>
              <button className="blue-button" onClick={wakeAudioSystem} style={{ padding: '12px 30px', fontSize: '0.8rem', letterSpacing: '2px', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
                &gt; ACCESS SYSTEM ROOT
              </button>
            </div>
          </div>
        )}
        {(bootPhase >= 18 && !skipIntro) && (
          <div style={{ marginTop: '25px', opacity: 0, animation: 'fade-in 0.5s 0.5s forwards' }}>
            <button className="blue-button" onClick={wakeAudioSystem} style={{ padding: '12px 30px', fontSize: '0.8rem', letterSpacing: '2px', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}>
              &gt; ACCESS SYSTEM ROOT
            </button>
          </div>
        )}
      </div>
      {isDistorted && <div className="distorted-overlay"></div>}
    </div>
  );
};

export default BootScreen;
