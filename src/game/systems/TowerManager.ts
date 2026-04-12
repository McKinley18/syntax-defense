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
    public onTowerPlaced: (() => void) | null = null;
    public onTowerSelected: ((tower: Tower | null) => void) | null = null;
    public onTowerHover: ((tower: Tower | null) => void) | null = null;
    public onTowerUpgraded: (() => void) | null = null;
    public onPlacementCancelled: (() => void) | null = null;
    public showAllRanges: boolean = false;
    public selectedTower: Tower | null = null;
    
    private previewGraphics: PIXI.Graphics;
    private previewTurret: PIXI.Container;
    private linkGraphics: PIXI.Graphics;
    private rangeGraphics: PIXI.Graphics;
    private game: GameContainer;
    public lastPlacementTime: number = 0;

    constructor(game: GameContainer) {
        this.game = game;
        this.previewGraphics = new PIXI.Graphics();
        this.previewTurret = new PIXI.Container();
        this.linkGraphics = new PIXI.Graphics();
        this.rangeGraphics = new PIXI.Graphics();
        this.game.uiLayer.addChild(this.rangeGraphics);
        this.game.uiLayer.addChild(this.previewGraphics);
        this.game.uiLayer.addChild(this.previewTurret);
        this.game.effectLayer.addChild(this.linkGraphics);
        this.setupPlacementInput();
    }

    public startPlacement(type: TowerType) {
        this.isPlacing = true;
        this.selectedTurretType = type;
        
        // Setup visual for preview
        this.previewTurret.removeChildren();
        
        // Add range circle attached to the preview container
        const config = TOWER_CONFIGS[type];
        const gsm = GameStateManager.getInstance();
        const boost = 1 + (gsm.upgrades.signalBoost * 0.02);
        const range = config.range * TILE_SIZE * boost;
        
        const rangeCircle = new PIXI.Graphics();
        rangeCircle.circle(0, 0, range);
        rangeCircle.fill({ color: config.color, alpha: 0.15 });
        rangeCircle.stroke({ width: 2, color: config.color, alpha: 0.5 });
        this.previewTurret.addChild(rangeCircle);

        const dummy = new Tower(type, 0, 0);
        this.previewTurret.addChild(dummy.container);
        this.previewTurret.alpha = 0.8;
        this.previewTurret.visible = true;
    }

    public cancelPlacement() {
        this.isPlacing = false;
        this.previewGraphics.clear();
        this.previewTurret.visible = false;
        if (this.onPlacementCancelled) this.onPlacementCancelled();
    }

    private setupPlacementInput() {
        this.game.app.stage.eventMode = 'static';
        
        this.game.app.stage.on('globalpointermove', (e) => {
            const worldPos = this.game.viewport.toLocal(e.global);
            if (!this.isPlacing) {
                this.previewGraphics.clear();
                this.previewTurret.visible = false;
                
                const hoverTower = this.getTowerAt(worldPos.x, worldPos.y);
                if (this.onTowerHover) this.onTowerHover(hoverTower);
                return;
            }
            this.updatePreview(worldPos.x, worldPos.y);
        });

        this.game.app.stage.on('pointerdown', (e) => {
            const worldPos = this.game.viewport.toLocal(e.global);
            
            if (this.isPlacing) {
                const gy = Math.floor(worldPos.y / TILE_SIZE);
                const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
                const isBoundary = gy <= 0 || gy >= visibleRows - 1;
                const isWave0 = GameStateManager.getInstance().currentWave === 0;

                // Tutorial override: Allow placement anywhere buildable (or even path if needed for tutorial success)
                if ((this.game.mapManager.isBuildable(worldPos.x, worldPos.y) && !isBoundary) || isWave0) {
                    if (!this.getTowerAt(worldPos.x, worldPos.y)) {
                        const cost = this.getAdjustedCost(this.selectedTurretType);
                        if (GameStateManager.getInstance().credits >= cost) {
                            const center = this.game.mapManager.getTileCenter(worldPos.x, worldPos.y);
                            this.placeTower(this.selectedTurretType, center.x, center.y);
                            this.lastPlacementTime = Date.now();
                            GameStateManager.getInstance().addCredits(-cost);
                            AudioManager.getInstance().playPlacement();
                            
                            if (this.onTowerPlaced) this.onTowerPlaced(); 
                            
                            this.isPlacing = false;
                            this.previewGraphics.clear();
                            this.previewTurret.visible = false;
                        }
                    }
                }
            } else {
                // TUTORIAL LOCK: Selection is ONLY permitted during Step 5 of the tutorial
                if (this.game.isTutorialActive && this.game.tutorialStep !== 5) return;
                
                // Ignore selection if we just placed a tower (prevents tutorial skip)
                if (Date.now() - this.lastPlacementTime < 400) return;

                const tower = this.getTowerAt(worldPos.x, worldPos.y);
                if (this.onTowerSelected) {
                    this.onTowerSelected(tower); // SIGNAL UI
                }
            }
        });
    }

    public getUpgradeCost(tower: Tower): number {
        const nextLevel = tower.level + 1;
        if (nextLevel > 3) return 0;
        return Math.floor(this.getAdjustedCost(tower.type) * (tower.level === 1 ? 1.5 : 2.0));
    }

    public tryUpgradeTower(tower: Tower): boolean {
        if (!tower || typeof tower.upgrade !== 'function') return false;
        if (tower.level >= 3) return false;
        const upgradeCost = this.getUpgradeCost(tower);
        
        if (GameStateManager.getInstance().credits >= upgradeCost) {
            if (tower.upgrade()) {
                AudioManager.getInstance().playUiClick();
                GameStateManager.getInstance().addCredits(-upgradeCost, 'kill' as any);
                this.game.particleManager.spawnFloatingText(tower.container.x, tower.container.y - 20, "UPGRADED!");
                this.recalculateLinks();
                if (this.onTowerUpgraded) this.onTowerUpgraded();
                return true;
            }
        }
        return false;
    }

    public getTowerCount(type: TowerType): number {
        return this.towers.filter(t => t.type === type).length;
    }

    public getTotalFieldValuation(): number {
        let total = 0;
        this.towers.forEach(t => {
            const baseCost = TOWER_CONFIGS[t.type].cost;
            total += baseCost;
            if (t.level >= 2) total += Math.floor(baseCost * 1.5);
            if (t.level >= 3) total += Math.floor(baseCost * 2.0);
        });
        return total;
    }

    public sellTower(tower: Tower) {
        const baseCost = TOWER_CONFIGS[tower.type].cost;
        let towerValue = baseCost;
        if (tower.level >= 2) towerValue += Math.floor(baseCost * 1.5);
        if (tower.level >= 3) towerValue += Math.floor(baseCost * 2.0);
        
        const state = GameStateManager.getInstance();
        const refundMult = 0.75 + (state.upgrades.scrapReclamation * 0.05);
        const refund = Math.floor(towerValue * refundMult);
        state.addCredits(refund, 'scrap' as any);
        AudioManager.getInstance().playUiClick();
        
        this.game.towerLayer.removeChild(tower.container);
        const idx = this.towers.indexOf(tower);
        if (idx > -1) this.towers.splice(idx, 1);
        tower.container.destroy({ children: true });
        this.recalculateLinks();
    }

    private getAdjustedCost(type: TowerType): number {
        const state = GameStateManager.getInstance();
        const base = TOWER_CONFIGS[type].cost;
        const count = this.getTowerCount(type);
        const supplyMultiplier = count >= 4 ? 1.15 : 1.0;
        let cost = Math.floor(base * supplyMultiplier);
        if (state.gameMode === 'HARDCORE') cost = Math.floor(cost * 1.5);
        if (state.integrity < 10 && state.gameMode !== 'SUDDEN_DEATH') cost = Math.floor(cost * 0.85);
        return cost;
    }

    public placeTower(type: TowerType, x: number, y: number) {
        const tower = new Tower(type, x, y);
        this.towers.push(tower);
        this.game.towerLayer.addChild(tower.container);
        this.recalculateLinks();
    }

    private recalculateLinks() {
        this.linkGraphics.clear();
        const gsm = GameStateManager.getInstance();
        const stepBonus = 0.1 + (gsm.upgrades.linkAmplifier * 0.05);
        const maxBonus = 0.3 + (gsm.upgrades.linkAmplifier * 0.1);
        
        this.towers.forEach(t => {
            t.linkBonus = 0;
            (t as any).synergySlow = false;
            (t as any).synergySpeedBoost = 1.0;
        });

        for (let i = 0; i < this.towers.length; i++) {
            for (let j = i + 1; j < this.towers.length; j++) {
                const t1 = this.towers[i];
                const t2 = this.towers[j];
                const dx = t1.container.x - t2.container.x;
                const dy = t1.container.y - t2.container.y;
                const distSq = dx*dx + dy*dy;
                const linkDist = TILE_SIZE * 2.0;

                if (distSq <= linkDist * linkDist) {
                    this.linkGraphics.moveTo(t1.container.x, t1.container.y);
                    this.linkGraphics.lineTo(t2.container.x, t2.container.y);
                    this.linkGraphics.stroke({ width: 1, color: 0x00ffff, alpha: 0.3 });

                    if (t1.type === t2.type) {
                        t1.linkBonus = Math.min(maxBonus, t1.linkBonus + stepBonus);
                        t2.linkBonus = Math.min(maxBonus, t2.linkBonus + stepBonus);
                    }
                    if ((t1.type === TowerType.FROST_RAY && t2.type === TowerType.PULSE_MG) ||
                        (t2.type === TowerType.FROST_RAY && t1.type === TowerType.PULSE_MG)) {
                        const mg = t1.type === TowerType.PULSE_MG ? t1 : t2;
                        (mg as any).synergySlow = true;
                    }
                    if (t1.type === TowerType.TESLA_LINK || t2.type === TowerType.TESLA_LINK) {
                        const target = t1.type === TowerType.TESLA_LINK ? t2 : t1;
                        (target as any).synergySpeedBoost = 1.3;
                    }
                }
            }
        }
    }

    private updatePreview(wx: number, wy: number) {
        this.previewGraphics.clear();
        const gx = Math.floor(wx / TILE_SIZE);
        const gy = Math.floor(wy / TILE_SIZE);
        const sx = gx * TILE_SIZE;
        const sy = gy * TILE_SIZE;
        
        const center = this.game.mapManager.getTileCenter(wx, wy);
        this.previewTurret.position.set(center.x, center.y);
        this.previewTurret.visible = true;

        const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
        const isBoundary = gy <= 0 || gy >= visibleRows - 1;
        const isBuildable = this.game.mapManager.isBuildable(wx, wy) && !this.getTowerAt(wx, wy) && !isBoundary;
        const config = TOWER_CONFIGS[this.selectedTurretType];
        if (!config) return;

        this.previewGraphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
        if (isBuildable) {
            const pulse = 0.2 + Math.abs(Math.sin(Date.now() / 200)) * 0.3;
            this.previewGraphics.fill({ color: 0x00ffff, alpha: pulse });
            this.previewGraphics.stroke({ width: 2, color: 0x00ffff, alpha: 0.8 });
        } else {
            this.previewGraphics.fill({ color: 0xff3300, alpha: 0.3 });
            this.previewGraphics.stroke({ width: 2, color: 0xff3300, alpha: 0.8 });
        }
    }

    public update(delta: number) {
        if (this.game.isTutorialActive) {
            this.rangeGraphics.clear();
        }
        
        const enemies = this.game.waveManager.enemies;
        this.towers.forEach(t => t.update(delta, enemies));
        this.renderRanges();
    }

    private renderRanges() {
        this.rangeGraphics.clear();
        
        // ABSOLUTE TUTORIAL KILL-SWITCH: No ranges permitted until tutorial is complete
        if (this.game.isTutorialActive) return;

        const gsm = GameStateManager.getInstance();
        const boost = 1 + (gsm.upgrades.signalBoost * 0.02);

        // 1. SELECTED TOWER: Always show radius for current selection
        if (this.selectedTower && this.selectedTower.container.x > 0) {
            const t = this.selectedTower;
            const range = (t.config.range + (t.level === 3 ? 1 : 0)) * TILE_SIZE * boost;
            this.rangeGraphics.circle(t.container.x, t.container.y, range);
            this.rangeGraphics.stroke({ width: 2, color: t.config.color, alpha: 0.8 });
            this.rangeGraphics.fill({ color: t.config.color, alpha: 0.05 });
        }

        if (!this.showAllRanges) return;

        this.towers.forEach(t => {
            // Don't double-render if it's the selected tower
            if (t === this.selectedTower) return;
            
            const range = (t.config.range + (t.level === 3 ? 1 : 0)) * TILE_SIZE * boost;
            this.rangeGraphics.circle(t.container.x, t.container.y, range);
            this.rangeGraphics.stroke({ width: 1, color: t.config.color, alpha: 0.2 });
        });
    }

    public clearTowers() {
        this.towers.forEach(t => {
            this.game.towerLayer.removeChild(t.container);
            t.container.destroy({ children: true });
        });
        this.towers = [];
        this.selectedTower = null;
        this.linkGraphics.clear();
        this.clearRanges();
    }

    public clearRanges() {
        this.rangeGraphics.clear();
    }

    private getTowerAt(x: number, y: number): Tower | null {
        return this.towers.find(t => {
            const dx = Math.abs(t.container.x - x);
            const dy = Math.abs(t.container.y - y);
            return dx < TILE_SIZE / 2 && dy < TILE_SIZE / 2;
        }) || null;
    }
}
