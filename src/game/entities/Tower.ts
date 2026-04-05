import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '../systems/MapManager';

export const TowerType = {
    PULSE_MG: 0,
    FROST_RAY: 1,
    BLAST_NOVA: 2,
    RAILGUN: 3,
    TESLA_LINK: 4
} as const;

export type TowerType = typeof TowerType[keyof typeof TowerType];

interface TowerConfig {
    name: string; range: number; damage: number; rate: number; cost: number; color: number;
}

export const TOWER_CONFIGS: Record<number, TowerConfig> = {
    [TowerType.PULSE_MG]: { name: 'Pulse MG', range: 4, damage: 10, rate: 12, cost: 150, color: 0x00ffcc },
    [TowerType.FROST_RAY]: { name: 'Frost Ray', range: 5, damage: 2, rate: 60, cost: 250, color: 0x00ffff },
    [TowerType.BLAST_NOVA]: { name: 'Blast Nova', range: 3, damage: 30, rate: 80, cost: 350, color: 0xffcc00 },
    [TowerType.RAILGUN]: { name: 'Railgun', range: 10, damage: 250, rate: 120, cost: 500, color: 0xff3300 },
    [TowerType.TESLA_LINK]: { name: 'Tesla Link', range: 5, damage: 45, rate: 45, cost: 750, color: 0xaa00ff }
};

export class Tower {
    public container: PIXI.Container;
    public type: TowerType;
    public config: TowerConfig;
    public level: number = 1;
    public linkBonus: number = 0;
    
    private fireTimer: number = 0;
    private turretHead: PIXI.Container;
    private muzzleFlash: PIXI.Graphics;
    private energyCore: PIXI.Graphics;
    private deploymentTimer: number = 30;

    constructor(type: TowerType, x: number, y: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.alpha = 0.3;

        const base = new PIXI.Graphics();
        const s = TILE_SIZE / 2 - 1;
        base.poly([-s, -s/2, -s/2, -s, s/2, -s, s, -s/2, s, s/2, s/2, s, -s/2, s, -s, s/2]);
        base.fill(0x151515);
        base.stroke({ width: 1.5, color: 0x333333 });
        this.container.addChild(base);

        this.turretHead = new PIXI.Container();
        this.container.addChild(this.turretHead);

        const chassis = new PIXI.Graphics();
        chassis.circle(0, 0, 7);
        chassis.fill(0x202020);
        chassis.stroke({ width: 1, color: 0x444444 });
        this.turretHead.addChild(chassis);

        this.createWeaponry();

        this.energyCore = new PIXI.Graphics();
        this.energyCore.circle(0, 0, 3.5);
        this.energyCore.fill({ color: this.config.color, alpha: 0.8 });
        this.turretHead.addChild(this.energyCore);

        this.muzzleFlash = new PIXI.Graphics();
        this.muzzleFlash.alpha = 0;
        this.turretHead.addChild(this.muzzleFlash);
    }

