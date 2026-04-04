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
    private energyCore: PIXI.Graphics;

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
        
        if (glitch === 'SYSTEM_DRAIN') this.effectiveRange = Math.max(1, this.effectiveRange - 2);
        else if (glitch === 'OVERCLOCK') this.effectiveRate = Math.max(5, this.effectiveRate * 0.5);

        // 1. OCTAGONAL REINFORCED BASE
        const base = new PIXI.Graphics();
        const s = TILE_SIZE / 2 - 2;
        base.poly([-s, -s/2, -s/2, -s, s/2, -s, s, -s/2, s, s/2, s/2, s, -s/2, s, -s, s/2]);
        base.fill(0x1a1a1a);
        base.stroke({ width: 2, color: 0x333333 });
        this.container.addChild(base);

        // 2. ROTATIONAL GEAR
        const gear = new PIXI.Graphics();
        gear.circle(0, 0, 7);
        gear.fill(0x222222);
        this.container.addChild(gear);

        this.turretHead = new PIXI.Container();
        this.container.addChild(this.turretHead);

        // 3. ENERGY CORE (Animated)
        this.energyCore = new PIXI.Graphics();
        this.energyCore.circle(0, 0, 4);
        this.energyCore.fill({ color: this.config.color, alpha: 0.6 });
        this.turretHead.addChild(this.energyCore);

        this.muzzleFlash = new PIXI.Graphics();
        this.muzzleFlash.alpha = 0;
        this.turretHead.addChild(this.muzzleFlash);

        this.createWeaponVisuals();
    }

    private createWeaponVisuals() {
        const g = new PIXI.Graphics();
        const c = this.config.color;
        
        if (this.type === TowerType.PULSE_MG) {
            // DUAL BARRELS WITH GREEN HIGHLIGHTS
            g.rect(-5, -16, 3, 14).fill(0x333333);
            g.rect(2, -16, 3, 14).fill(0x333333);
            // Color accents on tips
            g.rect(-5, -18, 3, 3).fill(c);
            g.rect(2, -18, 3, 3).fill(c);
        } 
        else if (this.type === TowerType.FROST_RAY) {
            // TRIANGULAR CRYOGENIC DISH
            g.poly([-8, 0, 0, -22, 8, 0]).fill(0x2c3e50).stroke({width:1, color:c});
            // Focal crystal
            g.poly([-2, -10, 0, -24, 2, -10]).fill(c);
        } 
        else if (this.type === TowerType.BLAST_NOVA) {
            // HEAVY SQUARE MORTAR
            g.rect(-8, -8, 16, 16).fill(0x2c3e50).stroke({width:2, color:0x111111});
            // Color band
            g.rect(-9, -4, 18, 4).fill(c);
            // Heavy muzzle
            g.circle(0, -6, 6).fill(0x111111).stroke({width:1, color:c});
        } 
        else if (this.type === TowerType.RAILGUN) {
            // MAGNETIC RAILS (TRAPEZOIDAL ACCELERATOR)
            g.rect(-6, -28, 2, 26).fill(0x333333);
            g.rect(4, -28, 2, 26).fill(0x333333);
            // Energy coils between rails
            for(let i=0; i<4; i++) {
                g.rect(-4, -24 + (i*6), 8, 2).fill(c);
            }
            // Heavy breach
            g.rect(-8, -4, 16, 12).fill(0x2c3e50);
        }
        
        this.turretHead.addChild(g);
    }

    public update(delta: number, enemies: Enemy[]) {
        this.fireTimer -= delta;
        if (this.recoilOffset > 0) {
            this.recoilOffset -= 0.2 * delta;
            this.turretHead.y = this.recoilOffset;
        }
        if (this.muzzleFlash.alpha > 0) this.muzzleFlash.alpha -= 0.1 * delta;

        // Core animation
        this.energyCore.alpha = 0.4 + Math.sin(Date.now() * 0.01) * 0.3;

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
        }
    }

    private findTarget(enemies: Enemy[]): Enemy | null {
        let bestTarget: Enemy | null = null;
        let maxProgress = -1;
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

        // CALCULATE TIP OF BARREL IN WORLD SPACE
        const muzzleDist = this.type === TowerType.RAILGUN ? 30 : 20;
        const angle = this.turretHead.rotation - Math.PI/2;
        const muzzleX = this.container.x + Math.cos(angle) * muzzleDist;
        const muzzleY = this.container.y + Math.sin(angle) * muzzleDist;

        if (this.config.special === 'aoe') {
            allEnemies.forEach(e => {
                const dx = e.container.x - target.container.x;
                const dy = e.container.y - target.container.y;
                if (dx*dx + dy*dy < 3600) e.takeDamage(this.config.damage);
            });
            this.drawEffect(muzzleX, muzzleY, target.container.x, target.container.y, 'ring');
        } else {
            const isDead = target.takeDamage(this.config.damage);
            if (this.config.special === 'freeze' && !isDead) target.freeze(300);
            this.drawEffect(muzzleX, muzzleY, target.container.x, target.container.y, 'line');
        }
    }

    private showMuzzleFlash() {
        this.muzzleFlash.clear();
        this.muzzleFlash.circle(0, -20, 5 + Math.random() * 5);
        this.muzzleFlash.fill({ color: 0xffffff, alpha: 0.8 });
        this.muzzleFlash.alpha = 1;
    }

    private drawEffect(mx: number, my: number, tx: number, ty: number, style: 'line' | 'ring') {
        const g = new PIXI.Graphics();
        if (style === 'line') {
            g.moveTo(mx, my).lineTo(tx, ty);
            g.stroke({ width: 2, color: this.config.color, alpha: 0.8 });
        } else {
            g.circle(tx, ty, 60);
            g.stroke({ width: 3, color: this.config.color, alpha: 0.5 });
        }
        GameContainer.instance.effectLayer.addChild(g);
        setTimeout(() => g.destroy(), 50);
    }
}
