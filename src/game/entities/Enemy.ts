import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from '../systems/GameStateManager';

export const EnemyType = {
    GLIDER: 0,
    STRIDER: 1,
    BEHEMOTH: 2,
    FRACTAL: 3
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];

interface EnemyConfig {
    hp: number; speed: number; reward: number; color: number; size: number;
}

const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
    [EnemyType.GLIDER]: { hp: 30, speed: 2, reward: 25, color: 0x00ffff, size: 12 },
    [EnemyType.STRIDER]: { hp: 100, speed: 1.2, reward: 50, color: 0xff00ff, size: 16 },
    [EnemyType.BEHEMOTH]: { hp: 400, speed: 0.7, reward: 150, color: 0x00ff00, size: 22 },
    [EnemyType.FRACTAL]: { hp: 2000, speed: 0.4, reward: 500, color: 0xffff00, size: 30 }
};

export class Enemy {
    public container: PIXI.Container;
    public health: number;
    public maxHealth: number;
    public type: EnemyType;
    public speed: number;
    public reward: number;
    public totalProgress: number = 0;
    public reachedGoal: boolean = false;
    
    private pathPoints: PIXI.Point[];
    private currentPointIndex: number = 0;
    private visual: PIXI.Graphics;
    private healthBar: PIXI.Graphics;
    private freezeTimer: number = 0;

    constructor(type: EnemyType, waveNumber: number) {
        this.type = type;
        this.container = new PIXI.Container();
        
        // Get high-fidelity path from Manager
        this.pathPoints = GameContainer.instance.pathManager.getPathPoints();
        
        const config = ENEMY_CONFIGS[type];
        this.maxHealth = Math.floor(config.hp * Math.pow(1.15, waveNumber));
        this.health = this.maxHealth;
        this.reward = config.reward;

        let finalSpeed = config.speed;
        if (GameStateManager.getInstance().activeGlitch === 'LAG_SPIKE') finalSpeed *= 0.7;
        this.speed = finalSpeed;

        this.visual = this.createVisual(config);
        this.healthBar = new PIXI.Graphics();
        this.container.addChild(this.visual, this.healthBar);

        // Initial Position
        if (this.pathPoints.length > 0) {
            this.container.x = this.pathPoints[0].x;
            this.container.y = this.pathPoints[0].y;
        }
    }

    private createVisual(config: EnemyConfig): PIXI.Graphics {
        const g = new PIXI.Graphics();
        const s = config.size;
        if (this.type === EnemyType.GLIDER) g.circle(0, 0, s);
        else if (this.type === EnemyType.STRIDER) g.poly([-s, s, 0, -s, s, s]);
        else if (this.type === EnemyType.BEHEMOTH) g.rect(-s, -s, s*2, s*2);
        else g.poly([-s, 0, -s/2, -s, s/2, -s, s, 0, s/2, s, -s/2, s]);
        g.fill({ color: config.color, alpha: 0.8 });
        g.stroke({ width: 2, color: 0xffffff });
        return g;
    }

    public update(delta: number) {
        if (this.freezeTimer > 0) {
            this.freezeTimer -= delta;
            this.visual.tint = 0x00ffff;
            return;
        }
        this.visual.tint = 0xffffff;

        if (this.currentPointIndex >= this.pathPoints.length - 1) {
            this.reachedGoal = true;
            return;
        }

        const target = this.pathPoints[this.currentPointIndex + 1];
        const dx = target.x - this.container.x;
        const dy = target.y - this.container.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < (this.speed * delta)) {
            this.currentPointIndex++;
        } else {
            this.container.x += (dx / dist) * this.speed * delta;
            this.container.y += (dy / dist) * this.speed * delta;
            this.totalProgress += this.speed * delta;
        }

        this.visual.rotation += 0.05 * delta;
        this.updateHealthBar();
    }

    private updateHealthBar() {
        this.healthBar.clear();
        if (this.health < this.maxHealth) {
            const w = 30; const h = 4;
            this.healthBar.rect(-w/2, -25, w, h);
            this.healthBar.fill(0x000000);
            this.healthBar.rect(-w/2, -25, w * (this.health/this.maxHealth), h);
            this.healthBar.fill(0xff0000);
        }
    }

    public takeDamage(amount: number): boolean {
        this.health -= amount;
        GameContainer.instance.particleManager.spawnDebris(this.container.x, this.container.y, ENEMY_CONFIGS[this.type].color);
        return this.health <= 0;
    }

    public freeze(duration: number) {
        this.freezeTimer = duration;
    }
}
