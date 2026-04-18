import * as PIXI from 'pixi.js';
import { MapManager, TILE_SIZE } from './MapManager';
import { TowerManager } from './TowerManager';
import { StateManager, AppState } from '../core/StateManager';

/**
 * INPUT MANAGER v34.0: Unified Event Router
 * Manages both Build-Commit and Tactical Selection.
 */
export class InputManager {
    private towerManager: TowerManager;
    private app: PIXI.Application;

    constructor(app: PIXI.Application, mapManager: MapManager, towerManager: TowerManager) {
        this.app = app;
        this.towerManager = towerManager;

        this.app.stage.eventMode = 'static';
        this.app.stage.on('pointerdown', this.onStageDown.bind(this));
    }

    private onStageDown(e: PIXI.FederatedPointerEvent) {
        const state = StateManager.instance.currentState;
        if (state !== AppState.GAME_PREP && state !== AppState.GAME_WAVE && state !== AppState.WAVE_PREP) return;

        const localPos = this.app.stage.toLocal(e.global);
        const gridX = Math.floor(localPos.x / TILE_SIZE);
        const gridY = Math.floor(localPos.y / TILE_SIZE);

        // 1. ATTEMPT BUILD COMMIT
        // If a turret is armed, handleStageClick will place it and return true.
        const buildSuccess = this.towerManager.handleStageClick(gridX, gridY);
        if (buildSuccess) return;

        // 2. ATTEMPT TACTICAL SELECTION
        const found = this.towerManager.towers.find(t => {
            const tx = Math.floor(t.container.x / TILE_SIZE);
            const ty = Math.floor(t.container.y / TILE_SIZE);
            return tx === gridX && ty === gridY;
        });

        if (found) {
            this.towerManager.selectTower(found);
        } else {
            this.towerManager.deselectTower();
            // If clicking empty space and a turret was armed but invalid, cancel arming
            this.towerManager.cancelPlacement();
        }
    }

    public destroy() {
        this.app.stage.off('pointerdown');
    }
}
