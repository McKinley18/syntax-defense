import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { TowerType, Tower } from './Tower';

/**
 * PROJECTILE: Authoritative Combat Payload (v55.0)
 * THE DEFINITIVE FIX: Synchronized with Tower firing protocol.
 */
export class Projectile {
    public container: PIXI.Graphics;
    public target: Enemy;
    public damage: number;
    public speed: number = 10;
    public isDead: boolean = false;
    
    private type: TowerType;
    private color: number;
    private tower: Tower;

    constructor(type: TowerType, x: number, y: number, target: Enemy, damage: number, color: number, tower: Tower) {
        this.type = type;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.tower = tower;

        this.container = new PIXI.Graphics();
        this.container.position.set(x, y);
        this.drawProjectile();
    }

    private drawProjectile() {
        this.container.clear();
        switch(this.type) {
            case TowerType.RAIL_CANNON:
                this.container.rect(-8, -1, 16, 2).fill({ color: this.color, alpha: 0.9 });
                break;
            case TowerType.PRISM_BEAM:
                this.container.circle(0, 0, 4).fill({ color: this.color, alpha: 0.8 });
                break;
            case TowerType.SONIC_IMPULSE:
                this.container.arc(0, 0, 8, -0.5, 0.5).stroke({ width: 3, color: this.color });
                break;
            default:
                this.container.rect(-3, -1.5, 6, 3).fill({ color: this.color });
        }
    }

    public update(dt: number) {
        if (this.isDead) return;

        if (this.target.isDead || this.target.isFinished) {
            this.isDead = true;
            return;
        }

        const dx = this.target.container.x - this.container.x;
        const dy = this.target.container.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            this.target.takeDamage(this.damage);
            if (this.target.isDead && this.tower) {
                this.tower.recordPurge();
            }
            this.isDead = true;
        } else {
            this.container.x += (dx / dist) * this.speed * dt;
            this.container.y += (dy / dist) * this.speed * dt;
            this.container.rotation = Math.atan2(dy, dx);
        }
    }
}
