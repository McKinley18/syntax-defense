import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { TextureGenerator } from '../utils/TextureGenerator';

export const MenuBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const gridRef = useRef<PIXI.TilingSprite | null>(null);
    const maskRef = useRef<PIXI.Sprite | null>(null);
    const bloomRef = useRef<PIXI.Graphics | null>(null);

    useEffect(() => {
        let isMounted = true;

        const handleResize = () => {
            const app = appRef.current;
            if (!app || !app.renderer || !containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            app.renderer.resize(w, h);
            
            const scale = h / 720;
            app.stage.scale.set(scale);

            // Re-center elements based on new logical width
            const logicalWidth = w / scale;
            const centerX = logicalWidth / 2;

            if (gridRef.current) gridRef.current.position.set(centerX, 360);
            if (maskRef.current) maskRef.current.position.set(centerX, 320);
            if (bloomRef.current) bloomRef.current.position.set(centerX, 320);
        };

        const init = async () => {
            if (!containerRef.current || appRef.current) return;

            const app = new PIXI.Application();
            if (!(app as any)._cancelResize) (app as any)._cancelResize = () => {};

            try {
                await app.init({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    backgroundAlpha: 0,
                    preference: 'webgl'
                });

                if (!isMounted) {
                    app.destroy(true, { children: true, texture: true });
                    return;
                }

                appRef.current = app;
                containerRef.current.appendChild(app.canvas);
                app.canvas.style.position = 'absolute';
                app.canvas.style.width = '100%';
                app.canvas.style.height = '100%';

                const stage = app.stage;

                // 1. EMISSIVE GRID LAYER
                const gridTex = TextureGenerator.getInstance().getGridTexture(app);
                const grid = new PIXI.TilingSprite({
                    texture: gridTex,
                    width: 3840,
                    height: 1440
                });
                grid.anchor.set(0.5);
                grid.alpha = 1.0; // Bright, controlled by mask
                app.stage.addChild(grid);
                gridRef.current = grid;

                // 2. RESTORED LIGHT SOURCE MASK (Localized spotlight)
                const canvas = document.createElement('canvas');
                canvas.width = 1000;
                canvas.height = 1000;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const gradient = ctx.createRadialGradient(500, 500, 0, 500, 500, 500);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)'); 
                    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)'); 
                    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)'); 
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); 
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 1000, 1000);
                }
                const lightMaskTex = PIXI.Texture.from(canvas);
                const maskSprite = new PIXI.Sprite(lightMaskTex);
                maskSprite.anchor.set(0.5);
                grid.mask = maskSprite;
                app.stage.addChild(maskSprite);
                maskRef.current = maskSprite;

                // 3. RESTORED CYAN BLOOM
                const bloom = new PIXI.Graphics();
                bloom.circle(0, 0, 350).fill({ color: 0x00ffff, alpha: 0.08 });
                const blur = new PIXI.BlurFilter();
                blur.strength = 50;
                bloom.filters = [blur];
                bloom.blendMode = 'add';
                app.stage.addChild(bloom);
                bloomRef.current = bloom;

                // 4. SCANLINE / SWEEP
                const sweep = new PIXI.Graphics();
                app.stage.addChild(sweep);
                let sweepY = -100;
                app.ticker.add((ticker) => {
                    if (!isMounted) return;
                    sweepY += 0.4 * ticker.deltaTime;
                    if (sweepY > 1400) sweepY = -200;
                    sweep.clear();
                    const currentScale = app.stage.scale.x;
                    const currentLogicalWidth = window.innerWidth / currentScale;
                    
                    for (let i = 0; i < 40; i++) {
                        const a = (1 - i / 40) * 0.03;
                        sweep.rect(0, sweepY - i, currentLogicalWidth, 1).fill({ color: 0x00ffff, alpha: a });
                    }
                    sweep.rect(0, sweepY, currentLogicalWidth, 2).fill({ color: 0x00ffff, alpha: 0.06 });
                });

                window.addEventListener('resize', handleResize);
                handleResize();

            } catch (err) {
                console.error("PIXI Init Error:", err);
            }
        };

        init();

        return () => {
            isMounted = false;
            window.removeEventListener('resize', handleResize);
            if (appRef.current) {
                const app = appRef.current;
                appRef.current = null;
                try {
                    if (app.ticker) app.ticker.stop();
                    (app as any).resizeTo = null;
                    app.destroy(true, { children: true, texture: true });
                } catch (e) {
                    console.warn("Menu PIXI Destroy Error:", e);
                }
            }
        };
    }, []);

    return <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }} />;
};
