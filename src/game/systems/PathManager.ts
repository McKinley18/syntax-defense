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

    public pathPoints: PIXI.Point[] = [];
    public pathVectors: { dx: number, dy: number }[] = [];
    public microCols: number = 0;
    public tutorialBuildableTile: GridCoord | null = null;

    constructor() {}

    public generatePath(waveNumber: number) {
        let success = false;
        let attempts = 0;
        while (!success && attempts < 100) {
            success = this.attemptMacroGeneration(waveNumber);
            attempts++;
        }
    }

    private attemptMacroGeneration(waveNumber: number): boolean {
        const currentTileSize = TILE_SIZE;
        const visibleRows = Math.floor((window.innerHeight - 140) / currentTileSize);
        // FORCE CEIL: Ensure we hit the absolute right border
        const visibleCols = Math.ceil(window.innerWidth / currentTileSize);
        
        this.microCols = visibleCols;

        // Macro logic: 2x2 blocks
        const macroCols = Math.ceil(visibleCols / 2);
        const macroRows = Math.floor(visibleRows / 2);
        const startMacroY = Math.floor(macroRows / 2);
        
        this.pathCells = [];
        this.pathPoints = [];
        const macroPath: GridCoord[] = [];
        const visited = new Set<string>();
        // WAVE 1: TUTORIAL - ABSOLUTE STRAIGHT HORIZONTAL 2-WIDE BLOCK
        if (waveNumber === 1) {
            this.pathCells = [];
            this.pathPoints = [];
            const midY = Math.floor(macroRows / 2) * 2;
            
            for (let x = 0; x < visibleCols; x++) {
                this.pathCells.push({ x, y: midY });
                this.pathCells.push({ x, y: midY + 1 });
            }
            
            this.pathPoints = [
                new PIXI.Point(0, (midY + 1) * TILE_SIZE),
                new PIXI.Point(window.innerWidth, (midY + 1) * TILE_SIZE)
            ];
            
            this.finalizePath();
            this.tutorialBuildableTile = { x: 13, y: 5 };
            return true;
        } else {
            // REAL GAME: DFS with strict directional turns
            const dfs = (mx: number, my: number): boolean => {
                if (mx === macroCols - 1) {
                    macroPath.push({ x: mx, y: my });
                    return true;
                }

                visited.add(`${mx},${my}`);
                macroPath.push({ x: mx, y: my });

                const dirs = [
                    { dx: 1, dy: 0, w: 25 }, 
                    { dx: 0, dy: 1, w: 10 }, 
                    { dx: 0, dy: -1, w: 10 }
                ];
                dirs.sort((a, b) => (Math.random() * b.w) - (Math.random() * a.w));

                for (const d of dirs) {
                    const nx = mx + d.dx;
                    const ny = my + d.dy;
                    if (nx === 0) continue; 
                    if (nx === macroCols - 1 && mx !== macroCols - 2) continue;

                    if (nx > 0 && nx < macroCols && ny >= 0 && ny < macroRows) {
                        if (!visited.has(`${nx},${ny}`)) {
                            // SPATIAL BUFFER GUARD: Check neighbors of nx, ny
                            // A new path block should only have ONE visited neighbor (the current mx, my)
                            let neighborCount = 0;
                            if (visited.has(`${nx+1},${ny}`)) neighborCount++;
                            if (visited.has(`${nx-1},${ny}`)) neighborCount++;
                            if (visited.has(`${nx},${ny+1}`)) neighborCount++;
                            if (visited.has(`${nx},${ny-1}`)) neighborCount++;

                            if (neighborCount === 1) { 
                                if (dfs(nx, ny)) return true;
                            }
                        }
                    }
                }

                macroPath.pop();
                return false;
            };

            if (!dfs(0, startMacroY)) return false;
        }

        // BUILD MICRO PATH FROM MACRO Sequence
        macroPath.forEach((p) => {
            const baseX = p.x * 2;
            const baseY = p.y * 2;
            
            // Add the 2x2 core
            this.pathCells.push({ x: baseX, y: baseY });
            this.pathCells.push({ x: baseX + 1, y: baseY });
            this.pathCells.push({ x: baseX, y: baseY + 1 });
            this.pathCells.push({ x: baseX + 1, y: baseY + 1 });
            
            this.pathPoints.push(new PIXI.Point((baseX + 1) * TILE_SIZE, (baseY + 1) * TILE_SIZE));
        });

        this.finalizePath();
        return true;
    }

    private finalizePath() {
        this.pathVectors = [];
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const p1 = this.pathPoints[i];
            const p2 = this.pathPoints[i+1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            this.pathVectors.push({ dx: dx/dist, dy: dy/dist });
        }
        this.startNodePos.copyFrom(this.pathPoints[0]);
        this.startNodePos.x = 0; 
        
        this.endNodePos.copyFrom(this.pathPoints[this.pathPoints.length - 1]);
        this.endNodePos.x = window.innerWidth - TILE_SIZE; // Shift left by 1 tile for full visibility
    }

    public getLanePoints(lane: 'A' | 'B'): PIXI.Point[] {
        // Parallel invisible lanes for organized side-by-side travel.
        const offset = lane === 'A' ? -5 : 5;
        return this.pathPoints.map(p => new PIXI.Point(p.x, p.y + offset));
    }
}
