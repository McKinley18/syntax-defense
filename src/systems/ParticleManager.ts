import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';

export interface Particle {
    sprite: PIXI.Graphics | PIXI.Text | PIXI.Container;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    fade: boolean;
    scale: boolean;
}

export class ParticleManager {
    private particles: Particle[] = [];
    private static graphicsPool: PIXI.Graphics[] = [];

    constructor() {}

    private getGraphics(): PIXI.Graphics {
        const g = ParticleManager.graphicsPool.pop() || new PIXI.Graphics();
        g.clear();
        return g;
    }

    public spawnExplosion(x: number, y: number, scale: number = 1) {
        const graphics = this.getGraphics();
        graphics.circle(0, 0, 10 * scale).fill(0x00ffff);
        graphics.x = x;
        graphics.y = y;
        Engine.instance.app.stage.addChild(graphics);
        this.particles.push({ sprite: graphics, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: 30, maxLife: 30, fade: true, scale: true });
    }

    public update(delta: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= delta;
            p.sprite.x += p.vx * delta;
            p.sprite.y += p.vy * delta;
            if (p.fade) p.sprite.alpha = p.life / p.maxLife;
            if (p.life <= 0) {
                Engine.instance.app.stage.removeChild(p.sprite);
                if (p.sprite instanceof PIXI.Graphics) ParticleManager.graphicsPool.push(p.sprite);
                else p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
}
