import { StateManager, AppState } from '../core/StateManager';
import { PathManager } from './PathManager';
import { MapManager } from './MapManager';
import { TowerManager } from './TowerManager';
import { Enemy } from '../entities/Enemy';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { Kernel } from '../entities/Kernel';
import * as PIXI from 'pixi.js';

interface TacticalRow {
    units: Enemy[];
    distance: number;
}

/**
 * WAVE MANAGER v84.0: Formation Engine
 * THE REBUILD: Manages "Tactical Rows" that move along the parametric spine.
 * Guaranteed: Zero merging, side-by-side sync, absolute lane restriction.
 */
export class WaveManager {
    private pathManager: PathManager;
    private mapManager: MapManager;
    private towerManager: TowerManager;
    private kernel: Kernel;
    
    public rows: TacticalRow[] = [];
    private spawnQueue: { type: EnemyType, delay: number }[] = []; 
    private nextSpawnTime: number = 0;
    private container: PIXI.Container;
    private waveInProgress: boolean = false;

    public nextWaveIntel: EnemyType[] = [];
    public totalWaveUnits: number = 0;
    public prepTimer: number = 0;
    private readonly PREP_DURATION = 15; 
    
    // Spacing configuration (pixels)
    private readonly ROW_SPACING = 32; 
    private readonly BLOCK_SPACING = 120;
    private readonly LATERAL_OFFSET = 20; // 0.5 grid tiles

    constructor(mapManager: MapManager, towerManager: TowerManager, pathManager: PathManager, kernel: Kernel) {
        this.mapManager = mapManager;
        this.towerManager = towerManager;
        this.pathManager = pathManager;
        this.kernel = kernel;
        this.container = new PIXI.Container();
        this.generateIntel(StateManager.instance.currentWave);
    }

    public getContainer() { return this.container; }

    public startWave() {
        this.pathManager.generatePath(StateManager.instance.currentWave);
        this.mapManager.setPathFromCells(this.pathManager.pathCells);
        this.kernel.setPosition(this.pathManager.endNodePos.x, this.pathManager.endNodePos.y);

        this.rows.forEach(r => r.units.forEach(u => this.container.removeChild(u.container)));
        this.rows = [];
        this.spawnQueue = [];

        let currentDelay = 0;
        const rowInterval = 700; 
        const blockInterval = 3000;

        // Queue pairs of enemies (5x2 logic)
        for (let i = 0; i < this.nextWaveIntel.length; i += 2) {
            const typeA = this.nextWaveIntel[i];
            this.spawnQueue.push({ type: typeA, delay: currentDelay });
            
            if ((i / 2 + 1) % 5 === 0) currentDelay += blockInterval;
            else currentDelay += rowInterval;
        }

        this.nextSpawnTime = Date.now();
        this.waveInProgress = true;
        StateManager.instance.currentState = AppState.GAME_WAVE;
    }

    public generateIntel(wave: number) {
        this.nextWaveIntel = [];
        if (wave === 0) {
            this.nextWaveIntel = [EnemyType.GLIDER, EnemyType.GLIDER, EnemyType.GLIDER, EnemyType.GLIDER];
            this.totalWaveUnits = 4;
            return;
        }

        const baseBudget = 150;
        const growth = (1.0 + 0.6 * wave) * Math.pow(1.12, wave);
        let remainingBudget = baseBudget * growth;

        const allTypes = [EnemyType.GLIDER, EnemyType.STRIDER, EnemyType.BEHEMOTH, EnemyType.FRACTAL, EnemyType.PHANTOM, EnemyType.BOSS];
        const availableTypes = allTypes.filter(t => {
            if (t === EnemyType.BOSS) return wave > 0 && wave % 10 === 0;
            return wave >= (t === EnemyType.GLIDER ? 0 : t === EnemyType.STRIDER ? 2 : t === EnemyType.BEHEMOTH ? 5 : t === EnemyType.FRACTAL ? 8 : 12);
        });

        while (remainingBudget > 10 && this.nextWaveIntel.length < 100) {
            let selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            const cost = VISUAL_REGISTRY[selectedType].threat * 2;
            if (cost <= remainingBudget) {
                this.nextWaveIntel.push(selectedType, selectedType);
                remainingBudget -= cost;
            } else break;
        }
        this.totalWaveUnits = this.nextWaveIntel.length;
    }

