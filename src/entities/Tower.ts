import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';
import { TextureGenerator } from '../utils/TextureGenerator';
import { Projectile } from './Projectile';
import { TILE_SIZE } from '../systems/MapManager';
import { AudioManager } from '../systems/AudioManager';

export enum TowerType {
    PULSE_NODE,
    SONIC_IMPULSE,
    STASIS_FIELD,
    PRISM_BEAM,
    RAIL_CANNON,
    VOID_PROJECTOR
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
    [TowerType.PULSE_NODE]: { name: "PULSE", cost: 125, damage: 22, range: 5.0, cooldown: 25, color: 0x00ffff, unlockWave: 0 },
    [TowerType.SONIC_IMPULSE]: { name: "SONIC", cost: 200, damage: 30, range: 4.0, cooldown: 40, color: 0x00ff66, unlockWave: 3 },
    [TowerType.STASIS_FIELD]: { name: "STASIS", cost: 250, damage: 5, range: 4.0, cooldown: 50, color: 0xffaa00, unlockWave: 6 },
    [TowerType.PRISM_BEAM]: { name: "PRISM", cost: 350, damage: 10, range: 5.5, cooldown: 0, color: 0xff3300, unlockWave: 10 },
    [TowerType.RAIL_CANNON]: { name: "RAIL", cost: 500, damage: 120, range: 10, cooldown: 100, color: 0xff00ff, unlockWave: 15 },
    [TowerType.VOID_PROJECTOR]: { name: "VOID", cost: 800, damage: 300, range: 7, cooldown: 150, color: 0x9900ff, unlockWave: 20 }
};

export class Tower {
    public container: PIXI.Container;
    public type: TowerType;
    public config: TowerConfig;
    public tier: number = 1;
    
    private base: PIXI.Sprite;
    private chassis: PIXI.Sprite;
    private cooldownTimer: number = 0;
    private rangeGraphic: PIXI.Graphics;
    private selectionGraphic: PIXI.Graphics;
    private animTimer: number = 0;

    constructor(type: TowerType, x: number, y: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        this.container = new PIXI.Container();
        this.container.position.set(x, y);
        this.container.eventMode = 'none';

        const baseTex = TextureGenerator.getInstance().getTowerBaseTexture();
        this.base = new PIXI.Sprite(baseTex);
        this.base.anchor.set(0.5);
        this.container.addChild(this.base);

        const chassisTex = TextureGenerator.getInstance().getTowerChassisTexture(type);
        this.chassis = new PIXI.Sprite(chassisTex);
        this.chassis.anchor.set(0.5);
        this.container.addChild(this.chassis);

        this.rangeGraphic = new PIXI.Graphics();
        this.container.addChild(this.rangeGraphic);

        this.selectionGraphic = new PIXI.Graphics();
        this.container.addChild(this.selectionGraphic);
    }

    public getUpgradeCost(): number {
        return Math.floor(this.config.cost * (this.tier === 1 ? 0.8 : 1.5));
    }

    public upgrade() {
        if (this.tier < 3) {
            this.tier++;
            this.container.scale.set(1 + (this.tier - 1) * 0.1);
            return true;
        }
        return false;
    }

    public getEffectiveDamage(): number {
        return this.config.damage * (1 + (this.tier - 1) * 0.5);
    }

    public getEffectiveRange(): number {
        return this.config.range * (1 + (this.tier - 1) * 0.2) * TILE_SIZE;
    }

    public update(delta: number, enemies: any[], spawnProjectile: (p: Projectile) => void) {
        if (this.cooldownTimer > 0) this.cooldownTimer -= delta;
        this.animTimer += 0.05 * delta;

        if (this.type === TowerType.STASIS_FIELD) {
            this.chassis.rotation += 0.03 * delta;
        }

        let target = null;
        let minDist = this.getEffectiveRange();

        for (const enemy of enemies) {
            const dx = enemy.container.x - this.container.x;
            const dy = enemy.container.y - this.container.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                target = enemy;
            }
        }

        if (target) {
            const dx = target.container.x - this.container.x;
            const dy = target.container.y - this.container.y;
            const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;
            const diff = targetRotation - this.chassis.rotation;
            const shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
            this.chassis.rotation += shortestDiff * 0.2 * delta;

            if (this.cooldownTimer <= 0) {
                // TACTICAL SFX TRIGGER
                AudioManager.getInstance().playFireSfx(this.type);

                const p = new Projectile(this.type, this.container.x, this.container.y, target, this.getEffectiveDamage(), this.config.color);
                spawnProjectile(p);
                this.cooldownTimer = this.config.cooldown;
                
                this.chassis.y += 3;
                setTimeout(() => { if(this.chassis) this.chassis.y = 0; }, 40);
            }
        }

        if (this.selectionGraphic.visible) {
            const pulse = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
            this.selectionGraphic.alpha = pulse;
        }
    }

    public setHighlight(active: boolean) {
        this.rangeGraphic.clear();
        this.selectionGraphic.clear();
        this.selectionGraphic.visible = active;

        if (active) {
            this.rangeGraphic.circle(0, 0, this.getEffectiveRange())
                             .stroke({ width: 1, color: 0x00ffff, alpha: 0.2 })
                             .fill({ color: 0x00ffff, alpha: 0.03 });

            const s = 22; 
            const l = 8;  
            this.selectionGraphic.stroke({ width: 2, color: 0x00ffff });
            this.selectionGraphic.moveTo(-s, -s+l).lineTo(-s, -s).lineTo(-s+l, -s);
            this.selectionGraphic.moveTo(s-l, -s).lineTo(s, -s).lineTo(s, -s+l);
            this.selectionGraphic.moveTo(s, s-l).lineTo(s, s).lineTo(s-l, s);
            this.selectionGraphic.moveTo(-s+l, s).lineTo(-s, s).lineTo(-s, s-l);
        }
    }

    public destroy() {
        this.container.destroy({ children: true });
    }
}
