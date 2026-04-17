import React, { useState, useEffect } from 'react';
import { useAppState, useTransition } from '../hooks/useAppState';
import { useEconomy } from '../hooks/useEconomy';
import { AppState } from '../../core/StateManager';
import { GameWorld } from '../../game/GameWorld';
import { TowerType } from '../../game/systems/TowerManager';
import { Kernel } from '../../game/entities/Kernel';

/**
 * GAME SCREEN: Tactical Command HUD
 * The primary UI overlay during gameplay.
 * 
 * Capabilities:
 * - Economy Monitoring (Scrap / Interest)
 * - Kernel Integrity (HP / Repair)
 * - Tower Construction Selection
 * - Wave Execution Control
 */

export const GameScreen: React.FC = () => {
    const currentState = useAppState();
    const credits = useEconomy();
    const transition = useTransition();

    const [integrity, setIntegrity] = useState(Kernel.instance.integrity);
    const [wave, setWave] = useState(1);
    const [isWaveActive, setIsWaveActive] = useState(false);

    useEffect(() => {
        const unsub = Kernel.instance.subscribe(setIntegrity);
        
        // Sync Wave Info every 200ms
        const timer = setInterval(() => {
            const wm = GameWorld.instance.waveManager;
            if (wm) {
                setWave(wm.currentWave);
                setIsWaveActive(wm.isWaveActive);
            }
        }, 200);

        return () => {
            unsub();
            clearInterval(timer);
        };
    }, []);

    const handleExecuteWave = () => {
        GameWorld.instance.waveManager.startWave();
    };

    const handleSelectTower = (type: TowerType) => {
        GameWorld.instance.towerManager.startPlacement(type);
    };

    return (
        <div className="game-screen-root ui-overlay">
            {/* TOP BAR: System Status */}
            <div className="hud-header">
                <div className="status-block">
                    <span className="label">SYSTEM_INTEGRITY:</span>
                    <span className="value" style={{ color: integrity > 5 ? '#00ff66' : '#ff3300' }}>
                        {integrity * 5}%
                    </span>
                </div>
                <div className="status-block">
                    <span className="label">ACTIVE_WAVE:</span>
                    <span className="value">00{wave}</span>
                </div>
                <div className="status-block credits">
                    <span className="label">RECLAIMED_SCRAP:</span>
                    <span className="value">{credits}</span>
                </div>
            </div>

            {/* SIDE BAR: Construction Queue */}
            <div className="hud-sidebar">
                <div className="sidebar-header">CONSTRUCTION_QUEUE</div>
                {Object.values(TowerType).map(type => (
                    <button key={type} className="tower-btn" onClick={() => handleSelectTower(type)}>
                        [{type}]
                        <span className="cost">250_CR</span>
                    </button>
                ))}
            </div>

            {/* BOTTOM BAR: Tactical Controls */}
            <div className="hud-footer">
                <div className="tactical-controls">
                    {!isWaveActive && currentState === AppState.GAME_PREP ? (
                        <button className="execute-btn" onClick={handleExecuteWave}>
                            [ EXECUTE_DEFENSE_WAVE ]
                        </button>
                    ) : (
                        <div className="wave-active-indicator">WAVE_IN_PROGRESS...</div>
                    )}
                </div>
                
                <button className="terminate-btn" onClick={() => transition(AppState.MAIN_MENU)}>
                    [ TERMINATE_SIMULATION ]
                </button>
            </div>

            {/* Post-Processing (CRT Scanlines / Static) */}
            <div className="hud-scanlines" />
        </div>
    );
};
