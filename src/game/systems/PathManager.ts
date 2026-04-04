import * as PIXI from 'pixi.js';
import { TILE_SIZE } from './MapManager';

export interface GridCoord {
    x: number;
    y: number;
}

export class PathManager {
    public pathCells: GridCoord[] = [];
    public startNodePos: PIXI.Point = new PIXI.Point(0, 0);
    public endNodePos: PIXI.Point = new PIXI.Point(0, 0);

    // Metadata for the MapManager to use for precise stamping
    public macroPath: GridCoord[] = [];
    public offsetX: number = 0;
    public offsetY: number = 0;
    public microCols: number = 0;

    constructor() {
        this.generatePath(1);
    }

    public generatePath(waveNumber: number) {
        let success = false;
        let attempts = 0;

        while (!success && attempts < 100) {
            success = this.attemptMacroGeneration(waveNumber);
            attempts++;
        }
    }

    private attemptMacroGeneration(waveNumber: number): boolean {
        const visibleCols = Math.floor(window.innerWidth / TILE_SIZE);
        const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
        
        this.microCols = visibleCols;

        const topMargin = 6;
        const bottomMargin = 8;
        const sideMargin = 1; // 1 micro-tile buffer on left and right

        const availCols = visibleCols - (sideMargin * 2);
        const availRows = visibleRows - (topMargin + bottomMargin);

        // A Macro Cell is 4x4 micro tiles
        const macroCols = Math.floor(availCols / 4);
        const macroRows = Math.floor(availRows / 4);

        if (macroCols <= 0 || macroRows <= 0) return false;

        this.offsetX = sideMargin + Math.floor((availCols - (macroCols * 4)) / 2);
        this.offsetY = topMargin + Math.floor((availRows - (macroRows * 4)) / 2);

        const startY = Math.floor(Math.random() * macroRows);
        
        let path: GridCoord[] = [];
        let visited = new Set<string>();
        let targetLength = macroCols + Math.min(waveNumber, 10); // Require longer paths as wave increases

        // DFS Backtracking Walk
        const dfs = (mx: number, my: number): boolean => {
            if (mx === macroCols - 1) {
                // Reached the right edge
                if (path.length >= targetLength || path.length > (macroCols * macroRows * 0.5)) {
                    path.push({ x: mx, y: my });
                    return true;
                }
            }

            visited.add(`${mx},${my}`);
            path.push({ x: mx, y: my });

            // Define directional weights to encourage winding but guarantee progression
            const dirs = [
                { dx: 1, dy: 0, weight: 5 },   // Right
                { dx: 0, dy: 1, weight: 6 },   // Down
                { dx: 0, dy: -1, weight: 6 },  // Up
                { dx: -1, dy: 0, weight: 1 }   // Left (Switch-back)
            ];

            // Randomize based on weight
            dirs.sort((a, b) => (Math.random() * b.weight) - (Math.random() * a.weight));

            for (const d of dirs) {
                const nx = mx + d.dx;
                const ny = my + d.dy;
                
                if (nx >= 0 && nx < macroCols && ny >= 0 && ny < macroRows) {
                    if (!visited.has(`${nx},${ny}`)) {
                        if (dfs(nx, ny)) return true;
                    }
                }
            }

            // Backtrack
            path.pop();
            visited.delete(`${mx},${my}`);
            return false;
        };

        const success = dfs(0, startY);

        if (success) {
            this.macroPath = path;
            this.buildMicroPathFromMacro(path);
        }

        return success;
    }

    private buildMicroPathFromMacro(macroPath: GridCoord[]) {
        this.pathCells = [];
        
        // Convert Macro Path into exact Micro Coordinates for enemies to follow
        for (let i = 0; i < macroPath.length; i++) {
            const mc = macroPath[i];
            
            // The center of a 4x4 macro cell is the 2x2 block at offset (1,1)
            const microCenterX = this.offsetX + (mc.x * 4) + 1;
            const microCenterY = this.offsetY + (mc.y * 4) + 1;

            if (i === 0) {
                // Entry segment: from the absolute left screen edge to the center of the first macro cell
                for (let x = 0; x <= microCenterX; x++) {
                    this.pathCells.push({ x: x, y: microCenterY });
                }
                // Enemy Start Pos (Top-Left of the 2x2 corridor center)
                this.startNodePos = new PIXI.Point(0, microCenterY * TILE_SIZE + TILE_SIZE);
            }

            if (i > 0) {
                const prev = macroPath[i - 1];
                const prevCenterX = this.offsetX + (prev.x * 4) + 1;
                const prevCenterY = this.offsetY + (prev.y * 4) + 1;

                // Create intermediate steps for enemies to walk smoothly through the connecting corridor
                if (mc.x > prev.x) { // Right
                    for (let x = prevCenterX + 1; x <= microCenterX; x++) this.pathCells.push({ x, y: microCenterY });
                } else if (mc.x < prev.x) { // Left
                    for (let x = prevCenterX - 1; x >= microCenterX; x--) this.pathCells.push({ x, y: microCenterY });
                } else if (mc.y > prev.y) { // Down
                    for (let y = prevCenterY + 1; y <= microCenterY; y++) this.pathCells.push({ x: microCenterX, y });
                } else if (mc.y < prev.y) { // Up
                    for (let y = prevCenterY - 1; y >= microCenterY; y--) this.pathCells.push({ x: microCenterX, y });
                }
            }

            if (i === macroPath.length - 1) {
                // Exit segment: from the center of the last macro cell to the absolute right screen edge
                for (let x = microCenterX + 1; x < this.microCols; x++) {
                    this.pathCells.push({ x: x, y: microCenterY });
                }
                // Enemy End Pos
                this.endNodePos = new PIXI.Point(this.microCols * TILE_SIZE, microCenterY * TILE_SIZE + TILE_SIZE);
            }
        }
    }

    public getPathPoints(): PIXI.Point[] {
        // Convert the 1-tile wide navigation spine into exact PIXI World Coordinates for the Enemy
        // We offset by TILE_SIZE (which is half of the 2-tile wide path) to keep them centered
        return this.pathCells.map(c => new PIXI.Point(
            c.x * TILE_SIZE + TILE_SIZE, 
            c.y * TILE_SIZE + TILE_SIZE
        ));
    }
}
