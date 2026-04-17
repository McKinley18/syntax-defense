import * as PIXI from 'pixi.js';
import { GridCoord } from './PathManager';
import { NeuralBrain } from './NeuralBrain';

export const TILE_SIZE = 40;
export const GRID_COLS = 40;
export const GRID_ROWS = 18;

/**
 * MAP MANAGER: High-Contrast Architecture
 * Renders a solid black pathway over a technical cyan grid.
 */
export class MapManager {
    private container: PIXI.Container;
    private gridGraphics: PIXI.Graphics;
    private pathGraphics: PIXI.Graphics;
    
    constructor() {
        this.container = new PIXI.Container();
        this.gridGraphics = new PIXI.Graphics();
        this.pathGraphics = new PIXI.Graphics();
        
        // Z-Index: Grid is the base, Path is on top to mask it
        this.container.addChild(this.gridGraphics);
        this.container.addChild(this.pathGraphics);
        
        this.drawGrid();
    }

    public getContainer() { return this.container; }

    public setPathFromCells(pathCells: GridCoord[]) {
        // BRAIN HANDSHAKE: Ensure placement logic knows path vs non-path
        NeuralBrain.getInstance().mapGridAvailability(GRID_COLS, GRID_ROWS, pathCells);

        this.pathGraphics.clear();
        
        // LAW: THE BLACK PATHWAY
        // We draw the path cells as solid, opaque black blocks.
        // This hides the grid lines underneath them perfectly.
        for (const cell of pathCells) {
            this.pathGraphics.rect(cell.x * TILE_SIZE, cell.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                .fill({ color: 0x000000, alpha: 1.0 }) 
                // Subtle edge stroke to define the corridor
                .stroke({ color: 0x00ffff, width: 1, alpha: 0.15 });
        }
    }

    private drawGrid() {
        this.gridGraphics.clear();
        
        // Base Tactical Grid (Cyan)
        // Increased alpha slightly to define the "non-path" space better
        this.gridGraphics.stroke({ color: 0x00ffff, width: 1, alpha: 0.08 });
        
        for (let x = 0; x <= GRID_COLS; x++) {
            this.gridGraphics.moveTo(x * TILE_SIZE, 0).lineTo(x * TILE_SIZE, GRID_ROWS * TILE_SIZE);
        }
        for (let y = 0; y <= GRID_ROWS; y++) {
            this.gridGraphics.moveTo(0, y * TILE_SIZE).lineTo(GRID_COLS * TILE_SIZE, y * TILE_SIZE);
        }

        // Highlight nodes every 5x3 for tactical reference
        for (let x = 0; x < GRID_COLS; x += 5) {
            for (let y = 0; y < GRID_ROWS; y += 3) {
                this.gridGraphics.rect(x * TILE_SIZE - 2, y * TILE_SIZE - 2, 4, 4)
                    .fill({ color: 0x00ffff, alpha: 0.15 });
            }
        }
    }
}
