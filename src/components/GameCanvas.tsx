import React, { useEffect, useRef, useState } from 'react';
import { Engine } from '../core/Engine';
import { MapManager } from '../systems/MapManager';
import { TowerManager } from '../systems/TowerManager';
import { InputManager } from '../systems/InputManager';
import { PathManager } from '../systems/PathManager';
import { WaveManager } from '../systems/WaveManager';
import { TextureGenerator } from '../utils/TextureGenerator';
import { TacticalHUD } from './TacticalHUD';
import { TutorialOverlay } from './TutorialOverlay';
import { WaveIntelOverlay } from './WaveIntelOverlay';
import { TurretUpgradeOverlay } from './TurretUpgradeOverlay';
import { PauseMenu } from './PauseMenu';
import { TowerType } from '../entities/Tower';
import { StateManager, AppState } from '../core/StateManager';

export const GameCanvas = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [towerCount, setTowerCount] = useState<Record<TowerType, number>>({} as any);
    const [activeSelectedTower, setActiveSelectedTower] = useState<any>(null);
    const [isPaused, setIsPaused] = useState(StateManager.instance.isPaused);
    
    const systemsRef = useRef<{
        mapManager: MapManager,
        towerManager: TowerManager,
        waveManager: WaveManager,
        pathManager: PathManager
    } | null>(null);

    useEffect(() => {
        let isMounted = true;

        const setup = async () => {
            if (!containerRef.current) return;
            
            const engine = Engine.instance;
            await engine.init(containerRef.current);
            
            if (!isMounted) return;

            const app = engine.app;
            TextureGenerator.getInstance().generate(app);

            const pathManager = new PathManager();
            const mapManager = new MapManager();
            const towerManager = new TowerManager(mapManager);
            
            // SYSTEM MOUNTING
            app.stage.addChild(towerManager.getContainer());
            app.stage.addChild(towerManager.getProjectileContainer());

            const waveManager = new WaveManager(mapManager, towerManager, pathManager);
            new InputManager(towerManager, mapManager);
            
            systemsRef.current = { pathManager, mapManager, towerManager, waveManager };

            // INITIAL BOOT TOPOGRAPHY
            pathManager.generatePath(0);
            mapManager.setPathFromCells(pathManager.pathCells);

            app.ticker.add((ticker) => {
                if (systemsRef.current) {
                    const delta = ticker.deltaTime;
                    const { towerManager, waveManager } = systemsRef.current;
                    
                    // SYSTEM HEARTBEAT
                    waveManager.update(delta);
                    towerManager.update(delta, waveManager.enemies);
                    
                    // REACT STATE SYNC
                    if (isPaused !== StateManager.instance.isPaused) {
                        setIsPaused(StateManager.instance.isPaused);
                    }
                    if (app.ticker.lastTime % 5 < 1) {
                        setActiveSelectedTower(towerManager.selectedTower);
                    }
                    if (app.ticker.lastTime % 10 < 1) {
                        setTowerCount(towerManager.getTowerCounts());
                    }
                }
            });

            setIsReady(true);
        };

        setup();
        return () => { isMounted = false; };
    }, []);

    const startWave = () => {
        if (systemsRef.current) {
            const state = StateManager.instance.currentState;
            if (state === AppState.GAME_PREP) {
                systemsRef.current.waveManager.startWave();
            } else if (state === AppState.WAVE_COMPLETED) {
                systemsRef.current.waveManager.confirmIntel();
            }
        }
    };

    return (
        <div className="tactical-theater" style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#050505' }}>
            <div ref={containerRef} id="canvas-container" style={{ width: '100%', height: '100%', display: 'block' }} />
            
            {isReady && (
                <>
                    {/* HUD LAYER */}
                    <TacticalHUD 
                        onStartWave={startWave} 
                        towerCount={towerCount} 
                        waveManager={systemsRef.current?.waveManager} 
                        towerManager={systemsRef.current?.towerManager}
                    />

                    {/* BRIEFING LAYER */}
                    <TutorialOverlay waveManager={systemsRef.current?.waveManager} />
                    {systemsRef.current && <WaveIntelOverlay waveManager={systemsRef.current.waveManager} />}
                    
                    {/* MAINTENANCE LAYER */}
                    {activeSelectedTower && (
                        <TurretUpgradeOverlay 
                            tower={activeSelectedTower} 
                            towerManager={systemsRef.current?.towerManager}
                            onClose={() => systemsRef.current?.towerManager.deselectTower()}
                        />
                    )}

                    {/* SYSTEM STATE LAYER */}
                    {isPaused && (
                        <PauseMenu onResume={() => { StateManager.instance.isPaused = false; setIsPaused(false); }} />
                    )}
                </>
            )}

            {!isReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ffff', fontFamily: 'monospace' }}>
                    INITIALIZING_TACTICAL_ENVIRONMENT...
                </div>
            )}
        </div>
    );
};
