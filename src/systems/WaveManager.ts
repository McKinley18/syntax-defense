import { StateManager, AppState } from '../core/StateManager';
import { PathManager } from './PathManager';
import { MapManager, TILE_SIZE } from './MapManager';
import { TowerManager } from './TowerManager';
import { Enemy } from '../entities/Enemy';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TOWER_CONFIGS, TowerType } from '../entities/Tower';
import { Engine } from '../core/Engine';
import { NeuralBrain, SimulationTheme } from './NeuralBrain';
import * as PIXI from 'pixi.js';

export class WaveManager {
    private pathManager: PathManager;
    private mapManager: MapManager;
    private towerManager: TowerManager;
    public enemies: Enemy[] = []; 
    private spawnQueue: { type: EnemyType, delay: number, lane: number }[] = []; 
    private nextSpawnTime: number = 0;
    private container: PIXI.Container;
    private waveInProgress: boolean = false;

    public nextWaveIntel: EnemyType[] = [];
    public currentDirective: string = "BALANCED";
    public totalWaveUnits: number = 0;
    public prepTimer: number = 0;
    private readonly PREP_DURATION = 15; 
    private readonly MAX_ENEMIES_PER_WAVE = 60; 

    constructor(mapManager: MapManager, towerManager: TowerManager, pathManager: PathManager) {
        this.mapManager = mapManager;
        this.towerManager = towerManager;
        this.pathManager = pathManager;
        this.container = new PIXI.Container();
        // REMOVED: Direct stage addition (managed by GameCanvas)
        this.generateIntel(StateManager.instance.currentWave);
    }

    public getContainer() { return this.container; }

    public confirmIntel() {
        if (StateManager.instance.currentState === AppState.WAVE_COMPLETED) {
            const nextWave = StateManager.instance.currentWave;
            this.pathManager.generatePath(nextWave);
            this.mapManager.setPathFromCells(this.pathManager.pathCells);
            this.prepTimer = this.PREP_DURATION;
            StateManager.instance.currentState = AppState.WAVE_PREP;
        }
    }

    public startWave() {
        this.enemies.forEach(e => this.container.removeChild(e.container));
        this.enemies = [];
        this.spawnQueue = [];

        let currentDelay = 0;
        const clusterSize = 5; 
        const numLanes = StateManager.instance.currentWave === 0 ? 1 : 2;
        
        this.nextWaveIntel.forEach((type, index) => {
            const lane = index % numLanes;
            if (index > 0 && index % clusterSize === 0) {
                currentDelay += 3000; 
            } else if (index > 0) {
                currentDelay += 400; 
            }
            this.spawnQueue.push({ type, delay: currentDelay, lane });
        });

        this.nextSpawnTime = Date.now();
        this.waveInProgress = true;
        StateManager.instance.currentState = AppState.GAME_WAVE;
    }

