import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';

type SwarmPattern = 'sustained_stream' | 'bulk_breach' | 'staggered_burst';

export class WaveManager {
    public enemies: Enemy[] = [];
    public waveNumber: number = 1;
    public isWaveActive: boolean = false;
    
    private spawnTimer: number = 0;
    private enemiesToSpawn: number = 0;
    private totalEnemiesThisWave: number = 0;
    private currentPattern: SwarmPattern = 'sustained_stream';
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
    }

    public prepareWave() {
        if (this.enemies.length > 0 || this.enemiesToSpawn > 0 || this.isWaveActive) return;

        GameStateManager.getInstance().resetForNextWave();
        this.waveNumber = GameStateManager.getInstance().currentWave;
        
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

        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; 
        } else {
            // TIGHTER ECONOMY: Balanced spawning
            this.enemiesToSpawn = 8 + Math.floor(this.waveNumber * 3.2);
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

                // ADAPTIVE INTELLIGENCE: "Processing Overload"
                // As wave progresses, spawn faster
                const waveProgress = 1 - (this.enemiesToSpawn / this.totalEnemiesThisWave);
                const intensityBoost = 1 - (waveProgress * 0.25); // Up to 25% faster

                if (this.currentPattern === 'bulk_breach') {
                    this.spawnTimer = (15 + Math.random() * 10) * intensityBoost; 
                } else if (this.currentPattern === 'staggered_burst') {
                    this.spawnTimer = ((this.enemiesToSpawn % 5 === 0) ? 150 : 25) * intensityBoost; 
                } else {
                    this.spawnTimer = Math.max(25, 60 - (this.waveNumber * 1.5)) * intensityBoost; 
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);

            if (enemy.reachedGoal) {
                const damage = enemy.type === EnemyType.FRACTAL ? 10 : 1;
                GameStateManager.getInstance().takeDamage(damage);
                if (this.game.kernel) this.game.kernel.triggerFlash();
                this.removeEnemy(i);
                continue;
            }

            if (enemy.health <= 0) {
                const baseReward = enemy.type === EnemyType.BEHEMOTH ? 25 : enemy.type === EnemyType.FRACTAL ? 100 : 10;
                const scaledReward = Math.floor(baseReward * Math.pow(1.04, this.waveNumber));
                
                GameStateManager.getInstance().addCredits(scaledReward);
                this.game.particleManager.spawnExplosion(enemy.container.x, enemy.container.y, 0.8);
                this.game.particleManager.spawnFloatingText(enemy.container.x, enemy.container.y, `+${scaledReward}c`);
                this.removeEnemy(i);
            }
        }

        if (this.enemiesToSpawn === 0 && this.enemies.length === 0) {
            this.isWaveActive = false;
            this.prepareWave();
        }
    }

    public dataPurge() {
        // Purge all non-elite, non-boss enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (!e.isElite && e.type !== EnemyType.FRACTAL) {
                GameStateManager.getInstance().addCredits(Math.floor(e.reward * 0.5));
                this.game.particleManager.spawnExplosion(e.container.x, e.container.y, 0.5);
                this.removeEnemy(i);
            }
        }
    }

    public getUpcomingEnemyTypes(): EnemyType[] {
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
