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

    // PERSISTENT SHAKE INTENSITY
    const shakeIntensity = useRef(0);

    useEffect(() => {
        const handleShake = (e: any) => { shakeIntensity.current = e.detail; };
        window.addEventListener('syndef-shake', handleShake);

        const unsub = StateManager.instance.subscribe('isPaused', (val) => {
            setIsPaused(val);
        });

        return () => {
            unsub();
            window.removeEventListener('syndef-shake', handleShake);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const setup = async () => {
            if (!containerRef.current) return;
            
            const engine = Engine.instance;
            await engine.init(containerRef.current);
            if (!isMounted) return;

            const app = engine.app;
            if (!app) return;
            
            TextureGenerator.getInstance().generate(app);

            const pathManager = new PathManager();
            const mapManager = new MapManager();
            const towerManager = new TowerManager(mapManager);
            const kernel = new Kernel();
            const waveManager = new WaveManager(mapManager, towerManager, pathManager, kernel);
            
            app.stage.removeChildren();
            app.stage.addChild(mapManager.getContainer());       
            app.stage.addChild(waveManager.getContainer());      
            app.stage.addChild(kernel.container);               
            app.stage.addChild(towerManager.getProjectileContainer()); 
            app.stage.addChild(towerManager.getContainer());     
            
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
                    initializeTopology(1);
                }
            } else {
                initializeTopology(StateManager.instance.currentWave);
            }

            const masterTicker = (ticker: PIXI.Ticker) => {
                if (!isMounted) return;

                // 1. SYNC SELECTION
                if (systemsRef.current) {
                    const currentSelected = systemsRef.current.towerManager.selectedTower;
                    if (activeSelectedTower !== currentSelected) {
                        setActiveSelectedTower(currentSelected);
                    }
                }

                // 2. SCREEN SHAKE
                if (shakeIntensity.current > 0) {
                    const sx = (Math.random() - 0.5) * shakeIntensity.current;
                    const sy = (Math.random() - 0.5) * shakeIntensity.current;
                    if (containerRef.current) {
                        containerRef.current.style.transform = `translate(${sx}px, ${sy}px)`;
                    }
                    shakeIntensity.current *= 0.9; 
                    if (shakeIntensity.current < 0.1) {
                        shakeIntensity.current = 0;
                        if (containerRef.current) containerRef.current.style.transform = '';
                    }
                }

                // 3. ENGINE PAUSE
                if (StateManager.instance.isPaused) {
                    if (app.ticker.started) app.ticker.stop();
                    return;
                }
                if (!app.ticker.started) app.ticker.start();

                // 4. SYSTEMS UPDATE
                if (systemsRef.current) {
                    const delta = ticker.deltaTime * StateManager.instance.gameSpeed;
                    const { towerManager, waveManager, kernel } = systemsRef.current;
                    waveManager.update(delta);
                    towerManager.update(delta, waveManager.enemies);
                    kernel.update(delta);
                    if (isPaused !== StateManager.instance.isPaused) setIsPaused(StateManager.instance.isPaused);
                }
            };

            app.ticker.add(masterTicker);
            setIsReady(true);
        };

        setup();
        return () => { 
            isMounted = false; 
            // Cleanup PIXI to prevent memory leaks on exit
            Engine.instance.app?.ticker.stop();
        };
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
            <div ref={containerRef} id="canvas-container" style={{ width: '100%', height: '100%', display: 'block', transition: 'transform 0.05s linear' }} />
            
            {isReady && (
                <>
                    <TacticalHUD onStartWave={startWave} waveManager={systemsRef.current?.waveManager} towerManager={systemsRef.current?.towerManager} />
                    <TutorialOverlay waveManager={systemsRef.current?.waveManager} />
                    {systemsRef.current && <WaveIntelOverlay waveManager={systemsRef.current.waveManager} />}
                    {activeSelectedTower && (
                        <TurretUpgradeOverlay 
                            tower={activeSelectedTower} 
                            towerManager={systemsRef.current!.towerManager} 
                            onClose={() => {
                                systemsRef.current?.towerManager.deselectTower();
                                setActiveSelectedTower(null);
                            }} 
                        />
                    )}
                    {isPaused && (
                        <PauseMenu onResume={() => { StateManager.instance.isPaused = false; setIsPaused(false); }} towerManager={systemsRef.current?.towerManager} />
                    )}
                </>
            )}
        </div>
    );
};
