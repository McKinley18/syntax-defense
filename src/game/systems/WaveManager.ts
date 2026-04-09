import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';
import { AudioManager } from './AudioManager';

type SwarmPattern = 'sustained_stream' | 'bulk_breach' | 'staggered_burst';

export class WaveManager {
    public enemies: Enemy[] = [];
    public waveNumber: number = 0; 
    public isWaveActive: boolean = false;
    public isSummaryActive: boolean = false;
    public onWaveEnd: (() => void) | null = null;
    
    private spawnTimer: number = 0;
    private enemiesToSpawn: number = 0;
    private totalEnemiesThisWave: number = 0;
    private currentPattern: SwarmPattern = 'sustained_stream';
    private game: GameContainer;
    private hasProcessedEnd: boolean = true;

    constructor(game: GameContainer) {
        this.game = game;
    }

    public upcomingEnemies: { type: EnemyType, count: number }[] = [];

    public prepareWave(incrementWave: boolean = true) {
        if (this.enemies.length > 0 || this.enemiesToSpawn > 0 || this.isWaveActive) return;

        if (incrementWave) {
            GameStateManager.getInstance().resetForNextWave();
        } else {
            GameStateManager.getInstance().lastWaveSummary = { kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0, points: 0 };
        }
        
        this.waveNumber = GameStateManager.getInstance().currentWave;
        GameStateManager.getInstance().phase = 'PREP';
        this.updateUpcomingData();
        
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

    private readonly MAX_CONCURRENT_ENEMIES = 40;
    private currentWaveHpMult: number = 1;

    public startWave() {
        if (this.isWaveActive) return;
        this.isWaveActive = true;
        this.hasProcessedEnd = false; 
        GameStateManager.getInstance().phase = 'WAVE'; 

        const state = GameStateManager.getInstance();

        if (this.game.isTutorialActive) {
            this.enemiesToSpawn = 1;
        } else if (this.waveNumber === 1) {
            this.enemiesToSpawn = 10;
        } else if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; 
        } else {
            const engineGrace = this.waveNumber <= 5 ? 0.3 : 1.0;
            const hoardFactor = Math.min(1.8, Math.max(1.0, (state.credits / 2000) * engineGrace));
            
            let totalPower = 0;
            this.game.towerManager.towers.forEach(t => {
                totalPower += (t.config.damage * (1 + (t.level-1) * 0.25));
            });
            const powerFactor = Math.min(2.0, Math.max(1.0, (totalPower / 150) * engineGrace));

            const baseCount = 10 + Math.floor(this.waveNumber * 3.5);
            const rawCount = Math.floor(baseCount * hoardFactor * powerFactor);
            
            if (rawCount > this.MAX_CONCURRENT_ENEMIES) {
                this.enemiesToSpawn = this.MAX_CONCURRENT_ENEMIES;
                this.currentWaveHpMult = 1 + ((rawCount - this.MAX_CONCURRENT_ENEMIES) / this.MAX_CONCURRENT_ENEMIES);
            } else {
                this.enemiesToSpawn = rawCount;
                this.currentWaveHpMult = 1;
            }
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
                const intensityBoost = 1 - (waveProgress * 0.35); 

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
            enemy.update(delta);

            if (enemy.reachedGoal) {
                const damage = enemy.type === EnemyType.FRACTAL ? 10 : 1;
                state.takeDamage(damage);
                AudioManager.getInstance().playBreach();
                this.game.triggerBreachEffect();
                if (this.game.kernel) this.game.kernel.triggerFlash();
                this.removeEnemy(i);
                continue;
            }

            if (enemy.health <= 0) {
                const baseReward = enemy.type === EnemyType.BEHEMOTH ? 45 : enemy.type === EnemyType.FRACTAL ? 180 : 18;
                const scaledReward = Math.floor(baseReward * Math.pow(1.09, this.waveNumber));
                
                AudioManager.getInstance().playPurge();
                state.addCredits(scaledReward);
                this.game.particleManager.spawnExplosion(enemy.container.x, enemy.container.y, 0.8);
                this.game.particleManager.spawnFloatingText(enemy.container.x, enemy.container.y, `+${scaledReward}c`);
                
                if (enemy.type === EnemyType.BEHEMOTH || enemy.type === EnemyType.FRACTAL) {
                    this.game.triggerPurgeEffect();
                }
                
                this.removeEnemy(i);
            }
        }

        if (this.enemiesToSpawn === 0 && this.enemies.length === 0 && !this.hasProcessedEnd) {
            this.hasProcessedEnd = true; 
            this.isWaveActive = false;
            GameStateManager.getInstance().phase = 'PREP';
            
            if (this.onWaveEnd) this.onWaveEnd();

            if (this.waveNumber > 0) {
                this.isSummaryActive = true; 
            } else if (!this.game.isTutorialActive) {
                this.prepareWave(); 
            }
        }
    }

