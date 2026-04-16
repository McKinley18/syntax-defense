import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';
import { TowerManager } from './TowerManager';
import { IMapManager, TILE_SIZE, GRID_ROWS, GRID_COLS } from './MapManager';
import { StateManager, AppState } from '../core/StateManager';

export class InputManager {
    private towerManager: TowerManager;
    private mapManager: IMapManager;

    constructor(towerManager: TowerManager, mapManager: IMapManager) {
        this.towerManager = towerManager;
        this.mapManager = mapManager;
        
        // Unified Authoritative Stage Interaction
        Engine.instance.app.stage.eventMode = 'static';
        Engine.instance.app.stage.hitArea = Engine.instance.app.screen;

        Engine.instance.app.stage.on('pointerdown', (e) => this.handleGlobalInput(e));
    }

    private handleGlobalInput(e: PIXI.FederatedPointerEvent) {
        // Convert to logical grid coordinates
        const { x, y } = Engine.instance.screenToLogical(e.global.x, e.global.y);
        const selectedType = StateManager.instance.selectedTurretType;

        // 1. TACTICAL BOUNDARY ENFORCEMENT
        const isInsideGrid = y >= 0 && y < (GRID_ROWS * TILE_SIZE) && x >= 0 && x < (GRID_COLS * TILE_SIZE);
        
        if (!isInsideGrid) {
            // Clicked over HUD -> Reset selections
            StateManager.instance.selectedTurretType = null;
            this.towerManager.deselectTower();
            return;
        }

        // 2. SELECTION PRIORITY
        const wasTowerSelected = this.towerManager.attemptSelection(x, y);
        if (wasTowerSelected) return;

        // 3. DEPLOYMENT ACTION
        // ALLOW PLACEMENT DURING PREP OR ACTIVE WAVE
        const validState = StateManager.instance.currentState === AppState.GAME_WAVE || 
                           StateManager.instance.currentState === AppState.WAVE_PREP ||
                           StateManager.instance.currentState === AppState.GAME_PREP;

        if (selectedType !== null && validState) {
            const gx = Math.floor(x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
            const gy = Math.floor(y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
            
            const success = this.towerManager.placeTower(selectedType, gx, gy);
            
            if (success) {
                StateManager.instance.selectedTurretType = null;
            }
            return;
        }

        // 4. DESELECTION (Empty space click with no active protocol)
        this.towerManager.deselectTower();
    }
}
