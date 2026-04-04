import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';

export class WaveManager {
    public enemies: Enemy[] = [];
    public waveNumber: number = 0;
    
    private spawnTimer: number = 0;
    private enemiesToSpawn: number = 0;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
    }

    public startWave() {
        if (this.enemies.length > 0 || this.enemiesToSpawn > 0) return;

        GameStateManager.getInstance().resetForNextWave();
        this.waveNumber = GameStateManager.getInstance().currentWave;
        
        this.game.towerManager.clearTowers();

        // 1. Dynamic Path Complexity based on Wave
        this.game.pathManager.generatePath(this.waveNumber);
        this.game.mapManager.setPathFromCells(this.game.pathManager.pathCells);

        // 2. Swarm Size Scaling
        // Base 10 + 5 per wave, but Boss waves have fewer, tougher units
        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; // JUST THE BOSS (and maybe a few guards)
        } else {
            this.enemiesToSpawn = 10 + Math.floor(this.waveNumber * 4);
        }
        
        this.spawnTimer = 0;
    }

    public update(delta: number) {
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer -= delta;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                // Faster spawning as waves progress
                this.spawnTimer = Math.max(10, 40 - (this.waveNumber * 1.5));
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);

            if (enemy.reachedGoal) {
                // Bosses do critical integrity damage
                const damage = enemy.type === EnemyType.FRACTAL ? 10 : 
                               enemy.type === EnemyType.BEHEMOTH ? 3 : 1;
                GameStateManager.getInstance().takeDamage(damage);
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
    }

    private spawnEnemy() {
        let type: EnemyType = EnemyType.GLIDER;
        
        // BOSS WAVE logic (Every 10 waves)
        if (this.waveNumber % 10 === 0) {
            type = EnemyType.FRACTAL;
        } else {
            const rand = Math.random();
            // Wave-based introduction
            if (this.waveNumber >= 8) {
                if (rand > 0.85) type = EnemyType.BEHEMOTH;
                else if (rand > 0.5) type = EnemyType.STRIDER;
                else type = EnemyType.GLIDER;
            } else if (this.waveNumber >= 4) {
                if (rand > 0.6) type = EnemyType.STRIDER;
                else type = EnemyType.GLIDER;
            } else {
                type = EnemyType.GLIDER;
            }
        }

        const startNodeId = this.game.pathManager.startNodes[Math.floor(Math.random() * this.game.pathManager.startNodes.length)];
        const enemy = new Enemy(type, this.waveNumber, startNodeId);
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
