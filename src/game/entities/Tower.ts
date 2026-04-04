import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '../systems/MapManager';

export const TowerType = {
    PULSE_MG: 0,
    FROST_RAY: 1,
    BLAST_NOVA: 2,
    RAILGUN: 3
} as const;

export type TowerType = typeof TowerType[keyof typeof TowerType];

interface TowerConfig {
    name: string; range: number; damage: number; rate: number; cost: number; color: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
    [TowerType.PULSE_MG]: { name: 'Pulse MG', range: 4, damage: 10, rate: 12, cost: 150, color: 0x00ffcc },
    [TowerType.FROST_RAY]: { name: 'Frost Ray', range: 5, damage: 2, rate: 60, cost: 250, color: 0x00ffff },
    [TowerType.BLAST_NOVA]: { name: 'Blast Nova', range: 3, damage: 30, rate: 80, cost: 350, color: 0xffcc00 },
    [TowerType.RAILGUN]: { name: 'Railgun', range: 10, damage: 250, rate: 120, cost: 500, color: 0xff3300 }
};

export class Tower {
    public container: PIXI.Container;
    public type: TowerType;
    public config: TowerConfig;
    
    private fireTimer: number = 0;
    private turretHead: PIXI.Container;
    private muzzleFlash: PIXI.Graphics;
    private deploymentTimer: number = 30;

    constructor(type: TowerType, x: number, y: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        // 1. GRID-SNAPPED BASE
        const base = new PIXI.Graphics();
        const s = TILE_SIZE / 2 - 1;
        base.rect(-s, -s, s*2, s*2);
        base.fill(0x1a1a1a);
        base.stroke({ width: 1, color: 0x333333 });
        this.container.addChild(base);

        this.turretHead = new PIXI.Container();
        this.container.addChild(this.turretHead);

        // 2. UNIFIED SHAPE (Matches Selector)
        const shape = new PIXI.Graphics();
        const r = 8;
        if (type === 0) shape.circle(0, 0, r);
        else if (type === 1) shape.poly([-r, r, 0, -r, r, r]);
        else if (type === 2) shape.rect(-r, -r, r*2, r*2);
        else shape.poly([-r, 0, -r/2, -r, 4, -r, 8, 0, 4, 8, -r/2, 8]);
        
        shape.fill({ color: this.config.color, alpha: 0.9 });
        shape.stroke({ width: 2, color: 0xffffff });
        this.turretHead.addChild(shape);

        this.muzzleFlash = new PIXI.Graphics();
        this.muzzleFlash.alpha = 0;
        this.turretHead.addChild(this.muzzleFlash);
    }

    public update(delta: number, enemies: Enemy[]) {
        if (this.deploymentTimer > 0) {
            this.deploymentTimer -= delta;
            this.container.alpha = 0.3 + (1 - this.deploymentTimer / 30) * 0.7;
            return;
        }
        this.container.alpha = 1;
        this.fireTimer -= delta;
        
        if (this.muzzleFlash.alpha > 0) this.muzzleFlash.alpha -= 0.1 * delta;

        const target = this.findTarget(enemies);
        if (target) {
            const dx = target.container.x - this.container.x;
            const dy = target.container.y - this.container.y;
            this.turretHead.rotation = Math.atan2(dy, dx) + Math.PI/2;

            if (this.fireTimer <= 0) {
                this.fire(target, enemies);
                this.fireTimer = this.config.rate;
            }
        }
    }

    private findTarget(enemies: Enemy[]): Enemy | null {
        let bestTarget: Enemy | null = null;
        let maxProgress = -1;
        const range = this.config.range * TILE_SIZE;
        const rSq = range * range;
        for (const enemy of enemies) {
            const dx = enemy.container.x - this.container.x;
            const dy = enemy.container.y - this.container.y;
            const dSq = dx*dx + dy*dy;
            if (dSq <= rSq && enemy.totalProgress > maxProgress) {
                maxProgress = enemy.totalProgress;
                bestTarget = enemy;
            }
        }
        return bestTarget;
    }

    private fire(target: Enemy, allEnemies: Enemy[]) {
        this.showMuzzleFlash();
        if (this.config.damage > 50) { 
            this.drawEffect(target.container.x, target.container.y, 'ring');
            allEnemies.forEach(e => {
                const dx = e.container.x - target.container.x;
                const dy = e.container.y - target.container.y;
                if (dx*dx + dy*dy < 3600) e.takeDamage(this.config.damage);
            });
        } else {
            target.takeDamage(this.config.damage);
            this.drawEffect(target.container.x, target.container.y, 'line');
        }
    }

    private showMuzzleFlash() {
        this.muzzleFlash.clear();
        this.muzzleFlash.circle(0, -15, 5);
        this.muzzleFlash.fill({ color: 0xffffff, alpha: 0.8 });
        this.muzzleFlash.alpha = 1;
    }

    private drawEffect(tx: number, ty: number, style: 'line' | 'ring') {
        const g = new PIXI.Graphics();
        if (style === 'line') {
            g.moveTo(this.container.x, this.container.y).lineTo(tx, ty);
            g.stroke({ width: 2, color: this.config.color, alpha: 0.8 });
        } else {
            const r = this.type === 3 ? 10 : 60; // Rail vs Nova
            g.circle(tx, ty, r);
            g.stroke({ width: 3, color: this.config.color, alpha: 0.5 });
        }
        GameContainer.instance.effectLayer.addChild(g);
        setTimeout(() => g.destroy(), 50);
    }
}
