import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';
import { TowerManager } from './TowerManager';
import { IMapManager, TILE_SIZE, GRID_ROWS, GRID_COLS } from './MapManager';
import { StateManager, AppState } from '../core/StateManager';

export class InputManager {
    private towerManager: TowerManager;
    private mapManager: IMapManager;
    private lastTapTime: number = 0;
    private lastTapTower: any = null;

    constructor(towerManager: TowerManager, mapManager: IMapManager) {
        this.towerManager = towerManager;
        this.mapManager = mapManager;
        
        // Unified Authoritative Stage Interaction
        Engine.instance.app.stage.eventMode = 'static';
        Engine.instance.app.stage.hitArea = Engine.instance.app.screen;

        Engine.instance.app.stage.on('pointerdown', (e) => this.handleGlobalInput(e));
        Engine.instance.app.stage.on('pointermove', (e) => this.handlePointerMove(e));
    }

    private handlePointerMove(e: PIXI.FederatedPointerEvent) {
        const { x, y } = Engine.instance.screenToLogical(e.global.x, e.global.y);
        const selectedType = StateManager.instance.selectedTurretType;

        if (selectedType !== null) {
            this.towerManager.showGhost(selectedType);
            this.towerManager.updateGhost(x, y);
        } else {
            this.towerManager.hideGhost();
        }
    }

    private handleGlobalInput(e: PIXI.FederatedPointerEvent) {
        const { x, y } = Engine.instance.screenToLogical(e.global.x, e.global.y);
        const selectedType = StateManager.instance.selectedTurretType;

        const isInsideGrid = y >= 0 && y < (GRID_ROWS * TILE_SIZE) && x >= 0 && x < (GRID_COLS * TILE_SIZE);
        
        if (!isInsideGrid) {
            StateManager.instance.selectedTurretType = null;
            this.towerManager.deselectTower();
            return;
        }

        const wasTowerSelected = this.towerManager.attemptSelection(x, y);
        
        if (wasTowerSelected) {
            const now = Date.now();
            const selectedTower = this.towerManager.selectedTower;
            
            // DOUBLE-TAP DETECTION
            if (this.lastTapTower === selectedTower && (now - this.lastTapTime) < 300) {
                if (selectedTower) {
                    (selectedTower as any).overcharge();
                }
            }
            
            this.lastTapTime = now;
            this.lastTapTower = selectedTower;
            return;
        }

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

        this.towerManager.deselectTower();
    }
}
