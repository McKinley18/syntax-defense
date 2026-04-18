import * as PIXI from 'pixi.js';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { AudioManager } from '../systems/AudioManager';
import { TextureGenerator } from '../utils/TextureGenerator';

export enum TowerType {
    PULSE_NODE,      // Fast Single
    SONIC_IMPULSE,   // AOE Burst
    STASIS_FIELD,    // Slow Field
    PRISM_BEAM,      // High Rate Focus
    RAIL_CANNON,     // Piercing Line
    VOID_PROJECTOR   // Massive Single
}

export enum TargetMode {
    CLOSEST,
    FIRST,
    WEAKEST,
    STRONGEST
}

export interface TowerConfig {
    name: string;
    cost: number;
    damage: number;
    range: number; 
    cooldown: number; 
    color: number;
    unlockWave: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
    [TowerType.PULSE_NODE]: { name: "PULSE_NODE", cost: 150, damage: 12, range: 3.5, cooldown: 40, color: 0x00ffff, unlockWave: 0 },
    [TowerType.SONIC_IMPULSE]: { name: "SONIC_IMPULSE", cost: 250, damage: 8, range: 3.0, cooldown: 70, color: 0x00ff66, unlockWave: 2 },
    [TowerType.STASIS_FIELD]: { name: "STASIS_FIELD", cost: 400, damage: 2, range: 4.0, cooldown: 90, color: 0x0066ff, unlockWave: 5 },
    [TowerType.PRISM_BEAM]: { name: "PRISM_BEAM", cost: 650, damage: 45, range: 5.0, cooldown: 25, color: 0xff00ff, unlockWave: 10 },
    [TowerType.RAIL_CANNON]: { name: "RAIL_CANNON", cost: 1200, damage: 150, range: 9.0, cooldown: 180, color: 0xff3300, unlockWave: 15 },
    [TowerType.VOID_PROJECTOR]: { name: "VOID_PROJECTOR", cost: 2500, damage: 400, range: 4.5, cooldown: 140, color: 0xffffff, unlockWave: 20 }
};

/**
 * TOWER v50.0: Multimodal Engagement Engine
 */
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

        const tg = TextureGenerator.getInstance();
        const base = new PIXI.Sprite(tg.getTowerBaseTexture());
        base.anchor.set(0.5);
        base.width = 34; base.height = 34;

        this.chassis = new PIXI.Sprite(tg.getTowerChassisTexture(type));
        this.chassis.anchor.set(0.5, 0.5);
        this.chassis.width = 28; this.chassis.height = 28;

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

        if (this.primaryTarget) {
            if (this.primaryTarget.isDead || this.primaryTarget.isFinished || !this.isInRange(this.primaryTarget)) {
                this.primaryTarget = null;
            }
        }

        if (!this.primaryTarget) {
            this.primaryTarget = this.findBestTarget(enemies);
        }

        if (this.primaryTarget) {
            const targetPos = this.primaryTarget.container.position;
            const dx = targetPos.x - this.container.x;
            const dy = targetPos.y - this.container.y;
            this.chassis.rotation = Math.atan2(dy, dx) + Math.PI / 2;

            if (this.cooldownTimer <= 0) {
                const p = new Projectile(this.type, this.container.x, this.container.y, this.primaryTarget, this.getEffectiveDamage(), this.config.color, this);
                spawnProjectile(p);
                this.cooldownTimer = this.config.cooldown;
                AudioManager.getInstance().playFireSfx(this.type);
            }
        }
    }

    private findBestTarget(enemies: Enemy[]): Enemy | null {
        let best: Enemy | null = null;
        let bestScore = -Infinity;

        for (const e of enemies) {
            if (this.isInRange(e)) {
                let score = 0;
                const dist = Math.sqrt(Math.pow(e.container.x - this.container.x, 2) + Math.pow(e.container.y - this.container.y, 2));

                switch(this.targetMode) {
                    case TargetMode.CLOSEST:
                        score = -dist; 
                        break;
                    case TargetMode.FIRST:
                        score = e.currentCellIndex * 1000 - dist; 
                        break;
                    case TargetMode.WEAKEST:
                        score = -e.hp;
                        break;
                    case TargetMode.STRONGEST:
                        score = e.hp;
                        break;
                }

                if (score > bestScore) {
                    bestScore = score;
                    best = e;
                }
            }
        }
        return best;
    }

    public cycleTargetMode() {
        this.targetMode = (this.targetMode + 1) % 4;
        AudioManager.getInstance().playUiClick();
    }

    private isInRange(e: Enemy): boolean {
        const dx = e.container.x - this.container.x;
        const dy = e.container.y - this.container.y;
        return (dx * dx + dy * dy) <= Math.pow(this.config.range * 40, 2);
    }

    public getEffectiveDamage() { return this.config.damage * (1 + (this.tier - 1) * 0.5); }
    public getEffectiveRange() { return this.config.range; }
    public getUpgradeCost() { return Math.round(this.config.cost * 0.8 * this.tier); }
    public getRefundValue() { return Math.round(this.config.cost * 0.75 + (this.tier - 1) * this.config.cost * 0.4); }

    public upgrade() {
        if (this.tier < 3) {
            this.tier++;
            this.drawRange();
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
