import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { TextureGenerator } from '../utils/TextureGenerator';
import type { GridCoord } from './PathManager';

export const TILE_SIZE = 24;

export const TileType = {
    PATH: 0,
    BUILDABLE: 1,
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export class MapManager {
    public grid: TileType[][] = [];
    public cols: number = 0;
    public rows: number = 0;
    
    private pathGraphics: PIXI.Graphics;
    private pathMask: PIXI.Graphics;
    private binarySprite: PIXI.TilingSprite | null = null;
    private gridSprite: PIXI.TilingSprite | null = null;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.pathGraphics = new PIXI.Graphics();
        this.pathMask = new PIXI.Graphics();
        this.updateDimensions();
    }

    private updateDimensions() {
        // MANDATE: NO PARTIAL BOXES. Round down to the nearest TILE_SIZE.
        const width = Math.floor(window.innerWidth / TILE_SIZE) * TILE_SIZE;
        const height = Math.floor(window.innerHeight / TILE_SIZE) * TILE_SIZE;
        
        this.cols = width / TILE_SIZE;
        this.rows = height / TILE_SIZE;
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
        this.pathGraphics.clear();
        this.pathMask.clear();

        // 1. RENDER GRID (If not already cached)
        if (!this.gridSprite) {
            const cellG = new PIXI.Graphics();
            cellG.rect(0, 0, TILE_SIZE, TILE_SIZE);
            cellG.fill(0x020408);
            // INSIDE STROKE: Ensures line is at the exact cell edge
            cellG.stroke({ width: 1, color: 0x0066ff, alpha: 0.3, alignment: 0 }); 
            const tex = this.game.app.renderer.generateTexture(cellG);
            
            this.gridSprite = new PIXI.TilingSprite({
                texture: tex,
                width: window.innerWidth,
                height: window.innerHeight
            });
            this.game.groundLayer.addChildAt(this.gridSprite, 0);
        }

        // 2. BUILD PATH VOID AND MASK
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.grid[x][y] === TileType.PATH) {
                    const sx = x * TILE_SIZE;
                    const sy = y * TILE_SIZE;
                    
                    // SOLID BLACK path
                    this.pathGraphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.pathGraphics.fill(0x000000);
                    
                    // Same shape for mask
                    this.pathMask.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.pathMask.fill(0xffffff);
                }
            }
        }

        // 3. APPLY INVERTED MASK TO GRID
        // This makes the grid invisible ONLY where the path is
        // Resulting in the grid lines acting as perfectly flush borders
        if (this.gridSprite) {
            this.gridSprite.mask = this.pathMask;
            // @ts-ignore - Pixi 8 property
            this.pathMask.context.alphaMode = 'erase'; 
        }

        if (!this.game.groundLayer.children.includes(this.pathGraphics)) {
            this.game.groundLayer.addChild(this.pathGraphics);
        }

        // 4. BINARY FLOW (Only inside path)
        if (!this.binarySprite) {
            const tex = TextureGenerator.getInstance().binaryTexture;
            if (tex) {
                this.binarySprite = new PIXI.TilingSprite({
                    texture: tex,
                    width: window.innerWidth,
                    height: window.innerHeight
                });
                this.binarySprite.alpha = 0.4;
                this.game.groundLayer.addChild(this.binarySprite);
                this.binarySprite.mask = this.pathMask;
            }
        }

        this.syncToViewport();
    }

    private syncToViewport() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (this.gridSprite) { this.gridSprite.width = w; this.gridSprite.height = h; }
        if (this.binarySprite) { this.binarySprite.width = w; this.binarySprite.height = h; }
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
