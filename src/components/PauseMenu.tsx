import React, { useState } from 'react';
import { StateManager, AppState } from '../core/StateManager';
import { AudioManager } from '../systems/AudioManager';

export const PauseMenu: React.FC<{ onResume: () => void, towerManager?: any }> = ({ onResume, towerManager }) => {
    const [isConfirmingAbort, setIsConfirmingAbort] = useState(false);

    const handleSaveAndExit = () => {
        if (towerManager) {
            StateManager.instance.saveGame(towerManager.towers);
        }
        StateManager.instance.transitionTo(AppState.MAIN_MENU);
        AudioManager.getInstance().playUiClick();
    };

    const handleAbortMission = () => {
        StateManager.instance.abortSession();
        AudioManager.getInstance().playUiClick();
    };

    const handleSettings = () => {
        StateManager.instance.transitionTo(AppState.DIAGNOSTICS);
        AudioManager.getInstance().playUiClick();
    };

    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 50000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            pointerEvents: 'auto'
        }}>
            <div style={{
                width: '28rem', background: 'rgba(0,10,25,0.98)', border: '2px solid var(--neon-cyan)',
                padding: '2rem', boxShadow: '0 0 50px rgba(0,255,255,0.2)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '4px' }}>PAUSE_INITIATED</div>
                    <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, marginTop: '0.4rem' }}>SYSTEM_HALTED</div>
                </div>

                {!isConfirmingAbort ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <button className="blue-button" onClick={onResume} style={{ height: '3.5rem', fontSize: '1.1rem', background: 'var(--neon-cyan)', color: '#000' }}>
                            RESUME_INFILTRATION
                        </button>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <button className="blue-button" onClick={handleSaveAndExit} style={{ height: '2.4rem', fontSize: '0.85rem', background: 'rgba(0,255,255,0.05)' }}>
                                SAVE_&_EXIT
                            </button>
                            <button className="blue-button" onClick={handleSettings} style={{ height: '2.4rem', fontSize: '0.85rem', background: 'rgba(0,255,255,0.05)' }}>
                                SYSTEM_CFG
                            </button>
                        </div>

                        <button className="blue-button" onClick={() => setIsConfirmingAbort(true)} style={{ height: '2.4rem', fontSize: '0.85rem', color: '#ff3300', borderColor: '#ff330066' }}>
                            ABORT_MISSION
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid #ff330033', background: 'rgba(255,0,0,0.05)' }}>
                        <div style={{ color: '#ff3300', fontSize: '0.75rem', fontWeight: 900, textAlign: 'center' }}>WARNING: ALL_UNSAVED_PROGRESS_WILL_BE_PURGED</div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleAbortMission} style={{ flex: 1, padding: '1rem', background: '#ff3300', color: '#000', border: 'none', fontWeight: 900, cursor: 'pointer' }}>
                                CONFIRM_ABORT
                            </button>
                            <button onClick={() => setIsConfirmingAbort(false)} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid #444', color: '#666', fontWeight: 900, cursor: 'pointer' }}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ color: '#444', fontSize: '0.55rem', textAlign: 'center', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    OS_v1.1.0 // SESSION_MANAGEMENT_ACTIVE
                </div>
            </div>
        </div>
    );
};
