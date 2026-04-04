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
    hp: number;
    speed: number;
    reward: number;
    color: number;
    size: number;
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
    public stagger: number;
    public reachedGoal: boolean = false;
    public totalProgress: number = 0;
    
    private freezeTimer: number = 0;
    private currentNodeId: string;
    private targetNodeId: string | null = null;
    private segmentProgress: number = 0;
    private visual: PIXI.Graphics;
    private healthBar: PIXI.Graphics;

    constructor(type: EnemyType, waveNumber: number, startNodeId: string) {
        this.type = type;
        this.container = new PIXI.Container();
        this.stagger = (Math.random() - 0.5) * 40;
        this.currentNodeId = startNodeId;

        const config = ENEMY_CONFIGS[type];
        // EXPONENTIAL HP SCALING: 15% increase per wave for higher difficulty
        this.maxHealth = Math.floor(config.hp * Math.pow(1.15, waveNumber));
        this.health = this.maxHealth;
        
        // Glitch Logic: LAG_SPIKE reduces speed by 30%
        let finalSpeed = config.speed;
        if (GameStateManager.getInstance().activeGlitch === 'LAG_SPIKE') {
            finalSpeed *= 0.7;
        }
        this.speed = finalSpeed;
        
        this.reward = config.reward;

        this.visual = this.createVisual(config);
        this.healthBar = new PIXI.Graphics();
        this.container.addChild(this.visual, this.healthBar);
        this.pickNextTarget();
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

    public freeze(duration: number) {
        this.freezeTimer = duration;
    }

    private pickNextTarget() {
        const node = GameContainer.instance.pathManager.nodes.get(this.currentNodeId);
        if (node && node.next.length > 0) {
            this.targetNodeId = node.next[Math.floor(Math.random() * node.next.length)];
            this.segmentProgress = 0;
        } else {
            this.targetNodeId = null;
            this.reachedGoal = true;
        }
    }

    public update(delta: number) {
        if (this.freezeTimer > 0) {
            this.freezeTimer -= delta;
            this.visual.tint = 0x00ffff;
            return;
        }
        
        // Visual Glitch if health is critical
        if (this.health < this.maxHealth * 0.25 && Math.random() > 0.8) {
            this.visual.tint = 0xff0000;
            this.visual.x = (Math.random() - 0.5) * 4;
        } else {
            this.visual.tint = 0xffffff;
            this.visual.x = 0;
        }

        if (!this.targetNodeId) return;

        const startNode = GameContainer.instance.pathManager.nodes.get(this.currentNodeId);
        const endNode = GameContainer.instance.pathManager.nodes.get(this.targetNodeId);

        if (startNode && endNode) {
            const dx = endNode.pos.x - startNode.pos.x;
            const dy = endNode.pos.y - startNode.pos.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            const moveStep = (this.speed * delta);
            this.segmentProgress += moveStep / dist;
            this.totalProgress += moveStep;

            if (this.segmentProgress >= 1) {
                this.currentNodeId = this.targetNodeId;
                this.pickNextTarget();
            } else {
                this.container.x = startNode.pos.x + dx * this.segmentProgress;
                this.container.y = startNode.pos.y + dy * this.segmentProgress;
                const nx = -dy / dist;
                const ny = dx / dist;
                this.container.x += nx * this.stagger;
                this.container.y += ny * this.stagger;
            }
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
        
        // Spawn small debris on impact
        GameContainer.instance.particleManager.spawnDebris(this.container.x, this.container.y, ENEMY_CONFIGS[this.type].color);
        
        return this.health <= 0;
    }
}
