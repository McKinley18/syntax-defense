import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';
import { AudioManager } from './AudioManager';

type SwarmPattern = 'sustained_stream' | 'bulk_breach' | 'staggered_burst';

export class WaveManager {
    public enemies: Enemy[] = [];
    public waveNumber: number = 0; // START AT 0 FOR TUTORIAL
    public isWaveActive: boolean = false;
    
    private spawnTimer: number = 0;
    private enemiesToSpawn: number = 0;
    private totalEnemiesThisWave: number = 0;
    private currentPattern: SwarmPattern = 'sustained_stream';
    private game: GameContainer;
    private hasProcessedEnd: boolean = true; // START IN PROCESSED STATE

    constructor(game: GameContainer) {
        this.game = game;
    }

    public upcomingEnemies: EnemyType[] = [];

    public prepareWave(incrementWave: boolean = true) {
        // PREVENT RE-ENTRY IF ALREADY PREPARING
        if (this.enemies.length > 0 || this.enemiesToSpawn > 0 || this.isWaveActive) return;

        if (incrementWave) {
            GameStateManager.getInstance().resetForNextWave();
        }
        
        this.waveNumber = GameStateManager.getInstance().currentWave;
        GameStateManager.getInstance().phase = 'PREP'; // LOCK PREP PHASE
        
        // PRE-CALCULATE FOR UI
        this.upcomingEnemies = this.calculateUpcomingTypes();
        
        this.game.towerManager.clearTowers();
        
        let success = false;
        let attempts = 0;
        while (!success && attempts < 100) {
            this.game.pathManager.generatePath(this.waveNumber);
            if (this.game.pathManager.macroPath.length >= 4) {
                success = true;
            }
            attempts++;
        }
        
        this.game.mapManager.setPathFromCells(this.game.pathManager.pathCells);

        if (this.game.kernel) {
            this.game.kernel.container.x = this.game.pathManager.endNodePos.x;
            this.game.kernel.container.y = this.game.pathManager.endNodePos.y;
        }

        const patterns: SwarmPattern[] = ['sustained_stream', 'bulk_breach', 'staggered_burst'];
        this.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];

