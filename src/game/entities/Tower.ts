import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '../systems/MapManager';
import { GameStateManager } from '../systems/GameStateManager';

export const TowerType = {
    PULSE_MG: 0,
    FROST_RAY: 1,
    BLAST_NOVA: 2,
    RAILGUN: 3
} as const;

export type TowerType = typeof TowerType[keyof typeof TowerType];

interface TowerConfig {
    name: string;
    range: number;
    damage: number;
    rate: number;
    cost: number;
    color: number;
    typeLabel: string;
    special: 'none' | 'freeze' | 'aoe' | 'rail';
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
    [TowerType.PULSE_MG]: { name: 'Pulse MG', range: 4, damage: 10, rate: 12, cost: 150, color: 0x00ffcc, typeLabel: 'Rapid', special: 'none' },
    [TowerType.FROST_RAY]: { name: 'Frost Ray', range: 5, damage: 2, rate: 60, cost: 250, color: 0x00ffff, typeLabel: 'Freeze', special: 'freeze' },
    [TowerType.BLAST_NOVA]: { name: 'Blast Nova', range: 3, damage: 30, rate: 80, cost: 350, color: 0xffcc00, typeLabel: 'Radius', special: 'aoe' },
    [TowerType.RAILGUN]: { name: 'Railgun', range: 10, damage: 250, rate: 120, cost: 500, color: 0xff3300, typeLabel: 'Massive', special: 'rail' }
};

export class Tower {
    public container: PIXI.Container;
    public type: TowerType;
    public config: TowerConfig;
    
    private fireTimer: number = 0;
    private turretHead: PIXI.Container;
    private recoilOffset: number = 0;
    private muzzleFlash: PIXI.Graphics;

    private effectiveRange: number;
    private effectiveRate: number;

    constructor(type: TowerType, x: number, y: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        const glitch = GameStateManager.getInstance().activeGlitch;
        this.effectiveRange = this.config.range;
        this.effectiveRate = this.config.rate;
        
        if (glitch === 'SYSTEM_DRAIN') {
            this.effectiveRange = Math.max(1, this.effectiveRange - 2);
        } else if (glitch === 'OVERCLOCK') {
            this.effectiveRate = Math.max(5, this.effectiveRate * 0.5);
        }

        const base = new PIXI.Graphics();
        const s = TILE_SIZE / 2;
        base.poly([-s, -s/2, -s/2, -s, s/2, -s, s, -s/2, s, s/2, s/2, s, -s/2, s, -s, s/2]);
        base.fill(0x2c3e50);
        base.stroke({ width: 2, color: 0x111111 });
        this.container.addChild(base);

        this.turretHead = new PIXI.Container();
        this.container.addChild(this.turretHead);

        const headBase = new PIXI.Graphics();
        headBase.circle(0, 0, 8);
        headBase.fill(0x34495e);
        headBase.stroke({ width: 1.5, color: 0x000000 });
        this.turretHead.addChild(headBase);

        this.muzzleFlash = new PIXI.Graphics();
        this.muzzleFlash.alpha = 0;
        this.turretHead.addChild(this.muzzleFlash);

        this.createWeaponVisuals();
    }

    private createWeaponVisuals() {
        if (this.type === TowerType.PULSE_MG) {
            const b1 = new PIXI.Graphics(); b1.rect(-4, -15, 3, 12); b1.fill(0x111111);
            const b2 = new PIXI.Graphics(); b2.rect(1, -15, 3, 12); b2.fill(0x111111);
            this.turretHead.addChild(b1, b2);
        } else if (this.type === TowerType.FROST_RAY) {
            const g = new PIXI.Graphics(); g.poly([-5, -5, 0, -20, 5, -5]); g.fill(0x00ffff);
            this.turretHead.addChild(g);
        } else if (this.type === TowerType.BLAST_NOVA) {
            const g = new PIXI.Graphics(); g.roundRect(-6, -15, 12, 15, 2); g.fill(0x222222);
            g.circle(0, -15, 7); g.fill(0x111111);
            this.turretHead.addChild(g);
        } else if (this.type === TowerType.RAILGUN) {
            const g = new PIXI.Graphics(); g.rect(-5, -25, 2, 22); g.rect(3, -25, 2, 22); g.fill(0x111111);
            for(let i=0; i<3; i++) { g.rect(-6, -22 + (i*6), 12, 2); g.fill(0xff3300); }
            this.turretHead.addChild(g);
        }
    }

    public update(delta: number, enemies: Enemy[]) {
        this.fireTimer -= delta;
        if (this.recoilOffset > 0) {
            this.recoilOffset -= 0.2 * delta;
            this.turretHead.y = this.recoilOffset;
        }
        if (this.muzzleFlash.alpha > 0) this.muzzleFlash.alpha -= 0.1 * delta;

        const target = this.findTarget(enemies);
        if (target) {
            const dx = target.container.x - this.container.x;
            const dy = target.container.y - this.container.y;
            const targetRot = Math.atan2(dy, dx) + Math.PI/2;
            let diff = targetRot - this.turretHead.rotation;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.turretHead.rotation += diff * 0.15 * delta;

            if (this.fireTimer <= 0) {
                this.fire(target, enemies);
                this.fireTimer = this.effectiveRate;
            }
        } else if (this.type === TowerType.PULSE_MG) {
            this.turretHead.rotation += 0.01 * delta;
        }
    }

    private findTarget(enemies: Enemy[]): Enemy | null {
        let bestTarget: Enemy | null = null;
        let maxProgress = -1;
        
        // PERFORMANCE: Use distance squared
        const pixelRangeSq = (this.effectiveRange * TILE_SIZE) ** 2;
        
        for (const enemy of enemies) {
            const dx = enemy.container.x - this.container.x;
            const dy = enemy.container.y - this.container.y;
            const distSq = dx*dx + dy*dy;
            
            if (distSq <= pixelRangeSq && enemy.totalProgress > maxProgress) {
                maxProgress = enemy.totalProgress;
                bestTarget = enemy;
            }
        }
        return bestTarget;
    }

    private fire(target: Enemy, allEnemies: Enemy[]) {
        this.recoilOffset = 3;
        this.showMuzzleFlash();
        if (this.config.special === 'aoe') {
            allEnemies.forEach(e => {
                const dx = e.container.x - target.container.x;
                const dy = e.container.y - target.container.y;
                if (dx*dx + dy*dy < 3600) e.takeDamage(this.config.damage);
            });
            this.drawEffect(target.container.x, target.container.y, 'ring');
        } else {
            const isDead = target.takeDamage(this.config.damage);
            if (this.config.special === 'freeze' && !isDead) target.freeze(300);
            this.drawEffect(target.container.x, target.container.y, 'line');
        }
    }

    private showMuzzleFlash() {
        this.muzzleFlash.clear();
        this.muzzleFlash.circle(0, -20, 5 + Math.random() * 5);
        this.muzzleFlash.fill({ color: 0xffffff, alpha: 0.8 });
        this.muzzleFlash.alpha = 1;
    }

    private drawEffect(tx: number, ty: number, style: 'line' | 'ring') {
        const g = new PIXI.Graphics();
        if (style === 'line') {
            g.moveTo(this.container.x, this.container.y).lineTo(tx, ty);
            g.stroke({ width: 1.5, color: this.config.color, alpha: 0.8 });
        } else {
            g.circle(tx, ty, 60);
            g.stroke({ width: 3, color: this.config.color, alpha: 0.5 });
        }
        GameContainer.instance.effectLayer.addChild(g);
        setTimeout(() => g.destroy(), 50);
    }
}
