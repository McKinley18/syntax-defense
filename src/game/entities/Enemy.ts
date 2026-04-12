import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from '../systems/GameStateManager';
import { TILE_SIZE } from '../systems/MapManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TextureGenerator } from '../utils/TextureGenerator';

export { EnemyType };

export class Enemy {
    public container: PIXI.Container;
    public health: number;
    public maxHealth: number;
    public type: EnemyType;
    public speed: number = 1.0; // Initialize with default
    public reward: number;
    public totalProgress: number = 0;
    public reachedGoal: boolean = false;
    public isElite: boolean = false;
    public isGhost: boolean = false;
    public isRevealed: boolean = false; 
    public hasThermalShield: boolean = false; 
    public shieldIntegrity: number = 0;
    public isSplitter: boolean = false;
    public parentProgress: number = 0; // To sync split children
    public lane: 'A' | 'B';

    private pathPoints: PIXI.Point[];
    private currentPointIndex: number = 0;
    private visual!: PIXI.Sprite; 
    private healthBar: PIXI.Graphics = new PIXI.Graphics();
    private shieldVisual: PIXI.Graphics | null = null;
    private freezeTimer: number = 0;


    constructor(type: EnemyType, waveNumber: number, initialProgress: number = 0, lane: 'A' | 'B' | null = null) {
        this.type = type;
        this.container = new PIXI.Container();
        
        // ASSIGN SMOOTH LANE: 50/50 chance for A or B (or inherit from parent)
        this.lane = lane || (Math.random() < 0.5 ? 'A' : 'B');
        this.pathPoints = GameContainer.instance!.pathManager.getLanePoints(this.lane);
        
        // TACTICAL MANDATE: Wave 1 (Tutorial) enemies are ALWAYS targetable.
        this.isRevealed = (waveNumber === 1) || (!this.isGhost);
        
        const config = VISUAL_REGISTRY[type];
        
        // COMPLEX BEHAVIOR INITIALIZATION
        if (type === EnemyType.BEHEMOTH) {
            this.hasThermalShield = true;
            this.shieldIntegrity = Math.floor(config.baseHp * 0.5);
            this.isSplitter = true; // Behemoths split into 2 Striders
        } else if (type === EnemyType.STRIDER && Math.random() < 0.2) {
            this.isSplitter = true; // Some Striders split into 3 Gliders
        }

        if (waveNumber % 5 === 0 && Math.random() < 0.15) {
            this.isElite = true;
        }

        if (waveNumber >= 10 && Math.random() < 0.15) {
            this.isGhost = true;
        }

        const hpMult = (this.isElite ? 3.5 : 1);
        this.maxHealth = Math.floor(config.baseHp * hpMult);
        
        // FORCED TUTORIAL LETHALITY: Wave 1 (Level 0)
        if (waveNumber === 1) {
            this.maxHealth = 50; 
            this.isRevealed = true;
            this.speed = 1.0; 
        }
        
        this.health = this.maxHealth;
        this.reward = Math.floor(config.reward * (this.isElite ? 2.5 : 1));

        let finalSpeed = this.speed || config.speed;
        if (GameStateManager.getInstance().activeGlitch === 'LAG_SPIKE') finalSpeed *= 0.7;
        this.speed = finalSpeed;

        const tex = TextureGenerator.getInstance().getEnemyTexture(type);
        this.visual = new PIXI.Sprite(tex);
        this.visual.anchor.set(0.5);
        this.visual.scale.set(1.0); // Reset scale to avoid ghost HMR effects
        this.visual.tint = type === EnemyType.GLIDER ? 0x00ffff : 0xffffff;
        this.visual.rotation = Math.PI / 2; // Point Right (System Start)
        
        if (this.isElite) {
            this.visual.scale.set(1.5);
            const glow = new PIXI.Graphics();
            glow.circle(0, 0, (TILE_SIZE / 2) * 1.6);
            glow.stroke({ width: 2, color: 0xffffff, alpha: 0.4 });
            this.container.addChild(glow);
        }

        if (this.isGhost) {
            this.container.alpha = 0.15; 
        }

        this.healthBar = new PIXI.Graphics();
        this.container.addChild(this.visual, this.healthBar);

        if (this.hasThermalShield) {
            this.shieldVisual = new PIXI.Graphics();
            this.container.addChild(this.shieldVisual);
        }

        // INITIAL POSITION & SYNC
        if (this.pathPoints.length > 0) {
            if (initialProgress > 0) {
                // Sync split child to parent's exact position on path
                this.jumpToProgress(initialProgress);
            } else {
                this.container.x = this.pathPoints[0].x;
                this.container.y = this.pathPoints[0].y;
            }
        }
    }

