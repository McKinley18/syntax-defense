import * as PIXI from 'pixi.js';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './MapManager';

export interface PathNode {
    id: string;
    pos: PIXI.Point;
    next: string[];
}

export class PathManager {
    public nodes: Map<string, PathNode> = new Map();
    public startNodes: string[] = [];
    public endNodes: string[] = [];
    
    private occupiedGrid: Set<string> = new Set();

    constructor() {
        this.generatePath(1);
    }

    public generatePath(waveNumber: number) {
        let success = false;
        let attempts = 0;

        while (!success && attempts < 30) {
            try {
                this.nodes.clear();
                this.startNodes = [];
                this.endNodes = [];
                this.occupiedGrid.clear();

                this.attemptGeneration(waveNumber);
                if (this.validatePath()) {
                    // Ensure the path is actually long enough to be challenging
                    const edges = this.getEdges();
                    if (edges.length >= 10) {
                        success = true;
                    }
                }
            } catch (e) {
                attempts++;
            }
        }
    }

    private attemptGeneration(wave: number) {
        const topMargin = 6;
        const bottomMargin = 8;
        const midY = Math.floor((MAP_ROWS - topMargin - bottomMargin) / 2) + topMargin;
        
        let gx = 0;
        let gy = midY;
        
        let lastId = this.addNodeAtGrid(gx, gy);
        this.startNodes.push(lastId);

        gx = 3;
        lastId = this.addNodeAtGrid(gx, gy);
        this.link(this.startNodes[0], lastId);

        // Escalating segments for progression
        const totalSegments = 12 + Math.min(wave, 18);
        let lastDir = { x: 1, y: 0 };

        for (let i = 0; i < totalSegments; i++) {
            const possibleDirs = [
                { x: 1, y: 0 }, { x: 1, y: 0 }, // Right Bias
                { x: 0, y: 1 }, { x: 0, y: -1 }
            ].filter(d => d.x !== -lastDir.x || d.y !== -lastDir.y);

            const dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            const step = 3 + Math.floor(Math.random() * 4);

            const nx = Math.max(2, Math.min(MAP_COLS - 4, gx + dir.x * step));
            const ny = Math.max(topMargin, Math.min(MAP_ROWS - bottomMargin, gy + dir.y * step));

            // Proximity check to prevent clumping
            if (this.isAreaClear(nx, ny, 2)) {
                const nextId = this.addNodeAtGrid(nx, ny);
                this.link(lastId, nextId);
                lastId = nextId;
                gx = nx;
                gy = ny;
                lastDir = dir;
            }
        }

        // DYNAMIC RIGHT EDGE based on current screen width
        const currentCols = Math.floor(window.innerWidth / TILE_SIZE);
        const goalId = this.addNodeAtGrid(currentCols - 1, gy);
        this.link(lastId, goalId);
        this.endNodes.push(goalId);
    }

    private isAreaClear(gx: number, gy: number, radius: number): boolean {
        for (let x = gx - radius; x <= gx + radius; x++) {
            for (let y = gy - radius; y <= gy + radius; y++) {
                if (this.occupiedGrid.has(`${x},${y}`)) return false;
            }
        }
        return true;
    }

    private addNodeAtGrid(gx: number, gy: number): string {
        const id = Math.random().toString(36).substr(2, 9);
        const pos = new PIXI.Point(gx * TILE_SIZE + TILE_SIZE / 2, gy * TILE_SIZE + TILE_SIZE / 2);
        this.nodes.set(id, { id, pos, next: [] });
        
        // Mark blocks as occupied to prevent clumping
        for(let ox=-1; ox<=1; ox++) {
            for(let oy=-1; oy<=1; oy++) {
                this.occupiedGrid.add(`${gx+ox},${gy+oy}`);
            }
        }
        return id;
    }

    private link(fromId: string, toId: string) {
        const node = this.nodes.get(fromId);
        if (node) node.next.push(toId);
    }

    private validatePath(): boolean {
        if (this.startNodes.length === 0 || this.endNodes.length === 0) return false;
        const reachable = new Set<string>();
        const queue = [...this.startNodes];
        while (queue.length > 0) {
            const currId = queue.shift()!;
            if (reachable.has(currId)) continue;
            reachable.add(currId);
            const node = this.nodes.get(currId);
            if (node) queue.push(...node.next);
        }
        return this.endNodes.some(id => reachable.has(id));
    }

    public getEdges(): { start: PIXI.Point, end: PIXI.Point }[] {
        const edges: { start: PIXI.Point, end: PIXI.Point }[] = [];
        this.nodes.forEach(node => {
            node.next.forEach(nextId => {
                const nextNode = this.nodes.get(nextId);
                if (nextNode) edges.push({ start: node.pos, end: nextNode.pos });
            });
        });
        return edges;
    }
}
