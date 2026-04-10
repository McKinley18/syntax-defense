import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';
import { AudioManager } from './AudioManager';

export type SwarmArchetype = 'BULK_BREACH' | 'SHIELDED_LEAD' | 'DIVERSIFIED' | 'FRACTAL_SURGE';

export class WaveManager {
    public waveNumber: number = 0;
    public enemies: Enemy[] = [];
    public isWaveActive: boolean = false;
    public isSummaryActive: boolean = false;
    public upcomingEnemies: { type: EnemyType, count: number }[] = [];
    public onWaveEnd: (() => void) | null = null;

    private game: GameContainer;
    private spawnTimer: number = 0;
    private enemiesToSpawn: EnemyType[] = [];
    private hasProcessedEnd: boolean = false;
    private currentArchetype: SwarmArchetype = 'DIVERSIFIED';
    private intensityMultiplier: number = 1.0;

    constructor(game: GameContainer) {
        this.game = game;
    }

    public prepareWave(startImmediate: boolean = false) {
        const state = GameStateManager.getInstance();
        this.waveNumber = state.currentWave;
        this.hasProcessedEnd = false;
        
        // 1. ANALYZE SYSTEM STATE & PLAYER PERFORMANCE
        this.analyzePerformance(state);

        // 2. GENERATE PATH FOR THIS WAVE
        this.game.pathManager.generatePath(this.waveNumber);
        this.game.mapManager.setPathFromCells(this.game.pathManager.pathCells);
        this.game.kernel.container.position.set(this.game.pathManager.endNodePos.x, this.game.pathManager.endNodePos.y);

        // 3. CALCULATE SWARM BUDGET (Scaling Quantity, not Strength)
        const baseBudget = 10 + (this.waveNumber * 5);
        const budget = Math.floor(baseBudget * this.intensityMultiplier);
        
        // 4. SELECT ARCHETYPE BASED ON LEVEL & VARIETY
        this.selectArchetype();

        // 5. COMPOSE SWARM DATA
        this.enemiesToSpawn = this.composeSwarm(budget);
        this.updateUpcomingData();

        if (startImmediate) this.startWave();
    }

    private analyzePerformance(state: any) {
        // INCREASING HARDNESS: If player is at full health, increase pressure
        if (state.integrity >= 20) {
            this.intensityMultiplier = 1.25; // Dominance Penalty: 25% more units
        } else if (state.integrity < 6) {
            this.intensityMultiplier = 0.85; // Low Health Grace: 15% fewer units
        } else {
            this.intensityMultiplier = 1.0;
        }
    }

    private selectArchetype() {
        if (this.waveNumber % 10 === 0) this.currentArchetype = 'FRACTAL_SURGE';
        else if (this.waveNumber % 5 === 0) this.currentArchetype = 'SHIELDED_LEAD';
        else if (this.waveNumber % 3 === 0) this.currentArchetype = 'BULK_BREACH';
        else this.currentArchetype = 'DIVERSIFIED';
    }

    private composeSwarm(budget: number): EnemyType[] {
        const queue: EnemyType[] = [];
        let remaining = budget;

        // TUTORIAL OVERRIDE
        if (this.waveNumber === 0) {
            for(let i=0; i<5; i++) queue.push(EnemyType.GLIDER);
            return queue;
        }

        switch(this.currentArchetype) {
            case 'BULK_BREACH':
                while (remaining > 0) {
                    queue.push(EnemyType.GLIDER);
                    remaining--;
                }
                break;
            case 'SHIELDED_LEAD':
                const tanks = Math.max(1, Math.floor(this.waveNumber / 4));
                for(let i=0; i<tanks; i++) queue.push(EnemyType.BEHEMOTH);
                remaining -= (tanks * 5);
                while(remaining > 0) {
                    queue.push(EnemyType.STRIDER);
                    remaining--;
                }
                break;
            case 'FRACTAL_SURGE':
                while(remaining > 0) {
                    queue.push(this.waveNumber > 10 ? EnemyType.FRACTAL : EnemyType.BEHEMOTH);
                    remaining -= 4;
                }
                break;
            default: // DIVERSIFIED
                while(remaining > 0) {
                    const roll = Math.random();
                    if (roll > 0.8 && this.waveNumber >= 8) queue.push(EnemyType.BEHEMOTH);
                    else if (roll > 0.6 && this.waveNumber >= 4) queue.push(EnemyType.STRIDER);
                    else queue.push(EnemyType.GLIDER);
                    remaining--;
                }
        }
        return queue;
    }

    public startWave() {
        this.isWaveActive = true;
        this.isSummaryActive = false;
        this.spawnTimer = 60; 
        GameStateManager.getInstance().phase = 'WAVE';
    }

    public update(delta: number) {
        if (!this.isWaveActive) return;

        if (this.enemiesToSpawn.length > 0) {
            this.spawnTimer -= delta;
            if (this.spawnTimer <= 0) {
                const type = this.enemiesToSpawn.shift()!;
                this.spawnEnemy(type);
                
                const baseInterval = Math.max(15, 45 - (this.waveNumber * 1.2));
                this.spawnTimer = baseInterval / this.intensityMultiplier;
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);

            if (enemy.reachedGoal) {
                const damage = enemy.type === EnemyType.FRACTAL ? 5 : 1;
                GameStateManager.getInstance().takeDamage(damage);
                AudioManager.getInstance().playBreach();
                this.game.triggerBreachEffect();
                this.removeEnemy(i);
                continue;
            }

            if (enemy.health <= 0) {
                const baseReward = enemy.type === EnemyType.BEHEMOTH ? 45 : enemy.type === EnemyType.FRACTAL ? 180 : 18;
                const scaledReward = Math.floor(baseReward * Math.pow(1.05, this.waveNumber));
                AudioManager.getInstance().playPurge(enemy.container.x, window.innerWidth);
                GameStateManager.getInstance().addCredits(scaledReward);
                this.game.particleManager.spawnExplosion(enemy.container.x, enemy.container.y, 0.8);
                this.game.particleManager.spawnFloatingText(enemy.container.x, enemy.container.y, `+${scaledReward}c`);
                this.removeEnemy(i);
            }
        }

        if (this.enemiesToSpawn.length === 0 && this.enemies.length === 0 && !this.hasProcessedEnd) {
            this.handleWaveEnd();
        }
    }

    private handleWaveEnd() {
        this.hasProcessedEnd = true;
        this.isWaveActive = false;
        GameStateManager.getInstance().phase = 'PREP';
        this.game.towerManager.clearTowers();
        
        if (this.onWaveEnd) this.onWaveEnd();
        
        if (this.waveNumber > 0) {
            this.isSummaryActive = true;
        } else {
            // If it was the tutorial wave, move to wave 1
            GameStateManager.getInstance().currentWave = 1;
            this.prepareWave(false);
        }
    }

    private spawnEnemy(type: EnemyType) {
        const enemy = new Enemy(type, this.waveNumber);
        this.enemies.push(enemy);
        this.game.enemyLayer.addChild(enemy.container);
    }

    private removeEnemy(index: number) {
        const enemy = this.enemies[index];
        this.game.enemyLayer.removeChild(enemy.container);
        this.enemies.splice(index, 1);
        enemy.destroy();
    }

    private updateUpcomingData() {
        const counts: Map<EnemyType, number> = new Map();
        this.enemiesToSpawn.forEach(type => {
            counts.set(type, (counts.get(type) || 0) + 1);
        });
        this.upcomingEnemies = Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
    }
}
