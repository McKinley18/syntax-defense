import * as PIXI from 'pixi.js';
import { NeuralBrain } from './NeuralBrain';

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
    
    private readonly TILE_SIZE = 40;
    private readonly GRID_COLS = 40; 
    private readonly GRID_ROWS = 18; 

    constructor() {}

    public generatePath(waveNumber: number) {
        this.pathCells = [];
        this.pathPoints = [];
        this.executeSmartGeneration(waveNumber);
    }

    private executeSmartGeneration(waveNumber: number) {
        const brain = NeuralBrain.getInstance();
        const profile = brain.currentProfile;
        
        // ENTROPY LAW: Higher brain entropy = more turns/chaos
        const entropy = profile ? profile.entropy : 0.5;

        const macroCols = 20; 
        const minMY = 1;
        const maxMY = 5; 
        
        const macroPath: GridCoord[] = [];

        if (waveNumber === 0) {
            for (let x = 0; x < macroCols; x++) macroPath.push({ x, y: 3 });
        } else {
            let currentX = 0;
            let currentY = minMY + Math.floor(Math.random() * (maxMY - minMY + 1));
            macroPath.push({ x: currentX, y: currentY });

            while (currentX < macroCols - 1) {
                // BRAIN-DRIVEN RUN LENGTH
                // Lower entropy = longer straight runs
                const minRun = Math.max(1, Math.floor(4 * (1 - entropy)));
                const maxRun = Math.max(2, Math.floor(7 * (1 - entropy)));
                let stepX = minRun + Math.floor(Math.random() * (maxRun - minRun + 1));
                
                let nextX = Math.min(macroCols - 1, currentX + stepX);
                for (let x = currentX + 1; x <= nextX; x++) macroPath.push({ x, y: currentY });
                currentX = nextX;

                if (currentX < macroCols - 1) {
                    let nextY = currentY;
                    while (nextY === currentY) {
                        nextY = minMY + Math.floor(Math.random() * (maxMY - minMY + 1));
                    }
                    const stepY = nextY > currentY ? 1 : -1;
                    let tempY = currentY;
                    while (tempY !== nextY) {
                        tempY += stepY;
                        macroPath.push({ x: currentX, y: tempY });
                    }
                    currentY = nextY;
                }
            }
        }

        macroPath.forEach((p) => {
            const bx = p.x * 2;
            const by = p.y * 2;
            this.pathCells.push(
                { x: bx, y: by },
                { x: bx + 1, y: by },
                { x: bx, y: by + 1 },
                { x: bx + 1, y: by + 1 }
            );
            this.pathPoints.push(new PIXI.Point((bx + 1) * this.TILE_SIZE, (by + 1) * this.TILE_SIZE));
        });

        const lastP = macroPath[macroPath.length - 1];
        this.pathCells.push({ x: 39, y: lastP.y * 2 }, { x: 39, y: lastP.y * 2 + 1 });
        this.pathPoints.push(new PIXI.Point(40 * this.TILE_SIZE, (lastP.y * 2 + 1) * this.TILE_SIZE));

        this.pathPoints = this.pathPoints.filter((p, i, s) => i === 0 || (p.x !== s[i-1].x || p.y !== s[i-1].y));
        this.finalizePath();
    }

    private finalizePath() {
        this.pathVectors = [];
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const p1 = this.pathPoints[i];
            const p2 = this.pathPoints[i+1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) this.pathVectors.push({ dx: dx/dist, dy: dy/dist });
        }
        this.startNodePos.copyFrom(this.pathPoints[0]);
        this.endNodePos.copyFrom(this.pathPoints[this.pathPoints.length - 1]);
    }

    public getLanePoints(laneID: 0 | 1): PIXI.Point[] {
        const offset = (laneID === 0) ? -15 : 15; 
        return this.pathPoints.map(p => new PIXI.Point(p.x, p.y + offset));
    }
}
