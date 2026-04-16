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

  useEffect(() => {
    const handleInteraction = () => {
        AudioManager.getInstance().resume();
        window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);

    const unsubscribe = StateManager.instance.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="game-wrapper" style={{ 
        backgroundColor: '#000', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
    }}>
      {/* ORIENTATION ENFORCEMENT */}
      <div className="orientation-barrier">
          <div className="barrier-title">TACTICAL_ERROR: PORTRAIT_MODE</div>
          <div className="barrier-body">
              Operator, the Syntax Defense Kernel requires 16:9 landscape orientation for full tactical deployment. 
              <br/><br/>
              [ PLEASE ROTATE DEVICE ]
          </div>
      </div>

      {/* State Debugger (Will show in top left) */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#333', fontSize: '10px', zIndex: 9999, pointerEvents: 'none' }}>
        SYSTEM_STATE: {AppState[state]}
      </div>

      <div className="game-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                <button 
                    onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}
                    style={{ backgroundColor: 'transparent', color: 'red', border: '1px solid red', padding: '10px 20px', cursor: 'pointer' }}
                >
                    [ REBOOT ]
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;
