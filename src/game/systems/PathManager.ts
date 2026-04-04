import * as PIXI from 'pixi.js';
import { TILE_SIZE, MAP_ROWS } from './MapManager';

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

    private attemptComplexSnake(waveNumber: number): boolean {
        const visibleCols = Math.floor(window.innerWidth / TILE_SIZE);
        const topMargin = 6;
        const bottomMargin = 8;
        
        this.pathCells = [];
        const visited = new Set<string>();

        let cx = 0;
        let cy = Math.floor((MAP_ROWS - topMargin - bottomMargin) / 2) + topMargin;
        
        const startX = cx;
        const startY = cy;

        this.markVisited(cx, cy, visited);
        this.pathCells.push({ x: cx, y: cy });

        let lastDir = { x: 1, y: 0 };
        let stepsSinceTurn = 0;
        const targetX = visibleCols - 1;

        // Loop limit based on waveNumber
        const maxIters = 1000 + (waveNumber * 10);

        for (let i = 0; i < maxIters; i++) {
            if (cx >= targetX) break;

            const possibleDirs = [
                { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: -1, y: 0 }
            ];

            const validDirs = possibleDirs.filter(d => {
                const nx = cx + d.x;
                const ny = cy + d.y;
                if (nx < 0 || nx > visibleCols || ny < topMargin || ny > MAP_ROWS - bottomMargin) return false;
                if (d.x === -lastDir.x && d.y === -lastDir.y) return false;
                return this.isAreaClear(nx, ny, visited, 2);
            });

            if (validDirs.length === 0) return false;

            validDirs.sort((a, b) => {
                let scoreA = 0; let scoreB = 0;
                if (a.x === 1) scoreA += 10; if (b.x === 1) scoreB += 10;
                if (a.x === lastDir.x && a.y === lastDir.y && stepsSinceTurn < 4) scoreA += 5;
                if (b.x === lastDir.x && b.y === lastDir.y && stepsSinceTurn < 4) scoreB += 5;
                if (a.x === -1 && cx > 10) scoreA += 2; if (b.x === -1 && cx > 10) scoreB += 2;
                return (scoreB + Math.random() * 5) - (scoreA + Math.random() * 5);
            });

            const dir = validDirs[0];
            stepsSinceTurn = (dir.x !== lastDir.x || dir.y !== lastDir.y) ? 0 : stepsSinceTurn + 1;

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
        visited.add(`${gx},${gy}`);
    }

    public getPathPoints(): PIXI.Point[] {
        return this.pathCells.map(c => new PIXI.Point(
            c.x * TILE_SIZE + TILE_SIZE / 2, 
            c.y * TILE_SIZE + TILE_SIZE / 2
        ));
    }
}
