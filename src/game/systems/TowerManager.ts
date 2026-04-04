import * as PIXI from 'pixi.js';
import { Tower, TowerType, TOWER_CONFIGS } from '../entities/Tower';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';
import { TILE_SIZE } from './MapManager';

export class TowerManager {
    public towers: Tower[] = [];
    public selectedTurretType: TowerType = TowerType.PULSE_MG;
    public isPlacing: boolean = false; // New State
    
    private game: GameContainer;
    private previewGraphics: PIXI.Graphics;

    public getCostModifier(): number {
        return GameStateManager.getInstance().isHardcore ? 1.5 : 1;
    }

    constructor(game: GameContainer) {
        this.game = game;
        this.previewGraphics = new PIXI.Graphics();
        this.game.uiLayer.addChild(this.previewGraphics);
        this.setupPlacementInput();
    }

    // Called by React App.tsx when a turret card is tapped
    public startPlacement(type: TowerType) {
        this.selectedTurretType = type;
        this.isPlacing = true;
    }

    private setupPlacementInput() {
        this.game.app.stage.eventMode = 'static';
        
        // Always clear preview on move IF not placing
        this.game.app.stage.on('globalpointermove', (e) => {
            if (!this.isPlacing) {
                this.previewGraphics.clear();
                return;
            }
            const worldPos = this.game.viewport.toLocal(e.global);
            this.updatePreview(worldPos.x, worldPos.y);
        });

        this.game.app.stage.on('pointertap', (e) => {
            if (!this.isPlacing) return;
            const worldPos = this.game.viewport.toLocal(e.global);
            
            if (this.game.mapManager.isBuildable(worldPos.x, worldPos.y)) {
                if (!this.getTowerAt(worldPos.x, worldPos.y)) {
                    const center = this.game.mapManager.getTileCenter(worldPos.x, worldPos.y);
                    this.placeTower(this.selectedTurretType, center.x, center.y);
                    
                    this.isPlacing = false;
                    this.previewGraphics.clear();
                    e.preventDefault();
                }
            } else {
                // DON'T AUTO-CANCEL ON BACKGROUND TAP - Wait for explicit card change or placement
            }
        });
    }

    private updatePreview(wx: number, wy: number) {
        this.previewGraphics.clear();
        if (!this.isPlacing) return;

        const gx = Math.floor(wx / TILE_SIZE);
        const gy = Math.floor(wy / TILE_SIZE);
        const center = new PIXI.Point(gx * TILE_SIZE + TILE_SIZE / 2, gy * TILE_SIZE + TILE_SIZE / 2);

        const isOccupied = this.getTowerAt(wx, wy) !== null;
        const color = isOccupied || !this.game.mapManager.isBuildable(wx, wy) ? 0xff0000 : 0x00ff00;
        
        const config = TOWER_CONFIGS[this.selectedTurretType];

        this.previewGraphics.rect(gx * TILE_SIZE, gy * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.previewGraphics.stroke({ width: 2, color, alpha: 0.8 });
        this.previewGraphics.fill({ color, alpha: 0.2 });

        this.previewGraphics.circle(center.x, center.y, config.range * TILE_SIZE);
        this.previewGraphics.stroke({ width: 1, color, alpha: 0.3 });
        this.previewGraphics.fill({ color, alpha: 0.05 });
    }

    public clearTowers() {
        this.towers.forEach(t => {
            this.game.towerLayer.removeChild(t.container);
            t.container.destroy({ children: true });
        });
        this.towers = [];
    }

    private getTowerAt(x: number, y: number): Tower | null {
        return this.towers.find(t => {
            const dx = t.container.x - x;
            const dy = t.container.y - y;
            return Math.sqrt(dx*dx + dy*dy) < 12;
        }) || null;
    }

    public placeTower(type: TowerType, x: number, y: number) {
        const cost = this.getCost(type);
        if (GameStateManager.getInstance().spendCredits(cost)) {
            const tower = new Tower(type, x, y);
            this.towers.push(tower);
            this.game.towerLayer.addChild(tower.container);
        }
    }

    public getCost(type: TowerType): number {
        const baseCost = TOWER_CONFIGS[type].cost;
        return Math.floor(baseCost * this.getCostModifier());
    }

    public update(delta: number) {
        const enemies = this.game.waveManager.enemies;
        this.towers.forEach(t => t.update(delta, enemies));
    }
}
