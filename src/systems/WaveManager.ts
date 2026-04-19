import { StateManager, AppState } from '../core/StateManager';
import { PathManager } from './PathManager';
import { MapManager } from './MapManager';
import { TowerManager } from './TowerManager';
import { Enemy } from '../entities/Enemy';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { Kernel } from '../entities/Kernel';
import { AudioManager } from './AudioManager';
import * as PIXI from 'pixi.js';

interface TacticalRow {
    units: (Enemy | null)[];
    distance: number;
}

/**
 * WAVE MANAGER v99.0: Strategic Wave Authority
 * THE PERFORMANCE REBUILD: Scales difficulty via LETHALITY rather than VOLUME.
 */
export class WaveManager {
    private pathManager: PathManager;
    private mapManager: MapManager;
    private towerManager: TowerManager;
    private kernel: Kernel;
    
    public rows: TacticalRow[] = [];
    private spawnQueue: { type: EnemyType, delay: number, mult: number }[] = []; 
    private nextSpawnTime: number = 0;
    private container: PIXI.Container;
    private waveInProgress: boolean = false;

    public nextWaveIntel: {type: EnemyType, mult: number}[] = [];
    public totalWaveUnits: number = 0;
    public prepTimer: number = 0;
    private readonly PREP_DURATION = 10; 
    
    private readonly LATERAL_OFFSET = 20;
    private readonly MAX_UNITS_PER_WAVE = 50; 

    constructor(mapManager: MapManager, towerManager: TowerManager, pathManager: PathManager, kernel: Kernel) {
        this.mapManager = mapManager;
        this.towerManager = towerManager;
        this.pathManager = pathManager;
        this.kernel = kernel;
        this.container = new PIXI.Container();
        this.prepTimer = this.PREP_DURATION;
        this.generateIntel(StateManager.instance.currentWave);
    }

    public getContainer() { return this.container; }

    public confirmIntel() {
        if (StateManager.instance.currentState === AppState.WAVE_COMPLETED) {
            this.towerManager.clearAllTowers();
            this.pathManager.generatePath(StateManager.instance.currentWave);
            this.mapManager.setPathFromCells(this.pathManager.pathCells);
            this.kernel.setPosition(this.pathManager.endNodePos.x, this.pathManager.endNodePos.y);
            this.kernel.update(0);

            if (StateManager.instance.gameMode === 'HARDCORE') {
                this.startWave();
            } else {
                this.prepTimer = this.PREP_DURATION;
                StateManager.instance.transitionTo(AppState.WAVE_PREP);
            }
        }
    }

    public startWave() {
        StateManager.instance.waveCreditsEarned = 0;
        StateManager.instance.wavePurgedCount = 0;

        // WAVE_IGNITION: Breach Alarm + Visual Pulse
        AudioManager.getInstance().playBreach();
        // Dispatches a global event for GameCanvas to shake the screen
        window.dispatchEvent(new CustomEvent('syndef-shake', { detail: 10 }));

        this.rows.forEach(r => r.units.forEach(u => {
            if (u) this.container.removeChild(u.container);
        }));
        this.rows = [];
        this.spawnQueue = [];

        let currentDelay = 0;
        const rowInterval = 450; 
        const blockInterval = 2000;

        for (let i = 0; i < this.nextWaveIntel.length; i += 2) {
            const entryA = this.nextWaveIntel[i];
            const entryB = this.nextWaveIntel[i+1] || entryA;
            this.spawnQueue.push({ type: entryA.type, delay: currentDelay, mult: entryA.mult });
            if ((i / 2 + 1) % 5 === 0) currentDelay += blockInterval;
            else currentDelay += rowInterval;
        }

        this.nextSpawnTime = Date.now();
        this.waveInProgress = true;
        StateManager.instance.transitionTo(AppState.GAME_WAVE);
    }

    public generateIntel(wave: number) {
        this.nextWaveIntel = [];
        const baseBudget = 150;
        const modeMult = StateManager.instance.gameMode === 'HARDCORE' ? 1.25 : 1.0;
        const growth = (1.0 + 0.6 * wave) * Math.pow(1.12, wave) * modeMult;
        let remainingBudget = baseBudget * growth;

        const densityCap = this.MAX_UNITS_PER_WAVE;
        let powerMult = 1.0 + (wave * 0.15); 
        if (remainingBudget > 5000) {
            powerMult *= (remainingBudget / 5000);
            remainingBudget = 5000;
        }

        const allTypes = [EnemyType.BOSS, EnemyType.PHANTOM, EnemyType.BEHEMOTH, EnemyType.FRACTAL, EnemyType.WORM, EnemyType.STRIDER, EnemyType.GLIDER];
        const availableTypes = allTypes.filter(t => {
            if (t === EnemyType.BOSS) return wave > 0 && wave % 10 === 0;
            return wave >= (t === EnemyType.GLIDER ? 0 : t === EnemyType.STRIDER ? 2 : t === EnemyType.BEHEMOTH ? 5 : t === EnemyType.FRACTAL ? 8 : 12);
        });

        while (remainingBudget > 20 && this.nextWaveIntel.length < densityCap) {
            let selectedType = availableTypes[0]; 
            for(const t of availableTypes) {
                if (VISUAL_REGISTRY[t].threat * 2 <= remainingBudget) {
                    selectedType = t;
                    break;
                }
            }
            const cost = VISUAL_REGISTRY[selectedType].threat * 2;
            this.nextWaveIntel.push({type: selectedType, mult: powerMult}, {type: selectedType, mult: powerMult});
            remainingBudget -= cost;
        }
        this.totalWaveUnits = this.nextWaveIntel.length;
    }

