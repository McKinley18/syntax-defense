import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { AudioManager } from '../systems/AudioManager';

export enum TowerType {
    PULSE_NODE,
    SONIC_IMPULSE,
    STASIS_FIELD,
    PRISM_BEAM,
    RAIL_CANNON,
    VOID_PROJECTOR
}

export enum TargetMode {
    CLOSEST,
    STRONGEST,
    WEAKEST
}

export interface TowerConfig {
    name: string;
    cost: number;
    damage: number;
    range: number; // in tiles
    cooldown: number; // in frames (60fps)
    color: number;
    unlockWave: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
    [TowerType.PULSE_NODE]: { name: "PULSE_NODE", cost: 150, damage: 10, range: 3.5, cooldown: 45, color: 0x00ffff, unlockWave: 0 },
    [TowerType.SONIC_IMPULSE]: { name: "SONIC_IMPULSE", cost: 250, damage: 15, range: 4.5, cooldown: 60, color: 0x00ff66, unlockWave: 2 },
    [TowerType.STASIS_FIELD]: { name: "STASIS_FIELD", cost: 400, damage: 5, range: 3.0, cooldown: 90, color: 0x0066ff, unlockWave: 5 },
    [TowerType.PRISM_BEAM]: { name: "PRISM_BEAM", cost: 650, damage: 40, range: 5.0, cooldown: 30, color: 0xff00ff, unlockWave: 10 },
    [TowerType.RAIL_CANNON]: { name: "RAIL_CANNON", cost: 1200, damage: 120, range: 8.0, cooldown: 180, color: 0xff3300, unlockWave: 15 },
    [TowerType.VOID_PROJECTOR]: { name: "VOID_PROJECTOR", cost: 2500, damage: 250, range: 4.0, cooldown: 120, color: 0xffffff, unlockWave: 20 }
};

export class Tower {
    public container: PIXI.Container;
    public type: TowerType;
    public config: TowerConfig;
    public tier: number = 1;
    public targetMode: TargetMode = TargetMode.CLOSEST;
    public killCount: number = 0;
    
    private primaryTarget: Enemy | null = null;
    private cooldownTimer: number = 0;
    private rangeGraphic: PIXI.Graphics;
    private selectionGraphic: PIXI.Graphics;
    private chassis: PIXI.Sprite;

    constructor(type: TowerType, gridX: number, gridY: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        this.container = new PIXI.Container();
        this.container.position.set((gridX + 0.5) * 40, (gridY + 0.5) * 40);

        const base = new PIXI.Sprite(PIXI.Texture.from('turret_base'));
        base.anchor.set(0.5);
        base.width = 34; base.height = 34;
        base.tint = 0x222222;

        this.chassis = new PIXI.Sprite(PIXI.Texture.from('turret_chassis'));
        this.chassis.anchor.set(0.5, 0.5);
        this.chassis.width = 28; this.chassis.height = 28;
        this.chassis.tint = this.config.color;

        this.rangeGraphic = new PIXI.Graphics();
        this.rangeGraphic.visible = false;

        this.selectionGraphic = new PIXI.Graphics();
        this.selectionGraphic.visible = false;

        this.container.addChild(this.rangeGraphic);
        this.container.addChild(base);
        this.container.addChild(this.chassis);
        this.container.addChild(this.selectionGraphic);

        this.drawSelection();
        this.drawRange();
    }

