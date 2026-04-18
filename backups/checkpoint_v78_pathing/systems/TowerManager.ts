import * as PIXI from 'pixi.js';
import { MapManager, TILE_SIZE } from './MapManager';
import { Tower, TowerType, TOWER_CONFIGS } from '../entities/Tower';
import { StateManager } from '../core/StateManager';
import { NeuralBrain } from './NeuralBrain';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { AudioManager } from './AudioManager';
import { Engine } from '../core/Engine';

/**
 * TOWER MANAGER v48.0: Active Ballistics Engine (ACTIVE)
 * THE DEFINITIVE FIX: Manages projectile updates and target engagement.
 */
export class TowerManager {
    public towers: Tower[] = [];
    public projectiles: Projectile[] = [];
    private container: PIXI.Container;
    private projectileContainer: PIXI.Container;
    private mapManager: MapManager;
    
    private pendingTurretType: TowerType | null = null;
    private ghostTower: PIXI.Container | null = null;
    private ghostRange: PIXI.Graphics | null = null;
    private ghostBox: PIXI.Graphics | null = null;
    
    private currentSnapX: number = 0;
    private currentSnapY: number = 0;

    constructor(mapManager: MapManager) {
        this.mapManager = mapManager;
        this.container = new PIXI.Container();
        this.projectileContainer = new PIXI.Container();
        this.projectileContainer.eventMode = 'none';

        Engine.instance.onResize(() => this.setupStageListeners());
        this.setupStageListeners();
    }

    private setupStageListeners() {
        const app = Engine.instance.app;
        if (!app) return;
        app.stage.eventMode = 'static';
        app.stage.off('pointermove');
        app.stage.on('pointermove', (e) => this.onStageMove(e));
    }

    public update(dt: number, enemies: Enemy[]) {
        // 1. Update Towers (Targeting & Firing)
        for (const tower of this.towers) {
            tower.update(dt, enemies, (p) => {
                this.projectiles.push(p);
                this.projectileContainer.addChild(p.container);
            });
        }

        // 2. Update Ballistics (Physics & Impact)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt);
            if (p.isDead) {
                this.projectileContainer.removeChild(p.container);
                this.projectiles.splice(i, 1);
            }
        }
    }

    public initiatePlacement(type: TowerType) {
        if (this.pendingTurretType !== null) this.cancelPlacement();
        const cfg = TOWER_CONFIGS[type];
        if (StateManager.instance.credits < cfg.cost) return;

        this.pendingTurretType = type;
        this.ghostTower = new PIXI.Container();
        this.ghostTower.eventMode = 'none'; 
        this.ghostRange = new PIXI.Graphics();
        this.ghostBox = new PIXI.Graphics();

        this.ghostRange.circle(0, 0, cfg.range * TILE_SIZE).fill({ color: 0x00ffff, alpha: 0.12 }).stroke({ color: 0x00ffff, width: 2, alpha: 0.25 });
        this.ghostBox.rect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE).stroke({ color: 0xffffff, width: 2.5 });

        this.ghostTower.addChild(this.ghostRange);
        this.ghostTower.addChild(this.ghostBox);
        this.container.addChild(this.ghostTower);
        
        AudioManager.getInstance().playUiClick();
    }

    private onStageMove(e: PIXI.FederatedPointerEvent) {
        if (!this.ghostTower) return;
        const localPos = Engine.instance.app.stage.toLocal(e.global);
        this.currentSnapX = Math.floor(localPos.x / TILE_SIZE);
        this.currentSnapY = Math.floor(localPos.y / TILE_SIZE);
        this.ghostTower.position.set((this.currentSnapX + 0.5) * TILE_SIZE, (this.currentSnapY + 0.5) * TILE_SIZE);

        const isAvailable = NeuralBrain.getInstance().isNodeAvailable(this.currentSnapX, this.currentSnapY);
        const alreadyOccupied = this.towers.some(t => {
            const tx = Math.floor(t.container.x / TILE_SIZE);
            const ty = Math.floor(t.container.y / TILE_SIZE);
            return tx === this.currentSnapX && ty === this.currentSnapY;
        });

        const valid = isAvailable && !alreadyOccupied;
        if (this.ghostBox) this.ghostBox.tint = valid ? 0x00ff66 : 0xff3300;
    }

    public handleStageClick(gx: number, gy: number) {
        if (this.pendingTurretType === null) return false;
        const type = this.pendingTurretType;
        const isAvailable = NeuralBrain.getInstance().isNodeAvailable(gx, gy);
        const alreadyOccupied = this.towers.some(t => {
            const tx = Math.floor(t.container.x / TILE_SIZE);
            const ty = Math.floor(t.container.y / TILE_SIZE);
            return tx === gx && ty === gy;
        });

        if (isAvailable && !alreadyOccupied) {
            const tower = new Tower(type, gx, gy);
            this.towers.push(tower);
            this.container.addChild(tower.container);
            StateManager.instance.addCredits(-TOWER_CONFIGS[type].cost);
            AudioManager.getInstance().playUiClick();
            this.cancelPlacement();
            return true;
        }
        return false;
    }

    public cancelPlacement() {
        if (this.ghostTower) {
            this.container.removeChild(this.ghostTower);
            this.ghostTower.destroy({ children: true });
            this.ghostTower = null;
        }
        this.pendingTurretType = null;
    }

    public getContainer() { return this.container; }
    public getProjectileContainer() { return this.projectileContainer; }
    public selectedTower: Tower | null = null;
    public selectTower(t: Tower) { this.selectedTower = t; t.showRange(true); }
    public deselectTower() { if(this.selectedTower) this.selectedTower.showRange(false); this.selectedTower = null; }
    public upgradeSelectedTower() { if(this.selectedTower && StateManager.instance.credits >= this.selectedTower.getUpgradeCost()) { StateManager.instance.addCredits(-this.selectedTower.getUpgradeCost()); this.selectedTower.upgrade(); }}
    public sellSelectedTower() { if(this.selectedTower) { StateManager.instance.addCredits(this.selectedTower.getRefundValue()); this.removeTower(this.selectedTower); this.deselectTower(); }}
    private removeTower(t: Tower) { this.towers = this.towers.filter(tw => tw !== t); this.container.removeChild(t.container); t.destroy(); }
    public loadTowers(data: any[]) { data.forEach(d => { const tw = new Tower(d.type, Math.floor(d.x / TILE_SIZE), Math.floor(d.y / TILE_SIZE)); tw.tier = d.tier; this.towers.push(tw); this.container.addChild(tw.container); });}
    public getTowerCounts() { const counts = {} as any; this.towers.forEach(t => counts[t.type] = (counts[t.type] || 0) + 1); return counts; }
}
