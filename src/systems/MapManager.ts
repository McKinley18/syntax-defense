import * as PIXI from 'pixi.js';
import { Engine } from '../core/Engine';
import { StateManager } from '../core/StateManager';
import { Kernel } from '../entities/Kernel';
import type { GridCoord } from './PathManager';

export enum TileType { EMPTY, PATH, OCCUPIED }
export const TILE_SIZE = 40;
export const GRID_COLS = 40;
export const GRID_ROWS = 14;

export interface IMapManager {
    isBuildable(x: number, y: number): boolean;
    setOccupied(x: number, y: number, occupied: boolean): void;
}

export class MapManager implements IMapManager {
    private grid: TileType[][] = [];
    private container: PIXI.Container;
    private gridGraphics: PIXI.Graphics;
    private kernel: Kernel;

    constructor() {
        this.container = new PIXI.Container();
        this.gridGraphics = new PIXI.Graphics();
        this.container.addChild(this.gridGraphics);
        Engine.instance.app.stage.addChildAt(this.container, 0); 
        
        for (let x = 0; x < GRID_COLS; x++) {
            this.grid[x] = [];
            for (let y = 0; y < GRID_ROWS; y++) {
                this.grid[x][y] = TileType.EMPTY;
            }
        }

        this.kernel = new Kernel();
        Engine.instance.app.stage.addChild(this.kernel.container);

        Engine.instance.app.ticker.add((ticker) => this.kernel.update(ticker.deltaTime));
    }

    public setPathFromCells(cells: GridCoord[]) {
        for (let x = 0; x < GRID_COLS; x++) {
            for (let y = 0; y < GRID_ROWS; y++) this.grid[x][y] = TileType.EMPTY;
        }
        cells.forEach(c => {
            if (this.grid[c.x] && this.grid[c.x][c.y] !== undefined) {
                this.grid[c.x][c.y] = TileType.PATH;
            }
        });

        // --- HARDENED KERNEL CENTERING ---
        // Find the termination cells (last two cells in the path array)
        const lastP1 = cells[cells.length - 1];
        const lastP2 = cells[cells.length - 2];
        
        // Calculate the Vertical Seam Center
        // (y1 + y2 + 1) * TILE_SIZE / 2 provides the exact seam between the two tiles
        const ky = (lastP1.y + lastP2.y + 1) * (TILE_SIZE / 2);
        
        // Position slightly inward (20px) from the absolute right edge for full visibility
        const kx = (GRID_COLS * TILE_SIZE) - 20; 
        
        this.kernel.setPosition(kx, ky);

        this.drawGrid();
    }

    private drawGrid() {
        this.gridGraphics.clear();
        this.gridGraphics.rect(0, 0, GRID_COLS * TILE_SIZE, GRID_ROWS * TILE_SIZE).fill(0x050505);

        for (let x = 0; x < GRID_COLS; x++) {
            for (let y = 0; y < GRID_ROWS; y++) {
                const isPath = this.grid[x][y] === TileType.PATH;
                const color = isPath ? 0x000000 : 0x1a1a1a;
                this.gridGraphics.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(color);
                
                if (!isPath) {
                    this.gridGraphics.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                                     .stroke({ width: 1.5, color: 0x00ffff, alpha: 0.6 });
                }
            }
        }
    }

    public isBuildable(x: number, y: number): boolean {
        const gx = Math.floor(x / TILE_SIZE);
        const gy = Math.floor(y / TILE_SIZE);
        if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return false;
        return this.grid[gx][gy] === TileType.EMPTY;
    }

    public setOccupied(x: number, y: number, occupied: boolean) {
        const gx = Math.floor(x / TILE_SIZE);
        const gy = Math.floor(y / TILE_SIZE);
        if (gx >= 0 && gx < GRID_COLS && gy >= 0 && gy < GRID_ROWS) {
            this.grid[gx][gy] = occupied ? TileType.OCCUPIED : TileType.EMPTY;
            this.drawGrid();
        }
    }
}
