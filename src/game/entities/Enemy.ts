import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from '../systems/GameStateManager';
import { TILE_SIZE } from '../systems/MapManager';
import { EnemyType, VISUAL_REGISTRY, type VisualConfig } from '../VisualRegistry';
import { TextureGenerator } from '../utils/TextureGenerator';

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
    public isGhost: boolean = false;
    public isRevealed: boolean = false; 
    public hasThermalShield: boolean = false; 

    private pathPoints: PIXI.Point[];
    private currentPointIndex: number = 0;
    private visual: PIXI.Sprite; // NOW USING SPRITE FOR BATCHING
    private shieldVisual?: PIXI.Graphics;
    private healthBar: PIXI.Graphics;
    private freezeTimer: number = 0;
    private laneOffset: { dx: number, dy: number } = { dx: 0, dy: 0 };
    private offsetVal: number = 0;

    constructor(type: EnemyType, waveNumber: number) {
        this.type = type;
        this.container = new PIXI.Container();
        this.pathPoints = GameContainer.instance!.pathManager.getPathPoints();
        
        this.offsetVal = (Math.random() * TILE_SIZE * 0.8) - (TILE_SIZE * 0.4);
        
        const config = VISUAL_REGISTRY[type];
        
        if (waveNumber % 5 === 0 && Math.random() < 0.15) {
            this.isElite = true;
        }

        if (waveNumber >= 10 && Math.random() < 0.15) {
            this.isGhost = true;
        }

        const hpMult = (this.isElite ? 3.5 : 1);
        this.maxHealth = Math.floor(config.baseHp * hpMult);
        this.health = this.maxHealth;
        this.reward = Math.floor(config.reward * (this.isElite ? 2.5 : 1));

        let finalSpeed = config.speed;
        
        if (GameStateManager.getInstance().activeGlitch === 'LAG_SPIKE') finalSpeed *= 0.7;
        this.speed = finalSpeed;

        // FETCH CACHED TEXTURE INSTEAD OF DRAWING PROCEDURALLY
        const tex = TextureGenerator.getInstance().getEnemyTexture(type);
        this.visual = new PIXI.Sprite(tex);
        this.visual.anchor.set(0.5); // Center the sprite
        
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

        if (this.pathPoints.length > 0) {
            const startVec = GameContainer.instance!.pathManager.pathVectors[0] || { dx: 1, dy: 0 };
            this.laneOffset = { dx: -startVec.dy * this.offsetVal, dy: startVec.dx * this.offsetVal };
            
            this.container.x = this.pathPoints[0].x + this.laneOffset.dx;
            this.container.y = this.pathPoints[0].y + this.laneOffset.dy;
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
        }

        if (this.currentPointIndex >= this.pathPoints.length - 1) {
            this.reachedGoal = true;
            return;
        }

        const target = this.pathPoints[this.currentPointIndex + 1];
        const vec = GameContainer.instance!.pathManager.pathVectors[this.currentPointIndex];
        const moveStep = this.speed * delta;
        
        // Update lane offset based on current direction to stay in "lane"
        const perp = { dx: -vec.dy, dy: vec.dx };
        this.laneOffset = { dx: perp.dx * this.offsetVal, dy: perp.dy * this.offsetVal };
        
        let reached = false;
        // Check progress against target point (ignoring lane offset for logic)
        const currentPureX = this.container.x - this.laneOffset.dx;
        const currentPureY = this.container.y - this.laneOffset.dy;

        if (vec.dx !== 0) {
            if (vec.dx > 0 && currentPureX + moveStep >= target.x) reached = true;
            else if (vec.dx < 0 && currentPureX - moveStep <= target.x) reached = true;
        } else {
            if (vec.dy > 0 && currentPureY + moveStep >= target.y) reached = true;
            else if (vec.dy < 0 && currentPureY - moveStep <= target.y) reached = true;
        }

        if (reached) {
            this.currentPointIndex++;
            if (this.currentPointIndex < this.pathPoints.length - 1) {
                const nextVec = GameContainer.instance!.pathManager.pathVectors[this.currentPointIndex];
                const nextPerp = { dx: -nextVec.dy, dy: nextVec.dx };
                this.container.x = target.x + (nextPerp.dx * this.offsetVal);
                this.container.y = target.y + (nextPerp.dy * this.offsetVal);
            } else {
                this.container.x = target.x + this.laneOffset.dx;
                this.container.y = target.y + this.laneOffset.dy;
            }
        } else {
            this.container.x += vec.dx * moveStep;
            this.container.y += vec.dy * moveStep;
        }
        
        this.totalProgress += moveStep;
        this.visual.rotation += 0.05 * delta;
        this.updateHealthBar();
        
        this.isRevealed = false; // Reset for next frame
    }

    private updateHealthBar() {
        this.healthBar.clear();
        const width = TILE_SIZE * 0.8;
        const height = 4;
        const yOffset = this.isElite ? -25 : -18;
        const pct = Math.max(0, this.health / this.maxHealth);

        // Background
        this.healthBar.rect(-width/2, yOffset, width, height);
        this.healthBar.fill(0x1a1a1a);
        this.healthBar.stroke({ width: 1, color: 0x333333 });

        // Fill
        this.healthBar.rect(-width/2, yOffset, width * pct, height);
        this.healthBar.fill(pct > 0.5 ? 0x00ffcc : pct > 0.25 ? 0xffcc00 : 0xff3300);
    }

    public renderShield() {
        if (this.hasThermalShield && !this.shieldVisual) {
            this.shieldVisual = new PIXI.Graphics();
            this.shieldVisual.circle(0, 0, (TILE_SIZE / 2) + 2);
            this.shieldVisual.stroke({ width: 2, color: 0xff3300, alpha: 0.8 });
            this.container.addChild(this.shieldVisual);
        }
    }

    public takeDamage(amount: number, sourceType?: number): boolean {
        let finalDamage = amount;
        
        if (this.hasThermalShield && sourceType === 0) { // PULSE_MG
            finalDamage *= 0.5; // 50% RESISTANCE
            if (GameContainer.instance) {
                GameContainer.instance.particleManager.spawnFloatingText(this.container.x, this.container.y - 20, "RESIST");
            }
        }
        
        this.health -= finalDamage;

        if (GameContainer.instance) {
            GameContainer.instance.particleManager.spawnHitMarker(this.container.x, this.container.y, finalDamage);
        }

        if (this.isElite || this.type === 3) {
            this.updateHealthBar();
        }

        return this.health <= 0;
    }

    public freeze(duration: number) {
        this.freezeTimer = duration;
    }
}