    private createWeaponry() {
        const g = new PIXI.Graphics();
        const c = this.config.color;
        if (this.type === TowerType.PULSE_MG) {
            g.rect(-5, -16, 3, 14).fill(0x252525); g.rect(2, -16, 3, 14).fill(0x252525);
            g.rect(-5, -18, 3, 3).fill(c); g.rect(2, -18, 3, 3).fill(c);
        } else if (this.type === TowerType.FROST_RAY) {
            g.poly([-10, 0, 0, -20, 10, 0]).fill(0x1a2a3a).stroke({width:1, color:c});
            g.moveTo(0, -10).lineTo(0, -24).stroke({width:2, color:c});
        } else if (this.type === TowerType.BLAST_NOVA) {
            g.rect(-8, -8, 16, 16).fill(0x252525); g.rect(-9, -4, 18, 4).fill(c);
        } else if (this.type === TowerType.RAILGUN) {
            g.rect(-6, -28, 2, 26).fill(0x333333); g.rect(4, -28, 2, 26).fill(0x333333);
            for(let i=0; i<4; i++) g.rect(-5, -24 + (i*6), 10, 1.5).fill(c);
        } else if (this.type === TowerType.TESLA_LINK) {
            g.circle(0, -12, 6).fill(0x202020).stroke({width:2, color:c});
            g.circle(0, -12, 2).fill(0xffffff);
        }
        this.turretHead.addChild(g);
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

        this.energyCore.alpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;

        // GHOST REVEAL LOGIC
        if (this.type === TowerType.FROST_RAY || this.type === TowerType.TESLA_LINK) {
            const range = (this.config.range + (this.level === 3 ? 1 : 0)) * TILE_SIZE;
            const rSq = range * range;
            enemies.forEach(e => {
                if (e.isGhost) {
                    const dSq = (e.container.x - this.container.x)**2 + (e.container.y - this.container.y)**2;
                    if (dSq <= rSq) e.isRevealed = true;
                }
            });
        }

        const target = this.findTarget(enemies);
        if (target) {
            const dx = target.container.x - this.container.x;
            const dy = target.container.y - this.container.y;
            const targetRot = Math.atan2(dy, dx) + Math.PI/2;
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
        let maxWeight = -1;
        const range = (this.config.range + (this.level === 3 ? 1 : 0)) * TILE_SIZE;
        const rSq = range * range;

        for (const enemy of enemies) {
            // Target Ghost only if revealed
            if (enemy.isGhost && !enemy.isRevealed) continue;

            const dx = enemy.container.x - this.container.x;
            const dy = enemy.container.y - this.container.y;
            const dSq = dx*dx + dy*dy;
            if (dSq <= rSq) {
                let weight = enemy.totalProgress;
                if (enemy.isElite) weight += 1000;
                if (enemy.type === 3) weight += 5000; 

                if (weight > maxWeight) {
                    maxWeight = weight;
                    bestTarget = enemy;
                }
            }
        }
        return bestTarget;
    }

    private fire(target: Enemy, allEnemies: Enemy[]) {
        this.showMuzzleFlash();
        const levelMult = this.level === 2 ? 1.25 : this.level === 3 ? 1.5 : 1;
        const totalDmg = this.config.damage * levelMult * (1 + this.linkBonus);

        if (this.type === TowerType.TESLA_LINK) {
            this.chainFire(target, allEnemies, totalDmg);
        } else if (this.config.damage > 25) { 
            this.drawEffect(target.container.x, target.container.y, 'ring');
            const impactRSq = 3600; // 60px radius squared
            allEnemies.forEach(e => {
                const dx = e.container.x - target.container.x;
                const dy = e.container.y - target.container.y;
                if (dx*dx + dy*dy < impactRSq) e.takeDamage(totalDmg);
            });
        } else {
            target.takeDamage(totalDmg);
            this.drawEffect(target.container.x, target.container.y, 'line');
        }
    }

    private chainFire(target: Enemy, allEnemies: Enemy[], dmg: number) {
        let currentSource = { x: this.container.x, y: this.container.y };
        let hitEnemies = new Set([target]);
        target.takeDamage(dmg);
        this.drawLightning(currentSource.x, currentSource.y, target.container.x, target.container.y);

        for (let i = 0; i < 2; i++) {
            let nextTarget: Enemy | null = null;
            let minDSq = 10000; // 100px radius squared
            allEnemies.forEach(e => {
                if (!hitEnemies.has(e)) {
                    if (e.isGhost && !e.isRevealed) return;
                    const dSq = (e.container.x - target.container.x)**2 + (e.container.y - target.container.y)**2;
                    if (dSq < minDSq) { minDSq = dSq; nextTarget = e; }
                }
            });
            if (nextTarget) {
                (nextTarget as Enemy).takeDamage(dmg * 0.7);
                this.drawLightning(target.container.x, target.container.y, (nextTarget as Enemy).container.x, (nextTarget as Enemy).container.y);
                hitEnemies.add(nextTarget);
            }
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
        if (style === 'line') {
            g.moveTo(this.container.x, this.container.y).lineTo(tx, ty);
            g.stroke({ width: 2, color: this.config.color, alpha: 0.8 });
        } else {
            g.circle(tx, ty, 60);
            g.stroke({ width: 3, color: this.config.color, alpha: 0.6 });
        }
        GameContainer.instance!.effectLayer.addChild(g);
        setTimeout(() => g.destroy(), 60);
    }

    private drawLightning(x1: number, y1: number, x2: number, y2: number) {
        const g = new PIXI.Graphics();
        g.moveTo(x1, y1).lineTo(x2, y2);
        g.stroke({ width: 3, color: 0xffffff, alpha: 0.8 });
        g.stroke({ width: 6, color: this.config.color, alpha: 0.3 });
        GameContainer.instance!.effectLayer.addChild(g);
        setTimeout(() => g.destroy(), 80);
    }

    public upgrade(): boolean {
        if (this.level < 3) {
            this.level++;
            return true;
        }
        return false;
    }
}
