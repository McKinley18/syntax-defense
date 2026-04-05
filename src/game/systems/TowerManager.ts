import * as PIXI from 'pixi.js';
import { Tower, TowerType, TOWER_CONFIGS } from '../entities/Tower';
import { GameContainer } from '../GameContainer';
import { TILE_SIZE } from './MapManager';
import { GameStateManager } from './GameStateManager';
import { AudioManager } from './AudioManager';

export class TowerManager {
    public towers: Tower[] = [];
    public isPlacing: boolean = false;
    public selectedTurretType: TowerType = TowerType.PULSE_MG;
    
    private previewGraphics: PIXI.Graphics;
    private linkGraphics: PIXI.Graphics;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.previewGraphics = new PIXI.Graphics();
        this.linkGraphics = new PIXI.Graphics();
        this.game.uiLayer.addChild(this.previewGraphics);
        this.game.effectLayer.addChild(this.linkGraphics);
        this.setupPlacementInput();
    }

    public startPlacement(type: TowerType) {
        this.isPlacing = true;
        this.selectedTurretType = type;
    }

    public cancelPlacement() {
        this.isPlacing = false;
        this.previewGraphics.clear();
    }

    private setupPlacementInput() {
        this.game.app.stage.eventMode = 'static';
        
        this.game.app.stage.on('globalpointermove', (e) => {
            if (!this.isPlacing) {
                this.previewGraphics.clear();
                return;
            }
            const worldPos = this.game.viewport.toLocal(e.global);
            this.updatePreview(worldPos.x, worldPos.y);
        });

        this.game.app.stage.on('pointertap', (e) => {
            const worldPos = this.game.viewport.toLocal(e.global);
            
            if (this.isPlacing) {
                const gy = Math.floor(worldPos.y / TILE_SIZE);
                const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
                const isBoundary = gy <= 0 || gy >= visibleRows - 1;

                if (this.game.mapManager.isBuildable(worldPos.x, worldPos.y) && !isBoundary) {
                    if (!this.getTowerAt(worldPos.x, worldPos.y)) {
                        const cost = this.getAdjustedCost(this.selectedTurretType);
                        if (GameStateManager.getInstance().credits >= cost) {
                            const center = this.game.mapManager.getTileCenter(worldPos.x, worldPos.y);
                            this.placeTower(this.selectedTurretType, center.x, center.y);
                            GameStateManager.getInstance().addCredits(-cost);
                            AudioManager.getInstance().playPlacement();
                            
                            this.isPlacing = false;
                            this.previewGraphics.clear();
                            e.preventDefault();
                        }
                    }
                }
            } else {
                // TOWER INTERACTION (Upgrade)
                const tower = this.getTowerAt(worldPos.x, worldPos.y);
                if (tower) {
                    this.tryUpgradeTower(tower);
                }
            }
        });
    }

    private getAdjustedCost(type: TowerType): number {
        const state = GameStateManager.getInstance();
        const base = TOWER_CONFIGS[type].cost;
        
        // SUPPLY & DEMAND PRICING
        const count = this.getTowerCount(type);
        const supplyMultiplier = count >= 4 ? 1.15 : 1.0;
        
        let cost = Math.floor(base * supplyMultiplier);
        if (state.gameMode === 'HARDCORE') cost = Math.floor(cost * 1.5);
        
        // SMART LOGIC: Recovery pricing
        if (state.integrity < 10 && state.gameMode !== 'SUDDEN_DEATH') cost = Math.floor(cost * 0.85);
        return cost;
    }

    private tryUpgradeTower(tower: Tower) {
        if (tower.level >= 3) return;
        const upgradeCost = Math.floor(this.getAdjustedCost(tower.type) * (tower.level === 1 ? 1.5 : 2.0));
        
        if (GameStateManager.getInstance().credits >= upgradeCost) {
            if (tower.upgrade()) {
                AudioManager.getInstance().playUiClick();
                GameStateManager.getInstance().addCredits(-upgradeCost);
                this.game.particleManager.spawnFloatingText(tower.container.x, tower.container.y - 20, "UPGRADED!");
                this.recalculateLinks();
            }
        }
    }

    public placeTower(type: TowerType, x: number, y: number) {
        const tower = new Tower(type, x, y);
        this.towers.push(tower);
        this.game.towerLayer.addChild(tower.container);
        this.recalculateLinks();
    }

    private recalculateLinks() {
        this.linkGraphics.clear();
        // Reset all bonuses
        this.towers.forEach(t => t.linkBonus = 0);

        for (let i = 0; i < this.towers.length; i++) {
            for (let j = i + 1; j < this.towers.length; j++) {
                const t1 = this.towers[i];
                const t2 = this.towers[j];

                if (t1.type === t2.type) {
                    const dx = t1.container.x - t2.container.x;
                    const dy = t1.container.y - t2.container.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < TILE_SIZE * 2.5) { // Adjacent or near-adjacent
                        t1.linkBonus = Math.min(0.3, t1.linkBonus + 0.1);
                        t2.linkBonus = Math.min(0.3, t2.linkBonus + 0.1);

                        // Draw Link Visual
                        this.linkGraphics.moveTo(t1.container.x, t1.container.y);
                        this.linkGraphics.lineTo(t2.container.x, t2.container.y);
                        this.linkGraphics.stroke({ width: 1, color: t1.config.color, alpha: 0.4 });
                    }
                }
            }
        }
    }

    public getTowerCount(type: TowerType): number {
        return this.towers.filter(t => t.type === type).length;
    }

    private updatePreview(wx: number, wy: number) {
        this.previewGraphics.clear();
        const gx = Math.floor(wx / TILE_SIZE);
        const gy = Math.floor(wy / TILE_SIZE);
        const sx = gx * TILE_SIZE;
        const sy = gy * TILE_SIZE;
        const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);

        const isBoundary = gy <= 0 || gy >= visibleRows - 1;
        const isBuildable = this.game.mapManager.isBuildable(wx, wy) && !this.getTowerAt(wx, wy) && !isBoundary;
        const config = TOWER_CONFIGS[this.selectedTurretType];

        // Radius
        this.previewGraphics.circle(sx + TILE_SIZE/2, sy + TILE_SIZE/2, config.range * TILE_SIZE);
        this.previewGraphics.fill({ color: config.color, alpha: 0.1 });
        this.previewGraphics.stroke({ width: 1, color: config.color, alpha: 0.3 });

        // Snap Box with Interactive Grid Pulse
        this.previewGraphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
        if (isBuildable) {
            const pulse = 0.2 + Math.abs(Math.sin(Date.now() / 200)) * 0.3;
            this.previewGraphics.fill({ color: 0x00ffcc, alpha: pulse });
            this.previewGraphics.stroke({ width: 2, color: 0x00ffcc, alpha: 0.8 });
        } else {
            this.previewGraphics.fill({ color: 0xff3300, alpha: 0.3 });
            this.previewGraphics.stroke({ width: 2, color: 0xff3300, alpha: 0.8 });
        }
    }

    public update(delta: number) {
        const enemies = this.game.waveManager.enemies;
        this.towers.forEach(t => t.update(delta, enemies));
    }

    public clearTowers() {
        this.towers.forEach(t => {
            this.game.towerLayer.removeChild(t.container);
            t.container.destroy({ children: true });
        });
        this.towers = [];
        this.linkGraphics.clear();
    }

    private getTowerAt(x: number, y: number): Tower | null {
        return this.towers.find(t => {
            const dx = Math.abs(t.container.x - x);
            const dy = Math.abs(t.container.y - y);
            return dx < TILE_SIZE / 2 && dy < TILE_SIZE / 2;
        }) || null;
    }
}
