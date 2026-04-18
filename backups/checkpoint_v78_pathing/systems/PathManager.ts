import * as PIXI from 'pixi.js';
import { NeuralBrain } from './NeuralBrain';

export interface GridCoord {
    x: number;
    y: number;
}

/**
 * PATH MANAGER v78.0: Car-Axle Kinematics
 * THE DEFINITIVE FIX: Maps continuous "Left Tire" and "Right Tire" tracks.
 * Solves the crossing problem by correctly swapping Left/Right assignments based on travel vector.
 * Uses Wait-Points to perfectly sync wide-swings and tight-pivots.
 */
export class PathManager {
    public pathCells: GridCoord[] = [];
    public startNodePos: PIXI.Point = new PIXI.Point(0, 0);
    public endNodePos: PIXI.Point = new PIXI.Point(0, 0);
    
    public lane0: GridCoord[] = []; // "Left Tire"
    public lane1: GridCoord[] = []; // "Right Tire"
    
    private readonly TILE_SIZE = 40;

    constructor() {}

    public generatePath(waveNumber: number) {
        this.pathCells = [];
        this.lane0 = [];
        this.lane1 = [];
        
        // 1. MACRO PATH GENERATION
        let curMX = 0;
        let curMR = (waveNumber === 0) ? 3 : 1 + Math.floor(Math.random() * 5); 
        const macroPath: {mx: number, mr: number}[] = [{mx: curMX, mr: curMR}];

        if (waveNumber === 0) {
            for (let x = 1; x < 20; x++) macroPath.push({ mx: x, mr: 3 });
        } else {
            while (curMX < 19) {
                const run = 2 + Math.floor(Math.random() * 4);
                for (let i = 0; i < run && curMX < 19; i++) {
                    curMX++;
                    macroPath.push({ mx: curMX, mr: curMR });
                }
                if (curMX < 19) {
                    let nextMR = curMR;
                    while (Math.abs(nextMR - curMR) < 2) nextMR = 1 + Math.floor(Math.random() * 5);
                    const step = nextMR > curMR ? 1 : -1;
                    while (curMR !== nextMR) {
                        curMR += step;
                        macroPath.push({ mx: curMX, mr: curMR });
                    }
                }
            }
        }

        // 2. VISUAL TILE REGISTRATION
        macroPath.forEach(m => {
            const bx = m.mx * 2; const by = m.mr * 2 + 1;
            for(let ix=0; ix<2; ix++) {
                for(let iy=0; iy<2; iy++) {
                    const cx = bx + ix; const cy = by + iy;
                    if (!this.pathCells.some(c => c.x === cx && c.y === cy)) {
                        this.pathCells.push({ x: cx, y: cy });
                    }
                }
            }
        });

        // 3. KINEMATIC TRACK TRACING
        const addPair = (x0: number, y0: number, x1: number, y1: number) => {
            this.lane0.push({ x: x0, y: y0 });
            this.lane1.push({ x: x1, y: y1 });
        };

        // Determine initial direction (defaults to RIGHT)
        let dirIN = 'R'; 

        for (let i = 0; i < macroPath.length; i++) {
            const m = macroPath[i];
            const next = macroPath[i+1];
            const bx = m.mx * 2;
            const by = m.mr * 2 + 1;

            let dirOUT = 'R'; // Default for final block
            if (next) {
                const dx = next.mx - m.mx;
                const dy = next.mr - m.mr;
                if (dx > 0) dirOUT = 'R';
                else if (dy > 0) dirOUT = 'D';
                else if (dy < 0) dirOUT = 'U';
            }

            // --- STRAIGHT SEGMENTS ---
            if (dirIN === 'R' && dirOUT === 'R') {
                // L0=Top, L1=Bottom
                addPair(bx, by, bx, by+1);
                addPair(bx+1, by, bx+1, by+1);
            } else if (dirIN === 'D' && dirOUT === 'D') {
                // L0=Right, L1=Left
                addPair(bx+1, by, bx, by);
                addPair(bx+1, by+1, bx, by+1);
            } else if (dirIN === 'U' && dirOUT === 'U') {
                // L0=Left, L1=Right
                addPair(bx, by+1, bx+1, by+1);
                addPair(bx, by, bx+1, by);
            }
            // --- CORNER SEGMENTS ---
            else if (dirIN === 'R' && dirOUT === 'D') {
                // Right -> Down. L0 swings wide (Top to Right). L1 pivots tight (Bottom to Left).
                addPair(bx, by, bx, by+1); // Entry
                addPair(bx+1, by, bx, by+1); // L0 moves Right, L1 waits
                addPair(bx+1, by+1, bx, by+1); // L0 moves Down, L1 waits
            } else if (dirIN === 'R' && dirOUT === 'U') {
                // Right -> Up. L0 pivots tight (Top to Left). L1 swings wide (Bottom to Right).
                addPair(bx, by, bx, by+1); // Entry
                addPair(bx, by, bx+1, by+1); // L0 waits, L1 moves Right
                addPair(bx, by, bx+1, by); // L0 waits, L1 moves Up
            } else if (dirIN === 'D' && dirOUT === 'R') {
                // Down -> Right. L0 pivots tight (Right to Top). L1 swings wide (Left to Bottom).
                addPair(bx+1, by, bx, by); // Entry
                addPair(bx+1, by, bx, by+1); // L0 waits, L1 moves Down
                addPair(bx+1, by, bx+1, by+1); // L0 waits, L1 moves Right
            } else if (dirIN === 'U' && dirOUT === 'R') {
                // Up -> Right. L0 swings wide (Left to Top). L1 pivots tight (Right to Bottom).
                addPair(bx, by+1, bx+1, by+1); // Entry
                addPair(bx, by, bx+1, by+1); // L0 moves Up, L1 waits
                addPair(bx+1, by, bx+1, by+1); // L0 moves Right, L1 waits
            }

            dirIN = dirOUT;
        }

        // 4. ANCHOR SYNCHRONIZATION
        this.startNodePos.set(0, (this.lane0[0].y + 1) * this.TILE_SIZE);
        const last0 = this.lane0[this.lane0.length - 1];
        const last1 = this.lane1[this.lane1.length - 1];
        this.endNodePos.set(1600, (last0.y + last1.y + 1) * 0.5 * this.TILE_SIZE);

        NeuralBrain.getInstance().mapGridAvailability(40, 14, this.pathCells);
    }
}