        this.isWaveActive = false;
        GameStateManager.getInstance().save();
    }

    public startWave() {
        if (this.isWaveActive) return;
        this.isWaveActive = true;
        this.hasProcessedEnd = false; 
        GameStateManager.getInstance().phase = 'WAVE'; 

        if (this.game.isTutorialActive) {
            this.enemiesToSpawn = 1;
            // WE NEED IT TO SURVIVE LONGER FOR DEMO
            setTimeout(() => {
                if (this.enemies.length > 0) {
                    const e = this.enemies[0];
                    e.maxHealth = 140;
                    e.health = 140;
                    e.speed = 0.8; // Slow it down so it takes hits visibly
                }
            }, 100);
        } else if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; 
        } else {
            // PROGRESSIVE SCALE: From 6-8 at Wave 1 to ~120 at Wave 50
            this.enemiesToSpawn = 6 + Math.floor(this.waveNumber * 2.3);
        }
        this.totalEnemiesThisWave = this.enemiesToSpawn;
        this.spawnTimer = 0;
    }

    public update(delta: number) {
        if (!this.isWaveActive) return;

        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= delta;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy();
                this.enemiesToSpawn--;

                const waveProgress = 1 - (this.enemiesToSpawn / this.totalEnemiesThisWave);
                const intensityBoost = 1 - (waveProgress * 0.25);

                // DYNAMIC BATCH SPAWNING (Wave 15+): Enemies arrive in 2-3 distinct clusters
                const isClustered = this.waveNumber >= 15 && this.currentPattern !== 'sustained_stream';
                const clusterGap = isClustered && (Math.random() < 0.1) ? (120 + Math.random() * 200) : 0;

                if (this.currentPattern === 'bulk_breach') {
                    this.spawnTimer = ((15 + Math.random() * 10) * intensityBoost) + clusterGap; 
                } else if (this.currentPattern === 'staggered_burst') {
                    this.spawnTimer = (((this.enemiesToSpawn % 5 === 0) ? 150 : 25) * intensityBoost) + clusterGap; 
                } else {
                    this.spawnTimer = (Math.max(25, 60 - (this.waveNumber * 1.5)) * intensityBoost) + clusterGap; 
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // ELITE LOGIC: Greed-Reactive Speed (Wave 20+)
            const state = GameStateManager.getInstance();
            if (this.waveNumber >= 20 && state.credits > 3000) {
                enemy.update(delta * 1.15); // +15% Speed Logic Overload
            } else {
                enemy.update(delta);
            }

            if (enemy.reachedGoal) {
                const damage = enemy.type === EnemyType.FRACTAL ? 10 : 1;
                GameStateManager.getInstance().takeDamage(damage);
                AudioManager.getInstance().playBreach();
                if (this.game.kernel) this.game.kernel.triggerFlash();
                this.removeEnemy(i);
                continue;
            }

            if (enemy.health <= 0) {
                const baseReward = enemy.type === EnemyType.BEHEMOTH ? 40 : enemy.type === EnemyType.FRACTAL ? 150 : 15;
                const scaledReward = Math.floor(baseReward * Math.pow(1.08, this.waveNumber));
                
                AudioManager.getInstance().playPurge();
                GameStateManager.getInstance().addCredits(scaledReward);
                this.game.particleManager.spawnExplosion(enemy.container.x, enemy.container.y, 0.8);
                this.game.particleManager.spawnFloatingText(enemy.container.x, enemy.container.y, `+${scaledReward}c`);
                this.removeEnemy(i);
            }
        }

        // ONE-TIME LATCH TRIGGER
        if (this.enemiesToSpawn === 0 && this.enemies.length === 0 && !this.hasProcessedEnd) {
            this.hasProcessedEnd = true; 
            this.isWaveActive = false;
            this.prepareWave(); // THIS WILL NOT RESET hasProcessedEnd
        }
    }

    public dataPurge() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (!e.isElite && e.type !== EnemyType.FRACTAL) {
                GameStateManager.getInstance().addCredits(Math.floor(e.reward * 0.5));
                this.game.particleManager.spawnExplosion(e.container.x, e.container.y, 0.5);
                this.removeEnemy(i);
            }
        }
    }

    public calculateUpcomingTypes(): EnemyType[] {
        const types: Set<EnemyType> = new Set();
        if (this.waveNumber % 10 === 0) {
            types.add(EnemyType.FRACTAL);
        } else {
            types.add(EnemyType.GLIDER);
            if (this.waveNumber >= 4) types.add(EnemyType.STRIDER);
            if (this.waveNumber >= 8) types.add(EnemyType.BEHEMOTH);
        }
        return Array.from(types);
    }

    private spawnEnemy() {
        let type: EnemyType = EnemyType.GLIDER;
        if (this.waveNumber % 10 === 0) {
            type = EnemyType.FRACTAL;
        } else {
            const rand = Math.random();
            if (this.waveNumber >= 8) {
                if (rand > 0.8) type = EnemyType.BEHEMOTH;
                else if (rand > 0.4) type = EnemyType.STRIDER;
            } else if (this.waveNumber >= 4) {
                if (rand > 0.6) type = EnemyType.STRIDER;
            }
        }
        
        const enemy = new Enemy(type, this.waveNumber);
        
        // VIRAL LEARNING: Strider Thermal Shield
        if (type === EnemyType.STRIDER && this.game.towerManager.getTowerCount(0) >= 5) {
            enemy.hasThermalShield = true;
            enemy.renderShield(); // Visually attach the shield
        }

        this.enemies.push(enemy);
        this.game.enemyLayer.addChild(enemy.container);
    }

    private removeEnemy(index: number) {
        const enemy = this.enemies[index];
        this.game.enemyLayer.removeChild(enemy.container);
        enemy.container.destroy({ children: true });
        this.enemies.splice(index, 1);
    }
}