    public generateIntel(wave: number) {
        this.nextWaveIntel = [];
        const brain = NeuralBrain.getInstance();
        const profile = brain.currentProfile;

        if (wave === 0) {
            this.nextWaveIntel = [EnemyType.GLIDER];
            this.currentDirective = "INITIAL_BOOT";
            this.totalWaveUnits = 1;
            return;
        }

        const playerTokens = StateManager.instance.credits;
        const levelNumber = wave;

        const unlockedTowers = Object.values(TOWER_CONFIGS).filter(t => levelNumber >= t.unlockWave);
        const avgTurretCost = unlockedTowers.length > 0 ? unlockedTowers.reduce((sum, t) => sum + t.cost, 0) / unlockedTowers.length : 125;
        const avgTurretDPS = unlockedTowers.length > 0 ? unlockedTowers.reduce((sum, t) => {
            const cooldownSec = (t.cooldown || 1) / 60;
            return sum + (t.damage / cooldownSec);
        }, 0) / unlockedTowers.length : 15;

        // LAW: Difficulty curve is constant per wave
        let difficultyMultiplier = 1.0 + (0.15 * levelNumber) + (0.02 * Math.pow(levelNumber, 2));
        
        const integrity = StateManager.instance.integrity;
        if (integrity < 10) difficultyMultiplier *= 0.8;
        if (integrity === 20) difficultyMultiplier *= 1.1;
        
        const budget = difficultyMultiplier * Math.max(playerTokens, 500);
        const waveDuration = 25; 
        const theoreticalMaxDamage = (budget / avgTurretCost) * avgTurretDPS * waveDuration;
        const fairnessThreshold = theoreticalMaxDamage * 0.85;

        const directives = ["SWARM", "SHIELD", "GHOST", "BALANCED"];
        let selectedDirective = directives[Math.floor(Math.random() * directives.length)];
        
        if (profile?.theme === SimulationTheme.VOLATILE) selectedDirective = "SWARM";
        if (profile?.theme === SimulationTheme.SHIELDED) selectedDirective = "SHIELD";
        
        const directive = (levelNumber > 0 && levelNumber % 10 === 0) ? "BOSS" : selectedDirective;
        this.currentDirective = directive;

        let remainingBudget = budget;
        let currentWaveHP = 0;

        if (directive === "BOSS") {
            this.nextWaveIntel.push(EnemyType.BOSS);
            remainingBudget -= VISUAL_REGISTRY[EnemyType.BOSS].threat;
            currentWaveHP += VISUAL_REGISTRY[EnemyType.BOSS].hp * (1 + levelNumber * 0.05);
        }

        const allEnemyTypes = (Object.keys(VISUAL_REGISTRY).map(Number).filter(n => !isNaN(n)) as unknown) as EnemyType[];
        const availableTypes = allEnemyTypes.filter(t => {
            if (t === EnemyType.BOSS) return false;
            const unlock = (t === EnemyType.GLIDER ? 0 : t === EnemyType.STRIDER ? 2 : t === EnemyType.BEHEMOTH ? 5 : t === EnemyType.FRACTAL ? 8 : t === EnemyType.PHANTOM ? 12 : 15);
            return levelNumber >= unlock;
        });

        while (remainingBudget > 5 && currentWaveHP < fairnessThreshold && this.nextWaveIntel.length < this.MAX_ENEMIES_PER_WAVE) {
            const valid = availableTypes.filter(t => VISUAL_REGISTRY[t].threat <= remainingBudget);
            if (valid.length === 0) break;

            let selectedType = valid[0];
            if (directive === "SWARM") {
                const swarms = valid.filter(t => t === EnemyType.GLIDER || t === EnemyType.STRIDER);
                selectedType = swarms.length > 0 ? swarms[Math.floor(Math.random() * swarms.length)] : valid[Math.floor(Math.random() * valid.length)];
            } else if (directive === "SHIELD") {
                const tanks = valid.filter(t => t === EnemyType.BEHEMOTH || t === EnemyType.WORM);
                selectedType = tanks.length > 0 ? tanks[Math.floor(Math.random() * tanks.length)] : valid[Math.floor(Math.random() * valid.length)];
            } else if (directive === "GHOST") {
                const fast = valid.filter(t => t === EnemyType.PHANTOM || t === EnemyType.FRACTAL);
                selectedType = fast.length > 0 ? fast[Math.floor(Math.random() * fast.length)] : valid[Math.floor(Math.random() * valid.length)];
            } else {
                const weights = valid.map(t => Math.pow(VISUAL_REGISTRY[t].threat, 1.2));
                const totalWeight = weights.reduce((s, w) => s + w, 0);
                let roll = Math.random() * totalWeight;
                for (let i = 0; i < valid.length; i++) {
                    roll -= weights[i];
                    if (roll <= 0) { selectedType = valid[i]; break; }
                }
            }

            this.nextWaveIntel.push(selectedType);
            remainingBudget -= VISUAL_REGISTRY[selectedType].threat;
            currentWaveHP += VISUAL_REGISTRY[selectedType].hp * (1 + levelNumber * 0.05);
        }

        if (this.nextWaveIntel.length === 0) this.nextWaveIntel = [EnemyType.GLIDER];
        this.nextWaveIntel.sort((a, b) => VISUAL_REGISTRY[b].hp - VISUAL_REGISTRY[a].hp);
        this.totalWaveUnits = this.nextWaveIntel.length;
    }

    public update(dt: number) {
        const state = StateManager.instance.currentState;
        if (state === AppState.WAVE_PREP) {
            this.prepTimer -= (dt / 60);
            if (this.prepTimer <= 0) this.startWave();
        }
        if (state !== AppState.GAME_WAVE) {
            StateManager.instance.nearKernelAlert = false;
            return;
        }

        const now = Date.now();
        let anyNearKernel = false;

        if (this.spawnQueue.length > 0) {
            if (!this.nextSpawnTime) this.nextSpawnTime = now; 
            const waveStartTime = this.nextSpawnTime; 
            const elapsed = (now - waveStartTime) * StateManager.instance.gameSpeed; 

            if (elapsed >= this.spawnQueue[0].delay) {
                const next = this.spawnQueue.shift()!;
                const stage = Engine.instance.app.stage;
                const scale = stage.scale.x;
                const vL = (0 - stage.x) / scale;
                const vR = (window.innerWidth - stage.x) / scale;
                
                const lp = this.pathManager.getLanePoints(next.lane as 0 | 1);
                if (lp.length > 0) {
                    const ingressPath = [new PIXI.Point(vL - 80, lp[0].y), ...lp, new PIXI.Point(vR + 40, lp[lp.length - 1].y)];
                    
                    const healthScale = 1 + StateManager.instance.currentWave * 0.05;
                    const enemy = new Enemy(next.type, ingressPath, healthScale);
                    this.enemies.push(enemy);
                    this.container.addChild(enemy.container);
                    StateManager.instance.discoverEnemy(next.type);
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(dt);
            
            if (!enemy.isFinished && enemy.container.x > (36 * TILE_SIZE)) {
                anyNearKernel = true;
            }

            if (enemy.isDead) {
                let reward = VISUAL_REGISTRY[enemy.type].reward;
                if (StateManager.instance.credits > 5000) reward *= 0.7;
                
                StateManager.instance.addCredits(reward);
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
            StateManager.instance.addCredits(300 + (StateManager.instance.currentWave * 25));
            StateManager.instance.currentWave++;
            this.generateIntel(StateManager.instance.currentWave);
            StateManager.instance.currentState = AppState.WAVE_COMPLETED;
            this.nextSpawnTime = 0; 
        }
    }

    public get activeEnemies() { return this.enemies; }
}
