import * as PIXI from 'pixi.js';
import { MapManager, TILE_SIZE } from './MapManager';
import { Tower, TowerType, TOWER_CONFIGS } from '../entities/Tower';
import { StateManager } from '../core/StateManager';
import { NeuralBrain } from './NeuralBrain';
import { Enemy } from '../entities/Enemy';
import { AudioManager } from './AudioManager';

export class TowerManager {
    public towers: Tower[] = [];
    private container: PIXI.Container;
    private projectileContainer: PIXI.Container;
    private mapManager: MapManager;
    
    // DRAG AND PLACE SYSTEM
    private ghostTower: PIXI.Container | null = null;
    private ghostRange: PIXI.Graphics | null = null;
    private ghostBox: PIXI.Graphics | null = null;

    constructor(mapManager: MapManager) {
        this.mapManager = mapManager;
        this.container = new PIXI.Container();
        this.projectileContainer = new PIXI.Container();
        this.projectileContainer.eventMode = 'none';

        // Global drag listener
        window.addEventListener('pointermove', this.updateDrag.bind(this));
        window.addEventListener('pointerup', this.executePlacement.bind(this));
    }

    public update(dt: number, enemies: Enemy[]) {
        for (const tower of this.towers) {
            tower.update(dt, enemies, (p) => this.projectileContainer.addChild(p.container));
        }
    }

    // --- DRAG AND PLACE PROTOCOL ---
    public initiateDrag(type: TowerType) {
        if (this.ghostTower) this.cleanupGhost();
        
        const cfg = TOWER_CONFIGS[type];
        if (StateManager.instance.credits < cfg.cost) return;

        StateManager.instance.activeDraggingTurret = type;
        
        this.ghostTower = new PIXI.Container();
        this.ghostRange = new PIXI.Graphics();
        this.ghostBox = new PIXI.Graphics();

        // 1. Light Radius Signature
        this.ghostRange.circle(0, 0, cfg.range * TILE_SIZE).fill({ color: 0x00ffff, alpha: 0.15 }).stroke({ color: 0x00ffff, width: 2, alpha: 0.3 });
        
        // 2. Snap Box Indicator
        this.ghostBox.rect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE).stroke({ color: 0xff3300, width: 2 });

        this.ghostTower.addChild(this.ghostRange);
        this.ghostTower.addChild(this.ghostBox);
        this.container.addChild(this.ghostTower);
        
        AudioManager.getInstance().playUiClick();
    }

    private updateDrag(e: PointerEvent) {
        if (!this.ghostTower) return;
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const sc = this.container.parent.scale.x;
        const offsetX = this.container.parent.x;
        
        const rawX = (e.clientX - rect.left - offsetX) / sc;
        const rawY = (e.clientY - rect.top) / sc;

        // QUANTUM SNAP
        const gridX = Math.floor(rawX / TILE_SIZE);
        const gridY = Math.floor(rawY / TILE_SIZE);

        this.ghostTower.position.set((gridX + 0.5) * TILE_SIZE, (gridY + 0.5) * TILE_SIZE);

        // AVAILABILITY CHECK
        const isAvailable = NeuralBrain.getInstance().isNodeAvailable(gridX, gridY);
        const alreadyOccupied = this.towers.some(t => {
            const tx = Math.floor(t.container.x / TILE_SIZE);
            const ty = Math.floor(t.container.y / TILE_SIZE);
            return tx === gridX && ty === gridY;
        });

        const valid = isAvailable && !alreadyOccupied;
        this.ghostBox!.tint = valid ? 0x00ff66 : 0xff3300;
        this.ghostRange!.alpha = valid ? 1.0 : 0.3;
    }

    private executePlacement(e: PointerEvent) {
        if (!this.ghostTower || !StateManager.instance.activeDraggingTurret) return;

        const type = StateManager.instance.activeDraggingTurret;
        const gridX = Math.floor(this.ghostTower.x / TILE_SIZE);
        const gridY = Math.floor(this.ghostTower.y / TILE_SIZE);

        const isAvailable = NeuralBrain.getInstance().isNodeAvailable(gridX, gridY);
        const alreadyOccupied = this.towers.some(t => {
            const tx = Math.floor(t.container.x / TILE_SIZE);
            const ty = Math.floor(t.container.y / TILE_SIZE);
            return tx === gridX && ty === gridY;
        });

        if (isAvailable && !alreadyOccupied) {
            const tower = new Tower(type, gridX, gridY);
            this.towers.push(tower);
            this.container.addChild(tower.container);
            StateManager.instance.addCredits(-TOWER_CONFIGS[type].cost);
            AudioManager.getInstance().playUiClick();
        }

        this.cleanupGhost();
        StateManager.instance.activeDraggingTurret = null;
    }

    private cleanupGhost() {
        if (this.ghostTower) {
            this.container.removeChild(this.ghostTower);
            this.ghostTower.destroy({ children: true });
            this.ghostTower = null;
        }
    }

    // --- EXISTING ---
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
