import * as PIXI from 'pixi.js';
import { TILE_SIZE } from './MapManager';
import { GameStateManager } from './GameStateManager';

export interface GridCoord {
    x: number;
    y: number;
}

export class PathManager {
    public pathCells: GridCoord[] = [];
    public startNodePos: PIXI.Point = new PIXI.Point(0, 0);
    public endNodePos: PIXI.Point = new PIXI.Point(0, 0);

    public macroPath: GridCoord[] = [];
    public pathVectors: { dx: number, dy: number }[] = [];
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
        
        // CACHE VECTORS FOR ENEMIES
        const pts = this.getPathPoints();
        this.pathVectors = [];
        for (let i = 0; i < pts.length - 1; i++) {
            const dx = pts[i+1].x - pts[i].x;
            const dy = pts[i+1].y - pts[i].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                this.pathVectors.push({ dx: dx/dist, dy: dy/dist });
            } else {
                this.pathVectors.push({ dx: 1, dy: 0 });
            }
        }
    }

    private attemptMacroGeneration(waveNumber: number): boolean {
        const visibleCols = Math.floor(window.innerWidth / TILE_SIZE);
        const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
        this.microCols = visibleCols;

        // MANDATE: USE ENTIRE SPACE EXCEPT TOP AND BOTTOM ROW
        // Top row is 0, Bottom row is visibleRows - 1
        const playableTop = 1;
        const playableBottom = visibleRows - 2;
        const playableRows = playableBottom - playableTop + 1;

        if (playableRows < 4) return false; // Safety check

        // TUTORIAL OVERRIDE: STRAIGHT PATH FROM LEFT TO RIGHT
        if (waveNumber === 0) {
            this.offsetX = 0;
            this.offsetY = playableTop;

            const midY = Math.floor(playableRows / 2);
            // Tutorial path is just a line across the middle
            this.pathCells = [];
            for (let x = 0; x < visibleCols; x++) {
                this.pathCells.push({ x, y: playableTop + midY });
            }
            this.startNodePos = new PIXI.Point(0, (playableTop + midY) * TILE_SIZE + TILE_SIZE / 2);
            this.endNodePos = new PIXI.Point(visibleCols * TILE_SIZE, (playableTop + midY) * TILE_SIZE + TILE_SIZE / 2);
            return true;
        }

        // REAL GAME GENERATION (Random Walk / DFS)
        // We use a macro grid where each macro cell is 2x2 micro tiles to match the enemy stamp
        const macroCols = Math.floor((visibleCols) / 2);
        const macroRows = Math.floor(playableRows / 2);

        if (macroCols < 4 || macroRows < 2) return false;

        const startY = Math.floor(Math.random() * macroRows);
        const path: GridCoord[] = [];
        const visited = new Set<string>();
        
        const state = GameStateManager.getInstance();
        const wealthMult = state.credits > 2500 ? 0.75 : 1.0; 
        
        const complexityFactor = 0.3 + (Math.random() * 0.2); 
        const targetLength = Math.floor(macroCols * macroRows * complexityFactor * wealthMult);

        const forwardWeight = 10 + Math.random() * 10;
        const verticalWeight = 5 + Math.random() * 15;
        const backWeight = 1;

        const dfs = (mx: number, my: number): boolean => {
            if (mx === macroCols - 1) {
                if (path.length >= Math.min(macroCols, targetLength / 2)) {
                    path.push({ x: mx, y: my });
                    return true;
                }
                return false;
            }

            visited.add(`${mx},${my}`);
            path.push({ x: mx, y: my });

            const dirs = [
                { dx: 1, dy: 0, weight: forwardWeight },   
                { dx: 0, dy: 1, weight: verticalWeight },  
                { dx: 0, dy: -1, weight: verticalWeight }, 
                { dx: -1, dy: 0, weight: backWeight }   
            ];

            dirs.sort((a, b) => (Math.random() * b.weight) - (Math.random() * a.weight));

            for (const d of dirs) {
                const nx = mx + d.dx;
                const ny = my + d.dy;
                
                if (nx >= 0 && nx < macroCols && ny >= 0 && ny < macroRows) {
                    // MANDATE: Only entrance and exit touch left/right
                    if (nx === 0 && mx !== 0) continue; 
                    // nx === macroCols - 1 is handled by the goal condition
                    
                    if (!visited.has(`${nx},${ny}`)) {
                        if (dfs(nx, ny)) return true;
                    }
                }
            }

            path.pop();
            visited.delete(`${mx},${my}`);
            return false;
        };

        if (dfs(0, startY)) {
            this.macroPath = path;
            this.buildMicroPathFromMacro(path, playableTop);
            return true;
        }
        return false;
    }

    private buildMicroPathFromMacro(macroPath: GridCoord[], playableTop: number) {
        this.pathCells = [];
        // Each macro coord (mx, my) maps to micro tiles (mx*2, playableTop + my*2)
        for (let i = 0; i < macroPath.length; i++) {
            const curr = macroPath[i];
            const microX = curr.x * 2;
            const microY = playableTop + curr.y * 2;

            // Add the 2x2 block for this macro cell
            this.pathCells.push({ x: microX, y: microY });
            this.pathCells.push({ x: microX + 1, y: microY });
            this.pathCells.push({ x: microX, y: microY + 1 });
            this.pathCells.push({ x: microX + 1, y: microY + 1 });

            if (i === 0) {
                this.startNodePos = new PIXI.Point(0, (microY + 1) * TILE_SIZE);
            }
            if (i === macroPath.length - 1) {
                this.endNodePos = new PIXI.Point(this.microCols * TILE_SIZE, (microY + 1) * TILE_SIZE);
            }

            // Bridge gap to next cell if needed (DFS ensures adjacency, but we might need filler)
            if (i < macroPath.length - 1) {
                const next = macroPath[i+1];
                // Since it's a DFS on a grid, they are already adjacent. 
                // The 2x2 blocks will touch.
            }
        }
    }

    public getPathPoints(): PIXI.Point[] {
        // Sort path cells to ensure enemies follow the sequence
        // Actually, pathCells should already be in order from buildMicroPathFromMacro
        return this.pathCells.map(c => new PIXI.Point(
            c.x * TILE_SIZE + TILE_SIZE / 2, 
            c.y * TILE_SIZE + TILE_SIZE / 2
        ));
    }
}
