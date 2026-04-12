import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { Enemy } from './Enemy';
import { TILE_SIZE } from '../systems/MapManager';
import { AudioManager } from '../systems/AudioManager';
import { GameStateManager } from '../systems/GameStateManager';

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
    [TowerType.PULSE_MG]: { name: 'Pulse MG', range: 5, damage: 10, rate: 12, cost: 150, color: 0x00ff66 },
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
    public totalDamageDealt: number = 0;
    
    private fireTimer: number = 0;
    private turretHead: PIXI.Container;
    private muzzleFlash: PIXI.Graphics;
    private energyCore: PIXI.Graphics;
    private deploymentTimer: number = 15;

    constructor(type: TowerType, x: number, y: number) {
        this.type = type;
        this.config = TOWER_CONFIGS[type];
        if (!this.config) {
            // Fallback to avoid crash
            this.config = TOWER_CONFIGS[0];
        }
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

        // Add direct hit area and interaction
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        const hitArea = new PIXI.Graphics();
        hitArea.rect(-12, -12, 24, 24); // Force absolute 24px center hit box
        hitArea.fill({ color: 0x000000, alpha: 0.001 }); // Ghost fill for PIXI events
        this.container.addChild(hitArea);
        this.container.hitArea = new PIXI.Rectangle(-12, -12, 24, 24);

        this.container.on('pointerdown', () => {
            if (GameContainer.instance && GameContainer.instance.towerManager) {
                const manager = GameContainer.instance.towerManager;
                if (Date.now() - manager.lastPlacementTime < 500) return;
                manager.onTowerSelected?.(this);
            }
        });
    }

    private createWeaponry() {
        const g = new PIXI.Graphics();
        const c = this.config.color;
        const gsm = GameStateManager.getInstance();

        if (this.type === TowerType.PULSE_MG) {
            const opt = gsm.upgrades.pulseMgOpt;
            const bWidth = opt >= 3 ? 4 : 3;
            g.rect(-6, -16, bWidth, 14).fill(0x252525); g.rect(2, -16, bWidth, 14).fill(0x252525);
            g.rect(-6, -18, bWidth, 3).fill(c); g.rect(2, -18, bWidth, 3).fill(c);
            if (opt >= 5) g.rect(-1, -20, 2, 18).fill(c);
        } else if (this.type === TowerType.FROST_RAY) {
            const opt = gsm.upgrades.frostOverclock;
            g.poly([-10, 0, 0, -20, 10, 0]).fill(0x1a2a3a).stroke({width:1, color:c});
            g.moveTo(0, -10).lineTo(0, -24).stroke({width:2, color:c});
            if (opt >= 3) g.circle(0, -20, 4).stroke({width:1, color:c});
            if (opt >= 5) g.circle(0, -20, 8).stroke({width:1, color:c, alpha: 0.5});
        } else if (this.type === TowerType.BLAST_NOVA) {
            const opt = gsm.upgrades.blastNovaReach;
            // Reactor Design: Central core with outer rings
            g.circle(0, 0, 10).fill(0x252525).stroke({width: 1, color: 0x444444});
            g.circle(0, 0, 6).stroke({width: 2, color: c});
            if (opt >= 3) {
                g.circle(0, 0, 14).stroke({width: 1, color: c, alpha: 0.5});
                g.rect(-12, -2, 24, 4).fill(c, 0.3);
            }
        } else if (this.type === TowerType.RAILGUN) {
            const opt = gsm.upgrades.railgunPenetration;
            g.rect(-6, -28, 2, 26).fill(0x333333); g.rect(4, -28, 2, 26).fill(0x333333);
            const rCount = opt >= 4 ? 6 : 4;
            for(let i=0; i<rCount; i++) g.rect(-5, -24 + (i*(24/rCount)), 10, 1.5).fill(c);
        } else if (this.type === TowerType.TESLA_LINK) {
            const opt = gsm.upgrades.teslaLinkArc;
            g.circle(0, -12, 6).fill(0x202020).stroke({width:2, color:c});
            g.circle(0, -12, 2).fill(0xffffff);
            if (opt >= 3) {
                g.moveTo(-8, -12).lineTo(-14, -18).stroke({width:1, color:c});
                g.moveTo(8, -12).lineTo(14, -18).stroke({width:1, color:c});
            }
        }
        this.turretHead.addChild(g);
    }

    public update(delta: number, enemies: Enemy[]) {
        const isWave0 = GameStateManager.getInstance().currentWave === 0;
        
        if (this.deploymentTimer > 0) {
            // Instant deployment in tutorial
            this.deploymentTimer -= isWave0 ? 100 : delta;
            this.container.alpha = 0.3 + (1 - Math.max(0, this.deploymentTimer) / 15) * 0.7;
            if (this.deploymentTimer > 0) return;
        }

        this.container.alpha = 1;
        
        // APPLY SPEED SYNERGY
        const speedBoost = (this as any).synergySpeedBoost || 1.0;
        this.fireTimer -= delta * speedBoost;

        if (this.muzzleFlash.alpha > 0) this.muzzleFlash.alpha -= 0.1 * delta;

        this.energyCore.alpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;

        const target = this.findTarget(enemies);
        if (target) {
            const dx = target.container.x - this.container.x;
            const dy = target.container.y - this.container.y;
            const targetRot = Math.atan2(dy, dx) + Math.PI/2;
            
            if (isWave0) {
                // Instant rotation in tutorial
                this.turretHead.rotation = targetRot;
            } else {
                let diff = targetRot - this.turretHead.rotation;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.turretHead.rotation += diff * 0.1 * delta;
            }

            if (this.fireTimer <= 0) {
                this.fire(target, enemies);
                this.fireTimer = this.config.rate;
            }
        }
    }

    private findTarget(enemies: Enemy[]): Enemy | null {
        const gsm = GameStateManager.getInstance();
        const boost = 1 + (gsm.upgrades.signalBoost * 0.02);
        const range = (this.config.range + (this.level === 3 ? 1 : 0)) * TILE_SIZE * boost;
        const rSq = range * range;

        const inRange = enemies.filter(enemy => {
            if (enemy.isGhost && !enemy.isRevealed) return false;
            const dx = enemy.container.x - this.container.x;
            const dy = enemy.container.y - this.container.y;
            return (dx*dx + dy*dy) <= rSq;
        });

        if (inRange.length === 0) return null;

        // TACTICAL TARGETING PROFILES
        switch(this.type) {
            case TowerType.PULSE_MG:
                // CLOSEST TO KERNEL: Furthest total progress
                return inRange.reduce((prev, curr) => (curr.totalProgress > prev.totalProgress) ? curr : prev);

            case TowerType.RAILGUN:
                // HIGHEST HP: Prioritize massive targets
                return inRange.reduce((prev, curr) => (curr.health > prev.health) ? curr : prev);

            case TowerType.FROST_RAY:
                // FASTEST NON-FROZEN: Prioritize speedsters
                const nonFrozen = inRange.filter(e => (e as any).freezeTimer <= 0);
                const source = nonFrozen.length > 0 ? nonFrozen : inRange;
                return source.reduce((prev, curr) => (curr.speed > prev.speed) ? curr : prev);

            case TowerType.BLAST_NOVA:
                // CLUSTER TARGETING: Target with most neighbors in splash radius
                const sR = TILE_SIZE * 1.5;
                const sRSq = sR * sR;
                return inRange.reduce((best, curr) => {
                    const n = inRange.filter(o => (o.container.x - curr.container.x)**2 + (o.container.y - curr.container.y)**2 <= sRSq).length;
                    const bn = inRange.filter(o => (o.container.x - best.container.x)**2 + (o.container.y - best.container.y)**2 <= sRSq).length;
                    return (n > bn) ? curr : best;
                });

            case TowerType.TESLA_LINK:
                // DEFENSE STRIPPER: Prioritize Shielded units
                const shielded = inRange.filter(e => e.shieldIntegrity > 0);
                if (shielded.length > 0) return shielded[0];
                return inRange[0];

            default:
                return inRange[0];
        }
    }

    private fire(target: Enemy, allEnemies: Enemy[]) {
        this.showMuzzleFlash();
        const gsm = GameStateManager.getInstance();

        // SYNERGY: MG Slow if near Frost Ray
        if ((this as any).synergySlow && this.type === TowerType.PULSE_MG) {
            target.applyFreeze(30);
        }

        const levelMult = this.level === 2 ? 1.25 : this.level === 3 ? 1.5 : 1;
        
        let upgradeMult = 1;
        // USE SAFE FALLBACKS TO PREVENT NaN
        const up = gsm.upgrades as any;
        if (this.type === TowerType.PULSE_MG) upgradeMult = 1 + ((up.pulseMgOpt || 0) * 0.1);
        else if (this.type === TowerType.RAILGUN) upgradeMult = 1 + ((up.railgunPenetration || 0) * 0.2);
        
        const totalDmg = this.config.damage * levelMult * upgradeMult * (1 + (this.linkBonus || 0));

        // TRIGGER UNIQUE SFX
        const am = AudioManager.getInstance();
        const maxX = window.innerWidth;
        const x = this.container.x;
        if (this.type === TowerType.PULSE_MG) am.playFirePulse(x, maxX);
        else if (this.type === TowerType.FROST_RAY) am.playFireFrost(x, maxX);
        else if (this.type === TowerType.BLAST_NOVA) am.playFireBlast(x, maxX);
        else if (this.type === TowerType.RAILGUN) am.playFireRail(x, maxX);
        else if (this.type === TowerType.TESLA_LINK) am.playFireTesla(x, maxX);

        if (this.type === TowerType.TESLA_LINK) {
            this.chainFire(target, allEnemies, totalDmg);
        } else if (this.type === TowerType.FROST_RAY) {
            target.takeDamage(totalDmg);
            this.totalDamageDealt += totalDmg;
            const freezeDuration = 30 + (gsm.upgrades.frostOverclock * 10);
            target.applyFreeze(freezeDuration); 
            this.drawEffect(target.container.x, target.container.y, 'line');
        } else if (this.config.damage > 25 || (this.type === TowerType.BLAST_NOVA)) { 
            this.drawEffect(target.container.x, target.container.y, 'ring');
            const radius = 60 * (1 + (gsm.upgrades.blastNovaReach * 0.15));
            const impactRSq = radius * radius;
            allEnemies.forEach(e => {
                const dx = e.container.x - target.container.x;
                const dy = e.container.y - target.container.y;
                if (dx*dx + dy*dy < impactRSq) {
                    e.takeDamage(totalDmg);
                    this.totalDamageDealt += totalDmg;
                }
            });
        } else {
            target.takeDamage(totalDmg);
            this.totalDamageDealt += totalDmg;
            this.drawEffect(target.container.x, target.container.y, 'line');
        }
    }

    private chainFire(target: Enemy, allEnemies: Enemy[], dmg: number) {
        const currentSource = { x: this.container.x, y: this.container.y };
        const hitEnemies = new Set([target]);
        target.takeDamage(dmg);
        this.totalDamageDealt += dmg;
        this.drawLightning(currentSource.x, currentSource.y, target.container.x, target.container.y);

        for (let i = 0; i < 2; i++) {
            let nextTarget: Enemy | null = null;
            let minDSq = 10000; // 100px radius squared
            allEnemies.forEach(e => {
                if (!hitEnemies.has(e)) {
                    if (e.isGhost && !e.isRevealed) return;
                    const dSq = (e.container.x - target.container.x)**2 + (e.container.y - target.container.y)**2;
                    if (dSq < minDSq) { 
                        minDSq = dSq; 
                        nextTarget = e; 
                    }
                }
            });
            
            if (nextTarget) {
                const nextE = nextTarget as Enemy;
                nextE.takeDamage(dmg * 0.7);
                this.totalDamageDealt += (dmg * 0.7);
                this.drawLightning(target.container.x, target.container.y, nextE.container.x, nextE.container.y);
                hitEnemies.add(nextE);
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
        const pm = GameContainer.instance!.particleManager;
        const g = pm.getGraphics();
        if (style === 'line') {
            g.moveTo(this.container.x, this.container.y).lineTo(tx, ty);
            g.stroke({ width: 2, color: this.config.color, alpha: 0.8 });
        } else {
            g.circle(tx, ty, 60);
            g.stroke({ width: 3, color: this.config.color, alpha: 0.6 });
        }
        GameContainer.instance!.effectLayer.addChild(g);
        
        // Add to ParticleManager for synced lifecycle
        pm.addEffect(g, 6); // 6 frames = ~100ms
    }

    private drawLightning(x1: number, y1: number, x2: number, y2: number) {
        const pm = GameContainer.instance!.particleManager;
        const g = pm.getGraphics();
        g.moveTo(x1, y1).lineTo(x2, y2);
        g.stroke({ width: 3, color: 0xffffff, alpha: 0.8 });
        g.stroke({ width: 6, color: this.config.color, alpha: 0.3 });
        GameContainer.instance!.effectLayer.addChild(g);
        
        // Add to ParticleManager for synced lifecycle
        pm.addEffect(g, 8); // 8 frames = ~130ms
    }

    public upgrade(): boolean {
        if (this.level < 3) {
            this.level++;
            return true;
        }
        return false;
    }
}
