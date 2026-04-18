import { StateManager, AppState } from '../core/StateManager';
import { PathManager } from './PathManager';
import { MapManager, TILE_SIZE } from './MapManager';
import { TowerManager } from './TowerManager';
import { Enemy } from '../entities/Enemy';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { Kernel } from '../entities/Kernel';
import { NeuralBrain } from './NeuralBrain';
import * as PIXI from 'pixi.js';

/**
 * WAVE MANAGER v63.0: Abreast Pair Injection
 * THE DEFINITIVE FIX: Ensures units are enqueued in pairs.
 * Adds diagnostic logging for lane verification.
 */
export class WaveManager {
    private pathManager: PathManager;
    private mapManager: MapManager;
    private towerManager: TowerManager;
    private kernel: Kernel;
    
    public enemies: Enemy[] = []; 
    private spawnQueue: { type: EnemyType, delay: number, lane: number }[] = []; 
    private nextSpawnTime: number = 0;
    private container: PIXI.Container;
    private waveInProgress: boolean = false;

    public nextWaveIntel: EnemyType[] = [];
    public totalWaveUnits: number = 0;
    public prepTimer: number = 0;
    private readonly PREP_DURATION = 15; 
    private readonly MAX_ENEMIES_PER_WAVE = 100; 

    constructor(mapManager: MapManager, towerManager: TowerManager, pathManager: PathManager, kernel: Kernel) {
        this.mapManager = mapManager;
        this.towerManager = towerManager;
        this.pathManager = pathManager;
        this.kernel = kernel;
        this.container = new PIXI.Container();
        this.generateIntel(StateManager.instance.currentWave);
    }

    public getContainer() { return this.container; }

    public confirmIntel() {
        if (StateManager.instance.currentState === AppState.WAVE_COMPLETED) {
            const nextWave = StateManager.instance.currentWave;
            this.pathManager.generatePath(nextWave);
            this.mapManager.setPathFromCells(this.pathManager.pathCells);
            this.kernel.setPosition(this.pathManager.endNodePos.x, this.pathManager.endNodePos.y);
            this.kernel.update(0);
            this.prepTimer = this.PREP_DURATION;
            StateManager.instance.currentState = AppState.WAVE_PREP;
        }
    }

    public startWave() {
        this.enemies.forEach(e => this.container.removeChild(e.container));
        this.enemies = [];
        this.spawnQueue = [];

        let currentDelay = 0;
        const rowDelay = 1200; 
        const blockDelay = 5000; 

        // ENFORCE 5x2 PAIR INJECTION
        for (let i = 0; i < this.nextWaveIntel.length; i += 2) {
            const pairIdx = i / 2;
            const typeA = this.nextWaveIntel[i];
            const typeB = this.nextWaveIntel[i+1] || typeA;

            this.spawnQueue.push({ type: typeA, delay: currentDelay, lane: 0 });
            this.spawnQueue.push({ type: typeB, delay: currentDelay, lane: 1 });

            if ((pairIdx + 1) % 5 === 0) {
                currentDelay += blockDelay;
            } else {
                currentDelay += rowDelay;
            }
        }

        console.log(`[WaveManager] ENQUEUED: ${this.spawnQueue.length} units in ${Math.ceil(this.spawnQueue.length / 10)} blocks.`);
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

        while (remainingBudget > 10 && this.nextWaveIntel.length < this.MAX_ENEMIES_PER_WAVE) {
            let selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            const cost = VISUAL_REGISTRY[selectedType].threat * 2;
            if (cost <= remainingBudget) {
                this.nextWaveIntel.push(selectedType, selectedType);
                remainingBudget -= cost;
            } else {
                break;
            }
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
        let anyNearKernel = false;

        // ATOMIC SPAWN LOOP
        while (this.spawnQueue.length > 0) {
            const elapsed = (now - baseTime) * StateManager.instance.gameSpeed; 
            if (elapsed >= this.spawnQueue[0].delay) {
                const next = this.spawnQueue.shift()!;
                const healthScale = 1 + (StateManager.instance.currentWave * 0.1);
                const enemy = new Enemy(next.type, this.pathManager, next.lane as 0 | 1, healthScale);
                this.enemies.push(enemy);
                this.container.addChild(enemy.container);
                StateManager.instance.discoverEnemy(next.type);
                
                console.log(`[WaveManager] SPAWNED: ${next.type} | LANE: ${next.lane} | START_POS: ${enemy.container.x},${enemy.container.y}`);
            } else {
                break;
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt);
            if (!enemy.isFinished && enemy.container.x > (1440)) anyNearKernel = true;

            if (enemy.isDead) {
                StateManager.instance.addCredits(VISUAL_REGISTRY[enemy.type].reward);
                StateManager.instance.totalPurged++; 
                this.container.removeChild(enemy.container);
                this.enemies.splice(i, 1);
            } else if (enemy.isFinished) {
                this.container.removeChild(enemy.container);
                this.enemies.splice(i, 1);
                StateManager.instance.takeDamage(1);
            }
        }

        StateManager.instance.nearKernelAlert = anyNearKernel;

        if (this.waveInProgress && this.spawnQueue.length === 0 && this.enemies.length === 0) {
            this.waveInProgress = false;
            StateManager.instance.applyWaveBonuses();
            StateManager.instance.currentWave++;
            this.generateIntel(StateManager.instance.currentWave);
            StateManager.instance.currentState = AppState.WAVE_COMPLETED;
            this.nextSpawnTime = 0; 
        }
    }

    public get activeEnemies() { return this.enemies; }
    public getRemainingRewards(): number {
        let total = 0;
        this.enemies.forEach(e => total += VISUAL_REGISTRY[e.type].reward);
        this.spawnQueue.forEach(s => total += VISUAL_REGISTRY[s.type].reward);
        return total;
    }
    public getEndWaveBonus(): number {
        return 200 + (StateManager.instance.currentWave * 50);
    }
}
