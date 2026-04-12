import { Enemy, EnemyType } from '../entities/Enemy';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from './GameStateManager';
import { AudioManager } from './AudioManager';

interface SwarmProfile {
    type: EnemyType;
    count: number;
    delay: number;
    isLocked?: boolean;
}

export class WaveManager {
    public waveNumber: number = 0;
    public enemies: Enemy[] = [];
    public upcomingEnemies: { type: EnemyType, count: number }[] = [];
    public isWaveActive: boolean = false;
    public isSummaryActive: boolean = false;
    public onWaveEnd: (() => void) | null = null;

    public unlockTutorialSwarm() {
        if (this.enemiesToSpawn.length > 0) {
            this.enemiesToSpawn[0].isLocked = false;
        }
    }


    private enemiesToSpawn: SwarmProfile[] = [];
    private spawnTimer: number = 0;
    private hasProcessedEnd: boolean = false;
    private game: GameContainer;

    constructor(game: GameContainer) {
        this.game = game;
    }

    public prepareWave(startImmediate: boolean = false) {
        const state = GameStateManager.getInstance();
        this.waveNumber = state.currentWave;
        this.hasProcessedEnd = false;
        
        // 1. GENERATE ENVIRONMENT
        this.game.pathManager.generatePath(this.waveNumber);
        this.game.mapManager.setPathFromCells(this.game.pathManager.pathCells);
        
        // 2. FORCE KERNEL VISIBILITY
        const endPos = this.game.pathManager.endNodePos;
        this.game.kernel.container.position.set(endPos.x, endPos.y);
        this.game.kernel.container.visible = true;

        // 3. TUTORIAL LOCK: Wave 1 ONLY spawns the Glider
        if (this.waveNumber === 1) {
            this.enemiesToSpawn = [{ type: EnemyType.GLIDER, count: 1, delay: 60, isLocked: true }];
            this.spawnTimer = 0; // Trigger instantly
        } else {
            this.composeLogicalSwarm();
        }
        this.updateUpcomingData();

        if (startImmediate) {
            this.isWaveActive = true;
            state.phase = 'COMBAT';
            // Unlock immediately for the tutorial
            if (this.waveNumber === 1) {
                this.enemiesToSpawn[0].isLocked = false;
            }
        }
    }

    private composeLogicalSwarm() {
        this.enemiesToSpawn = [];
        const wave = this.waveNumber;

        // WAVE 0: TUTORIAL MANDATE
        if (wave === 0) {
            this.enemiesToSpawn.push({ type: EnemyType.GLIDER, count: 1, delay: 60, isLocked: true });
            return;
        }

        // EXPONENTIAL BUDGET: 15 * (1.15 ^ wave)
        Math.floor(15 * Math.pow(1.15, wave));

        // DECIDE WAVE PROFILE
        const roll = Math.random();
        
        if (roll < 0.4) { // MIXED WAVE: Balanced Vanguard + Heavy
            this.addSwarm(EnemyType.GLIDER, Math.ceil(wave * 1.5), 25);
            this.addSwarm(EnemyType.STRIDER, Math.ceil(wave / 2), 60);
            if (wave >= 5) this.addSwarm(EnemyType.BEHEMOTH, Math.floor(wave / 5), 120);
        } 
        else if (roll < 0.7) { // SWARM WAVE: High quantity, low health
            this.addSwarm(EnemyType.GLIDER, wave * 3, 15);
        }
        else { // HEAVY WAVE: Low quantity, high health/armor
            if (wave >= 3) {
                this.addSwarm(EnemyType.STRIDER, wave, 40);
                this.addSwarm(EnemyType.BEHEMOTH, Math.ceil(wave / 3), 90);
            } else {
                this.addSwarm(EnemyType.GLIDER, wave * 2, 30);
            }
        }

        // BOSS WAVE: Every 10 waves
        if (wave > 0 && wave % 10 === 0) {
            this.enemiesToSpawn.push({ type: EnemyType.FRACTAL, count: 1, delay: 200 });
        }
    }

    private addSwarm(type: EnemyType, count: number, delay: number) {
        if (count <= 0) return;
        this.enemiesToSpawn.push({ type, count, delay });
    }

