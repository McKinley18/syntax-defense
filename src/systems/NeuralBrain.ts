import { StateManager } from '../core/StateManager';
import { GridCoord } from './PathManager';

export enum SimulationTheme {
    STANDARD,
    OVERCLOCKED,
    SHIELDED,
    VOLATILE,
    STEALTH
}

export interface SessionProfile {
    seed: string;
    theme: SimulationTheme;
    entropy: number;       
}

/**
 * NEURAL BRAIN: Simulation Orchestrator
 * Manages grid availability and session-wide strategic variety.
 */
export class NeuralBrain {
    private static instance: NeuralBrain;
    public currentProfile: SessionProfile | null = null;
    
    private availableNodes: Set<string> = new Set();

    private constructor() {}

    public static getInstance(): NeuralBrain {
        if (!NeuralBrain.instance) NeuralBrain.instance = new NeuralBrain();
        return NeuralBrain.instance;
    }

    public initializeSession(): SessionProfile {
        const seed = Math.random().toString(36).substring(7).toUpperCase();
        const themes = [SimulationTheme.STANDARD, SimulationTheme.OVERCLOCKED, SimulationTheme.SHIELDED, SimulationTheme.VOLATILE];
        const theme = themes[Math.floor(Math.random() * themes.length)];

        const profile: SessionProfile = {
            seed,
            theme,
            entropy: 0.2 + Math.random() * 0.8
        };

        if (theme === SimulationTheme.OVERCLOCKED) profile.entropy = 0.2;
        else if (theme === SimulationTheme.SHIELDED) profile.entropy = 0.9;

        this.currentProfile = profile;
        return profile;
    }

    /**
     * BRAIN_GRID_MAPPING: Strict 14-Row Lockdown
     * Marks Row 0 and Row 13 as forbidden. Rows 14-17 no longer exist in simulation.
     */
    public mapGridAvailability(cols: number, rows: number, pathCells: GridCoord[]) {
        this.availableNodes.clear();
        const pathSet = new Set(pathCells.map(c => `${c.x},${c.y}`));

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                // LAW: Physical 0 and Row 13 are Buffers.
                const isForbidden = (y === 0 || y === 13);
                
                if (!pathSet.has(`${x},${y}`) && !isForbidden) {
                    this.availableNodes.add(`${x},${y}`);
                }
            }
        }
        console.log(`[Neural Brain] Grid Mapped (14 Rows). Playable Nodes: ${this.availableNodes.size}`);
    }

    public isNodeAvailable(x: number, y: number): boolean {
        return this.availableNodes.has(`${x},${y}`);
    }

    public occupyNode(x: number, y: number) {
        this.availableNodes.delete(`${x},${y}`);
    }

    public get themeName(): string {
        return this.currentProfile ? SimulationTheme[this.currentProfile.theme] : "IDLE";
    }
}
