import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { TowerType, Tower } from './Tower';

/**
 * PROJECTILE v90.0: Tactical Payload Authority
 * THE REBUILD: Implements Splash Damage for Rockets and optimized collision.
 */
export class Projectile {
    public container: PIXI.Container;
    private target: Enemy;
    private speed: number;
    private damage: number;
    public isDead: boolean = false;
    private type: TowerType;
    private color: number;
    private sourceTower: Tower;
    private graphics: PIXI.Graphics;

    constructor(type: TowerType, x: number, y: number, target: Enemy, damage: number, color: number, source: Tower) {
        this.type = type;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.sourceTower = source;

        this.container = new PIXI.Container();
        this.container.position.set(x, y);

        this.graphics = new PIXI.Graphics();
        this.drawProjectile();
        this.container.addChild(this.graphics);

        switch(type) {
            case TowerType.ROCKET_BATTERY: this.speed = 4; break;
            case TowerType.RAIL_CANNON: this.speed = 15; break;
            case TowerType.PRISM_BEAM: this.speed = 10; break;
            case TowerType.STASIS_FIELD: this.speed = 6; break;
            default: this.speed = 8;
        }
    }

    private drawProjectile() {
        this.graphics.clear();
        switch(this.type) {
            case TowerType.ROCKET_BATTERY:
                this.graphics.rect(-4, -2, 8, 4).fill(0x333333);
                this.graphics.moveTo(4, 0).lineTo(6, 0).stroke({ width: 2, color: this.color });
                this.graphics.circle(-4, 0, 2).fill(0xff6600); 
                break;
            case TowerType.STASIS_FIELD:
                this.graphics.circle(0, 0, 4).fill({ color: this.color, alpha: 0.5 }).stroke({ width: 1, color: 0xffffff });
                break;
            case TowerType.RAIL_CANNON:
                this.graphics.rect(-6, -1, 12, 2).fill(this.color);
                break;
            default:
                this.graphics.circle(0, 0, 3).fill(this.color);
        }
    }

    public update(dt: number, allEnemies: Enemy[] = []) {
        if (this.isDead || this.target.isDead || this.target.isFinished) {
            this.isDead = true;
            return;
        }

        const targetPos = this.target.container.position;
        const dx = targetPos.x - this.container.x;
        const dy = targetPos.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            // --- PAYLOAD IMPACT ---
            if (this.type === TowerType.ROCKET_BATTERY) {
                // SPLASH DAMAGE (0.8 tile radius)
                const splashRadius = 32;
                allEnemies.forEach(e => {
                    const edx = e.container.x - this.container.x;
                    const edy = e.container.y - this.container.y;
                    if (Math.sqrt(edx*edx + edy*edy) <= splashRadius) {
                        e.takeDamage(this.damage);
                    }
                });
            } else {
                this.target.takeDamage(this.damage);
            }
            
            if (this.type === TowerType.STASIS_FIELD) {
                this.target.applyStun(180); 
            }

            if (this.target.isDead) this.sourceTower.recordPurge();
            this.isDead = true;
        } else {
            this.container.x += (dx / dist) * this.speed * dt;
            this.container.y += (dy / dist) * this.speed * dt;
            this.container.rotation = Math.atan2(dy, dx);
        }
    }
}
