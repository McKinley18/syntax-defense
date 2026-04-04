import * as PIXI from 'pixi.js';

export class TextureGenerator {
    private static instance: TextureGenerator;
    public metalTexture!: PIXI.Texture;
    public armorTexture!: PIXI.Texture;
    public sandTexture!: PIXI.Texture;
    public binaryTexture!: PIXI.Texture; // New Texture for Path Flow

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

        // Generate Binary Text Pattern
        const binaryContainer = new PIXI.Container();
        const style = new PIXI.TextStyle({ 
            fontFamily: 'Courier New', 
            fontSize: 16, 
            fill: 0x333333, 
            fontWeight: 'bold' 
        });
        
        // Add random 0s and 1s
        for(let i=0; i<60; i++) {
            const t = new PIXI.Text({ text: Math.random() > 0.5 ? '0' : '1', style });
            t.x = Math.random() * 256;
            t.y = Math.random() * 256;
            t.alpha = 0.2 + Math.random() * 0.4;
            binaryContainer.addChild(t);
        }
        // Add a background to ensure texture size is exactly 256x256
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, 256, 256);
        bg.fill({ color: 0x000000, alpha: 0.01 }); // Almost invisible
        binaryContainer.addChildAt(bg, 0);

        this.binaryTexture = app.renderer.generateTexture(binaryContainer);
    }
}
