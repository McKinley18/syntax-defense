import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { TowerType } from './Tower';

export class Projectile {
    public container: PIXI.Graphics;
    public target: Enemy;
    public damage: number;
    public dead: boolean = false;
    private speed: number = 8;

    constructor(type: TowerType, x: number, y: number, target: Enemy, damage: number, color: number) {
        this.target = target;
        this.damage = damage;
        this.container = new PIXI.Graphics();
        
        // LASER BOLT RENDERING
        this.container.rect(-2, -6, 4, 12).fill({ color, alpha: 1.0 });
        this.container.position.set(x, y);
    }

    public update(dt: number) {
        if (this.dead) return;
        if (this.target.isDead || this.target.isFinished) {
            this.dead = true;
            return;
        }

        const dx = this.target.container.x - this.container.x;
        const dy = this.target.container.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            this.target.takeDamage(this.damage);
            this.dead = true;
        } else {
            this.container.x += (dx / dist) * this.speed * dt;
            this.container.y += (dy / dist) * this.speed * dt;
            this.container.rotation = Math.atan2(dy, dx) + Math.PI / 2;
        }
    }

    public destroy() {
        this.container.destroy();
    }
}
