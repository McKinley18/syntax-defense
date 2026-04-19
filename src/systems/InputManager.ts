import * as PIXI from 'pixi.js';
import { MapManager, TILE_SIZE } from './MapManager';
import { TowerManager } from './TowerManager';
import { StateManager, AppState } from '../core/StateManager';

/**
 * INPUT MANAGER v35.0: Unified Event Router
 * THE REBUILD: Adds right-click and Escape listeners for authoritative deselection.
 */
export class InputManager {
    private towerManager: TowerManager;
    private app: PIXI.Application;

    constructor(app: PIXI.Application, mapManager: MapManager, towerManager: TowerManager) {
        this.app = app;
        this.towerManager = towerManager;

        this.app.stage.eventMode = 'static';
        this.app.stage.on('pointerdown', this.onStageDown.bind(this));
        
        // GLOBAL KEYBOARD LISTENER
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // CONTEXT MENU SUPPRESSION (Allows right-click to deselect)
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleDeselection();
        });
    }

    private onStageDown(e: PIXI.FederatedPointerEvent) {
        // Right-click detection
        if (e.button === 2) {
            this.handleDeselection();
            return;
        }

        const state = StateManager.instance.currentState;
        if (state !== AppState.GAME_PREP && state !== AppState.GAME_WAVE && state !== AppState.WAVE_PREP) return;

        const localPos = this.app.stage.toLocal(e.global);
        const gridX = Math.floor(localPos.x / TILE_SIZE);
        const gridY = Math.floor(localPos.y / TILE_SIZE);

        // 1. ATTEMPT BUILD COMMIT
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
            this.handleDeselection();
        }
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.handleDeselection();
        }
    }

    private handleDeselection() {
        this.towerManager.deselectTower();
        this.towerManager.cancelPlacement();
    }

    public destroy() {
        this.app.stage.off('pointerdown');
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        // Note: Context menu listener is harder to remove if anonymous, 
        // but for this prototype, stage cleanup is sufficient.
    }
}
