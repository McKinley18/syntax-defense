import React, { useEffect, useRef, useState } from 'react';
import { Engine } from '../core/Engine';
import { MapManager } from '../systems/MapManager';
import { TowerManager } from '../systems/TowerManager';
import { InputManager } from '../systems/InputManager';
import { PathManager } from '../systems/PathManager';
import { WaveManager } from '../systems/WaveManager';
import { TextureGenerator } from '../utils/TextureGenerator';
import { Kernel } from '../entities/Kernel';
import { TacticalHUD } from './TacticalHUD';
import { TutorialOverlay } from './TutorialOverlay';
import { WaveIntelOverlay } from './WaveIntelOverlay';
import { TurretUpgradeOverlay } from './TurretUpgradeOverlay';
import { PauseMenu } from './PauseMenu';
import { TowerType } from '../entities/Tower';
import { StateManager, AppState } from '../core/StateManager';
import * as PIXI from 'pixi.js';

export const GameCanvas = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [activeSelectedTower, setActiveSelectedTower] = useState<any>(null);
    const [isPaused, setIsPaused] = useState(StateManager.instance.isPaused);
    
    const systemsRef = useRef<{
        mapManager: MapManager,
        towerManager: TowerManager,
        waveManager: WaveManager,
        pathManager: PathManager,
        kernel: Kernel
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
            const kernel = new Kernel();
            const waveManager = new WaveManager(mapManager, towerManager, pathManager, kernel);
            
            // --- HIGH-PRIORITY MOUNTING SEQUENCE ---
            app.stage.removeChildren();
            app.stage.addChild(mapManager.getContainer());        // Layer 0: Map/Grid
            app.stage.addChild(waveManager.getContainer());      // Layer 1: Enemies
            app.stage.addChild(kernel.container);               // Layer 2: Objective
            app.stage.addChild(towerManager.getProjectileContainer()); // Layer 3: FX
            app.stage.addChild(towerManager.getContainer());     // Layer 4: Turrets (TOP FOR INTERACTION)
            
            // Interaction Shield for entire field
            app.stage.hitArea = new PIXI.Rectangle(0, 0, 1600, 720);
            
            new InputManager(app, mapManager, towerManager);
            
            systemsRef.current = { pathManager, mapManager, towerManager, waveManager, kernel };

            const initializeTopology = (wave: number) => {
                pathManager.generatePath(wave);
                mapManager.setPathFromCells(pathManager.pathCells);
                kernel.setPosition(pathManager.endNodePos.x, pathManager.endNodePos.y);
                kernel.update(0); 
            };

            if (StateManager.instance.previousState === AppState.MAIN_MENU) {
                const saveData = StateManager.instance.loadGame();
                if (saveData && saveData.towers) {
                    initializeTopology(saveData.currentWave);
                    towerManager.loadTowers(saveData.towers);
                } else {
                    initializeTopology(0);
                }
            } else {
                initializeTopology(StateManager.instance.currentWave);
            }

            app.ticker.add((ticker) => {
                if (systemsRef.current) {
                    const delta = ticker.deltaTime * StateManager.instance.gameSpeed;
                    const { towerManager, waveManager, kernel } = systemsRef.current;
                    waveManager.update(delta);
                    towerManager.update(delta, waveManager.enemies);
                    kernel.update(delta);
                    if (isPaused !== StateManager.instance.isPaused) setIsPaused(StateManager.instance.isPaused);
                    
                    // SYNCED SELECTION (Every frame for instant response)
                    if (activeSelectedTower !== towerManager.selectedTower) {
                        setActiveSelectedTower(towerManager.selectedTower);
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
            if (state === AppState.GAME_PREP || state === AppState.WAVE_PREP) systemsRef.current.waveManager.startWave();
            else if (state === AppState.WAVE_COMPLETED) systemsRef.current.waveManager.confirmIntel();
        }
    };

    return (
        <div className="tactical-theater" style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#050505' }}>
            <div ref={containerRef} id="canvas-container" style={{ width: '100%', height: '100%', display: 'block' }} />
            
            {isReady && (
                <>
                    <TacticalHUD onStartWave={startWave} waveManager={systemsRef.current?.waveManager} towerManager={systemsRef.current?.towerManager} />
                    <TutorialOverlay waveManager={systemsRef.current?.waveManager} />
                    {systemsRef.current && <WaveIntelOverlay waveManager={systemsRef.current.waveManager} />}
                    {activeSelectedTower && systemsRef.current && (
                        <TurretUpgradeOverlay tower={activeSelectedTower} towerManager={systemsRef.current.towerManager} onClose={() => systemsRef.current?.towerManager.deselectTower()} />
                    )}
                    {isPaused && (
                        <PauseMenu onResume={() => { StateManager.instance.isPaused = false; setIsPaused(false); }} towerManager={systemsRef.current?.towerManager} />
                    )}
                </>
            )}
        </div>
    );
};
