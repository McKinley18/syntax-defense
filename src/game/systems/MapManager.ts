import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import type { GridCoord } from './PathManager';

export let TILE_SIZE = 24;

export const TileType = {
    PATH: 0,
    BUILDABLE: 1,
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export class MapManager {
    public grid: TileType[][] = [];
    public cols: number = 0;
    public rows: number = 0;
    
    private groundGraphics: PIXI.Graphics;
    private gridGraphics: PIXI.Graphics;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.groundGraphics = new PIXI.Graphics();
        this.gridGraphics = new PIXI.Graphics();
        
        TILE_SIZE = MapManager.calculateTileSize();
        this.updateDimensions();
    }

    public static calculateTileSize(): number {
        const screenWidth = window.innerWidth;
        let size = 24;
        if (screenWidth < 600) {
            size = Math.floor(screenWidth / 25);
        } else if (screenWidth < 1200) {
            size = Math.floor(screenWidth / 35);
        } else {
            size = 24;
        }
        return Math.max(16, Math.min(32, size));
    }

    public updateDimensions() {
        TILE_SIZE = MapManager.calculateTileSize();
        this.cols = Math.ceil(window.innerWidth / TILE_SIZE) + 1;
        this.rows = Math.ceil(window.innerHeight / TILE_SIZE) + 1;
        this.initGrid();
    }

    private initGrid() {
        this.grid = [];
        for (let x = 0; x < this.cols; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.rows; y++) {
                this.grid[x][y] = TileType.BUILDABLE;
            }
        }
    }

    public isBuildable(wx: number, wy: number): boolean {
        const gx = Math.floor(wx / TILE_SIZE);
        const gy = Math.floor(wy / TILE_SIZE);
        if (gy < 0 || gy >= this.rows - 3) return false;
        if (this.grid[gx] && this.grid[gx][gy] === TileType.BUILDABLE) {
            return true;
        }
        return false;
    }

    public setPathFromCells(cells: GridCoord[]) {
        this.initGrid(); 
        cells.forEach(cell => {
            if (this.grid[cell.x]) {
                this.grid[cell.x][cell.y] = TileType.PATH;
            }
        });
        this.renderMap();
    }

    public getTileCenter(wx: number, wy: number): { x: number, y: number } {
        const gx = Math.floor(wx / TILE_SIZE);
        const gy = Math.floor(wy / TILE_SIZE);
        return {
            x: gx * TILE_SIZE + TILE_SIZE / 2,
            y: gy * TILE_SIZE + TILE_SIZE / 2
        };
    }

    public render() {
        this.renderMap();
    }

    public update() {
        // Reserved for dynamic map effects (e.g. flickering grid)
    }

    private renderMap() {
        this.groundGraphics.clear();
        this.gridGraphics.clear();

        // 1. Base Layer (Absolute Black)
        this.groundGraphics.rect(0, 0, window.innerWidth, window.innerHeight);
        this.groundGraphics.fill({ color: 0x000000 });

        // 2. PER-TILE CONSTRUCTION
        // Dimmed Alpha to 0.15 for subtle aesthetic
        this.gridGraphics.setStrokeStyle({ width: 2, color: 0x00ffff, alpha: 0.15 });
        
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const wx = x * TILE_SIZE;
                const wy = y * TILE_SIZE;
                const isPath = this.grid[x] && this.grid[x][y] === TileType.PATH;
                
                if (isPath) {
                    // Path is solid black void with a subtle tint, NO gridlines
                    this.gridGraphics.rect(wx, wy, TILE_SIZE, TILE_SIZE);
                    this.gridGraphics.fill({ color: 0x00ffff, alpha: 0.05 }); 
                    this.gridGraphics.rect(wx, wy, TILE_SIZE, TILE_SIZE);
                    this.gridGraphics.fill({ color: 0x000000, alpha: 0.9 });
                } else {
                    // Buildable area gets the vibrant cyan grid
                    if (y < this.rows - 3) {
                        this.gridGraphics.rect(wx, wy, TILE_SIZE, TILE_SIZE);
                        this.gridGraphics.stroke();
                    }
                }
            }
        }

        this.game.groundLayer.addChild(this.groundGraphics, this.gridGraphics);
    }

    public getTutorialTile(): { x: number, y: number } | null {
        const tile = this.game.pathManager.tutorialBuildableTile;
        if (tile) {
            // Force center of the specific grid box (12, 6)
            return {
                x: tile.x * TILE_SIZE + TILE_SIZE / 2,
                y: tile.y * TILE_SIZE + TILE_SIZE / 2
            };
        }
        return this.getFirstBuildableTile();
    }

    public getFirstBuildableTile(): { x: number, y: number } | null {
        const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
        for (let x = 6; x < this.cols - 6; x++) {
            for (let y = 2; y < this.rows - 2; y++) {
                if (y < 0 || y >= visibleRows - 3) continue;
                if (this.grid[x] && this.grid[x][y] === TileType.BUILDABLE) {
                    const adjacentToPath = 
                        (x > 0 && this.grid[x-1][y] === TileType.PATH) ||
                        (x < this.cols-1 && this.grid[x+1][y] === TileType.PATH) ||
                        (y > 0 && this.grid[x][y-1] === TileType.PATH) ||
                        (y < this.rows-1 && this.grid[x][y+1] === TileType.PATH);
                    
                    if (adjacentToPath) {
                        return { x: x * TILE_SIZE + TILE_SIZE/2, y: y * TILE_SIZE + TILE_SIZE/2 };
                    }
                }
            }
        }
        return null;
    }
}
