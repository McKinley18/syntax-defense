import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { BootSequence } from './components/ui/BootSequence';
import { MainMenu } from './components/MainMenu';
import { StudioSplash } from './components/ui/StudioSplash';
import { PowerOn } from './components/PowerOn';
import { SystemCheck } from './components/SystemCheck';
import { SystemArchive } from './components/SystemArchive';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { StateManager, AppState } from './core/StateManager';
import { AudioManager } from './systems/AudioManager';

function App() {
  const [state, setState] = useState<AppState>(StateManager.instance.currentState);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [needsWake, setNeedsWake] = useState(false);

  useEffect(() => {
    // 1. Synchronize StateManager with Component State
    const unbind = StateManager.instance.subscribe((newState) => {
      setState(newState);
    });

    // 2. Orientation Logic
    const checkOrientation = () => {
        const portrait = window.innerHeight > window.innerWidth;
        setIsPortrait(portrait);

        // AUTO-BOOT WITH SKIP LOGIC
        if (!portrait && StateManager.instance.currentState === AppState.ORIENTATION_LOCK) {
            if (StateManager.instance.skipCinematics) {
                setNeedsWake(true); // Gate entry behind a user click to wake audio
            } else {
                StateManager.instance.transitionTo(AppState.POWER_ON);
            }
        }
    };

    window.addEventListener('resize', checkOrientation);
    checkOrientation();

    return () => {
        unbind();
        window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  const handleWake = async () => {
      await AudioManager.getInstance().resume();
      setNeedsWake(false);
      StateManager.instance.transitionTo(AppState.MAIN_MENU);
  };

  return (
    <div className="game-wrapper" style={{ 
        backgroundColor: '#000', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        margin: 0, padding: 0, overflow: 'hidden'
    }}>
      {/* ORIENTATION BARRIER */}
      <div className="orientation-barrier" style={{ display: isPortrait ? 'flex' : 'none', position: 'absolute', inset: 0, zIndex: 1000000, backgroundColor: '#000', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00ffff', textAlign: 'center', fontFamily: 'monospace', padding: '2rem' }}>
          <div className="rotation-icon-container" style={{ marginBottom: '2rem' }}>
              <svg viewBox="0 0 64 64" width="80" height="80">
                  <rect x="20" y="8" width="24" height="48" rx="4" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" />
                  <circle cx="32" cy="50" r="2" fill="var(--neon-cyan)" />
                  <path d="M48 20 A 24 24 0 0 1 48 44" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" strokeLinecap="round" />
                  <path d="M44 40 L48 44 L52 40" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" strokeLinecap="round" />
              </svg>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '1rem' }}>TACTICAL_ERROR: PORTRAIT_MODE</div>
          <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              Operator, the Syntax Defense Kernel requires landscape orientation for tactical deployment. 
              <br/><br/>
              [ PLEASE ROTATE DEVICE ]
          </div>
      </div>

      <div className="game-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
        {/* INTERACTION GATES */}
        {needsWake && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 100000, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={handleWake} style={{ backgroundColor: 'transparent', color: '#00ffff', border: '1px solid #00ffff', padding: '20px 40px', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 900, boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}>
                    [ ESTABLISH SYSTEM LINK ]
                </button>
            </div>
        )}

        <div className="crt-vignette"></div>
        {state === AppState.POWER_ON && <PowerOn />}
        {state === AppState.SYSTEM_CHECK && <SystemCheck />}
        {state === AppState.TERMINAL_BOOT && <BootSequence />}
        {state === AppState.STUDIO_SPLASH && <StudioSplash />}
        {state === AppState.MAIN_MENU && <MainMenu />}
        {state === AppState.ARCHIVE && <SystemArchive />}
        {state === AppState.DIAGNOSTICS && <SystemDiagnostics />}
        {(state === AppState.GAME_PREP || state === AppState.GAME_WAVE || state === AppState.WAVE_COMPLETED || state === AppState.WAVE_PREP) && <GameCanvas />}
        {state === AppState.GAME_OVER && (
            <div style={{ color: 'red', textAlign: 'center', fontFamily: 'monospace', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
                <h1>SYSTEM_TERMINATED</h1>
                <button onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)} style={{ backgroundColor: 'transparent', color: 'red', border: '1px solid red', padding: '10px 20px', cursor: 'pointer' }}>
                    [ REBOOT ]
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