    private updateUpcomingData() {
        const counts: Map<EnemyType, number> = new Map();
        const state = GameStateManager.getInstance();
        let total = 0;
        
        if (this.game.isTutorialActive) {
            total = 1;
            counts.set(EnemyType.GLIDER, 1);
        } else if (this.waveNumber === 1) {
            total = 10;
            counts.set(EnemyType.GLIDER, 10);
        } else if (this.waveNumber % 10 === 0) {
            total = 1;
            counts.set(EnemyType.FRACTAL, 1);
        } else {
            const hoardFactor = Math.min(2.0, Math.max(1.0, state.credits / 1500));
            let totalPower = 0;
            this.game.towerManager.towers.forEach(t => { totalPower += (t.config.damage * (1 + (t.level-1) * 0.25)); });
            const powerFactor = Math.min(2.5, Math.max(1.0, totalPower / 100));

            const baseCount = 15 + Math.floor(this.waveNumber * 5.5);
            total = Math.floor(baseCount * hoardFactor * powerFactor);
            
            if (this.waveNumber >= 8) {
                const behemoths = Math.floor(total * 0.2);
                const striders = Math.floor(total * 0.4);
                counts.set(EnemyType.BEHEMOTH, behemoths);
                counts.set(EnemyType.STRIDER, striders);
                counts.set(EnemyType.GLIDER, total - (behemoths + striders));
            } else if (this.waveNumber >= 4) {
                const striders = Math.floor(total * 0.4);
                counts.set(EnemyType.STRIDER, striders);
                counts.set(EnemyType.GLIDER, total - striders);
            } else {
                counts.set(EnemyType.GLIDER, total);
            }
        }
        
        this.upcomingEnemies = Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
    }

    private spawnEnemy() {
        let type: EnemyType = EnemyType.GLIDER;
        const state = GameStateManager.getInstance();

        if (this.game.isTutorialActive) {
            type = EnemyType.GLIDER;
        } else if (this.waveNumber === 1) {
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
        
        let modeMult = 1.0;
        if (this.game.isTutorialActive) {
            modeMult = 1.0;
        } else {
            if (state.gameMode === 'HARDCORE') modeMult = 1.25;
            if (state.gameMode === 'ENDLESS' && this.waveNumber > 50) {
                modeMult = Math.pow(1.05, this.waveNumber - 50); 
            }
        }

        const hoardMult = this.game.isTutorialActive ? 1.0 : Math.min(2.0, Math.max(1.0, state.credits / 1500));
        let totalPower = 0;
        this.game.towerManager.towers.forEach(t => { totalPower += (t.config.damage * (1 + (t.level-1) * 0.25)); });
        const powerMult = this.game.isTutorialActive ? 1.0 : Math.min(3.0, Math.max(1.0, totalPower / 150));

        const finalHpMult = hoardMult * powerMult * (this.game.isTutorialActive ? 1.0 : this.currentWaveHpMult) * modeMult;
        if (finalHpMult > 1) {
            enemy.maxHealth *= finalHpMult;
            enemy.health = enemy.maxHealth;
        }

        if (state.gameMode === 'SUDDEN_DEATH') {
            enemy.speed *= 0.85;
        }
        
        if (type === EnemyType.STRIDER) {
            enemy.hasThermalShield = true;
            enemy.renderShield(); 
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