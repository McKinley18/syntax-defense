import React, { useEffect, useRef } from 'react';
import { useAppState } from '../hooks/useAppState';
import { AppState, StateManager } from '../../core/StateManager';
import { Engine } from '../../core/Engine';
import { GameWorld } from '../../game/GameWorld';

// Real Screens
import { GameScreen } from '../screens/GameScreen';

/**
 * MAIN LAYOUT: React Composition Hub
 * Orhcestrates Screen transitions based on the StateManager.
 */

export const MainLayout: React.FC = () => {
    const currentState = useAppState();

    const isGameActive = [
        AppState.GAME_PREP,
        AppState.GAME_WAVE,
        AppState.GAME_PAUSED,
        AppState.GAME_OVER
    ].includes(currentState);

    return (
        <div className="syntax-layout-root">
            {/* The Engine Layer (PIXI) */}
            {isGameActive && <GameCanvas />}

            {/* The Presentation Layer (React) */}
            <div className="ui-overlay-layer">
                {currentState === AppState.BOOT && <PlaceholderScreen name="BOOT_SEQUENCE" color="cyan" />}
                {currentState === AppState.MAIN_MENU && <PlaceholderScreen name="MAIN_MENU" color="green" />}
                {currentState === AppState.SETTINGS && <PlaceholderScreen name="SETTINGS_MOD" color="orange" />}
                
                {/* Tactical HUD for Game States */}
                {isGameActive && <GameScreen />}

                {/* GAME OVER Screen Overlay */}
                {currentState === AppState.GAME_OVER && (
                    <div className="game-over-overlay">
                        <h1>SYSTEM_TERMINATED</h1>
                        <p>PERIMETER BREACHED. KERNEL COMPROMISED.</p>
                        <button onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)}>
                            [ RETURN_TO_ROOT ]
                        </button>
                    </div>
                )}
            </div>

            {/* Global Post-Processing Effects (Glitch, CRT) */}
            <div className="vfx-overlay-layer" />
        </div>
    );
};

/**
 * GameCanvas: The PIXI Mounting Point
 * Encapsulates the Engine and GameWorld lifecycle.
 */
const GameCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const initGame = async () => {
            const container = containerRef.current;
            if (!container) return;

            console.log("[MainLayout] Initializing PIXI Engine...");
            
            // Explicitly ensure the container is ready for the PIXI canvas
            await Engine.instance.init(container);
            await GameWorld.instance.init();

            // Manual DOM Check: Verify canvas is present
            if (container.querySelector('canvas')) {
                console.log("[MainLayout] PIXI_CANVAS_MOUNTED_OK");
            } else {
                console.warn("[MainLayout] WARNING: PIXI_CANVAS_MISSING");
            }
        };

        initGame();

        return () => {
            GameWorld.instance.destroy();
            Engine.instance.destroy();
        };
    }, []);

    return <div ref={containerRef} id="game-container" className="game-canvas-container" />;
};

// --- STUB COMPONENTS ---

const PlaceholderScreen: React.FC<{ name: string; color: string }> = ({ name, color }) => {
    const handleInitialize = () => {
        console.log("[PlaceholderScreen] INITIALIZING_SIMULATION...");
        StateManager.instance.transitionTo(AppState.GAME_PREP);
    };

    return (
        <div className="placeholder-screen" style={{ color }}>
            <h1>&gt; {name}</h1>
            <button className="init-button" onClick={handleInitialize}>
                [ INITIALIZE_SIMULATION ]
            </button>
        </div>
    );
};
