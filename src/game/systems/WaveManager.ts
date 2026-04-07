import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';
import { AudioManager } from './AudioManager';

type SwarmPattern = 'sustained_stream' | 'bulk_breach' | 'staggered_burst';

export class WaveManager {
    public enemies: Enemy[] = [];
    public waveNumber: number = 0; // START AT 0 FOR TUTORIAL
    public isWaveActive: boolean = false;
    public isSummaryActive: boolean = false;
    public onWaveEnd: (() => void) | null = null;
    
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
        } else {
            // INITIAL RESET
            GameStateManager.getInstance().lastWaveSummary = { kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0 };
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
            // WE NEED IT TO SURVIVE LONGER FOR DEMO - FORCE GLIDER
            setTimeout(() => {
                if (this.enemies.length > 0) {
                    const e = this.enemies[0];
                    // Manual override to GLIDER visuals and properties if needed
                    // For now, spawnEnemy handles the selection, we just tune the stats
                    e.maxHealth = 140;
                    e.health = 140;
                    e.speed = 0.8; 
                }
            }, 100);
        } else if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; 
        } else {
            // EASIER STARTING CURVE: 5 at Wave 1, scaling up more gently
            this.enemiesToSpawn = 5 + Math.floor(this.waveNumber * 2.5);
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
                const intensityBoost = 1 - (waveProgress * 0.35); // FASTER FINISH

                // DYNAMIC BATCH SPAWNING (Wave 10+): Enemies arrive in distinct clusters
                const isClustered = this.waveNumber >= 10 && this.currentPattern !== 'sustained_stream';
                const clusterGap = isClustered && (Math.random() < 0.15) ? (100 + Math.random() * 150) : 0;

                if (this.currentPattern === 'bulk_breach') {
                    this.spawnTimer = ((12 + Math.random() * 8) * intensityBoost) + clusterGap; 
                } else if (this.currentPattern === 'staggered_burst') {
                    this.spawnTimer = (((this.enemiesToSpawn % 5 === 0) ? 120 : 20) * intensityBoost) + clusterGap; 
                } else {
                    this.spawnTimer = (Math.max(20, 50 - (this.waveNumber * 1.8)) * intensityBoost) + clusterGap; 
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            const state = GameStateManager.getInstance();
            if (this.waveNumber >= 20 && state.credits > 3000) {
                enemy.update(delta * 1.15); 
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
                const baseReward = enemy.type === EnemyType.BEHEMOTH ? 45 : enemy.type === EnemyType.FRACTAL ? 180 : 18;
                const scaledReward = Math.floor(baseReward * Math.pow(1.09, this.waveNumber));
                
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
            GameStateManager.getInstance().phase = 'PREP'; // TRIGGER UI TRANSITION
            
            if (this.waveNumber > 0) {
                this.isSummaryActive = true; 
                if (this.onWaveEnd) this.onWaveEnd();
            } else {
                this.prepareWave(); 
            }
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
        if (this.game.isTutorialActive) {
            type = EnemyType.GLIDER;
        } else if (this.waveNumber % 10 === 0) {
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
