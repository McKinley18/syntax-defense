import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { TextureGenerator } from '../utils/TextureGenerator';
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
    private pathMask: PIXI.Graphics;
    private binarySprite: PIXI.TilingSprite | null = null;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.groundGraphics = new PIXI.Graphics();
        this.gridGraphics = new PIXI.Graphics();
        this.pathMask = new PIXI.Graphics();
        this.calculateTileSize();
        this.updateDimensions();
    }

    private calculateTileSize() {
        // Dynamic scaling: target ~40-50 columns for desktop, ~25-30 for mobile
        const screenWidth = window.innerWidth;
        if (screenWidth < 600) {
            TILE_SIZE = Math.floor(screenWidth / 25);
        } else if (screenWidth < 1200) {
            TILE_SIZE = Math.floor(screenWidth / 35);
        } else {
            TILE_SIZE = 24; // Standard Elite feel
        }
        TILE_SIZE = Math.max(16, Math.min(32, TILE_SIZE)); // Constraint boundaries
    }

    private updateDimensions() {
        this.calculateTileSize();
        // MANDATE: NO PARTIAL BOXES. 
        const width = Math.floor(window.innerWidth / TILE_SIZE) * TILE_SIZE;
        const height = Math.floor(window.innerHeight / TILE_SIZE) * TILE_SIZE;
        
        this.cols = Math.floor(width / TILE_SIZE);
        this.rows = Math.floor(height / TILE_SIZE);
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

    public setPathFromCells(cells: GridCoord[]) {
        this.updateDimensions();
        // Clear old path
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.grid[x][y] = TileType.BUILDABLE;
            }
        }
        
        cells.forEach(cell => {
            // APPLY STRICT 2x2 STAMP - Snapped to Grid
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const gx = cell.x + i;
                    const gy = cell.y + j;
                    if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
                        this.grid[gx][gy] = TileType.PATH;
                    }
                }
            }
        });
        this.render();
    }

    public render() {
        this.groundGraphics.clear();
        this.gridGraphics.clear();
        this.pathMask.clear();

        // 1. DRAW SOLID BACKGROUND & BLACK PATHS
        // Background
        this.groundGraphics.rect(0, 0, this.cols * TILE_SIZE, this.rows * TILE_SIZE);
        this.groundGraphics.fill(0x020408);

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.grid[x][y] === TileType.PATH) {
                    const sx = x * TILE_SIZE;
                    const sy = y * TILE_SIZE;
                    this.groundGraphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.groundGraphics.fill(0x000000);
                    
                    this.pathMask.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.pathMask.fill(0xffffff);
                }
            }
        }

        // 2. BOUNDARY-AWARE GRID ARCHITECT
        // Draw lines only where appropriate
        // VERTICAL LINES
        for (let x = 0; x <= this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const left = (x > 0) ? this.grid[x-1][y] : null;
                const right = (x < this.cols) ? this.grid[x][y] : null;
                
                // Don't draw line IF both sides are path (inside the corridor)
                if (left === TileType.PATH && right === TileType.PATH) continue;
                
                const isBorder = (left !== right && left !== null && right !== null);
                
                this.gridGraphics.moveTo(x * TILE_SIZE, y * TILE_SIZE);
                this.gridGraphics.lineTo(x * TILE_SIZE, (y + 1) * TILE_SIZE);
                this.gridGraphics.stroke({
                    width: 1,
                    color: 0x0066ff,
                    alpha: isBorder ? 0.6 : 0.15
                });
            }
        }

        // HORIZONTAL LINES
        for (let y = 0; y <= this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const top = (y > 0) ? this.grid[x][y-1] : null;
                const bottom = (y < this.rows) ? this.grid[x][y] : null;
                
                if (top === TileType.PATH && bottom === TileType.PATH) continue;
                
                const isBorder = (top !== bottom && top !== null && bottom !== null);
                
                this.gridGraphics.moveTo(x * TILE_SIZE, y * TILE_SIZE);
                this.gridGraphics.lineTo((x + 1) * TILE_SIZE, y * TILE_SIZE);
                this.gridGraphics.stroke({
                    width: 1,
                    color: 0x0066ff,
                    alpha: isBorder ? 0.6 : 0.15
                });
            }
        }

        if (!this.game.groundLayer.children.includes(this.groundGraphics)) {
            this.game.groundLayer.addChild(this.groundGraphics);
        }
        if (!this.game.groundLayer.children.includes(this.gridGraphics)) {
            this.game.groundLayer.addChild(this.gridGraphics);
        }

        // 3. BINARY FLOW (Only inside path)
        if (this.binarySprite) {
            this.game.groundLayer.removeChild(this.binarySprite);
            this.binarySprite.destroy();
            this.binarySprite = null;
        }
        
        const tex = TextureGenerator.getInstance().binaryTexture;
        if (tex) {
            this.binarySprite = new PIXI.TilingSprite({
                texture: tex,
                width: this.cols * TILE_SIZE,
                height: this.rows * TILE_SIZE
            });
            this.binarySprite.alpha = 0.4;
            this.game.groundLayer.addChild(this.binarySprite);
            this.binarySprite.mask = this.pathMask;
        }
    }

    public update(delta: number) {
        if (this.binarySprite) {
            this.binarySprite.tilePosition.x += 0.6 * delta;
            this.binarySprite.tilePosition.y += 0.3 * delta;
        }
    }

    public isBuildable(x: number, y: number): boolean {
        const gx = Math.floor(x / TILE_SIZE);
        const gy = Math.floor(y / TILE_SIZE);
        if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
            return this.grid[gx][gy] === TileType.BUILDABLE;
        }
        return false;
    }

    public getTileCenter(x: number, y: number): PIXI.Point {
        const gx = Math.floor(x / TILE_SIZE);
        const gy = Math.floor(y / TILE_SIZE);
        return new PIXI.Point(gx * TILE_SIZE + TILE_SIZE / 2, gy * TILE_SIZE + TILE_SIZE / 2);
    }
}