    public update(dt: number) {
        const state = StateManager.instance.currentState;
        
        if (state === AppState.WAVE_PREP || state === AppState.GAME_PREP) {
            this.prepTimer -= (dt / 60) * StateManager.instance.gameSpeed;
            if (this.prepTimer <= 0) {
                this.prepTimer = 0;
                this.startWave();
            }
        }

        if (state !== AppState.GAME_WAVE) return;

        const now = Date.now();
        const baseTime = this.nextSpawnTime;
        const gameSpeed = StateManager.instance.gameSpeed;

        while (this.spawnQueue.length > 0) {
            const elapsed = (now - baseTime) * gameSpeed;
            if (elapsed >= this.spawnQueue[0].delay) {
                const nextA = this.spawnQueue.shift()!;
                const u1 = new Enemy(nextA.type, nextA.mult);
                const u2 = new Enemy(nextA.type, nextA.mult);
                this.rows.push({ units: [u1, u2], distance: 0 });
                this.container.addChild(u1.container, u2.container);
                StateManager.instance.discoverEnemy(nextA.type);
            } else break;
        }

        let anyNearKernel = false;
        for (let i = this.rows.length - 1; i >= 0; i--) {
            const row = this.rows[i];
            const livingUnits = row.units.filter(u => u !== null);
            const allStunned = livingUnits.length > 0 && livingUnits.every(u => u!.isStunned);
            
            if (!allStunned) row.distance += 1.5 * dt * gameSpeed;
            livingUnits.forEach(u => u!.update(dt));

            const transform = this.pathManager.getTransformAtDistance(row.distance);
            row.units.forEach((u, idx) => {
                if (u) {
                    u.distance = row.distance;
                    const offset = idx === 0 ? -this.LATERAL_OFFSET : this.LATERAL_OFFSET;
                    u.project(transform.x, transform.y, transform.rotation, offset);
                }
            });

            if (row.distance > this.pathManager.totalLength - 10) {
                row.units.forEach(u => {
                    if (u) {
                        this.container.removeChild(u.container);
                        StateManager.instance.takeDamage(1);
                    }
                });
                this.rows.splice(i, 1);
                continue;
            }

            for (let j = row.units.length - 1; j >= 0; j--) {
                const u = row.units[j];
                if (u && u.isDead) {
                    const baseReward = VISUAL_REGISTRY[u.type].reward;
                    StateManager.instance.addCredits(baseReward);
                    StateManager.instance.totalPurged++;
                    StateManager.instance.wavePurgedCount++;
                    this.container.removeChild(u.container);
                    row.units[j] = null;
                }
            }
            if (row.units.every(u => u === null)) this.rows.splice(i, 1);
            else if (transform.x > 1440) anyNearKernel = true;
        }

        StateManager.instance.nearKernelAlert = anyNearKernel;

        if (this.waveInProgress && this.spawnQueue.length === 0 && this.rows.length === 0) {
            this.waveInProgress = false;
            const bonus = this.getEndWaveBonus();
            StateManager.instance.applyWaveBonuses(bonus);
            StateManager.instance.currentWave++;
            StateManager.instance.saveGame(this.towerManager.towers);
            this.generateIntel(StateManager.instance.currentWave);
            StateManager.instance.transitionTo(AppState.WAVE_COMPLETED);
        }
    }

    public get enemies(): Enemy[] {
        const all: Enemy[] = [];
        this.rows.forEach(r => r.units.forEach(u => { if (u) all.push(u); }));
        return all;
    }

    public getRemainingRewards(): number {
        let total = 0;
        this.rows.forEach(r => r.units.forEach(u => { if (u) total += VISUAL_REGISTRY[u.type].reward; }));
        this.spawnQueue.forEach(s => total += VISUAL_REGISTRY[s.type].reward);
        return total;
    }

    public getEndWaveBonus(): number {
        const wave = StateManager.instance.currentWave;
        if (StateManager.instance.gameMode === 'HARDCORE') return 200 + (wave * 50);
        return Math.max(1500, 450 + (wave * 150));
    }
}
