import * as PIXI from 'pixi.js';
import { StateManager } from '../core/StateManager';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TextureGenerator } from '../utils/TextureGenerator';
import { PathManager, GridCoord } from '../systems/PathManager';

/**
 * ENEMY: Atomic Traversal Unit (v78.0)
 * THE DEFINITIVE FIX: Implements "Mark Time" Wait-Point protocol.
 * Synchronizes inner-pivots with outer-swings by burning distance on 0-dist waypoints.
 */
export class Enemy {
    public container: PIXI.Container;
    public sprite: PIXI.Sprite;
    public type: EnemyType;
    public hp: number;
    public maxHp: number;
    public speed: number;
    
    public cells: GridCoord[] = [];
    public currentCellIndex: number = 0;
    public laneID: 0 | 1;
    
    public isDead: boolean = false;
    public isFinished: boolean = false;
    public velocity: { x: number, y: number } = { x: 0, y: 0 };
    
    private readonly VIRUS_SIZE = 16; 
    private healthBar: PIXI.Graphics;
    
    // The exact distance (pixels) remaining to wait at the current pivot.
    private waitDist: number = 0;

    constructor(type: EnemyType, pathManager: PathManager, laneID: number, waveMult: number = 1) {
        this.type = type;
        this.laneID = laneID as 0 | 1;
        this.cells = (this.laneID === 0) ? pathManager.lane0 : pathManager.lane1;
        
        const config = VISUAL_REGISTRY[type];
        this.hp = config.hp * waveMult;
        this.maxHp = this.hp;
        this.speed = config.speed;

        this.container = new PIXI.Container();
        this.sprite = new PIXI.Sprite(TextureGenerator.getInstance().getEnemyTexture(type));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(this.VIRUS_SIZE / 24);

        this.container.addChild(this.sprite);
        this.healthBar = new PIXI.Graphics();
        this.healthBar.position.set(0, -12);
        this.container.addChild(this.healthBar);
        this.updateHealthBar();
        
        if (this.cells.length > 0) {
            const first = this.cells[0];
            this.container.position.set((first.x + 0.5) * 40, (first.y + 0.5) * 40);
            this.updateRotation();
        }
    }

    public update(dt: number) {
        if (this.isDead || this.isFinished || StateManager.instance.isPaused) return;

        let moveDist = this.speed * dt * StateManager.instance.gameSpeed;

        // 1. Process active wait/pivot
        if (this.waitDist > 0) {
            if (moveDist >= this.waitDist) {
                moveDist -= this.waitDist;
                this.waitDist = 0;
                this.currentCellIndex++;
                this.updateRotation();
            } else {
                this.waitDist -= moveDist;
                moveDist = 0;
            }
        }
        
        // 2. Execute physical traversal
        while (moveDist > 0) {
            const nextIdx = this.currentCellIndex + 1;
            if (nextIdx >= this.cells.length) {
                this.isFinished = true;
                break;
            }

            const next = this.cells[nextIdx];
            const targetX = (next.x + 0.5) * 40;
            const targetY = (next.y + 0.5) * 40;
            
            const dx = targetX - this.container.x;
            const dy = targetY - this.container.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Wait-Point Detection (Pivot)
            if (dist < 0.1) {
                this.waitDist = 40; // Wait for the equivalent of 1 full tile
                if (moveDist >= this.waitDist) {
                    moveDist -= this.waitDist;
                    this.waitDist = 0;
                    this.currentCellIndex++;
                    this.updateRotation();
                    continue;
                } else {
                    this.waitDist -= moveDist;
                    moveDist = 0;
                    break;
                }
            }

            // Normal Traversal
            if (moveDist >= dist) {
                this.container.position.set(targetX, targetY);
                moveDist -= dist;
                this.currentCellIndex++;
                this.updateRotation();
            } else {
                const ratio = moveDist / dist;
                this.container.x += dx * ratio;
                this.container.y += dy * ratio;
                this.velocity = { x: (dx / dist) * this.speed, y: (dy / dist) * this.speed };
                moveDist = 0; 
            }
        }

        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.04;
        this.sprite.scale.set((this.VIRUS_SIZE / 24) * pulse);
    }

    private updateRotation() {
        for (let i = this.currentCellIndex + 1; i < this.cells.length; i++) {
            const next = this.cells[i];
            const tx = (next.x + 0.5) * 40;
            const ty = (next.y + 0.5) * 40;
            const dx = tx - this.container.x;
            const dy = ty - this.container.y;
            if (Math.sqrt(dx*dx + dy*dy) > 2) {
                this.container.rotation = Math.atan2(dy, dx) + Math.PI/2;
                break;
            }
        }
    }

    private updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.rect(-8, 0, 16, 2.5).fill({ color: 0x333333, alpha: 0.5 });
        const pct = Math.max(0, this.hp / this.maxHp);
        const color = pct < 0.3 ? 0xff3300 : 0x00ffff;
        this.healthBar.rect(-8, 0, 16 * pct, 2.5).fill({ color, alpha: 0.8 });
    }

    public takeDamage(amount: number) {
        this.hp -= amount;
        this.updateHealthBar();
        if (this.hp <= 0) this.isDead = true;
    }
}
