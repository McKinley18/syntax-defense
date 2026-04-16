import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export const MenuBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const init = async () => {
            const app = new PIXI.Application();
            await app.init({
                resizeTo: window,
                backgroundAlpha: 0,
                antialias: true,
                resolution: window.devicePixelRatio || 1
            });
            appRef.current = app;
            containerRef.current?.appendChild(app.canvas);

            const { width, height } = app.screen;
            // REFINED PINPOINT CENTERING (LEFT AND UP)
            const centerX = width * 0.25; 
            const centerY = height * 0.14; 

            // --- 1. THE SOFT BLOOM (GAUSSIAN LIGHT SOURCE) ---
            const lightContainer = new PIXI.Container();
            const bloomG = new PIXI.Graphics();
            // Tiny radius, high alpha for a pinpoint bright center
            bloomG.circle(centerX, centerY, width * 0.04)
                  .fill({ color: 0x00ffff, alpha: 0.7 });
            
            // Much sharper blur for a very tight falloff
            const blurFilter = new PIXI.BlurFilter();
            blurFilter.strength = 40; 
            bloomG.filters = [blurFilter];
            
            lightContainer.addChild(bloomG);
            app.stage.addChild(lightContainer);

            // --- 2. HIGH-DENSITY MICRO-GRID (INDEPENDENT) ---
            const microSize = 30; // Tighter than game-grid
            const gridTextureG = new PIXI.Graphics();
            gridTextureG.moveTo(0, 0).lineTo(microSize, 0).moveTo(0, 0).lineTo(0, microSize);
            gridTextureG.stroke({ width: 0.5, color: 0x00ffff, alpha: 0.2 });
            const gridTexture = app.renderer.generateTexture(gridTextureG);

            const gridTiling = new PIXI.TilingSprite({
                texture: gridTexture,
                width: width,
                height: height
            });
            gridTiling.tileScale.set(1 / app.renderer.resolution);
            app.stage.addChild(gridTiling);

            // --- 3. PROXIMITY MASK (SYNCED SOFT REVEAL) ---
            // Mask radius tightened further to lock grid to center
            const maskG = new PIXI.Graphics();
            maskG.circle(centerX, centerY, width * 0.06)
                 .fill({ color: 0xffffff, alpha: 1.0 });
            
            const maskBlur = new PIXI.BlurFilter();
            maskBlur.strength = 40; // Sharpened falloff
            maskG.filters = [maskBlur];
            
            // Critical for Filters as Masks in v8
            const maskContainer = new PIXI.Container();
            maskContainer.addChild(maskG);
            gridTiling.mask = maskContainer;
            app.stage.addChild(maskContainer);

            // --- 4. SUBTLE SCANLINE ---
            const scanline = new PIXI.Graphics();
            scanline.rect(0, 0, width, 1.5).fill({ color: 0x00ffff, alpha: 0.1 });
            app.stage.addChild(scanline);

            let time = 0;
            app.ticker.add((ticker) => {
                time += 0.01 * ticker.deltaTime;
                scanline.y = (time * 60) % height;
                
                // Very soft organic pulse
                bloomG.alpha = 0.8 + Math.sin(time * 1.2) * 0.2;
            });
        };

        init();

        return () => {
            appRef.current?.destroy(true, { children: true, texture: true });
        };
    }, []);

    return (
        <div ref={containerRef} style={{
            position: 'absolute', inset: 0, zIndex: 0,
            pointerEvents: 'none', overflow: 'hidden'
        }} />
    );
};
