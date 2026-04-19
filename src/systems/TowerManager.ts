import * as PIXI from 'pixi.js';
import { MapManager, TILE_SIZE } from './MapManager';
import { Tower, TowerType, TOWER_CONFIGS } from '../entities/Tower';
import { StateManager } from '../core/StateManager';
import { NeuralBrain } from './NeuralBrain';
import { Engine } from '../core/Engine';

/**
 * TOWER MANAGER v40.0: Definitive Placement Authority
 * THE REBUILD: Implements Ghost Range Sync and rigid grid restrictions.
 */
export class TowerManager {
    public towers: Tower[] = [];
    private mapManager: MapManager;
    private container: PIXI.Container;
    private projectileContainer: PIXI.Container;
    private projectiles: any[] = [];
    
    // GHOSTING SYSTEM
    private pendingTurretType: TowerType | null = null;
    private ghostTower: PIXI.Sprite | null = null;
    private ghostRange: PIXI.Graphics | null = null;
    
    constructor(mapManager: MapManager) {
        this.mapManager = mapManager;
        this.container = new PIXI.Container();
        this.projectileContainer = new PIXI.Container();

        this.ghostRange = new PIXI.Graphics();
        this.ghostRange.visible = false;
        this.container.addChild(this.ghostRange);
    }

    public initiatePlacement(type: TowerType) {
        if (StateManager.instance.credits < TOWER_CONFIGS[type].cost) return;
        this.pendingTurretType = type;
        
        if (this.ghostTower) this.container.removeChild(this.ghostTower);
        this.ghostTower = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.ghostTower.anchor.set(0.5);
        this.ghostTower.width = 30; this.ghostTower.height = 30;
        this.ghostTower.tint = TOWER_CONFIGS[type].color;
        this.ghostTower.alpha = 0.5;
        this.container.addChild(this.ghostTower);
    }

    public update(dt: number, enemies: any[]) {
        if (this.pendingTurretType !== null) {
            const app = Engine.instance.app;
            const { x, y } = app.renderer.events.pointer.global;
            const local = this.container.toLocal({ x, y });
            const gx = Math.floor(local.x / TILE_SIZE);
            const gy = Math.floor(local.y / TILE_SIZE);
            
            if (this.ghostTower) {
                this.ghostTower.x = (gx + 0.5) * TILE_SIZE;
                this.ghostTower.y = (gy + 0.5) * TILE_SIZE;
                this.ghostRange!.clear().circle(0, 0, TOWER_CONFIGS[this.pendingTurretType].range * TILE_SIZE).fill({ color: 0xffffff, alpha: 0.1 });
                this.ghostRange!.position.set(this.ghostTower.x, this.ghostTower.y);
                this.ghostRange!.visible = true;
            }
        } else if (this.ghostRange) {
            this.ghostRange.visible = false;
        }

        // 1. Update Towers
        for (const tower of this.towers) {
            tower.update(dt, enemies, (p) => {
                this.projectiles.push(p);
                this.projectileContainer.addChild(p.container);
            });
        }

        // 2. Update Ballistics
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(dt, enemies);
            if (p.isDead) {
                this.projectileContainer.removeChild(p.container);
                this.projectiles.splice(i, 1);
            }
        }
    }

    public handleStageClick(gridX: number, gridY: number): boolean {
        if (this.pendingTurretType === null) return false;

        const cost = TOWER_CONFIGS[this.pendingTurretType].cost;
        if (StateManager.instance.credits >= cost && NeuralBrain.getInstance().isNodeAvailable(gridX, gridY)) {
            const tower = new Tower(this.pendingTurretType, gridX, gridY);
            this.towers.push(tower);
            this.container.addChild(tower.container);
            StateManager.instance.addCredits(-cost);
            NeuralBrain.getInstance().occupyNode(gridX, gridY);
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
        if (this.ghostRange) this.ghostRange.visible = false;
    }

    public getContainer() { return this.container; }
    public getProjectileContainer() { return this.projectileContainer; }
    public selectedTower: Tower | null = null;
    public selectTower(t: Tower) { this.selectedTower = t; t.showRange(true); }
    public deselectTower() { if(this.selectedTower) this.selectedTower.showRange(false); this.selectedTower = null; }
    public upgradeSelectedTower() { if(this.selectedTower && StateManager.instance.credits >= this.selectedTower.getUpgradeCost()) { StateManager.instance.addCredits(-this.selectedTower.getUpgradeCost()); this.selectedTower.upgrade(); }}
    public sellSelectedTower() { if(this.selectedTower) { StateManager.instance.addCredits(this.selectedTower.getRefundValue()); this.removeTower(this.selectedTower); this.deselectTower(); }}
    private removeTower(t: Tower) { this.towers = this.towers.filter(tw => tw !== t); this.container.removeChild(t.container); t.destroy(); }
    
    public loadTowers(data: any[]) { 
        data.forEach(d => { 
            const tw = new Tower(d.type, Math.floor(d.x / TILE_SIZE), Math.floor(d.y / TILE_SIZE)); 
            tw.setTier(d.tier); 
            this.towers.push(tw); 
            this.container.addChild(tw.container); 
        });
    }

    public getTowerCounts() { const counts = {} as any; this.towers.forEach(t => counts[t.type] = (counts[t.type] || 0) + 1); return counts; }

    public clearAllTowers() {
        this.towers.forEach(t => {
            this.container.removeChild(t.container);
            t.destroy();
        });
        this.towers = [];
        this.deselectTower();
    }
}
