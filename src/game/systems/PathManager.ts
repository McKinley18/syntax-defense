import * as PIXI from 'pixi.js';
import { TILE_SIZE, MAP_ROWS, MAP_COLS } from './MapManager';

export interface GridCoord {
    x: number;
    y: number;
}

export class PathManager {
    public pathCells: GridCoord[] = [];
    public startNodePos: PIXI.Point = new PIXI.Point(0, 0);
    public endNodePos: PIXI.Point = new PIXI.Point(0, 0);

    constructor() {
        this.generatePath(1);
    }

    public generatePath(waveNumber: number) {
        let success = false;
        let attempts = 0;
        
        while (!success && attempts < 50) {
            if (this.attemptComplexSnake(waveNumber)) {
                success = true;
            }
            attempts++;
        }
    }

    private attemptComplexSnake(wave: number): boolean {
        const visibleCols = Math.floor(window.innerWidth / TILE_SIZE);
        const topMargin = 6;
        const bottomMargin = 8;
        
        this.pathCells = [];
        const visited = new Set<string>();

        let cx = 0;
        let cy = Math.floor((MAP_ROWS - topMargin - bottomMargin) / 2) + topMargin;
        
        const startX = cx;
        const startY = cy;

        // Add initial 2x2 stamp area to visited to prevent immediate collision
        this.markVisited(cx, cy, visited);
        this.pathCells.push({ x: cx, y: cy });

        let lastDir = { x: 1, y: 0 };
        let stepsSinceTurn = 0;

        // Target: Right edge
        const targetX = visibleCols - 1;

        // Loop until we hit the right edge
        for (let i = 0; i < 1000; i++) {
            if (cx >= targetX) break;

            const possibleDirs = [
                { x: 1, y: 0 },  // Right
                { x: 0, y: 1 },  // Down
                { x: 0, y: -1 }, // Up
                { x: -1, y: 0 }  // Left (SWITCH-BACK)
            ];

            // Filter out 180-degree turns and margins
            const validDirs = possibleDirs.filter(d => {
                const nx = cx + d.x;
                const ny = cy + d.y;
                
                // Stay within visible bounds
                if (nx < 0 || nx > visibleCols || ny < topMargin || ny > MAP_ROWS - bottomMargin) return false;
                
                // Prevent 180-degree reversal
                if (d.x === -lastDir.x && d.y === -lastDir.y) return false;

                // STRICT SPATIAL AWARENESS: Check if the 2x2 area we are about to fill is already used
                // We check a 3x3 area to ensure a 1-tile gap between "Switch-Back" corridors
                return this.isAreaClear(nx, ny, visited, 2);
            });

            if (validDirs.length === 0) return false; // Trapped, retry

            // Weighting: High bias for Right, Medium for same direction (inertia), Low for Left
            validDirs.sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;

                // Right bias
                if (a.x === 1) scoreA += 10;
                if (b.x === 1) scoreB += 10;

                // Inertia (prefer continuing straight for a few tiles)
                if (a.x === lastDir.x && a.y === lastDir.y && stepsSinceTurn < 4) scoreA += 5;
                if (b.x === lastDir.x && b.y === lastDir.y && stepsSinceTurn < 4) scoreB += 5;

                // Switch-back weight (Only allow if we are well away from the start)
                if (a.x === -1 && cx > 10) scoreA += 2;
                if (b.x === -1 && cx > 10) scoreB += 2;

                return (scoreB + Math.random() * 5) - (scoreA + Math.random() * 5);
            });

            const dir = validDirs[0];
            if (dir.x !== lastDir.x || dir.y !== lastDir.y) {
                stepsSinceTurn = 0;
            } else {
                stepsSinceTurn++;
            }

            cx += dir.x;
            cy += dir.y;
            lastDir = dir;

            this.markVisited(cx, cy, visited);
            this.pathCells.push({ x: cx, y: cy });
        }

        this.startNodePos = new PIXI.Point(startX * TILE_SIZE + TILE_SIZE, startY * TILE_SIZE + TILE_SIZE);
        this.endNodePos = new PIXI.Point(cx * TILE_SIZE + TILE_SIZE, cy * TILE_SIZE + TILE_SIZE);
        
        return true;
    }

    private isAreaClear(gx: number, gy: number, visited: Set<string>, radius: number): boolean {
        for (let ox = -radius; ox <= radius; ox++) {
            for (let oy = -radius; oy <= radius; oy++) {
                if (visited.has(`${gx + ox},${gy + oy}`)) return false;
            }
        }
        return true;
    }

    private markVisited(gx: number, gy: number, visited: Set<string>) {
        // We only mark the 1x1 core to allow the path to wind tightly,
        // but the renderer will still draw it as 2x2.
        visited.add(`${gx},${gy}`);
    }

    public getPathPoints(): PIXI.Point[] {
        return this.pathCells.map(c => new PIXI.Point(
            c.x * TILE_SIZE + TILE_SIZE / 2, 
            c.y * TILE_SIZE + TILE_SIZE / 2
        ));
    }
}