    private jumpToProgress(progress: number) {
        let current = 0;
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const p1 = this.pathPoints[i];
            const p2 = this.pathPoints[i+1];
            const d = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
            if (current + d > progress) {
                const ratio = (progress - current) / d;
                this.container.x = p1.x + (p2.x - p1.x) * ratio;
                this.container.y = p1.y + (p2.y - p1.y) * ratio;
                this.currentPointIndex = i;
                this.totalProgress = progress;
                return;
            }
            current += d;
        }
    }

    public update(delta: number) {
        if (this.freezeTimer > 0) {
            this.freezeTimer -= delta;
            this.visual.tint = 0x00ffff;
            return;
        }
        this.visual.tint = 0xffffff;

        // Visibility Check
        if (this.isGhost) {
            this.container.alpha = this.isRevealed ? 1.0 : 0.15;
            this.healthBar.visible = this.isRevealed;
        } else {
            this.container.alpha = 1.0;
            this.healthBar.visible = true;
        }

        if (this.currentPointIndex >= this.pathPoints.length - 1) {
            this.reachedGoal = true;
            return;
        }

        // SMOOTH MOVEMENT ALONG SPLINE
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
            const vx = dx / dist;
            const vy = dy / dist;
            this.container.x += vx * moveStep;
            this.container.y += vy * moveStep;
            
            // Dynamic Facing: Point in direction of movement
            this.visual.rotation = Math.atan2(vy, vx) + Math.PI / 2;
        }

        this.totalProgress += moveStep;
        this.drawHealthBar();
        this.drawShield();
    }

    private drawShield() {
        if (!this.shieldVisual) return;
        this.shieldVisual.clear();
        if (this.shieldIntegrity <= 0) return;

        const pulse = 0.6 + Math.sin(Date.now() * 0.01) * 0.2;
        this.shieldVisual.circle(0, 0, TILE_SIZE * 0.8);
        this.shieldVisual.stroke({ width: 2, color: 0x00ffff, alpha: pulse });
        this.shieldVisual.fill({ color: 0x00ffff, alpha: 0.1 });
    }

    private drawHealthBar() {
        this.healthBar.clear();
        if (this.health >= this.maxHealth) return;
        
        const w = 24;
        const h = 3;
        const pct = this.health / this.maxHealth;
        
        this.healthBar.rect(-w/2, -20, w, h);
        this.healthBar.fill({ color: 0x333333 });
        this.healthBar.rect(-w/2, -20, w * pct, h);
        this.healthBar.fill({ color: pct > 0.5 ? 0x00ff66 : pct > 0.25 ? 0xffcc00 : 0xff3300 });
    }

    public takeDamage(amount: number) {
        // ABSOLUTE LETHALITY: No immunity checks
        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
        }
        
        this.drawHealthBar();
        console.log(`ENEMY: Hit received. DMG: ${amount}, Remaining HP: ${this.health}`);
    }

    public applyFreeze(duration: number) {
        this.freezeTimer = Math.max(this.freezeTimer, duration);
    }

    public destroy() {
        this.container.destroy({ children: true });
    }
}
