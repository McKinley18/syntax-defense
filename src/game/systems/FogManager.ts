import * as PIXI from 'pixi.js';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './MapManager';
import { GameContainer } from '../GameContainer';

export const Visibility = {
    UNEXPLORED: 0,
    EXPLORED: 1,
    VISIBLE: 2
} as const;

export type Visibility = typeof Visibility[keyof typeof Visibility];

export class FogManager {
    private grid: Visibility[][] = [];
    private graphics: PIXI.Graphics;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
        this.graphics = new PIXI.Graphics();
        this.initGrid();
    }

    private initGrid() {
        for (let x = 0; x < MAP_COLS; x++) {
            this.grid[x] = [];
            for (let y = 0; y < MAP_ROWS; y++) {
                this.grid[x][y] = Visibility.UNEXPLORED;
            }
        }
    }

    public revealArea(worldX: number, worldY: number, radius: number) {
        const gridX = Math.floor(worldX / TILE_SIZE);
        const gridY = Math.floor(worldY / TILE_SIZE);
        const gridRadius = Math.ceil(radius / TILE_SIZE);

        for (let x = gridX - gridRadius; x <= gridX + gridRadius; x++) {
            for (let y = gridY - gridRadius; y <= gridY + gridRadius; y++) {
                if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
                    const dist = Math.sqrt(Math.pow(x - gridX, 2) + Math.pow(y - gridY, 2));
                    if (dist <= gridRadius) {
                        this.grid[x][y] = Visibility.VISIBLE;
                    }
                }
            }
        }
    }

    public resetVisibility() {
        for (let x = 0; x < MAP_COLS; x++) {
            for (let y = 0; y < MAP_ROWS; y++) {
                if (this.grid[x][y] === Visibility.VISIBLE) {
                    this.grid[x][y] = Visibility.EXPLORED;
                }
            }
        }
    }

    public render() {
        this.graphics.clear();
        for (let x = 0; x < MAP_COLS; x++) {
            for (let y = 0; y < MAP_ROWS; y++) {
                const state = this.grid[x][y];
                if (state === Visibility.VISIBLE) continue;

                const color = 0x000000;
                const alpha = state === Visibility.UNEXPLORED ? 1.0 : 0.6;
                this.graphics.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                this.graphics.fill({ color, alpha });
            }
        }
        if (!this.game.uiLayer.children.includes(this.graphics)) {
            this.game.viewport.addChild(this.graphics);
        }
    }

    public getVisibilityAt(worldX: number, worldY: number): Visibility {
        const x = Math.floor(worldX / TILE_SIZE);
        const y = Math.floor(worldY / TILE_SIZE);
        if (x >= 0 && x < MAP_COLS && y >= 0 && y < MAP_ROWS) {
            return this.grid[x][y];
        }
        return Visibility.UNEXPLORED;
    }
}