    public update(dt: number) {
        const state = StateManager.instance.currentState;
        if (state === AppState.WAVE_PREP) {
            this.prepTimer -= (dt / 60) * StateManager.instance.gameSpeed;
            if (this.prepTimer <= 0) this.startWave();
        }
        if (state !== AppState.GAME_WAVE) return;

        const now = Date.now();
        const baseTime = this.nextSpawnTime;
        const gameSpeed = StateManager.instance.gameSpeed;

        // 1. Spawning
        while (this.spawnQueue.length > 0) {
            const elapsed = (now - baseTime) * gameSpeed;
            if (elapsed >= this.spawnQueue[0].delay) {
                const next = this.spawnQueue.shift()!;
                const mult = 1 + (StateManager.instance.currentWave * 0.1);
                
                // Create a Tactical Row (2 units)
                const u1 = new Enemy(next.type, mult);
                const u2 = new Enemy(next.type, mult);
                this.rows.push({ units: [u1, u2], distance: 0 });
                this.container.addChild(u1.container, u2.container);
                StateManager.instance.discoverEnemy(next.type);
            } else break;
        }

        // 2. Traversal & Lifecycle
        let anyNearKernel = false;
        for (let i = this.rows.length - 1; i >= 0; i--) {
            const row = this.rows[i];
            row.distance += 1.5 * dt * gameSpeed; // Base movement speed

            // Get path transform for this distance
            const transform = this.pathManager.getTransformAtDistance(row.distance);
            
            // Project units side-by-side
            row.units[0].project(transform.x, transform.y, transform.rotation, -this.LATERAL_OFFSET);
            row.units[1].project(transform.x, transform.y, transform.rotation, this.LATERAL_OFFSET);

            if (row.distance > this.pathManager.totalLength - 10) {
                row.units.forEach(u => {
                    this.container.removeChild(u.container);
                    StateManager.instance.takeDamage(1);
                });
                this.rows.splice(i, 1);
                continue;
            }

            // Cleanup dead units
            for (let j = row.units.length - 1; j >= 0; j--) {
                const u = row.units[j];
                if (u.isDead) {
                    StateManager.instance.addCredits(VISUAL_REGISTRY[u.type].reward);
                    StateManager.instance.totalPurged++;
                    this.container.removeChild(u.container);
                    row.units.splice(j, 1);
                }
            }

            if (row.units.length === 0) {
                this.rows.splice(i, 1);
            } else if (transform.x > 1440) {
                anyNearKernel = true;
            }
        }

        StateManager.instance.nearKernelAlert = anyNearKernel;

        if (this.waveInProgress && this.spawnQueue.length === 0 && this.rows.length === 0) {
            this.waveInProgress = false;
            StateManager.instance.applyWaveBonuses();
            StateManager.instance.currentWave++;
            this.generateIntel(StateManager.instance.currentWave);
            StateManager.instance.currentState = AppState.WAVE_COMPLETED;
        }
    }

    public get enemies(): Enemy[] {
        const all: Enemy[] = [];
        this.rows.forEach(r => all.push(...r.units));
        return all;
    }

    public getRemainingRewards(): number {
        let total = 0;
        this.rows.forEach(r => r.units.forEach(u => total += VISUAL_REGISTRY[u.type].reward));
        this.spawnQueue.forEach(() => total += 10); // Approximation
        return total;
    }

    public getEndWaveBonus(): number {
        return 200 + (StateManager.instance.currentWave * 50);
    }
    
    public confirmIntel() {
        if (StateManager.instance.currentState === AppState.WAVE_COMPLETED) {
            this.prepTimer = this.PREP_DURATION;
            StateManager.instance.currentState = AppState.WAVE_PREP;
        }
    }
}
