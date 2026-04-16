import * as PIXI from 'pixi.js';
import { Tower, TowerType, TOWER_CONFIGS } from '../entities/Tower';
import { IMapManager, TileType } from './MapManager';
import { Projectile } from '../entities/Projectile';
import { StateManager } from '../core/StateManager';
import { AudioManager } from './AudioManager';

export class TowerManager {
    public towers: Tower[] = [];
    private projectiles: Projectile[] = [];
    private mapManager: IMapManager;
    private container: PIXI.Container;
    private projectileContainer: PIXI.Container;
    
    public selectedTower: Tower | null = null;

    constructor(mapManager: IMapManager) {
        this.mapManager = mapManager;
        this.container = new PIXI.Container();
        this.projectileContainer = new PIXI.Container();
    }

    public getContainer() { return this.container; }
    public getProjectileContainer() { return this.projectileContainer; }

    public placeTower(type: TowerType, x: number, y: number) {
        if (this.mapManager.isBuildable(x, y)) {
            const config = TOWER_CONFIGS[type];
            if (StateManager.instance.credits >= config.cost) {
                const tower = new Tower(type, x, y);
                StateManager.instance.credits -= config.cost;
                this.towers.push(tower);
                this.container.addChild(tower.container);
                this.mapManager.setOccupied(x, y, true);
                AudioManager.getInstance().playTerminalCommand();
                return true;
            }
        }
        return false;
    }

    /**
     * MODULAR HIT-DETECTION: Resolves selection via coordinate proximity.
     * This is 100% reliable regardless of PIXI event propagation bugs.
     */
    public attemptSelection(x: number, y: number): boolean {
        this.deselectTower();
        
        // Find the tower closest to the tap
        const found = this.towers.find(t => {
            const dx = t.container.x - x;
            const dy = t.container.y - y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            return dist < 24; // 24px selection radius
        });

        if (found) {
            this.selectedTower = found;
            found.setHighlight(true);
            StateManager.instance.selectedTurretType = null;
            AudioManager.getInstance().playUiClick();
            console.log(`[TowerManager] Selected ${found.config.name} at Tier ${found.tier}`);
            return true;
        }
        return false;
    }

    public deselectTower() {
        if (this.selectedTower) {
            this.selectedTower.setHighlight(false);
            this.selectedTower = null;
        }
    }

    public upgradeSelectedTower() {
        if (this.selectedTower) {
            const cost = this.selectedTower.getUpgradeCost();
            if (StateManager.instance.credits >= cost) {
                if (this.selectedTower.upgrade()) {
                    StateManager.instance.credits -= cost;
                    this.selectedTower.setHighlight(true);
                    AudioManager.getInstance().playTerminalCommand();
                    return true;
                }
            }
        }
        return false;
    }

    public clearAllTowers() {
        this.deselectTower();
        this.towers.forEach(t => {
            this.mapManager.setOccupied(t.container.x, t.container.y, false);
            t.destroy();
        });
        this.towers = [];
        this.projectiles.forEach(p => p.destroy());
        this.projectiles = [];
    }

    public update(delta: number, enemies: any[]) {
        for (const tower of this.towers) {
            tower.update(delta, enemies, (p) => {
                this.projectiles.push(p);
                this.projectileContainer.addChild(p.container);
            });
        }
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update(delta);
            if (p.dead) {
                this.projectileContainer.removeChild(p.container);
                this.projectiles.splice(i, 1);
                p.destroy();
            }
        }
    }

    public getTowerCounts(): Record<TowerType, number> {
        const counts: any = {};
        this.towers.forEach(t => counts[t.type] = (counts[t.type] || 0) + 1);
        return counts;
    }
}
