import * as PIXI from 'pixi.js';
import { MapManager } from './MapManager';
import { TowerManager } from './TowerManager';
import { StateManager, AppState } from '../core/StateManager';

/**
 * INPUT MANAGER: Interaction Orchestrator
 * Manages tactical selection and deployment inputs.
 */
export class InputManager {
    private mapManager: MapManager;
    private towerManager: TowerManager;
    private app: PIXI.Application;

    constructor(app: PIXI.Application, mapManager: MapManager, towerManager: TowerManager) {
        this.app = app;
        this.mapManager = mapManager;
        this.towerManager = towerManager;

        // Interaction is now primarily handled via TowerManager's Drag-and-Place protocol
        // but we maintain global stage clicks for selection.
        this.app.stage.eventMode = 'static';
        this.app.stage.on('pointerdown', this.onStageDown.bind(this));
    }

    private onStageDown(e: PIXI.FederatedPointerEvent) {
        const state = StateManager.instance.currentState;
        if (state !== AppState.GAME_PREP && state !== AppState.GAME_WAVE && state !== AppState.WAVE_PREP) return;

        const pos = this.app.stage.toLocal(e.global);
        
        // --- SELECTION PROTOCOL ---
        // Identify if a tower exists at this node
        const gridX = Math.floor(pos.x / 40);
        const gridY = Math.floor(pos.y / 40);

        const found = this.towerManager.towers.find(t => {
            const tx = Math.floor(t.container.x / 40);
            const ty = Math.floor(t.container.y / 40);
            return tx === gridX && ty === gridY;
        });

        if (found) {
            this.towerManager.selectTower(found);
        } else {
            this.towerManager.deselectTower();
        }
    }

    public destroy() {
        this.app.stage.off('pointerdown');
    }
}
