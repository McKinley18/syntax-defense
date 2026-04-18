import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';
import { MapManager, TILE_SIZE, GRID_COLS, GRID_ROWS } from '../systems/MapManager';
import { PathManager } from '../systems/PathManager';
import { Kernel } from '../entities/Kernel';
import { StateManager, AppState } from '../core/StateManager';

/**
 * MAP ARCHITECT SANDBOX v11.0: Forced Entity Sync
 * Displays the Kernel at the end of the path with immediate frame synchronization.
 */
export const MapDebug: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseCoord, setMouseCoord] = useState({ x: 1, y: 1 });
    
    const systemsRef = useRef<{
        map: MapManager,
        path: PathManager,
        kernel: Kernel,
        markerContainer: PIXI.Container
    } | null>(null);

    useEffect(() => {
        let isMounted = true;
        const initSandbox = async () => {
            if (!containerRef.current) return;
            const engine = Engine.instance;
            await engine.init(containerRef.current);
            if (!isMounted) return;
            
            const app = engine.app;
            app.stage.removeChildren(); 
            
            const map = new MapManager();
            const path = new PathManager();
            const kernel = new Kernel();
            const markerContainer = new PIXI.Container();

            app.stage.addChild(map.getContainer());
            app.stage.addChild(kernel.container);
            app.stage.addChild(markerContainer);

            app.stage.hitArea = new PIXI.Rectangle(0, 0, 1600, 560);
            app.stage.eventMode = 'static';

            systemsRef.current = { map, path, kernel, markerContainer };

            const onMove = (e: PIXI.FederatedPointerEvent) => {
                const localPos = app.stage.toLocal(e.global);
                const ux = Math.floor(localPos.x / TILE_SIZE) + 1;
                const uy = (GRID_ROWS - 1) - Math.floor(localPos.y / TILE_SIZE) + 1;
                setMouseCoord({ x: Math.max(1, Math.min(40, ux)), y: Math.max(1, Math.min(14, uy)) });
            };

            const onTap = (e: PIXI.FederatedPointerEvent) => {
                const localPos = app.stage.toLocal(e.global);
                const ux = Math.floor(localPos.x / TILE_SIZE) + 1;
                const uy = (GRID_ROWS - 1) - Math.floor(localPos.y / TILE_SIZE) + 1;
                placeMarker(ux, uy);
            };
            
            app.stage.on('pointermove', onMove);
            app.stage.on('pointertap', onTap);

            regenerate();

            const tick = (ticker: PIXI.Ticker) => {
                if (systemsRef.current && isMounted) {
                    systemsRef.current.kernel.update(ticker.deltaTime);
                }
            };
            app.ticker.add(tick);
            app.renderer.render(app.stage);

            return () => {
                isMounted = false;
                app.stage.off('pointermove', onMove);
                app.stage.off('pointertap', onTap);
                app.ticker.remove(tick);
                systemsRef.current = null;
            };
        };
        initSandbox();
    }, []);

    const placeMarker = (ux: number, uy: number) => {
        if (!systemsRef.current) return;
        const gx = ux - 1;
        const gy = (GRID_ROWS - 1) - (uy - 1);
        const marker = new PIXI.Graphics();
        marker.rect(gx * TILE_SIZE + 2, gy * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4)
            .fill({ color: 0xffffff, alpha: 0.3 }).stroke({ color: 0xffffff, width: 2 });
        const label = new PIXI.Text({
            text: `(${ux},${uy})`,
            style: { fill: 0xffffff, fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }
        });
        label.position.set(gx * TILE_SIZE + 4, gy * TILE_SIZE + 4);
        marker.addChild(label);
        systemsRef.current.markerContainer.addChild(marker);
    };

    const regenerate = () => {
        if (!systemsRef.current) return;
        const { map, path, kernel, markerContainer } = systemsRef.current;
        path.generatePath(Math.floor(Math.random() * 50) + 1); 
        map.setPathFromCells(path.pathCells);
        
        // AFFIX KERNEL WITH FORCED SYNC
        kernel.setPosition(path.endNodePos.x, path.endNodePos.y);
        kernel.update(0); 

        markerContainer.removeChildren();
        Engine.instance.app.renderer.render(Engine.instance.app.stage);
    };

    return (
        <div style={{ backgroundColor: '#000', width: '100%', height: '100%', position: 'relative' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            <div style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                width: '20rem', padding: '1.5rem', background: 'rgba(0,10,25,0.95)',
                border: '2px solid #00ffff', color: '#00ffff', fontFamily: 'monospace',
                fontSize: '0.85rem', pointerEvents: 'auto', zIndex: 1000,
                boxShadow: '0 0 30px rgba(0,255,255,0.2)'
            }}>
                <div style={{ fontWeight: 900, marginBottom: '0.8rem', borderBottom: '1px solid #00ffff44', letterSpacing: '2px' }}>
                    TOPOLOGY_ARCHITECT_v11.0
                </div>
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem' }}>
                        <span>USER_COORD:</span>
                        <span style={{ color: '#00ff00', fontWeight: 900 }}>({mouseCoord.x}, {mouseCoord.y})</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <button onClick={regenerate} style={{ background: '#00ffff', color: '#000', border: 'none', padding: '0.8rem', fontWeight: 900, cursor: 'pointer', letterSpacing: '1px' }}>
                        REGENERATE_PATH
                    </button>
                    <button onClick={() => StateManager.instance.transitionTo(AppState.MAIN_MENU)} style={{ marginTop: '0.5rem', opacity: 0.5, color: '#fff', background: 'transparent', border: '1px solid #555', padding: '0.5rem', cursor: 'pointer', fontSize: '0.7rem' }}>
                        RETURN_TO_MAIN_MENU
                    </button>
                </div>
            </div>
        </div>
    );
};
