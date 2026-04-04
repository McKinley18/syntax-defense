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

        // SIDEBAR AWARENESS: Offset path start by the sidebar width (~180px / 24px = ~8 tiles)
        const sidebarBuffer = Math.ceil(180 / TILE_SIZE); 
        const topMargin = 1; // UNLOCKED VERTICAL SPACE
        const bottomMargin = 1;

        const availCols = visibleCols - sidebarBuffer - 2; // Subtract sidebar and right buffer
        const availRows = visibleRows - (topMargin + bottomMargin);

        const macroCols = Math.floor(availCols / 4);
        const macroRows = Math.floor(availRows / 4);

        if (macroCols <= 0 || macroRows <= 0) return false;

        this.offsetX = sidebarBuffer + 1;
        this.offsetY = topMargin;

        const startY = Math.floor(Math.random() * macroRows);
        let path: GridCoord[] = [];
        let visited = new Set<string>();
        
        // INCREASED WINDING: Demand at least 70% coverage of the macro-grid
        let targetLength = Math.floor(macroCols * macroRows * 0.4) + Math.min(waveNumber, 5);

        const dfs = (mx: number, my: number): boolean => {
            if (mx === macroCols - 1) {
                if (path.length >= targetLength) {
                    path.push({ x: mx, y: my });
                    return true;
                }
            }

            visited.add(`${mx},${my}`);
            path.push({ x: mx, y: my });

            const dirs = [
                { dx: 1, dy: 0, weight: 4 },   // Right
                { dx: 0, dy: 1, weight: 10 },  // Down (Higher weight for winding)
                { dx: 0, dy: -1, weight: 10 }, // Up (Higher weight for winding)
                { dx: -1, dy: 0, weight: 2 }   // Left (Switch-back)
            ];

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
        for (let i = 0; i < macroPath.length; i++) {
            const mc = macroPath[i];
            const microCenterX = this.offsetX + (mc.x * 4) + 1;
            const microCenterY = this.offsetY + (mc.y * 4) + 1;

            if (i === 0) {
                // Connect to left sidebar edge
                for (let x = this.offsetX - 1; x <= microCenterX; x++) {
                    this.pathCells.push({ x, y: microCenterY });
                }
                this.startNodePos = new PIXI.Point(this.offsetX * TILE_SIZE, microCenterY * TILE_SIZE + TILE_SIZE);
            }

            if (i > 0) {
                const prev = macroPath[i - 1];
                const prevCenterX = this.offsetX + (prev.x * 4) + 1;
                const prevCenterY = this.offsetY + (prev.y * 4) + 1;

                if (mc.x > prev.x) { for (let x = prevCenterX + 1; x <= microCenterX; x++) this.pathCells.push({ x, y: microCenterY }); }
                else if (mc.x < prev.x) { for (let x = prevCenterX - 1; x >= microCenterX; x--) this.pathCells.push({ x, y: microCenterY }); }
                else if (mc.y > prev.y) { for (let y = prevCenterY + 1; y <= microCenterY; y++) this.pathCells.push({ x: microCenterX, y }); }
                else if (mc.y < prev.y) { for (let y = prevCenterY - 1; y >= microCenterY; y--) this.pathCells.push({ x: microCenterX, y }); }
            }

            if (i === macroPath.length - 1) {
                for (let x = microCenterX + 1; x < this.microCols; x++) {
                    this.pathCells.push({ x, y: microCenterY });
                }
                this.endNodePos = new PIXI.Point(this.microCols * TILE_SIZE, microCenterY * TILE_SIZE + TILE_SIZE);
            }
        }
    }

    public getPathPoints(): PIXI.Point[] {
        return this.pathCells.map(c => new PIXI.Point(
            c.x * TILE_SIZE + TILE_SIZE, 
            c.y * TILE_SIZE + TILE_SIZE
        ));
    }
}
