import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { TextureGenerator } from '../utils/TextureGenerator';

export const TILE_SIZE = 24;
export const MAP_COLS = Math.ceil(window.innerWidth / TILE_SIZE);
export const MAP_ROWS = Math.ceil(window.innerHeight / TILE_SIZE);

export const TileType = {
    PATH: 0,
    BUILDABLE: 1,
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export class MapManager {
    public grid: TileType[][] = [];
    private graphics: PIXI.Graphics;
    private pathMask: PIXI.Graphics;
    private binarySprite: PIXI.TilingSprite | null = null;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.graphics = new PIXI.Graphics();
        this.pathMask = new PIXI.Graphics();
        this.initGrid();
    }

    private initGrid() {
        this.grid = [];
        for (let x = 0; x < MAP_COLS; x++) {
            this.grid[x] = [];
            for (let y = 0; y < MAP_ROWS; y++) {
                this.grid[x][y] = TileType.BUILDABLE;
            }
        }
    }

    /**
     * STRICT 2-TILE "FAT BRUSH" PATHING
     * Ensures every segment and corner is exactly a 2x2 block.
     */
    public setPathFromEdges(edges: {start: PIXI.Point, end: PIXI.Point}[]) {
        this.initGrid();
        
        edges.forEach(edge => {
            const gx1 = Math.floor(edge.start.x / TILE_SIZE);
            const gy1 = Math.floor(edge.start.y / TILE_SIZE);
            const gx2 = Math.floor(edge.end.x / TILE_SIZE);
            const gy2 = Math.floor(edge.end.y / TILE_SIZE);

            const minX = Math.min(gx1, gx2);
            const maxX = Math.max(gx1, gx2);
            const minY = Math.min(gy1, gy2);
            const maxY = Math.max(gy1, gy2);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
                        // FILL 2X2 BLOCK AT EVERY STEP
                        // This guarantees 100% solid coverage and perfect corners
                        for(let i=0; i<2; i++) {
                            for(let j=0; j<2; j++) {
                                const fx = x + i;
                                const fy = y + j;
                                if (fx < MAP_COLS && fy < MAP_ROWS) {
                                    this.grid[fx][fy] = TileType.PATH;
                                }
                            }
                        }
                    }
                }
            }
        });
        this.render();
    }

    public render() {
        this.graphics.clear();
        this.pathMask.clear();

        for (let x = 0; x < MAP_COLS; x++) {
            for (let y = 0; y < MAP_ROWS; y++) {
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
        if (gx >= 0 && gx < MAP_COLS && gy >= 0 && gy < MAP_ROWS) {
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
