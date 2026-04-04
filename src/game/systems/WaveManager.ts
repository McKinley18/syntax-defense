import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';

export class WaveManager {
    public enemies: Enemy[] = [];
    public waveNumber: number = 1;
    public isWaveActive: boolean = false;
    
    private spawnTimer: number = 0;
    private enemiesToSpawn: number = 0;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
    }

    // PHASE 1: Generate path and show intel
    public prepareWave() {
        if (this.enemies.length > 0 || this.enemiesToSpawn > 0 || this.isWaveActive) return;

        GameStateManager.getInstance().resetForNextWave();
        this.waveNumber = GameStateManager.getInstance().currentWave;
        
        this.game.towerManager.clearTowers();

        // Generate path
        this.game.pathManager.generatePath(this.waveNumber);
        this.game.mapManager.setPathFromCells(this.game.pathManager.pathCells);

        this.isWaveActive = false;
    }

    // PHASE 2: Start the swarm
    public startWave() {
        if (this.isWaveActive) return;
        
        this.isWaveActive = true;
        if (this.waveNumber % 10 === 0) {
            this.enemiesToSpawn = 1; 
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
                this.spawnTimer = Math.max(10, 40 - (this.waveNumber * 1.5));
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);

            if (enemy.reachedGoal) {
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

        // WAVE COMPLETE CHECK
        if (this.enemiesToSpawn === 0 && this.enemies.length === 0) {
            this.isWaveActive = false;
            // Auto-prepare next wave
            this.prepareWave();
        }
    }

    public getUpcomingEnemyTypes(): EnemyType[] {
        const nextWave = this.waveNumber; // Current prepared wave
        const types: Set<EnemyType> = new Set();
        
        if (nextWave % 10 === 0) {
            types.add(EnemyType.FRACTAL);
        } else {
            types.add(EnemyType.GLIDER);
            if (nextWave >= 4) types.add(EnemyType.STRIDER);
            if (nextWave >= 8) types.add(EnemyType.BEHEMOTH);
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
                if (rand > 0.85) type = EnemyType.BEHEMOTH;
                else if (rand > 0.5) type = EnemyType.STRIDER;
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
