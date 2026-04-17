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
    private ghostContainer: PIXI.Container;
    private ghostTower: Tower | null = null;

    constructor(mapManager: IMapManager) {
        this.mapManager = mapManager;
        this.container = new PIXI.Container();
        this.projectileContainer = new PIXI.Container();
        this.ghostContainer = new PIXI.Container();
        this.ghostContainer.alpha = 0.4;
        Engine.instance.app.stage.addChild(this.ghostContainer);
    }

    public showGhost(type: TowerType) {
        this.hideGhost();
        this.ghostTower = new Tower(type, 0, 0);
        this.ghostContainer.addChild(this.ghostTower.container);
        this.ghostContainer.visible = true;
    }

    public hideGhost() {
        this.ghostContainer.removeChildren();
        this.ghostTower = null;
        this.ghostContainer.visible = false;
    }

    public updateGhost(x: number, y: number) {
        if (this.ghostTower) {
            const gx = Math.floor(x / 40) * 40 + 20;
            const gy = Math.floor(y / 40) * 40 + 20;
            this.ghostTower.container.position.set(gx, gy);
            
            // Red tint if not buildable
            const buildable = this.mapManager.isBuildable(gx, gy);
            this.ghostTower.container.alpha = buildable ? 1.0 : 0.4;
        }
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
            return dist < 40; // Increased from 24 to 40 for mobile precision
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

    public sellSelectedTower() {
        if (this.selectedTower) {
            const refund = this.selectedTower.getRefundValue();
            StateManager.instance.addCredits(refund);
            this.mapManager.setOccupied(this.selectedTower.container.x, this.selectedTower.container.y, false);
            
            const index = this.towers.indexOf(this.selectedTower);
            if (index !== -1) {
                this.towers.splice(index, 1);
            }
            this.selectedTower.destroy();
            this.selectedTower = null;
            AudioManager.getInstance().playTerminalCommand();
            return true;
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

    public loadTowers(towerData: any[]) {
        this.clearAllTowers();
        towerData.forEach(data => {
            const tower = new Tower(data.type, data.x, data.y);
            // Manually set tier and update visual
            for (let i = 1; i < data.tier; i++) {
                tower.upgrade();
            }
            this.towers.push(tower);
            this.container.addChild(tower.container);
            this.mapManager.setOccupied(data.x, data.y, true);
        });
    }

    public update(delta: number, enemies: any[]) {
        const TILE_SIZE = 40;
        const SECTOR_SIZE = TILE_SIZE * 4; // 4x4 Tiles per sector

        // Spatial Partitioning: Bucket enemies by sector
        const sectors: Record<string, any[]> = {};
        for (const enemy of enemies) {
            const sx = Math.floor(enemy.container.x / SECTOR_SIZE);
            const sy = Math.floor(enemy.container.y / SECTOR_SIZE);
            const key = `${sx},${sy}`;
            if (!sectors[key]) sectors[key] = [];
            sectors[key].push(enemy);
        }

        for (const tower of this.towers) {
            // Only scan enemies in tower's sector + adjacent sectors
            const tx = Math.floor(tower.container.x / SECTOR_SIZE);
            const ty = Math.floor(tower.container.y / SECTOR_SIZE);
            const nearbyEnemies: any[] = [];
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const key = `${tx + dx},${ty + dy}`;
                    if (sectors[key]) nearbyEnemies.push(...sectors[key]);
                }
            }

            tower.update(delta, nearbyEnemies, (p) => {
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
