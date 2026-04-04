import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from '../systems/GameStateManager';
import { TILE_SIZE } from '../systems/MapManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';

export { EnemyType };

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
        this.pathPoints = GameContainer.instance.pathManager.getPathPoints();
        
        // SYNC FROM REGISTRY
        const config = VISUAL_REGISTRY[type];
        
        this.maxHealth = Math.floor(config.baseHp * Math.pow(1.15, waveNumber));
        this.health = this.maxHealth;
        this.reward = config.reward;

        let finalSpeed = config.speed;
        if (GameStateManager.getInstance().activeGlitch === 'LAG_SPIKE') finalSpeed *= 0.7;
        this.speed = finalSpeed;

        this.visual = this.createVisual(config);
        this.healthBar = new PIXI.Graphics();
        this.container.addChild(this.visual, this.healthBar);

        if (this.pathPoints.length > 0) {
            this.container.x = this.pathPoints[0].x;
            this.container.y = this.pathPoints[0].y;
        }
    }

    private createVisual(config: any): PIXI.Graphics {
        const g = new PIXI.Graphics();
        const s = TILE_SIZE / 2 - 2; 
        
        if (config.shape === 'circle') g.circle(0, 0, s);
        else if (config.shape === 'triangle') g.poly([-s, s, 0, -s, s, s]);
        else if (config.shape === 'square') g.rect(-s, -s, s*2, s*2);
        else if (config.shape === 'hexagon') g.poly([-s, 0, -s/2, -s, s/2, -s, s, 0, s/2, s, -s/2, s]);
        
        g.fill({ color: config.color, alpha: 0.9 });
        g.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
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
            const w = 20; const h = 3;
            this.healthBar.rect(-w/2, -18, w, h);
            this.healthBar.fill(0x000000);
            this.healthBar.rect(-w/2, -18, w * (this.health/this.maxHealth), h);
            this.healthBar.fill(0xff0000);
        }
    }

    public takeDamage(amount: number): boolean {
        this.health -= amount;
        GameContainer.instance.particleManager.spawnDebris(this.container.x, this.container.y, VISUAL_REGISTRY[this.type].color);
        return this.health <= 0;
    }

    public freeze(duration: number) {
        this.freezeTimer = duration;
    }
}
