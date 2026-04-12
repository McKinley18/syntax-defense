import * as PIXI from 'pixi.js';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TILE_SIZE } from '../systems/MapManager';

export class TextureGenerator {
    private static instance: TextureGenerator;
    public metalTexture!: PIXI.Texture;
    public armorTexture!: PIXI.Texture;
    public sandTexture!: PIXI.Texture;
    public binaryTexture!: PIXI.Texture;

    public enemyTextures: Map<EnemyType, PIXI.Texture> = new Map();

    private constructor() {}

    public static getInstance(): TextureGenerator {
        if (!TextureGenerator.instance) {
            TextureGenerator.instance = new TextureGenerator();
        }
        return TextureGenerator.instance;
    }

    public generate(app: PIXI.Application) {
        const metalG = new PIXI.Graphics();
        metalG.rect(0, 0, 128, 128);
        metalG.fill(0x7f8c8d);
        for(let i=0; i<500; i++) {
            metalG.circle(Math.random()*128, Math.random()*128, Math.random()*2);
            metalG.fill({ color: 0x333333, alpha: 0.2 });
        }
        this.metalTexture = app.renderer.generateTexture(metalG);

        const armorG = new PIXI.Graphics();
        armorG.rect(0, 0, 128, 128);
        armorG.fill(0x2c3e50);
        for(let i=0; i<100; i++) {
            armorG.moveTo(Math.random()*128, Math.random()*128);
            armorG.lineTo(Math.random()*128, Math.random()*128);
            armorG.stroke({ width: 1, color: 0xffffff, alpha: 0.1 });
        }
        this.armorTexture = app.renderer.generateTexture(armorG);

        const sandG = new PIXI.Graphics();
        sandG.rect(0, 0, 256, 256);
        sandG.fill(0xc2a47c);
        for(let i=0; i<2000; i++) {
            sandG.circle(Math.random()*256, Math.random()*256, 1);
            sandG.fill({ color: 0x000000, alpha: 0.05 });
        }
        this.sandTexture = app.renderer.generateTexture(sandG);

        const binaryContainer = new PIXI.Container();
        const style = new PIXI.TextStyle({ 
            fontFamily: 'Courier New', 
            fontSize: 16, 
            fill: 0x333333, 
            fontWeight: 'bold' 
        });
        
        for(let i=0; i<60; i++) {
            const t = new PIXI.Text({ text: Math.random() > 0.5 ? '0' : '1', style });
            t.x = Math.random() * 256;
            t.y = Math.random() * 256;
            t.alpha = 0.2 + Math.random() * 0.4;
            binaryContainer.addChild(t);
        }
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, 256, 256);
        bg.fill({ color: 0x000000, alpha: 0.01 });
        binaryContainer.addChildAt(bg, 0);
        this.binaryTexture = app.renderer.generateTexture(binaryContainer);

        // Pre-render Enemy Textures with character
        for (const [key, config] of Object.entries(VISUAL_REGISTRY)) {
            const type = parseInt(key) as EnemyType;
            const g = new PIXI.Graphics();
            const s = TILE_SIZE / 4.5; 
            const c = config.color;

            if (type === EnemyType.GLIDER) {
                // Compact High-Contrast Cyan Arrow (12px wide)
                const sz = 6;
                g.poly([
                    0, -sz * 1.8, // Sharper top
                    sz, sz,       
                    0, sz * 0.6,  
                    -sz, sz       
                ]);
                g.fill({ color: 0x00ffff, alpha: 1.0 });
                g.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
            } else if (type === EnemyType.STRIDER) {
                // Technical circular core (The official Strider)
                g.circle(0, 0, s*1.2).fill({ color: 0x222222 }).stroke({ width: 2, color: c });
                g.circle(0, 0, s*0.6).fill(c);
                // Orbiting sensors
                for(let i=0; i<3; i++) {
                    const ang = (i / 3) * Math.PI * 2;
                    g.circle(Math.cos(ang)*s*1.4, Math.sin(ang)*s*1.4, 3).fill(0xffffff);
                }
            } else if (type === EnemyType.BEHEMOTH) {
                // Heavy dual-core tank
                g.roundRect(-s*1.2, -s, s*2.4, s*2, 2).fill({ color: 0x222222 }).stroke({ width: 2, color: c });
                g.circle(-s*0.5, 0, s*0.4).fill(c);
                g.circle(s*0.5, 0, s*0.4).fill(c);
            } else if (type === EnemyType.FRACTAL) {
                // Complex nested boss core
                g.poly([-s*1.5, 0, -s*0.75, -s*1.3, s*0.75, -s*1.3, s*1.5, 0, s*0.75, s*1.3, -s*0.75, s*1.3]).fill({ color: 0x111111 }).stroke({ width: 2, color: c });
                g.circle(0, 0, s*0.8).fill(c).stroke({ width: 1, color: 0xffffff });
                // Orbiting bits
                for(let i=0; i<4; i++) {
                    const ang = (i / 4) * Math.PI * 2;
                    g.circle(Math.cos(ang)*s*1.2, Math.sin(ang)*s*1.2, 2).fill(0xffffff);
                }
            }
            
            const renderTex = app.renderer.generateTexture(g);
            this.enemyTextures.set(type, renderTex);
        }
    }

    public getEnemyTexture(type: EnemyType): PIXI.Texture {
        return this.enemyTextures.get(type)!;
    }

    public getBinaryTexture(): PIXI.Texture {
        return this.binaryTexture;
    }

    public getGridTexture(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();
        // 20x20 tile to match the main menu
        g.rect(0, 0, 20, 20);
        g.fill({ color: 0x000000, alpha: 0 }); // Transparent center

        // Draw the top and left borders (creates the grid effect when tiled)
        g.moveTo(0, 0);
        g.lineTo(20, 0);
        g.moveTo(0, 0);
        g.lineTo(0, 20);
        g.stroke({ width: 1, color: 0x00ffff, alpha: 0.35 });

        return app.renderer.generateTexture(g);
    }
    }