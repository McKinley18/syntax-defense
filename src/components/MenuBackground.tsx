import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface MenuBackgroundProps {
    onSyncFlicker?: (alpha: number) => void;
    isVisible?: boolean;
}

/**
 * MENU BACKGROUND v99.12: Visibility Hardening
 * THE DEFINITIVE SYNC: Incorporates external visibility control for sequential reveals.
 */
export const MenuBackground: React.FC<MenuBackgroundProps> = ({ onSyncFlicker, isVisible = true }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const systemLayerRef = useRef<PIXI.Container | null>(null);
    const onFlickerRef = useRef(onSyncFlicker);

    useEffect(() => { onFlickerRef.current = onSyncFlicker; }, [onSyncFlicker]);

    useEffect(() => {
        let isMounted = true;
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
            if (!isMounted) { app.destroy(true); return; }
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
                grad.addColorStop(0.3, 'rgba(255,255,255,0.6)'); 
                grad.addColorStop(1, 'rgba(255,255,255,0)');   
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
                return PIXI.Texture.from(canvas);
            };
            const gradTex = createGradientTexture(1024);

            const systemLayer = new PIXI.Container();
            app.stage.addChild(systemLayer);
            systemLayerRef.current = systemLayer;

            const grid = new PIXI.Graphics();
            systemLayer.addChild(grid);

            const maskSprite = new PIXI.Sprite(gradTex);
            maskSprite.anchor.set(0.5);
            app.stage.addChild(maskSprite);
            systemLayer.mask = maskSprite; 

            const updateLayout = () => {
                if (!app.renderer || !systemLayer || !isMounted) return;
                const { width, height } = app.screen;
                const tileSize = width / 40; 
                const gridRows = 18;
                const gridHeight = gridRows * tileSize;
                const offsetY = ((height - gridHeight) / 2) - 20;

                systemLayer.x = tileSize * 1.55;
                grid.clear();
                for (let i = 0; i <= 40; i++) {
                    grid.moveTo(i * tileSize, offsetY).lineTo(i * tileSize, height - offsetY);
                }
                for (let j = 0; j <= gridRows; j++) {
                    const ly = height - offsetY - (j * tileSize);
                    grid.moveTo(0, ly).lineTo(width, ly);
                }
                grid.stroke({ width: 1, color: 0x00ffff, alpha: 0.6 }); 
                maskSprite.position.set(width / 2, height * 0.32);
                maskSprite.width = width * 1.1; maskSprite.height = width * 1.1;
            };

            updateLayout();

            let nextFlickerTime = 0;
            let flickerDuration = 0;

            const ticker = () => {
                if (!isMounted) return;
                const now = performance.now();

                if (now > nextFlickerTime) {
                    flickerDuration = 30 + Math.random() * 50;
                    nextFlickerTime = now + flickerDuration + (1500 + Math.random() * 9000);
                }

                const isDipped = (nextFlickerTime - now) < flickerDuration;
                const targetAlpha = isDipped ? 0.2 : 1.0;
                
                // Authoritative Sync Push
                if (onFlickerRef.current) {
                    onFlickerRef.current(targetAlpha);
                }
            };
            app.ticker.add(ticker);
            app.renderer.on('resize', updateLayout);
        };

        init();
        return () => {
            isMounted = false;
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    // Reactive Alpha Control (for the Phase 2 reveal)
    useEffect(() => {
        if (systemLayerRef.current) {
            systemLayerRef.current.alpha = isVisible ? 1.0 : 0;
            systemLayerRef.current.visible = isVisible;
        }
    }, [isVisible]);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} />
    );
};
