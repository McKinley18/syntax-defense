import React from 'react';
import TerminalText from '../components/TerminalText';

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
  wakeAudioSystem,
  setBootPhase
}) => {
  return (
    <div className="audio-splash ui-layer" onClick={wakeAudioSystem}>
      <div className={`boot-container ${isDistorted ? 'distorted' : ''}`} style={{ position: 'absolute', top: '20px', left: '20px', textAlign: 'left', fontFamily: 'monospace' }}>
        {!skipIntro ? (
          <>
            <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '4px' }}>
              &gt; <TerminalText text="auth --request-access" speed={35} onComplete={() => setBootPhase(1)} />
              {bootPhase === 1 && <span className="terminal-cursor"></span>}
            </div>
            {bootPhase >= 2 && (
              <div style={{ color: '#00ff66', fontSize: '0.85rem', marginBottom: '12px' }}>
                <TerminalText text="User access authorized [CLEARANCE_CONFIRMED]" speed={20} onComplete={() => setBootPhase(3)} />
                {bootPhase === 3 && <span className="terminal-cursor"></span>}
              </div>
            )}
            
            {bootPhase >= 4 && (
              <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '4px' }}>
                &gt; <TerminalText text="sys --init-protocols" speed={35} onComplete={() => setBootPhase(5)} />
                {bootPhase === 5 && <span className="terminal-cursor"></span>}
              </div>
            )}
            {bootPhase >= 5 && (
              <div style={{ color: '#00ff66', fontSize: '0.85rem', marginBottom: '12px' }}>
                <TerminalText text="INITIATING DEFENSE PROTOCOL DOWNLOAD..." speed={20} onComplete={() => setBootPhase(6)} />
                {bootPhase === 6 && <span className="terminal-cursor"></span>}
              </div>
            )}

            {bootPhase >= 6 && (
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
            {bootPhase >= 9 && (
              <div style={{ color: '#00ff66', fontSize: '0.75rem', marginTop: '10px' }}>
                <div>&gt; <TerminalText text="Status: Successful." speed={25} onComplete={() => setBootPhase(10)} />{bootPhase === 10 && <span className="terminal-cursor"></span>}</div>
                {bootPhase >= 11 && (
                  <div style={{ marginTop: '4px' }}>&gt; <TerminalText text="Access: Granted." speed={25} onComplete={() => setBootPhase(12)} />{bootPhase === 12 && <span className="terminal-cursor"></span>}</div>
                )}
                {bootPhase >= 13 && (
                  <div style={{ marginTop: '8px', color: 'var(--neon-red)' }}>
                    &gt; <TerminalText text="Caution: threats imminent. Take necessary precautions." speed={25} onComplete={() => setBootPhase(14)} />
                    {bootPhase === 14 && <span className="terminal-cursor"></span>}
                  </div>
                )}
              </div>
            )}
            {bootPhase >= 15 && (
              <div style={{ color: '#00ff66', fontSize: '0.75rem', marginTop: '10px' }}>
                &gt; READY TO {isReadyGlitched ? (
                  <span style={{ color: 'var(--neon-red)', fontWeight: 900 }}>WIPE USER SYSTEM</span>
                ) : (
                  bootPhase >= 16 ? "INITIALIZE SYSTEM" : <TerminalText text="INITIALIZE SYSTEM" speed={25} onComplete={() => setBootPhase(16)} />
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
