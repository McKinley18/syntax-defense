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
        this.game.pathManager.generatePath(this.waveNumber);
        this.game.mapManager.setPathFromCells(this.game.pathManager.pathCells);

        if (this.game.kernel) {
            this.game.kernel.container.x = this.game.pathManager.endNodePos.x;
            this.game.kernel.container.y = this.game.pathManager.endNodePos.y;
        }

        // Randomize Pattern
        const patterns: SwarmPattern[] = ['sustained_stream', 'bulk_breach', 'staggered_burst'];
        this.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];

        this.isWaveActive = false;
    }

    public startWave() {
        if (this.isWaveActive) return;
        this.isWaveActive = true;

        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; // Boss only
        } else {
            this.enemiesToSpawn = 10 + Math.floor(this.waveNumber * 4);
        }
        this.spawnTimer = 0;
    }

    public update(delta: number) {
        if (!this.isWaveActive) return;

        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= delta;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy();
                this.enemiesToSpawn--;

                // OPTIMIZED SWARM FLOW: Dynamic Spacing
                if (this.currentPattern === 'bulk_breach') {
                    this.spawnTimer = 15 + Math.random() * 10; // Forced separation for bulk
                } else if (this.currentPattern === 'staggered_burst') {
                    this.spawnTimer = (this.enemiesToSpawn % 5 === 0) ? 150 : 25; // Clean group breaks
                } else {
                    this.spawnTimer = Math.max(30, 60 - (this.waveNumber * 1.2)); // Smooth sustained stream
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);

            if (enemy.reachedGoal) {
                const damage = enemy.type === 3 ? 10 : 1;
                GameStateManager.getInstance().takeDamage(damage);
                if (this.game.kernel) this.game.kernel.triggerFlash();
                this.removeEnemy(i);
                continue;
            }

            if (enemy.health <= 0) {
                GameStateManager.getInstance().addCredits(enemy.reward);
                this.game.particleManager.spawnExplosion(enemy.container.x, enemy.container.y, 0.8);
                this.game.particleManager.spawnFloatingText(enemy.container.x, enemy.container.y, `+${enemy.reward}c`);
                this.removeEnemy(i);
            }
        }

        if (this.enemiesToSpawn === 0 && this.enemies.length === 0) {
            this.isWaveActive = false;
            this.prepareWave();
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
        let type: number = 0;
        if (this.waveNumber % 10 === 0) {
            type = 3;
        } else {
            const rand = Math.random();
            if (this.waveNumber >= 8) {
                if (rand > 0.8) type = 2;
                else if (rand > 0.4) type = 1;
            } else if (this.waveNumber >= 4) {
                if (rand > 0.6) type = 1;
            }
        }
        const enemy = new Enemy(type as any, this.waveNumber);
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