    public update(dt: number, enemies: Enemy[], spawnProjectile: (p: Projectile) => void) {
        if (this.cooldownTimer > 0) this.cooldownTimer -= dt;

        // 1. STICKY TARGET LOCK: Validate existing target
        if (this.primaryTarget) {
            if (this.primaryTarget.isDead || this.primaryTarget.isFinished || !this.isInRange(this.primaryTarget)) {
                this.primaryTarget = null;
            }
        }

        // 2. ACQUISITION: Find new target if none locked
        if (!this.primaryTarget) {
            this.primaryTarget = this.findBestTarget(enemies);
        }

        // 3. COMBAT ENGAGEMENT
        if (this.primaryTarget) {
            const targetPos = this.primaryTarget.container.position;
            const dx = targetPos.x - this.container.x;
            const dy = targetPos.y - this.container.y;
            this.chassis.rotation = Math.atan2(dy, dx) + Math.PI / 2;

            if (this.cooldownTimer <= 0) {
                // PATH-AWARE PREDICTION
                const aim = this.calculateIntercept(this.primaryTarget);
                const p = new Projectile(this.type, this.container.x, this.container.y, this.primaryTarget, this.getEffectiveDamage(), this.config.color, aim, this);
                spawnProjectile(p);
                this.cooldownTimer = this.config.cooldown;
                AudioManager.getInstance().playFireSfx(this.type);
            }
        }
    }

    private findBestTarget(enemies: Enemy[]): Enemy | null {
        let best: Enemy | null = null;
        let bestVal = Infinity;

        for (const e of enemies) {
            if (this.isInRange(e)) {
                const dist = Math.sqrt(Math.pow(e.container.x - this.container.x, 2) + Math.pow(e.container.y - this.container.y, 2));
                if (dist < bestVal) {
                    bestVal = dist;
                    best = e;
                }
            }
        }
        return best;
    }

    private isInRange(e: Enemy): boolean {
        const dx = e.container.x - this.container.x;
        const dy = e.container.y - this.container.y;
        return (dx * dx + dy * dy) <= Math.pow(this.config.range * 40, 2);
    }

    private calculateIntercept(target: Enemy) {
        // Linear prediction for now, but prioritized with Target speed
        const pSpeed = 8; 
        const tx = target.container.x;
        const ty = target.container.y;
        const vx = target.velocity.x;
        const vy = target.velocity.y;

        const dx = tx - this.container.x;
        const dy = ty - this.container.y;

        const a = vx * vx + vy * vy - pSpeed * pSpeed;
        const b = 2 * (vx * dx + vy * dy);
        const c = dx * dx + dy * dy;

        const disc = b * b - 4 * a * c;
        if (disc < 0) return { x: tx, y: ty };

        const t1 = (-b + Math.sqrt(disc)) / (2 * a);
        const t2 = (-b - Math.sqrt(disc)) / (2 * a);
        const t = t1 > 0 ? t1 : t2;

        return { x: tx + vx * t, y: ty + vy * t };
    }

    public getEffectiveDamage() { return this.config.damage * (1 + (this.tier - 1) * 0.5); }
    public getEffectiveRange() { return this.config.range * 40; }
    public getUpgradeCost() { return Math.round(this.config.cost * 0.8 * this.tier); }
    public getRefundValue() { return Math.round(this.config.cost * 0.75 + (this.tier - 1) * this.config.cost * 0.4); }

    public upgrade() {
        if (this.tier < 3) {
            this.tier++;
            this.drawRange();
            if (this.tier === 3) this.chassis.alpha = 1.0; 
            return true;
        }
        return false;
    }

    public recordPurge() { this.killCount++; }
    public showRange(val: boolean) { this.rangeGraphic.visible = val; this.selectionGraphic.visible = val; }

    private drawRange() {
        this.rangeGraphic.clear();
        this.rangeGraphic.circle(0, 0, this.config.range * 40).fill({ color: this.config.color, alpha: 0.05 }).stroke({ color: this.config.color, width: 1, alpha: 0.2 });
    }

    private drawSelection() {
        this.selectionGraphic.clear();
        const s = 22; const l = 6;
        this.selectionGraphic.stroke({ color: 0x00ffff, width: 2 });
        this.selectionGraphic.moveTo(-s, -s+l).lineTo(-s, -s).lineTo(-s+l, -s);
        this.selectionGraphic.moveTo(s-l, -s).lineTo(s, -s).lineTo(s, -s+l);
        this.selectionGraphic.moveTo(s, s-l).lineTo(s, s).lineTo(s-l, s);
        this.selectionGraphic.moveTo(-s+l, s).lineTo(-s, s).lineTo(-s, s-l);
    }

    public destroy() { this.container.destroy({ children: true }); }
}
