import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';

export interface Particle {
    sprite: PIXI.Graphics | PIXI.Text;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    fade: boolean;
    scale: boolean;
}

export class ParticleManager {
    private particles: Particle[] = [];
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
    }

    public spawnDust(x: number, y: number) {
        const graphics = new PIXI.Graphics();
        graphics.circle(0, 0, 2 + Math.random() * 2);
        graphics.fill({ color: 0x555555, alpha: 0.6 });
        
        graphics.x = x + (Math.random() - 0.5) * 10;
        graphics.y = y + (Math.random() - 0.5) * 10;
        
        this.game.effectLayer.addChild(graphics);
        this.particles.push({
            sprite: graphics,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            fade: true,
            scale: true
        });
    }

    public spawnExplosion(x: number, y: number, scale: number = 1) {
        if (this.particles.length > 150) return; // PERFORMANCE CAP
        for (let i = 0; i < 8; i++) {
            const graphics = new PIXI.Graphics();
            graphics.circle(0, 0, (4 + Math.random() * 8) * scale);
            const color = Math.random() > 0.5 ? 0x00ffff : 0x0066ff;
            graphics.fill({ color, alpha: 0.8 });
            
            graphics.x = x;
            graphics.y = y;
            
            this.game.effectLayer.addChild(graphics);
            this.particles.push({
                sprite: graphics,
                vx: (Math.random() - 0.5) * 6 * scale,
                vy: (Math.random() - 0.5) * 6 * scale,
                life: 15 + Math.random() * 15,
                maxLife: 30,
                fade: true,
                scale: true
            });
        }
    }

    public spawnDebris(x: number, y: number, color: number) {
        for (let i = 0; i < 3; i++) {
            const graphics = new PIXI.Graphics();
            graphics.poly([-2, -2, 2, -2, 0, 3]);
            graphics.fill({ color, alpha: 0.9 });
            
            graphics.x = x;
            graphics.y = y;
            
            this.game.effectLayer.addChild(graphics);
            this.particles.push({
                sprite: graphics,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 10 + Math.random() * 10,
                maxLife: 20,
                fade: true,
                scale: false
            });
        }
    }

    public spawnFloatingText(x: number, y: number, text: string, color: number = 0x00ffcc) {
        const style = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 14,
            fontWeight: 'bold',
            fill: color,
            dropShadow: { color: 0x000000, alpha: 0.8, blur: 2, distance: 1 }
        });
        
        const textSprite = new PIXI.Text({ text, style });
        textSprite.anchor.set(0.5);
        textSprite.x = x;
        textSprite.y = y - 10;
        
        this.game.effectLayer.addChild(textSprite);
        this.particles.push({
            sprite: textSprite,
            vx: 0,
            vy: -1.5, // Float straight up
            life: 40,
            maxLife: 40,
            fade: true,
            scale: false
        });
    }

    public update(delta: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;
            
            p.sprite.x += p.vx * delta;
            p.sprite.y += p.vy * delta;
            
            const lifeRatio = Math.max(0, p.life / p.maxLife);
            
            if (p.fade) p.sprite.alpha = lifeRatio;
            if (p.scale && p.sprite instanceof PIXI.Graphics) p.sprite.scale.set(lifeRatio);
            
            if (p.life <= 0) {
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}
