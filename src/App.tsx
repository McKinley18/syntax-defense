import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { BootSequence } from './intro/BootSequence';
import { MainMenu } from './components/MainMenu';
import { StudioSplash } from './intro/StudioSplash';
import { MapDebug } from './components/MapDebug';
import { SystemArchive } from './components/SystemArchive';
import { SystemDiagnostics } from './components/SystemDiagnostics';
import { StateManager, AppState } from './core/StateManager';
import { AudioManager } from './systems/AudioManager';

function App() {
  const [state, setState] = useState<AppState>(StateManager.instance.currentState);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [needsWake, setNeedsWake] = useState(true); 

  useEffect(() => {
    const unbind = StateManager.instance.subscribe('state', (newState) => {
      setState(newState);
    });

    const updateScaling = () => {
        const userScale = StateManager.instance.uiScale;
        document.documentElement.style.fontSize = `clamp(10px, ${1.8 * userScale}vh, 26px)`;
    };

    const unbindScale = StateManager.instance.subscribe('uiScale', updateScaling);

    const checkOrientation = () => {
        const portrait = window.innerHeight > window.innerWidth;
        setIsPortrait(portrait);
    };

    const handleKeys = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'd') StateManager.instance.transitionTo(AppState.MAP_DEBUG);
    };

    window.addEventListener('resize', () => {
        checkOrientation();
        updateScaling();
    });
    window.addEventListener('keydown', handleKeys);
    
    checkOrientation();
    updateScaling();

    return () => {
        unbind();
        unbindScale();
        window.removeEventListener('resize', checkOrientation);
        window.removeEventListener('keydown', handleKeys);
    };
  }, []);

  const handleWake = async () => {
      await AudioManager.getInstance().resume();
      setNeedsWake(false);
      
      const s = StateManager.instance;
      if (s.skipCinematics) {
          s.transitionTo(AppState.MAIN_MENU);
      } else {
          s.transitionTo(AppState.TERMINAL_BOOT);
      }
  };

  // Only show barrier if strictly portrait and likely a mobile device
  const showBarrier = isPortrait && window.innerWidth < 1000;

  return (
    <div className="game-wrapper" style={{ 
        backgroundColor: '#000', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        margin: 0, padding: 0, overflow: 'hidden'
    }}>
      <div className="orientation-barrier" style={{ 
          display: showBarrier ? 'flex' : 'none', 
          position: 'absolute', inset: 0, zIndex: 1000000, 
          backgroundColor: '#050505', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', 
          color: '#00ffff', textAlign: 'center', 
          fontFamily: "'Courier New', Courier, monospace", padding: '2rem' 
      }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '4px' }}>[ TACTICAL_ERROR ]</div>
          <div style={{ opacity: 0.8, fontSize: '1rem', lineHeight: 1.6 }}>
              UNSUPPORTED_RESOLUTION: PORTRAIT_MODE_DETECTED.
              <br/>
              LANDSCAPE_ORIENTATION_REQUIRED_FOR_SYSTEM_LINK.
              <br/><br/>
              <span style={{ color: '#fff', fontWeight: 900, animation: 'blink 1s infinite alternate' }}>[ PLEASE ROTATE DEVICE ]</span>
          </div>
      </div>

      <div className="game-container" style={{ 
          width: '100%', height: '100%', position: 'relative',
          opacity: showBarrier ? 0 : 1, // Use opacity instead of hidden for smoother recovery
          transition: 'opacity 0.3s ease'
      }}>
        {needsWake && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 100000, backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={handleWake} style={{ backgroundColor: 'transparent', color: '#00ffff', border: '1px solid #00ffff', padding: '20px 40px', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 900, boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}>
                    [ ESTABLISH SYSTEM LINK ]
                </button>
            </div>
        )}

        <div className="crt-vignette"></div>
        {state === AppState.MAP_DEBUG && <MapDebug />}
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

      <style>{`
        @keyframes blink { from { opacity: 1; } to { opacity: 0.3; } }
      `}</style>
    </div>
  );
}

export default App;
