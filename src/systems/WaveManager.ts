import { StateManager, AppState } from '../core/StateManager';
import { PathManager } from './PathManager';
import { MapManager, TILE_SIZE } from './MapManager';
import { TowerManager } from './TowerManager';
import { Enemy } from '../entities/Enemy';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { Engine } from '../core/Engine';
import * as PIXI from 'pixi.js';

export class WaveManager {
    private pathManager: PathManager;
    private mapManager: MapManager;
    private towerManager: TowerManager;
    public enemies: Enemy[] = []; 
    private spawnQueue: { type: EnemyType, delay: number }[] = []; 
    private nextSpawnTime: number = 0;
    private container: PIXI.Container;

    public nextWaveIntel: EnemyType[] = [];
    public prepTimer: number = 0;
    private readonly PREP_DURATION = 15; 

    constructor(mapManager: MapManager, towerManager: TowerManager, pathManager: PathManager) {
        this.mapManager = mapManager;
        this.towerManager = towerManager;
        this.pathManager = pathManager;
        this.container = new PIXI.Container();
        Engine.instance.app.stage.addChild(this.container);
        this.generateIntel(0);
    }

    public confirmIntel() {
        if (StateManager.instance.currentState === AppState.WAVE_COMPLETED) {
            const nextWave = StateManager.instance.currentWave;
            
            // LAW: Map shift only happens AFTER Intel acknowledgment
            this.pathManager.generatePath(nextWave);
            this.mapManager.setPathFromCells(this.pathManager.pathCells);
            
            this.prepTimer = this.PREP_DURATION;
            StateManager.instance.currentState = AppState.WAVE_PREP;
            console.log(`[WaveManager] Topology Shift Executed. Prep Timer Active.`);
        }
    }

    public startWave() {
        this.enemies.forEach(e => this.container.removeChild(e.container));
        this.enemies = [];
        this.spawnQueue = [];
        this.nextWaveIntel.forEach((type, index) => {
            this.spawnQueue.push({ type, delay: index === 0 ? 0 : 25 });
        });
        this.nextSpawnTime = Date.now() + 300;
        StateManager.instance.currentState = AppState.GAME_WAVE;
    }

    public generateIntel(wave: number) {
        this.nextWaveIntel = [];
        if (wave === 0) {
            this.nextWaveIntel = [EnemyType.GLIDER];
            return;
        }

        let budget = 100 + (wave * 40) * Math.pow(1.03, wave);
        const integrity = StateManager.instance.integrity;
        if (integrity >= 18) budget *= 1.2;
        if (integrity <= 6) budget *= 0.8;

        const availableTypes: EnemyType[] = [EnemyType.GLIDER];
        if (wave >= 2) availableTypes.push(EnemyType.STRIDER);
        if (wave >= 5) availableTypes.push(EnemyType.BEHEMOTH);
        if (wave >= 8) availableTypes.push(EnemyType.FRACTAL);
        if (wave >= 12) availableTypes.push(EnemyType.PHANTOM);
        if (wave >= 15) availableTypes.push(EnemyType.WORM);

        let remainingBudget = budget;
        while (remainingBudget > 5) {
            const valid = availableTypes.filter(t => VISUAL_REGISTRY[t].threat <= remainingBudget);
            if (valid.length === 0) break;
            const type = valid[Math.floor(Math.random() * valid.length)];
            this.nextWaveIntel.push(type);
            remainingBudget -= VISUAL_REGISTRY[type].threat;
        }

        this.nextWaveIntel.sort((a, b) => VISUAL_REGISTRY[b].hp - VISUAL_REGISTRY[a].hp);
    }

    public update(dt: number) {
        const state = StateManager.instance.currentState;
        if (state === AppState.WAVE_PREP) {
            this.prepTimer -= (dt / 60);
            if (this.prepTimer <= 0) this.startWave();
        }
        if (state !== AppState.GAME_WAVE) return;

        if (this.spawnQueue.length > 0 && Date.now() >= this.nextSpawnTime) {
            const next = this.spawnQueue.shift()!;
            const stage = Engine.instance.app.stage;
            const scale = stage.scale.x;
            const vL = (0 - stage.x) / scale;
            const vR = (window.innerWidth - stage.x) / scale;
            const lanes = StateManager.instance.currentWave === 0 ? [0] : [0, 1];
            lanes.forEach(laneID => {
                const lp = this.pathManager.getLanePoints(laneID as 0 | 1);
                if (lp.length > 0) {
                    const ingressPath = [new PIXI.Point(vL - 80, lp[0].y), ...lp, new PIXI.Point(vR + 40, lp[lp.length - 1].y)];
                    // BALANCE: Reduced health scaling for early game
                    const healthScale = 1 + StateManager.instance.currentWave * 0.05;
                    const enemy = new Enemy(next.type, ingressPath, healthScale);
                    this.enemies.push(enemy);
                    this.container.addChild(enemy.container);
                }
            });
            this.nextSpawnTime = Date.now() + (next.delay * 16.6); 
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt);
            if (enemy.isDead) {
                StateManager.instance.addCredits(VISUAL_REGISTRY[enemy.type].reward);
                this.container.removeChild(enemy.container);
                this.enemies.splice(i, 1);
            } else if (enemy.isFinished) {
                this.container.removeChild(enemy.container);
                this.enemies.splice(i, 1);
                StateManager.instance.takeDamage(1);
            }
        }

        if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
            this.towerManager.clearAllTowers();
            // HIGH BONUS FOR REBUILD
            StateManager.instance.addCredits(300 + (StateManager.instance.currentWave * 50));
            StateManager.instance.currentWave++;
            this.generateIntel(StateManager.instance.currentWave);
            StateManager.instance.currentState = AppState.WAVE_COMPLETED;
        }
    }

    public get activeEnemies() { return this.enemies; }
}