    public update(delta: number) {
        if (!this.isWaveActive) return;

        // TUTORIAL FAIL-SAFE: Force-inject glider if missing in Wave 1
        if (this.waveNumber === 1 && this.enemies.length === 0 && this.enemiesToSpawn.length === 0 && !this.hasProcessedEnd) {
            this.spawnEnemy(EnemyType.GLIDER);
            const lastEnemy = this.enemies[this.enemies.length - 1];
            if (lastEnemy) lastEnemy.health = 1; // Instant kill for fail-safe
        }

        // 1. SPAWNING LOGIC
        if (this.enemiesToSpawn.length > 0) {
            const group = this.enemiesToSpawn[0];
            if (group.isLocked) return; // VITAL: Stop if locked

            this.spawnTimer -= delta;
            if (this.spawnTimer <= 0) {
                this.spawnEnemy(group.type);
                group.count--;
                this.spawnTimer = group.delay;
                
                if (group.count <= 0) {
                    this.enemiesToSpawn.shift();
                }
            }
        }

        // 2. ENEMY UPDATES & CLEANUP
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(delta);

            if (enemy.reachedGoal) {
                GameStateManager.getInstance().takeDamage(enemy.type === EnemyType.FRACTAL ? 10 : 1);
                AudioManager.getInstance().playBreach(enemy.container.x, window.innerWidth);
                this.removeEnemy(i);
                continue;
            }

            if (enemy.health <= 0) {
                // Reward scaling: base * (1.05 ^ wave)
                const baseReward = enemy.type === EnemyType.BEHEMOTH ? 45 : enemy.type === EnemyType.FRACTAL ? 250 : 18;
                const scaledReward = Math.floor(baseReward * Math.pow(1.05, this.waveNumber));
                
                GameStateManager.getInstance().addCredits(scaledReward);
                AudioManager.getInstance().playPurge(enemy.container.x, window.innerWidth);
                this.game.particleManager.spawnExplosion(enemy.container.x, enemy.container.y, 0.8);
                this.game.particleManager.spawnFloatingText(enemy.container.x, enemy.container.y, `+${scaledReward}c`);
                
                this.handleEnemyDeath(enemy, i);
            }
        }

        // 3. WAVE COMPLETION
        if (this.enemiesToSpawn.length === 0 && this.enemies.length === 0 && !this.hasProcessedEnd) {
            this.handleWaveEnd();
        }
    }

    private handleEnemyDeath(enemy: Enemy, index: number) {
        if (enemy.isSplitter) {
            const childType = enemy.type === EnemyType.BEHEMOTH ? EnemyType.STRIDER : EnemyType.GLIDER;
            const count = enemy.type === EnemyType.BEHEMOTH ? 2 : 3;
            
            for (let i = 0; i < count; i++) {
                // Offset split children slightly in progress so they don't overlap perfectly
                const progressOffset = i * 15;
                const child = new Enemy(childType, this.waveNumber, enemy.totalProgress - progressOffset, enemy.lane as 'A' | 'B');
                this.enemies.push(child);
                this.game.enemyLayer.addChild(child.container);
            }
        }
        this.removeEnemy(index);
    }

    private handleWaveEnd() {
        this.hasProcessedEnd = true;
        this.isWaveActive = false;
        const state = GameStateManager.getInstance();
        
        // 1. CHECK VICTORY MILESTONE (Wave 50)
        if (this.waveNumber >= 50) {
            this.game.isPaused = true;
            if (this.onWaveEnd) this.onWaveEnd();
            return;
        }

        state.phase = 'SUMMARY';
        const fieldValuation = this.game.towerManager.getTotalFieldValuation();
        state.calculateEndOfWave(fieldValuation);
        this.game.towerManager.clearTowers();
        
        if (this.onWaveEnd) this.onWaveEnd();
        
        if (this.waveNumber > 1) { 
            this.isSummaryActive = true;
        } else {
            // Tutorial finished, start Level 2 (The Real Swarm begins)
            state.currentWave = 2;
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
        this.enemiesToSpawn.forEach(group => {
            counts.set(group.type, (counts.get(group.type) || 0) + group.count);
        });
        this.upcomingEnemies = Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
    }
}
