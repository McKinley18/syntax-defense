import * as PIXI from 'pixi.js';
import { StateManager } from '../core/StateManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TextureGenerator } from '../utils/TextureGenerator';

/**
 * ENEMY v85.0: Visual Puppet (STUN-ENABLED)
 * THE REBUILD: No autonomous movement. No coordinate arrays.
 * Supports the new Stasis Field pause effect via stunTimer.
 */
export class Enemy {
    public container: PIXI.Container;
    public sprite: PIXI.Sprite;
    public type: EnemyType;
    public hp: number;
    public maxHp: number;
    public distance: number = 0;
    
    public isDead: boolean = false;
    public isFinished: boolean = false;
    private stunTimer: number = 0;
    
    private readonly VIRUS_SIZE = 18; 
    private healthBar: PIXI.Graphics;

    constructor(type: EnemyType, waveMult: number = 1) {
        this.type = type;
        const config = VISUAL_REGISTRY[type];
        this.hp = config.hp * waveMult;
        this.maxHp = this.hp;

        this.container = new PIXI.Container();
        this.sprite = new PIXI.Sprite(TextureGenerator.getInstance().getEnemyTexture(type));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(this.VIRUS_SIZE / 24);

        this.container.addChild(this.sprite);
        this.healthBar = new PIXI.Graphics();
        this.healthBar.position.set(0, -10);
        this.container.addChild(this.healthBar);
        this.updateHealthBar();
    }

    public project(x: number, y: number, rotation: number, lateralOffset: number) {
        if (this.stunTimer > 0) return; // Freeze visual update if stunned

        const perpAngle = rotation + Math.PI / 2;
        this.container.x = x + Math.cos(perpAngle) * lateralOffset;
        this.container.y = y + Math.sin(perpAngle) * lateralOffset;
        this.container.rotation = rotation + Math.PI / 2;

        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.04;
        this.sprite.scale.set((this.VIRUS_SIZE / 24) * pulse);
    }

    public update(dt: number) {
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            this.sprite.tint = 0x0066ff; // Blue tint while frozen
        } else {
            this.sprite.tint = 0xffffff;
        }
    }

    public updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.rect(-7, 0, 14, 2).fill({ color: 0x333333, alpha: 0.5 });
        const pct = Math.max(0, this.hp / this.maxHp);
        const color = pct < 0.3 ? 0xff3300 : 0x00ffff;
        this.healthBar.rect(-7, 0, 14 * pct, 2).fill({ color, alpha: 0.8 });
    }

    public takeDamage(amount: number) {
        this.hp -= amount;
        this.updateHealthBar();
        if (this.hp <= 0) this.isDead = true;
    }

    public applyStun(duration: number) {
        this.stunTimer = Math.max(this.stunTimer, duration);
    }

    public get isStunned(): boolean {
        return this.stunTimer > 0;
    }
}
