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
    
    private graphics: PIXI.Graphics;
    private pathMask: PIXI.Graphics;
    private binarySprite: PIXI.TilingSprite | null = null;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.graphics = new PIXI.Graphics();
        this.pathMask = new PIXI.Graphics();
        this.updateDimensions();
    }

    /**
     * Identifies current viewable edges and limits grid to that area.
     */
    private updateDimensions() {
        this.cols = Math.ceil(window.innerWidth / TILE_SIZE);
        this.rows = Math.ceil(window.innerHeight / TILE_SIZE);
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
        // ALWAYS SYNC TO VIEWABLE EDGES ON START WAVE
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
        // RE-CALCULATE ON EVERY RENDER CALL
        this.cols = Math.ceil(window.innerWidth / TILE_SIZE);
        this.rows = Math.ceil(window.innerHeight / TILE_SIZE);

        this.graphics.clear();
        this.pathMask.clear();

        // ONLY RENDER WITHIN CURRENT VIEWABLE COLS/ROWS
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                const type = this.grid[x][y];
                const sx = x * TILE_SIZE;
                const sy = y * TILE_SIZE;

                if (type === TileType.PATH) {
                    this.graphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.graphics.fill(0x000000);
                    this.pathMask.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.pathMask.fill(0xffffff);
                } else {
                    this.graphics.rect(sx, sy, TILE_SIZE, TILE_SIZE);
                    this.graphics.fill(0x020408);
                    this.graphics.stroke({ width: 1, color: 0x0066ff, alpha: 0.4 });
                }
            }
        }

        if (!this.game.groundLayer.children.includes(this.graphics)) {
            this.game.groundLayer.addChild(this.graphics);
        }

        // RE-SYNC BINARY FLOW TO EXACT VIEWPORT
        if (!this.binarySprite) {
            const tex = TextureGenerator.getInstance().binaryTexture;
            if (tex) {
                this.binarySprite = new PIXI.TilingSprite({
                    texture: tex,
                    width: window.innerWidth,
                    height: window.innerHeight
                });
                this.binarySprite.alpha = 0.5;
                this.game.groundLayer.addChild(this.binarySprite);
                this.game.groundLayer.addChild(this.pathMask);
                this.binarySprite.mask = this.pathMask;
            }
        } else {
            this.binarySprite.width = window.innerWidth;
            this.binarySprite.height = window.innerHeight;
        }
    }

    public update(delta: number) {
        if (this.binarySprite) {
            this.binarySprite.tilePosition.x += 0.8 * delta;
            this.binarySprite.tilePosition.y += 0.4 * delta;
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
