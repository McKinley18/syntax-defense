import * as PIXI from 'pixi.js';
import { GridCoord } from './PathManager';
import { NeuralBrain } from './NeuralBrain';

export const TILE_SIZE = 40;
export const GRID_COLS = 40;
export const GRID_ROWS = 14;

/**
 * MAP MANAGER v14.0: Definitive Authority Void
 * Layering: GRID (Bottom) -> OPAQUE BLACK PATH (Middle) -> SIDE BORDERS (Top).
 */
export class MapManager {
    private container: PIXI.Container;
    private gridGraphics: PIXI.Graphics;
    private pathGraphics: PIXI.Graphics;
    private borderGraphics: PIXI.Graphics;
    
    constructor() {
        this.container = new PIXI.Container();
        this.gridGraphics = new PIXI.Graphics();
        this.pathGraphics = new PIXI.Graphics();
        this.borderGraphics = new PIXI.Graphics();
        
        // TRIPLE-LOCK STACK
        this.container.addChild(this.gridGraphics);
        this.container.addChild(this.pathGraphics);
        this.container.addChild(this.borderGraphics);
        
        this.drawGrid();
    }

    public getContainer() { return this.container; }

    public setPathFromCells(pathCells: GridCoord[]) {
        NeuralBrain.getInstance().mapGridAvailability(GRID_COLS, GRID_ROWS, pathCells);

        this.pathGraphics.clear();
        this.borderGraphics.clear();
        
        // 1. THE BLACK VOID (Masks all grid lines)
        this.pathGraphics.beginPath();
        for (const cell of pathCells) {
            this.pathGraphics.rect(cell.x * TILE_SIZE, cell.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        this.pathGraphics.fill({ color: 0x000000, alpha: 1.0 });

        // 2. THE SIDE BORDERS (Exterior definition)
        const pathSet = new Set(pathCells.map(c => `${c.x},${c.y}`));
        this.borderGraphics.stroke({ color: 0x00ffff, width: 2, alpha: 0.8 });
        
        for (const cell of pathCells) {
            const { x, y } = cell;
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (!pathSet.has(`${x},${y - 1}`)) this.borderGraphics.moveTo(px, py).lineTo(px + TILE_SIZE, py);
            if (!pathSet.has(`${x},${y + 1}`)) this.borderGraphics.moveTo(px, py + TILE_SIZE).lineTo(px + TILE_SIZE, py + TILE_SIZE);
            if (!pathSet.has(`${x - 1},${y}`)) this.borderGraphics.moveTo(px, py).lineTo(px, py + TILE_SIZE);
            if (!pathSet.has(`${x + 1},${y}`)) this.borderGraphics.moveTo(px + TILE_SIZE, py).lineTo(px + TILE_SIZE, py + TILE_SIZE);
        }

        // Always redraw grid for maximum intensity
        this.drawGrid();
    }

    private drawGrid() {
        this.gridGraphics.clear();
        
        // HIGH-INTENSITY UNIFORM GRID
        for (let x = 0; x <= GRID_COLS; x++) {
            this.gridGraphics.moveTo(x * TILE_SIZE, 0).lineTo(x * TILE_SIZE, GRID_ROWS * TILE_SIZE);
        }
        for (let y = 0; y <= GRID_ROWS; y++) {
            this.gridGraphics.moveTo(0, y * TILE_SIZE).lineTo(GRID_COLS * TILE_SIZE, y * TILE_SIZE);
        }
        this.gridGraphics.stroke({ color: 0x00ffff, width: 1.5, alpha: 0.7 });

        // Tactical Node Markers
        for (let x = 0; x < GRID_COLS; x += 5) {
            for (let y = 0; y < GRID_ROWS; y += 3) {
                this.gridGraphics.rect(x * TILE_SIZE - 2, y * TILE_SIZE - 2, 4, 4);
            }
        }
        this.gridGraphics.fill({ color: 0x00ffff, alpha: 0.8 });
    }
}
