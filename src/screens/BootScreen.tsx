import React, { useState, useEffect } from 'react';
import TerminalText from '../components/TerminalText';
import { AudioManager } from '../game/systems/AudioManager';

interface BootScreenProps {
  isDistorted: boolean;
  skipIntro: boolean;
  bootPhase: number;
  setBootPhase: (phase: number) => void;
  onAccessRoot: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({
  isDistorted,
  skipIntro,
  bootPhase,
  setBootPhase,
  onAccessRoot
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const [chaosText, setChaosText] = useState("SCANNING");

  // RED/CHAOS TRIGGER (Starts AFTER critical manual purge error completes)
  const isRedMode = bootPhase >= 15.3;

  // CHAOTIC HEADER LOGIC
  useEffect(() => {
    if (!isRedMode) return;
    const itv = setInterval(() => {
        const processes = ["OVERFLOW", "SEG_FAULT", "MEM_LEAK", "NULL_PTR", "CORE_DUMP", "IO_ERROR", "STACK_SMASH"];
        setChaosText(processes[Math.floor(Math.random() * processes.length)] + ": 0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase());

        // Trigger subtle digital activity audio
        const am = AudioManager.getInstance();
        if (am.isReady()) am.playDataChatter();
    }, 150);
    return () => clearInterval(itv);
  }, [isRedMode]);

  useEffect(() => {
    if (bootPhase === 6.6) {
        setInternalProgress(0);
        const timer = setInterval(() => {
            setInternalProgress(p => {
                if (p >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setBootPhase(7), 800);
                    return 100;
                }
                return p + 1;
            });
        }, 50);
        return () => clearInterval(timer);
    }
  }, [bootPhase, setBootPhase]);

  return (
    <div className="audio-splash ui-layer">
      {/* PERSISTENT BOOT HEADER */}
      {!skipIntro && bootPhase >= 1 && bootPhase < 18 && (
        <>
          <div className="menu-breadcrumbs" style={{ color: isRedMode ? 'var(--neon-red)' : '#aaa', textShadow: isRedMode ? '0 0 10px var(--neon-red)' : '0 0 5px rgba(255,255,255,0.2)' }}>
            {isRedMode ? `CRITICAL_FAILURE@${chaosText}` : 'GUEST@MAINFRAME:~/UNAUTHORIZED$'}
          </div>
          <div className="menu-diagnostics">
            <div className="diag-line" style={{ color: isRedMode ? 'var(--neon-red)' : '#ccc' }}>SESSION: {isRedMode ? 'COMPROMISED' : 'INSECURE'}</div>
            <div className="diag-line" style={{ color: bootPhase >= 14 ? 'var(--neon-red)' : '#999', fontWeight: isRedMode ? 900 : 400 }}>
              THREAT_LEVEL: {isRedMode ? chaosText : (bootPhase >= 14 ? 'CRITICAL' : 'SCANNING')}
            </div>
          </div>
        </>
      )}

      <div className={`boot-container ${isDistorted || isRedMode ? 'distorted' : ''}`} style={{ fontFamily: 'monospace' }}>
        
        {bootPhase > 0 && bootPhase < 18 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* ACT 1 */}
            {bootPhase >= 1 && bootPhase < 4.5 && (
              <>
                <div>&gt; <TerminalText text="auth --request-access --identity=ARCHITECT" speed={60} onComplete={() => setBootPhase(2)} humanTyping={true} isCommand={true} /></div>
                {bootPhase >= 2 && <div style={{ color: '#00ff66' }}>&gt; <TerminalText text="ACCESS_REQUEST_RECEIVED... SCANNING_BIOMETRICS... AUTHORIZED." speed={40} onComplete={() => setBootPhase(4)} /></div>}
                {bootPhase >= 4 && <div style={{ color: '#00ff66' }}>&gt; <TerminalText text="WELCOME BACK, ARCHITECT." speed={40} onComplete={() => setTimeout(() => setBootPhase(4.5), 1000)} /></div>}
              </>
            )}

            {/* ACT 2 */}
            {bootPhase >= 5 && bootPhase < 13.5 && (
              <>
                <div>&gt; <TerminalText text="sys --mount-tactical-logic --force" speed={60} onComplete={() => setBootPhase(6.3)} humanTyping={true} isCommand={true} /></div>
                {bootPhase >= 6.3 && <div style={{ color: '#00ff66' }}>&gt; <TerminalText text="VERIFYING_MOUNT_POINT: /dev/core_kernel ... [READY]" speed={40} onComplete={() => setTimeout(() => setBootPhase(6.5), 1000)} /></div>}
                {bootPhase >= 6.5 && <div style={{ color: '#00ff66' }}>&gt; <TerminalText text="MOUNTING_LOGIC_PACKETS... INITIATING_DOWNLOAD." speed={40} onComplete={() => setTimeout(() => setBootPhase(6.6), 2500)} /></div>}
                {bootPhase >= 6.6 && (
                  <div style={{ width: '250px', height: '15px', border: '1px solid #00ff66', position: 'relative', overflow: 'hidden', margin: '10px 0' }}>
                    <div style={{ height: '100%', background: '#00ff66', width: `${internalProgress}%` }}></div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: internalProgress > 50 ? '#000' : '#00ff66', fontWeight: 900 }}>
                      {internalProgress}% LOADED
                    </div>
                  </div>
                )}
                {bootPhase >= 7 && <div style={{ color: '#00ff66', fontSize: '0.75rem' }}>&gt; <TerminalText text="PACKET_01: KERNEL_CORE... [OK]" speed={40} onComplete={() => setBootPhase(7.1)} /></div>}
                {bootPhase >= 7.1 && <div style={{ color: '#00ff66', fontSize: '0.75rem' }}>&gt; <TerminalText text="PACKET_02: TACTICAL_ASSETS... [OK]" speed={40} onComplete={() => setBootPhase(7.2)} /></div>}
                {bootPhase >= 7.2 && <div style={{ color: '#00ff66', fontSize: '0.75rem' }}>&gt; <TerminalText text="PACKET_03: NEURAL_MESH... [OK]" speed={40} onComplete={() => setBootPhase(7.3)} /></div>}
                {bootPhase >= 7.3 && <div style={{ color: '#00ff66', fontSize: '0.75rem' }}>&gt; <TerminalText text="PACKET_04: CRYPTO_KEY... [OK]" speed={40} onComplete={() => setTimeout(() => setBootPhase(9), 1000)} /></div>}
                {bootPhase >= 9 && <div style={{ color: '#00ff66', fontSize: '0.75rem' }}>&gt; <TerminalText text="Status: Successful." speed={40} onComplete={() => setTimeout(() => setBootPhase(11.1), 500)} /></div>}
                {bootPhase >= 11.1 && <div style={{ color: '#00ff66', fontSize: '0.75rem' }}>&gt; <TerminalText text="Access: Granted." speed={40} onComplete={() => setBootPhase(13)} /></div>}
              </>
            )}

            {/* ACT 3: THE BREACH */}
            {bootPhase >= 13.5 && (
              <>
                <div style={{ color: isRedMode ? 'var(--neon-red)' : '#fff' }}>
                  &gt; <TerminalText text="sys --scan-integrity --deep" speed={60} onComplete={() => setTimeout(() => setBootPhase(14.2), 800)} humanTyping={true} isCommand={true} isGlitched={isRedMode} permanentGlitch={true} />
                </div>
                {bootPhase >= 14.2 && <div style={{ color: isRedMode ? 'var(--neon-red)' : '#00ff66', fontSize: '0.7rem', display: 'flex', flexWrap: 'wrap', gap: '8px', opacity: 0.7 }}><TerminalText text="SCANNING_MEM_SECTOR_0x1... OK. SCANNING_MEM_SECTOR_0x2... OK. SCANNING_MEM_SECTOR_0x3..." speed={15} onComplete={() => setBootPhase(14.3)} isGlitched={isRedMode} permanentGlitch={true} /></div>}
                {bootPhase >= 14.3 && <div style={{ color: isRedMode ? 'var(--neon-red)' : '#00ff66' }}>&gt; <TerminalText text=">> MALICIOUS_DATA_DETECTED: [STORM_LEVEL_7]" speed={40} onComplete={() => setBootPhase(14.5)} isGlitched={isRedMode} permanentGlitch={true} /></div>}
                {bootPhase >= 14.5 && (
                  <div style={{ color: isRedMode ? 'var(--neon-red)' : '#00ff66' }}>
                    &gt; <TerminalText text="Proceed with automated containment? (Y/N)" speed={40} onComplete={() => setBootPhase(14.6)} isGlitched={isRedMode} permanentGlitch={true} />
                    {bootPhase >= 14.6 && <span style={{ color: isRedMode ? 'var(--neon-red)' : '#fff', marginLeft: '8px' }}><TerminalText text="Y" speed={150} delay={500} onComplete={() => setTimeout(() => setBootPhase(14.8), 500)} humanTyping={true} isCommand={true} isGlitched={isRedMode} permanentGlitch={true} /></span>}
                  </div>
                )}
                {bootPhase >= 14.8 && <div style={{ color: isRedMode ? 'var(--neon-red)' : '#00ff66' }}>&gt; <TerminalText text="INITIATING_AUTOMATED_CONTAINMENT... [FAILED]" speed={40} onComplete={() => setBootPhase(14.9)} isGlitched={isRedMode} permanentGlitch={true} /></div>}
                {bootPhase >= 14.9 && <div style={{ color: isRedMode ? 'var(--neon-red)' : '#fff' }}>&gt; <TerminalText text="sys --purge-auto --all --force" speed={60} onComplete={() => setBootPhase(15.1)} humanTyping={true} isCommand={true} isGlitched={isRedMode} permanentGlitch={true} /></div>}
                {bootPhase >= 15.1 && <div style={{ color: 'var(--neon-red)', fontSize: '0.7rem' }}>&gt; <TerminalText text="FORCING_PURGE... ERROR_0x88... UNABLE_TO_CONTAIN... OVERLOAD_DETECTED..." speed={15} onComplete={() => setBootPhase(15.2)} decryptionMode={true} permanentGlitch={true} isGlitched={true} /></div>}
                {bootPhase >= 15.2 && <div style={{ color: 'var(--neon-red)', fontWeight: 900 }}>&gt; <TerminalText text="CRITICAL_ERROR: MANUAL_PURGE_FAILED [KERNEL_OVERLOAD]" speed={40} onComplete={() => setBootPhase(15.3)} decryptionMode={true} permanentGlitch={true} isGlitched={true} /></div>}
                {bootPhase >= 15.3 && <div style={{ color: 'var(--neon-red)' }}>&gt; <TerminalText text="INITIATING_SAFE_MODE_SEQUENCE... [CRITICAL_FAILURE]" speed={40} onComplete={() => setBootPhase(15.5)} decryptionMode={true} permanentGlitch={true} isGlitched={true} /></div>}
                {bootPhase >= 15.5 && <div style={{ color: 'var(--neon-red)' }}>&gt; <TerminalText text="RELINQUISHING_SYSTEM_CONTROL... MANUAL_DEFENSE_REQUIRED." speed={40} onComplete={() => setBootPhase(15.6)} isGlitched={true} permanentGlitch={true} /></div>}
                {bootPhase >= 15.6 && <div style={{ marginTop: '10px' }}><button className="blue-button" onClick={onAccessRoot} style={{ padding: '10px 25px', fontSize: '0.8rem', borderColor: 'var(--neon-red)', color: 'var(--neon-red)', animation: 'blink 0.5s infinite', letterSpacing: '2px' }}>&gt; ACCESS SYSTEM ROOT</button></div>}
              </>
            )}
          </div>
        ) : (bootPhase >= 18 || skipIntro) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#00ff66' }}>&gt; SYSTEM PRE-AUTHORIZED. [SKIP_BOOT ACTIVE]</div>
            <button className="blue-button" onClick={onAccessRoot} style={{ padding: '12px 30px', fontSize: '0.8rem', letterSpacing: '2px', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', width: 'fit-content' }}>&gt; ACCESS SYSTEM ROOT</button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BootScreen;
