import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface MenuBackgroundProps {
    isFlickering?: boolean;
}

export const MenuBackground: React.FC<MenuBackgroundProps> = ({ isFlickering }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const systemLayerRef = useRef<PIXI.Container | null>(null);
    
    // Animation refs to avoid multiple tickers
    const animState = useRef({
        nodes: [] as PIXI.Graphics[],
        scanline: null as PIXI.Graphics | null,
        time: 0
    });

    // Synchronize PIXI alpha with the flicker prop
    useEffect(() => {
        if (systemLayerRef.current) {
            systemLayerRef.current.alpha = isFlickering ? 0.85 : 1.0;
        }
    }, [isFlickering]);

    useEffect(() => {
        if (!containerRef.current) return;

        const init = async () => {
            const app = new PIXI.Application();
            await app.init({
                resizeTo: window,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });
            appRef.current = app;
            containerRef.current?.appendChild(app.canvas);

            const createGradientTexture = (size: number) => {
                const canvas = document.createElement('canvas');
                canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return PIXI.Texture.WHITE;
                const mid = size / 2;
                const grad = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
                grad.addColorStop(0, 'rgba(255,255,255,1)');   
                grad.addColorStop(0.3, 'rgba(255,255,255,0.7)'); 
                grad.addColorStop(0.6, 'rgba(255,255,255,0.2)'); 
                grad.addColorStop(1, 'rgba(255,255,255,0)');   
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                return PIXI.Texture.from(canvas);
            };

            const drawLayout = () => {
                app.stage.removeChildren();
                const { width, height } = app.screen;
                const gridCols = 40;
                const gridRows = 18; 
                const tileSize = width / gridCols; 
                const gridHeight = gridRows * tileSize;
                const offsetY = ((height - gridHeight) / 2) - 20;

                const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const centerX = (width / 2) - (14 * rootFontSize) + (width * 0.205); 
                const centerY = height * 0.18;
                const lightRadius = width * 0.45;

                const gradTex = createGradientTexture(1024);

                // --- 1. SYSTEM LAYER ---
                const systemLayer = new PIXI.Container();
                systemLayer.x = tileSize * 1.55; 
                systemLayerRef.current = systemLayer;
                app.stage.addChild(systemLayer);

                // A. THE TACTICAL GRID
                const grid = new PIXI.Graphics();
                for (let i = 0; i <= gridCols; i++) {
                    const lx = i * tileSize;
                    grid.moveTo(lx, offsetY).lineTo(lx, height - offsetY);
                }
                for (let j = 0; j <= gridRows; j++) {
                    const ly = height - offsetY - (j * tileSize);
                    grid.moveTo(0, ly).lineTo(width, ly);
                }
                grid.stroke({ width: 1, color: 0x00ffff, alpha: 0.6 }); 
                systemLayer.addChild(grid);

                // B. LOGIC NODES
                const nodes: PIXI.Graphics[] = [];
                for (let i = 0; i <= gridCols; i += 5) {
                    for (let j = 0; j <= gridRows; j += 3) {
                        const n = new PIXI.Graphics();
                        n.circle(0, 0, 2).fill({ color: 0x00ffff, alpha: 0.8 });
                        n.position.set(i * tileSize, height - offsetY - (j * tileSize));
                        systemLayer.addChild(n);
                        nodes.push(n);
                    }
                }

                // Update animation refs for the persistent ticker
                animState.current.nodes = nodes;

                // --- 2. THE ILLUMINATION MASK ---
                const mask = new PIXI.Sprite(gradTex);
                mask.anchor.set(0.5);
                mask.position.set(centerX, centerY);
                mask.width = lightRadius * 2;
                mask.height = lightRadius * 2;
                systemLayer.mask = mask;
                app.stage.addChild(mask);

                // --- 3. SCANLINE ---
                const scanline = new PIXI.Graphics();
                scanline.rect(0, 0, width, 1.5).fill({ color: 0x00ffff, alpha: 0.05 });
                app.stage.addChild(scanline);
                animState.current.scanline = scanline;
            };

            // INITIAL DRAW
            drawLayout();
            
            // SINGLE PERSISTENT TICKER
            const ticker = (t: PIXI.Ticker) => {
                const { height } = app.screen;
                animState.current.time += 0.01 * t.deltaTime;
                const time = animState.current.time;
                
                // Update Scanline
                if (animState.current.scanline) {
                    animState.current.scanline.y = (time * 60) % height;
                }
                
                // Update Nodes
                animState.current.nodes.forEach((n, idx) => {
                    n.alpha = 0.4 + Math.sin(time * 2 + idx) * 0.4;
                });
            };
            app.ticker.add(ticker);

            app.renderer.on('resize', drawLayout);
        };

        init();

        return () => {
            appRef.current?.destroy(true, { children: true, texture: true });
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} />
    );
};
