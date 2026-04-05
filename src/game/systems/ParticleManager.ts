import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { HitMarker } from '../entities/HitMarker';

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
    public isThrottled: boolean = false;

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
        if (this.particles.length > (this.isThrottled ? 50 : 150)) return; 
        const count = this.isThrottled ? 3 : 8;
        for (let i = 0; i < count; i++) {
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
public spawnHitMarker(x: number, y: number, amount: number) {
    const marker = HitMarker.create(x, y, amount);
    this.game.effectLayer.addChild(marker.container);
    this.particles.push({
        sprite: marker.container as any,
        vx: 0, vy: -0.5, life: 60, maxLife: 60, fade: true, scale: false,
        marker: marker // CUSTOM FIELD FOR UPDATE
    } as any);
}

public addEffect(graphics: PIXI.Graphics, frames: number) {
    this.particles.push({
        sprite: graphics,
        vx: 0,
        vy: 0,
        life: frames,
        maxLife: frames,
        fade: true,
        scale: false
    });
}

public update(delta: number) {    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i] as any;

        if (p.marker) {
            if (!p.marker.update(delta)) {
                this.game.effectLayer.removeChild(p.sprite);
                HitMarker.release(p.marker);
                this.particles.splice(i, 1);
            }
            continue;
        }

        p.life -= delta;
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
