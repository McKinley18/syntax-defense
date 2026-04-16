import React from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { AudioManager } from '../systems/AudioManager';

export const PauseMenu: React.FC<{ onResume: () => void }> = ({ onResume }) => {
    const handleSaveAndExit = () => {
        StateManager.instance.saveGame();
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
        AudioManager.getInstance().playUiClick();
    };

    const handleQuitWithoutSaving = () => {
        if (window.confirm("ARE YOU SURE? ALL UNSAVED PROGRESS WILL BE LOST.")) {
            StateManager.instance.transitionTo(AppState.MAIN_MENU);
            AudioManager.getInstance().playUiClick();
        }
    };

    const handleSettings = () => {
        StateManager.instance.transitionTo(AppState.DIAGNOSTICS);
        AudioManager.getInstance().playUiClick();
    };

    return (
        <div className="pause-overlay" style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
            backdropFilter: 'blur(4px)',
            pointerEvents: 'auto'
        }}>
            <div className="terminal-box" style={{
                width: '20rem',
                background: 'rgba(0, 10, 25, 0.98)',
                border: '0.12rem solid var(--neon-cyan)',
                padding: '1.2rem',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                transform: 'translateY(-2.5rem)' // CALIBRATED for playable area centering
            }}>
                <div style={{ 
                    color: 'var(--neon-cyan)', 
                    fontSize: '1rem', 
                    fontWeight: 900, 
                    borderBottom: '1px solid rgba(0,255,255,0.2)', 
                    paddingBottom: '0.5rem', 
                    textAlign: 'center',
                    letterSpacing: '3px'
                }}>
                    SYSTEM_PAUSED
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <button className="blue-button" onClick={onResume} style={{ height: '2.4rem', fontSize: '0.85rem' }}>
                        RESUME_OPERATIONS
                    </button>

                    <button className="blue-button" onClick={handleSettings} style={{ height: '2.4rem', fontSize: '0.85rem', background: 'rgba(0,255,255,0.05)' }}>
                        SYSTEM_DIAGNOSTICS
                    </button>

                    <button className="blue-button" onClick={handleSaveAndExit} style={{ height: '2.4rem', fontSize: '0.85rem', background: 'rgba(0,255,255,0.05)' }}>
                        SAVE_&_TERMINATE
                    </button>

                    <button 
                        className="blue-button" 
                        onClick={handleQuitWithoutSaving} 
                        style={{ height: '2.4rem', fontSize: '0.85rem', border: '1px solid #ff3300', color: '#ff3300', background: 'transparent' }}
                    >
                        ABORT_WITHOUT_SAVING
                    </button>
                </div>

                <div style={{ color: '#444', fontSize: '0.55rem', textAlign: 'center', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    OS_v1.0.4 // SESSION_MANAGEMENT_ACTIVE
                </div>
            </div>
        </div>
    );
};
