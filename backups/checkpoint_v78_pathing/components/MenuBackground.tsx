import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface MenuBackgroundProps {
    isFlickering?: boolean;
}

export const MenuBackground: React.FC<MenuBackgroundProps> = ({ isFlickering }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const systemLayerRef = useRef<PIXI.Container | null>(null);
    const gridRef = useRef<PIXI.Graphics | null>(null);
    const nodeLayerRef = useRef<PIXI.Graphics | null>(null);
    const maskSpriteRef = useRef<PIXI.Sprite | null>(null);
    const scanlineRef = useRef<PIXI.Graphics | null>(null);
    
    const animState = useRef({
        time: 0
    });

    useEffect(() => {
        if (systemLayerRef.current) {
            systemLayerRef.current.alpha = isFlickering ? 0.85 : 1.0;
        }
    }, [isFlickering]);

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
            if (!isMounted) {
                app.destroy(true);
                return;
            }
            appRef.current = app;
            containerRef.current?.appendChild(app.canvas);

            // 1. RESTORE PRONOUNCED RADIAL TEXTURE
            const createGradientTexture = (size: number) => {
                const canvas = document.createElement('canvas');
                canvas.width = size; canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) return PIXI.Texture.WHITE;
                const mid = size / 2;
                const grad = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
                
                grad.addColorStop(0, 'rgba(255,255,255,1)');   
                grad.addColorStop(0.3, 'rgba(255,255,255,0.8)'); 
                grad.addColorStop(0.6, 'rgba(255,255,255,0.2)'); 
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
            gridRef.current = grid;

            const nodeLayer = new PIXI.Graphics();
            systemLayer.addChild(nodeLayer);
            nodeLayerRef.current = nodeLayer;

            const maskSprite = new PIXI.Sprite(gradTex);
            maskSprite.anchor.set(0.5);
            app.stage.addChild(maskSprite);
            systemLayer.mask = maskSprite; 
            maskSpriteRef.current = maskSprite;

            const scanline = new PIXI.Graphics();
            app.stage.addChild(scanline);
            scanlineRef.current = scanline;

            const updateLayout = () => {
                if (!app.renderer || !systemLayer || !isMounted) return;
                
                systemLayer.renderable = false;
                const { width, height } = app.screen;
                if (width === 0 || height === 0) return;

                const gridCols = 40;
                const gridRows = 18; 
                const tileSize = width / gridCols; 
                const gridHeight = gridRows * tileSize;
                const offsetY = ((height - gridHeight) / 2) - 20;

                const centerX = width / 2;
                const centerY = height * 0.32;
                const lightRadius = width * 0.42; // Expanded slightly from 0.38

                systemLayer.x = tileSize * 1.55;

                grid.clear();
                for (let i = 0; i <= gridCols; i++) {
                    const lx = i * tileSize;
                    grid.moveTo(lx, offsetY).lineTo(lx, height - offsetY);
                }
                for (let j = 0; j <= gridRows; j++) {
                    const ly = height - offsetY - (j * tileSize);
                    grid.moveTo(0, ly).lineTo(width, ly);
                }
                grid.stroke({ width: 1, color: 0x00ffff, alpha: 0.6 }); 

                nodeLayer.clear();
                for (let i = 0; i <= gridCols; i += 5) {
                    for (let j = 0; j <= gridRows; j += 3) {
                        nodeLayer.circle(i * tileSize, height - offsetY - (j * tileSize), 2)
                                 .fill({ color: 0x00ffff, alpha: 0.8 });
                    }
                }

                maskSprite.position.set(centerX, centerY);
                maskSprite.width = lightRadius * 2.5; 
                maskSprite.height = lightRadius * 2.5;

                scanline.clear();
                const trailHeight = 60;
                for (let h = 0; h < trailHeight; h++) {
                    const alpha = (1 - (h / trailHeight)) * 0.06;
                    scanline.rect(0, -h, width, 1).fill({ color: 0x00ffff, alpha });
                }
                scanline.rect(0, 0, width, 2).fill({ color: 0x00ffff, alpha: 0.12 });
                scanline.blendMode = 'add';

                systemLayer.renderable = true;
            };

            updateLayout();

            const ticker = (t: PIXI.Ticker) => {
                if (!app.renderer || !systemLayer.renderable || !isMounted) return;
                const { height } = app.screen;
                animState.current.time += 0.01 * t.deltaTime;
                const time = animState.current.time;
                if (scanline) scanline.y = (time * 60) % height;
                if (nodeLayer) nodeLayer.alpha = 0.6 + Math.sin(time * 2) * 0.3;
            };
            app.ticker.add(ticker);
            app.renderer.on('resize', updateLayout);
        };

        init();

        return () => {
            isMounted = false;
            if (appRef.current) {
                appRef.current.ticker.stop();
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }} />
    );
};
