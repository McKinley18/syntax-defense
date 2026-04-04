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
    private energyCore: PIXI.Graphics;
    private deploymentTimer: number = 30; // 0.5s materialization

    constructor(type: TowerType, x: number, y: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.alpha = 0.3; // Start for materialization

        // 1. OCTAGONAL DOCKING BASE (IMPLANTED)
        const base = new PIXI.Graphics();
        const s = TILE_SIZE / 2 - 1;
        // Octagon shape for industrial feel
        base.poly([-s, -s/2, -s/2, -s, s/2, -s, s, -s/2, s, s/2, s/2, s, -s/2, s, -s, s/2]);
        base.fill(0x151515);
        base.stroke({ width: 1.5, color: 0x333333 });
        
        // Internal panel lines
        base.moveTo(-s/2, -s).lineTo(-s/2, s);
        base.moveTo(s/2, -s).lineTo(s/2, s);
        base.stroke({ width: 0.5, color: 0x222222 });
        this.container.addChild(base);

        this.turretHead = new PIXI.Container();
        this.container.addChild(this.turretHead);

        // 2. HIGH-FIDELITY MECHA CHASSIS
        const chassis = new PIXI.Graphics();
        chassis.circle(0, 0, 7);
        chassis.fill(0x202020);
        chassis.stroke({ width: 1, color: 0x444444 });
        this.turretHead.addChild(chassis);

        // 3. SPECIALIZED WEAPONRY
        this.createWeaponry();

        // 4. GLOWING ENERGY CORE
        this.energyCore = new PIXI.Graphics();
        this.energyCore.circle(0, 0, 3.5);
        this.energyCore.fill({ color: this.config.color, alpha: 0.8 });
        this.energyCore.stroke({ width: 1, color: 0xffffff, alpha: 0.4 });
        this.turretHead.addChild(this.energyCore);

        this.muzzleFlash = new PIXI.Graphics();
        this.muzzleFlash.alpha = 0;
        this.turretHead.addChild(this.muzzleFlash);
    }

    private createWeaponry() {
        const g = new PIXI.Graphics();
        const c = this.config.color;
        const s = 10;

        if (this.type === TowerType.PULSE_MG) {
            // Dual Oscillating Barrels
            g.rect(-5, -16, 3, 14).fill(0x252525).stroke({width:1, color:0x333333});
            g.rect(2, -16, 3, 14).fill(0x252525).stroke({width:1, color:0x333333});
            g.rect(-5, -18, 3, 3).fill(c); g.rect(2, -18, 3, 3).fill(c);
        } else if (this.type === TowerType.FROST_RAY) {
            // Cryogenic Dish
            g.poly([-s, 0, 0, -20, s, 0]).fill(0x1a2a3a).stroke({width:1, color:c});
            g.circle(0, -10, 4).fill(0x050505).stroke({width:1, color:c});
            g.moveTo(0, -10).lineTo(0, -24).stroke({width:2, color:c});
        } else if (this.type === TowerType.BLAST_NOVA) {
            // Heavy Radius Discharger
            g.rect(-8, -8, 16, 16).fill(0x252525).stroke({width:2, color:0x111111});
            g.rect(-9, -4, 18, 4).fill(c);
            g.rect(-4, -9, 4, 18).fill(c);
        } else if (this.type === TowerType.RAILGUN) {
            // Magnetic Rails
            g.rect(-6, -28, 2, 26).fill(0x333333); g.rect(4, -28, 2, 26).fill(0x333333);
            for(let i=0; i<4; i++) {
                g.rect(-5, -24 + (i*6), 10, 1.5).fill(c);
            }
            g.rect(-8, -4, 16, 12).fill(0x202020).stroke({width:1, color:0x444444});
        }
        this.turretHead.addChild(g);
    }

    public update(delta: number, enemies: Enemy[]) {
        if (this.deploymentTimer > 0) {
            this.deploymentTimer -= delta;
            this.container.alpha = 0.3 + (1 - this.deploymentTimer / 30) * 0.7;
            this.container.scale.set(0.8 + (1 - this.deploymentTimer / 30) * 0.2);
            return;
        }
        this.container.alpha = 1;
        this.container.scale.set(1);
        
        this.fireTimer -= delta;
        if (this.muzzleFlash.alpha > 0) this.muzzleFlash.alpha -= 0.1 * delta;

        // Core Pulse
        this.energyCore.alpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;

        const target = this.findTarget(enemies);
        if (target) {
            const dx = target.container.x - this.container.x;
            const dy = target.container.y - this.container.y;
            const targetRot = Math.atan2(dy, dx) + Math.PI/2;
            
            // Smooth Rotation
            let diff = targetRot - this.turretHead.rotation;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.turretHead.rotation += diff * 0.1 * delta;

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
        this.muzzleFlash.circle(0, -20, 6);
        this.muzzleFlash.fill({ color: 0xffffff, alpha: 0.9 });
        this.muzzleFlash.alpha = 1;
    }

    private drawEffect(tx: number, ty: number, style: 'line' | 'ring') {
        const g = new PIXI.Graphics();
        const startX = this.container.x;
        const startY = this.container.y;
        
        if (style === 'line') {
            g.moveTo(startX, startY).lineTo(tx, ty);
            g.stroke({ width: 2, color: this.config.color, alpha: 0.8 });
        } else {
            const r = this.type === 3 ? 15 : 60;
            g.circle(tx, ty, r);
            g.stroke({ width: 3, color: this.config.color, alpha: 0.6 });
        }
        GameContainer.instance.effectLayer.addChild(g);
        setTimeout(() => g.destroy(), 60);
    }
}
