import React, { useState } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { AudioManager } from '../systems/AudioManager';

export const PauseMenu: React.FC<{ onResume: () => void, towerManager?: any }> = ({ onResume, towerManager }) => {
    const [isConfirmingAbort, setIsConfirmingAbort] = useState(false);

    const handleSaveAndExit = () => {
        if (towerManager) {
            StateManager.instance.saveGame(towerManager.towers);
        } else {
            StateManager.instance.saveGame();
        }
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
        AudioManager.getInstance().playUiClick();
    };

    const handleQuitWithoutSaving = () => {
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
        AudioManager.getInstance().playUiClick();
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
                width: '22rem',
                background: 'rgba(0, 10, 25, 0.98)',
                border: `0.12rem solid ${isConfirmingAbort ? '#ff3300' : 'var(--neon-cyan)'}`,
                padding: '1.5rem',
                boxShadow: `0 0 40px ${isConfirmingAbort ? 'rgba(255, 51, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.3s ease'
            }}>
                
                {!isConfirmingAbort ? (
                    <>
                        <div style={{ 
                            color: 'var(--neon-cyan)', fontSize: '1rem', fontWeight: 900, 
                            borderBottom: '1px solid rgba(0,255,255,0.2)', paddingBottom: '0.5rem', 
                            textAlign: 'center', letterSpacing: '3px'
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
                                SAVE_&_EXIT
                            </button>

                            <button 
                                className="blue-button" 
                                onClick={() => { setIsConfirmingAbort(true); AudioManager.getInstance().playUiClick(); }} 
                                style={{ height: '2.4rem', fontSize: '0.85rem', border: '1px solid #ff3300', color: '#ff3300', background: 'transparent' }}
                            >
                                ABORT_WITHOUT_SAVING
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ 
                            color: '#ff3300', fontSize: '1rem', fontWeight: 900, 
                            borderBottom: '1px solid rgba(255,51,0,0.2)', paddingBottom: '0.5rem', 
                            textAlign: 'center', letterSpacing: '2px'
                        }}>
                            CRITICAL_WARNING
                        </div>

                        <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                            <div style={{ fontSize: '0.8rem', color: '#ff3300', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                                ABORT WITHOUT SAVING?
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#666', lineHeight: 1.4 }}>
                                ALL UNSAVED PROGRESS WILL BE PERMANENTLY PURGED FROM THE KERNEL BUFFER.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                            <button 
                                className="blue-button" 
                                onClick={() => setIsConfirmingAbort(false)}
                                style={{ flex: 1, height: '2.4rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444' }}
                            >
                                CANCEL
                            </button>
                            <button 
                                className="blue-button" 
                                onClick={handleQuitWithoutSaving}
                                style={{ flex: 1, height: '2.4rem', fontSize: '0.8rem', background: '#ff3300', color: '#fff', border: 'none', fontWeight: 900 }}
                            >
                                CONFIRM_PURGE
                            </button>
                        </div>
                    </>
                )}

                <div style={{ color: '#444', fontSize: '0.55rem', textAlign: 'center', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    OS_v1.1.0 // SESSION_MANAGEMENT_ACTIVE
                </div>
            </div>
        </div>
    );
};
