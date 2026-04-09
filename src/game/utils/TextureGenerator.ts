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

        // Pre-render Enemy Textures
        for (const [key, config] of Object.entries(VISUAL_REGISTRY)) {
            const type = parseInt(key) as EnemyType;
            const g = new PIXI.Graphics();
            const s = TILE_SIZE / 2 - 2; 

            // Center the pivot by drawing relative to 0,0, but when generating texture
            // it will capture the bounding box. To ensure the texture is centered
            // properly on a sprite, we will set the anchor of the sprite to 0.5.
            if (config.shape === 'circle') {
                g.circle(0, 0, s);
            } else if (config.shape === 'triangle') {
                g.poly([-s, s, 0, -s, s, s]);
            } else if (config.shape === 'square') {
                g.rect(-s, -s, s*2, s*2);
            } else if (config.shape === 'hexagon') {
                g.poly([-s, 0, -s/2, -s, s/2, -s, s, 0, s/2, s, -s/2, s]);
            }
            g.fill({ color: config.color, alpha: 0.9 });
            g.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
            
            // Generate texture with a padded bounding box to ensure glow fits if added later
            const renderTex = app.renderer.generateTexture(g);
            this.enemyTextures.set(type, renderTex);
        }
    }

    public getEnemyTexture(type: EnemyType): PIXI.Texture {
        return this.enemyTextures.get(type)!;
    }
}