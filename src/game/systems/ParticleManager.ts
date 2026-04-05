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
        if (this.particles.length > 150) return; 
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
                vx: (Math.random() - 0.5) * 4 * scale,
                vy: (Math.random() - 0.5) * 4 * scale,
                life: 15 + Math.random() * 15,
                maxLife: 30,
                fade: true,
                scale: true
            });
        }
        // HIGH-INTELLIGENCE: Data bit harvester
        this.spawnDataBit(x, y);
    }

    private spawnDataBit(x: number, y: number) {
        const p = new PIXI.Graphics();
        p.rect(0, 0, 4, 4);
        p.fill(0x00ffff);
        p.x = x; p.y = y;
        this.game.effectLayer.addChild(p);

        const tx = window.innerWidth - 100;
        const ty = window.innerHeight - 50;
        
        let t = 0;
        const anim = () => {
            t += 0.02;
            p.x += (tx - p.x) * 0.08;
            p.y += (ty - p.y) * 0.08;
            p.alpha = 1 - t;
            if (t < 1) requestAnimationFrame(anim);
            else p.destroy();
        };
        anim();
    }

    public spawnFloatingText(x: number, y: number, text: string) {
        const style = new PIXI.TextStyle({
            fontFamily: 'Courier New',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: { color: '#000000', width: 2 }
        });
        
        const pixiText = new PIXI.Text({ text, style });
        pixiText.x = x;
        pixiText.y = y;
        pixiText.anchor.set(0.5);
        
        this.game.effectLayer.addChild(pixiText);
        this.particles.push({
            sprite: pixiText,
            vx: 0,
            vy: -0.8,
            life: 40,
            maxLife: 40,
            fade: true,
            scale: false
        });
    }

    public update(delta: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.sprite.x += p.vx * delta;
            p.sprite.y += p.vy * delta;
            p.life -= delta;

            if (p.fade) {
                p.sprite.alpha = p.life / p.maxLife;
            }
            if (p.scale) {
                const s = p.life / p.maxLife;
                p.sprite.scale.set(s);
            }

            if (p.life <= 0) {
                this.game.effectLayer.removeChild(p.sprite);
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}
