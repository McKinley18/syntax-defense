import * as PIXI from 'pixi.js';
import { TILE_SIZE } from './MapManager';
import { GameStateManager } from './GameStateManager';
import { GameContainer } from '../GameContainer';

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
            this.pathVectors.push({ dx: dx/dist, dy: dy/dist });
        }
    }

    private attemptMacroGeneration(waveNumber: number): boolean {
        const visibleCols = Math.floor(window.innerWidth / TILE_SIZE);
        const visibleRows = Math.floor(window.innerHeight / TILE_SIZE);
        this.microCols = visibleCols;

        // TUTORIAL OVERRIDE: STRAIGHT PATH FROM LEFT TO RIGHT
        if (GameContainer.instance?.isTutorialActive && waveNumber === 1) {
            const topMargin = 2;
            const bottomMargin = 8;
            const availRows = visibleRows - (topMargin + bottomMargin);
            
            // Set offsets so buildMicroPathFromMacro uses them
            this.offsetX = 0;
            this.offsetY = topMargin;

            // Middle of the available rows
            const midMacroY = Math.floor(Math.floor(availRows / 4) / 2);
            const macroCols = Math.floor((visibleCols - 2) / 4);

            const tutorialPath = [{x: 0, y: midMacroY}, {x: macroCols, y: midMacroY}];
            this.macroPath = tutorialPath;
            this.buildMicroPathFromMacro(tutorialPath);
            return true;
        }

        const topMargin = 2; // TOP BUFFER
        const bottomMargin = 8; // HUGE BOTTOM BUFFER FOR DASHBOARD

        const availCols = visibleCols - 2; 
        const availRows = visibleRows - (topMargin + bottomMargin);

        const macroCols = Math.floor(availCols / 4);
        const macroRows = Math.floor(availRows / 4);

        if (macroCols <= 0 || macroRows <= 0) return false;

        this.offsetX = 0; 
        this.offsetY = topMargin;

        const startY = Math.floor(Math.random() * macroRows);
        const path: GridCoord[] = [];
        const visited = new Set<string>();
        
        // WEALTH REACTIVE DIFFICULTY: Shorter path = less time to kill
        const state = GameStateManager.getInstance();
        const wealthMult = state.credits > 2500 ? 0.75 : 1.0; 
        
        // DYNAMIC COMPLEXITY: Target length varies significantly each wave
        const complexityFactor = 0.25 + (Math.random() * 0.2); 
        const baseTarget = Math.floor(macroCols * macroRows * complexityFactor * wealthMult);
        const waveBonus = Math.floor(waveNumber * 0.8);
        const targetLength = Math.min(macroCols * macroRows * 0.85, baseTarget + waveBonus);

        // RANDOMIZED DIRECTION BIAS: Each map has a unique "flow" personality
        const forwardWeight = 5 + Math.random() * 10;
        const verticalWeight = 2 + Math.random() * 15;
        const backWeight = Math.random() * 3;

        const dfs = (mx: number, my: number): boolean => {
            if (mx === macroCols - 1) {
                // Variation: End point can be any Y on the last column
                if (path.length >= targetLength) {
                    path.push({ x: mx, y: my });
                    return true;
                }
            }

            visited.add(`${mx},${my}`);
            path.push({ x: mx, y: my });

            const dirs = [
                { dx: 1, dy: 0, weight: forwardWeight },   
                { dx: 0, dy: 1, weight: verticalWeight },  
                { dx: 0, dy: -1, weight: verticalWeight }, 
                { dx: -1, dy: 0, weight: backWeight }   
            ];

            // Add slight per-step jitter to weights
            dirs.sort((a, b) => (Math.random() * b.weight * (0.8 + Math.random() * 0.4)) - (Math.random() * a.weight * (0.8 + Math.random() * 0.4)));

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
                for (let x = 0; x <= microCenterX; x++) {
                    this.pathCells.push({ x, y: microCenterY });
                }
                this.startNodePos = new PIXI.Point(0, microCenterY * TILE_SIZE + TILE_SIZE);
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
                    this.pathCells.push({ x: x, y: microCenterY });
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
