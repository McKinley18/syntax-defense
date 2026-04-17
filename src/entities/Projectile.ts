import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { TowerType } from './Tower';

export class Projectile {
    public container: PIXI.Graphics;
    public target: Enemy;
    public damage: number;
    public dead: boolean = false;
    private speed: number = 8;
    
    private velocity: { x: number, y: number };

    constructor(type: TowerType, x: number, y: number, target: Enemy, damage: number, color: number, interceptPoint?: { x: number, y: number }) {
        this.target = target;
        this.damage = damage;
        this.container = new PIXI.Graphics();
        
        this.container.rect(-2, -6, 4, 12).fill({ color, alpha: 1.0 });
        this.container.position.set(x, y);

        // STRAIGHT-LINE COMBAT: Calculate fixed velocity vector
        const dest = interceptPoint || { x: target.container.x, y: target.container.y };
        const dx = dest.x - x;
        const dy = dest.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.velocity = {
            x: (dx / dist) * this.speed,
            y: (dy / dist) * this.speed
        };
        this.container.rotation = Math.atan2(dy, dx) + Math.PI / 2;
    }

    public update(dt: number) {
        if (this.dead) return;

        // Move along fixed straight-line vector
        this.container.x += this.velocity.x * dt;
        this.container.y += this.velocity.y * dt;

        // Collision detection: Check distance to the target enemy
        const dx = this.target.container.x - this.container.x;
        const dy = this.target.container.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
            this.target.takeDamage(this.damage);
            this.dead = true;
        }

        // Cleanup if way off screen
        if (this.container.x < -100 || this.container.x > 2000 || this.container.y < -100 || this.container.y > 1000) {
            this.dead = true;
        }
    }

    public destroy() {
        this.container.destroy();
    }
}
