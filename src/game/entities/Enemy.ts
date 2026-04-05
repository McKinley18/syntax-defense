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
    public isElite: boolean = false;
    
    private pathPoints: PIXI.Point[];
    private currentPointIndex: number = 0;
    private visual: PIXI.Graphics;
    private healthBar: PIXI.Graphics;
    private freezeTimer: number = 0;

    constructor(type: EnemyType, waveNumber: number) {
        this.type = type;
        this.container = new PIXI.Container();
        this.pathPoints = GameContainer.instance.pathManager.getPathPoints();
        
        const config = VISUAL_REGISTRY[type];
        
        // ELITE SIGNATURE LOGIC (10% chance every 5 waves)
        if (waveNumber % 5 === 0 && Math.random() < 0.15) {
            this.isElite = true;
        }

        const hpMult = Math.pow(1.15, waveNumber) * (this.isElite ? 3.5 : 1);
        this.maxHealth = Math.floor(config.baseHp * hpMult);
        this.health = this.maxHealth;
        this.reward = Math.floor(config.reward * (this.isElite ? 2.5 : 1));

        let finalSpeed = config.speed;
        if (GameStateManager.getInstance().activeGlitch === 'LAG_SPIKE') finalSpeed *= 0.7;
        this.speed = finalSpeed;

        this.visual = this.createVisual(config);
        
        if (this.isElite) {
            this.visual.scale.set(1.5);
            const glow = new PIXI.Graphics();
            glow.circle(0, 0, (TILE_SIZE / 2) * 1.6);
            glow.stroke({ width: 2, color: 0xffffff, alpha: 0.4 });
            this.container.addChild(glow);
        }

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
        
        if (config.shape === 'circle') {
            g.circle(0, 0, s);
        } else if (config.shape === 'triangle') {
            g.poly([-s, s, 0, -s, s, s]);
        } else if (config.shape === 'square') {
            g.rect(-s, -s, s*2, s*2);
        } else if (config.shape === 'hexagon') {
            g.poly([-s, 0, -s/2, -s, s/2, -s, s, 0, s/2, s, -s/2, s]);
        }
        
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
        const moveStep = this.speed * delta;

        if (dist <= moveStep) {
            this.container.x = target.x;
            this.container.y = target.y;
            this.currentPointIndex++;
        } else {
            const ratio = moveStep / dist;
            this.container.x += dx * ratio;
            this.container.y += dy * ratio;
        }
        
        this.totalProgress += moveStep;
        this.visual.rotation += 0.05 * delta;
        this.updateHealthBar();
    }

    private updateHealthBar() {
        this.healthBar.clear();
        const width = 24;
        const height = 4;
        const yOffset = this.isElite ? -25 : -18;
        
        this.healthBar.rect(-width/2, yOffset, width, height);
        this.healthBar.fill(0x000000);
        this.healthBar.stroke({ width: 1, color: 0x000000 });

        const fillWidth = (this.health / this.maxHealth) * width;
        this.healthBar.rect(-width/2, yOffset, fillWidth, height);
        this.healthBar.fill(0xff3300);
    }

    public takeDamage(amount: number): boolean {
        this.health -= amount;
        return this.health <= 0;
    }

    public freeze(duration: number) {
        this.freezeTimer = duration;
    }
}
