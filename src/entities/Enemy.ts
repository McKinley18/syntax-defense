import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';
import { StateManager } from '../core/StateManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TextureGenerator } from '../utils/TextureGenerator';

export class Enemy {
    public container: PIXI.Container;
    public sprite: PIXI.Sprite;
    public type: EnemyType;
    public hp: number;
    public maxHp: number;
    public speed: number;
    public progress: number = 0;
    public pathPoints: PIXI.Point[] = [];
    public currentPointIndex: number = 0;
    public isDead: boolean = false;
    public isFinished: boolean = false;
    
    private readonly VIRUS_SIZE = 20;
    private healthBar: PIXI.Graphics;

    constructor(type: EnemyType, path: PIXI.Point[], waveMult: number = 1) {
        this.type = type;
        const config = VISUAL_REGISTRY[type];
        this.hp = config.hp * waveMult;
        this.maxHp = this.hp;
        this.speed = config.speed;
        this.pathPoints = path;

        this.container = new PIXI.Container();
        this.sprite = new PIXI.Sprite(TextureGenerator.getInstance().getEnemyTexture(type));
        this.sprite.anchor.set(0.5);
        
        this.sprite.width = this.VIRUS_SIZE;
        this.sprite.height = this.VIRUS_SIZE;
        this.container.addChild(this.sprite);

        // Health Bar initialization
        this.healthBar = new PIXI.Graphics();
        this.healthBar.position.set(0, -15); // Above enemy
        this.container.addChild(this.healthBar);
        this.updateHealthBar();
        
        if (path.length > 0) {
            this.container.position.copyFrom(path[0]);
        }
    }

    public getVelocity(): { vx: number, vy: number } {
        if (this.isDead || this.isFinished) return { vx: 0, vy: 0 };
        const target = this.pathPoints[this.currentPointIndex + 1];
        if (!target) return { vx: 0, vy: 0 };

        const dx = target.x - this.container.x;
        const dy = target.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return { vx: 0, vy: 0 };

        return {
            vx: (dx / dist) * this.speed,
            vy: (dy / dist) * this.speed
        };
    }

    public update(dt: number) {
        if (this.isDead || this.isFinished || StateManager.instance.isPaused) return;

        const target = this.pathPoints[this.currentPointIndex + 1];
        if (!target) {
            this.isFinished = true;
            return;
        }

        const dx = target.x - this.container.x;
        const dy = target.y - this.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const moveDist = this.speed * dt;

        if (dist <= moveDist) {
            this.container.position.copyFrom(target);
            this.currentPointIndex++;
            if (this.currentPointIndex >= this.pathPoints.length - 1) {
                this.isFinished = true;
            }
        } else {
            this.container.x += (dx / dist) * moveDist;
            this.container.y += (dy / dist) * moveDist;
            this.container.rotation = Math.atan2(dy, dx) + Math.PI/2;
        }

        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.04;
        this.sprite.scale.set(pulse);
    }

    private updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.rect(-10, 0, 20, 3).fill({ color: 0x333333, alpha: 0.5 });
        const pct = Math.max(0, this.hp / this.maxHp);
        const color = pct < 0.3 ? 0xff3300 : 0x00ffff;
        this.healthBar.rect(-10, 0, 20 * pct, 3).fill({ color, alpha: 0.8 });
    }

    public takeDamage(amount: number) {
        this.hp -= amount;
        this.updateHealthBar();
        if (this.hp <= 0) {
            this.isDead = true;
        }
    }
}
