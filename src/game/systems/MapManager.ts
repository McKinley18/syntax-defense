import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { TextureGenerator } from '../utils/TextureGenerator';
import type { GridCoord } from './PathManager';

export const TILE_SIZE = 24;
export const MAP_COLS = Math.ceil(2000 / TILE_SIZE); 
export const MAP_ROWS = Math.ceil(2000 / TILE_SIZE);

export const TileType = {
    PATH: 0,
    BUILDABLE: 1,
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export class MapManager {
    public grid: TileType[][] = [];
    public cols: number = 0;
    public rows: number = 0;
    
    private graphics: PIXI.Graphics;
    private pathMask: PIXI.Graphics;
    private binarySprite: PIXI.TilingSprite | null = null;
    private gridSprite: PIXI.TilingSprite | null = null;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.graphics = new PIXI.Graphics();
        this.pathMask = new PIXI.Graphics();
        this.updateDimensions();
    }

    private updateDimensions() {
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

    public setPathFromCells(cells: GridCoord[]) {
        this.updateDimensions();
        cells.forEach(cell => {
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
        this.graphics.clear();
        this.pathMask.clear();

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.grid[x][y] === TileType.PATH) {
                    const sx = x * TILE_SIZE;
                    const sy = y * TILE_SIZE;
                    
                    this.graphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.graphics.fill(0x000000);
                    
                    this.pathMask.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.pathMask.fill(0xffffff);

                    // EDGE LIGHTING
                    if (x > 0 && x < this.cols - 1) {
                        const neighbors = [
                            { nx: x+1, ny: y, s: 'r' },
                            { nx: x-1, ny: y, s: 'l' },
                            { nx: x, ny: y+1, s: 'b' },
                            { nx: x, ny: y-1, s: 't' }
                        ];
                        neighbors.forEach(n => {
                            if (this.grid[n.nx] && this.grid[n.nx][n.ny] === TileType.BUILDABLE) {
                                if (n.s === 'r') this.graphics.moveTo(sx + TILE_SIZE, sy).lineTo(sx + TILE_SIZE, sy + TILE_SIZE);
                                if (n.s === 'l') this.graphics.moveTo(sx, sy).lineTo(sx, sy + TILE_SIZE);
                                if (n.s === 'b') this.graphics.moveTo(sx, sy + TILE_SIZE).lineTo(sx + TILE_SIZE, sy + TILE_SIZE);
                                if (n.s === 't') this.graphics.moveTo(sx, sy).lineTo(sx + TILE_SIZE, sy);
                                this.graphics.stroke({ width: 1.5, color: 0x0066ff, alpha: 0.6 });
                            }
                        });
                    }
                }
            }
        }

        if (!this.gridSprite) {
            const cell = new PIXI.Graphics();
            cell.rect(0, 0, TILE_SIZE, TILE_SIZE);
            cell.fill(0x020408);
            cell.stroke({ width: 1, color: 0x0066ff, alpha: 0.3 });
            const tex = this.game.app.renderer.generateTexture(cell);
            this.gridSprite = new PIXI.TilingSprite({ texture: tex, width: window.innerWidth, height: window.innerHeight });
            this.game.groundLayer.addChildAt(this.gridSprite, 0);
        }

        if (!this.game.groundLayer.children.includes(this.graphics)) {
            this.game.groundLayer.addChild(this.graphics);
        }

        if (!this.binarySprite) {
            const tex = TextureGenerator.getInstance().binaryTexture;
            if (tex) {
                this.binarySprite = new PIXI.TilingSprite({ texture: tex, width: window.innerWidth, height: window.innerHeight });
                this.binarySprite.alpha = 0.4;
                this.game.groundLayer.addChild(this.binarySprite);
                this.game.groundLayer.addChild(this.pathMask);
                this.binarySprite.mask = this.pathMask;
            }
        }
        this.syncToViewport();
    }

    private syncToViewport() {
        if (this.gridSprite) {
            this.gridSprite.width = window.innerWidth;
            this.gridSprite.height = window.innerHeight;
        }
        if (this.binarySprite) {
            this.binarySprite.width = window.innerWidth;
            this.binarySprite.height = window.innerHeight;
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
