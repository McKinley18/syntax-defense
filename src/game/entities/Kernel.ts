import * as PIXI from 'pixi.js';
import { GameContainer } from '../GameContainer';
import { GameStateManager } from '../systems/GameStateManager';
import { Enemy } from './Enemy';

export class Kernel {
    public container: PIXI.Container;
    private core: PIXI.Graphics;
    private ring1: PIXI.Graphics;
    private ring2: PIXI.Graphics;
    private flashTimer: number = 0;
    private overdriveTimer: number = 0;

    constructor(x: number, y: number) {
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        this.ring2 = new PIXI.Graphics();
        this.ring2.circle(0, 0, 30);
        this.ring2.stroke({ width: 1, color: 0x0066ff, alpha: 0.3 });
        this.container.addChild(this.ring2);

        this.ring1 = new PIXI.Graphics();
        this.ring1.circle(0, 0, 20);
        this.ring1.stroke({ width: 2, color: 0x00ffff, alpha: 0.5 });
        for(let i=0; i<4; i++) {
            const angle = (i * Math.PI) / 2;
            this.ring1.moveTo(Math.cos(angle)*18, Math.sin(angle)*18);
            this.ring1.lineTo(Math.cos(angle)*22, Math.sin(angle)*22);
            this.ring1.stroke({ width: 3, color: 0x00ffff });
        }
        this.container.addChild(this.ring1);

        this.core = new PIXI.Graphics();
        this.core.poly([-12, 0, -6, -10, 6, -10, 12, 0, 6, 10, -6, 10]);
        this.core.fill(0x00ffcc);
        this.core.stroke({ width: 2, color: 0xffffff });
        this.container.addChild(this.core);

        GameContainer.instance!.effectLayer.addChild(this.container);
    }

    public triggerFlash() {
        this.flashTimer = 20;
    }

    public update(delta: number, enemies: Enemy[]) {
        const integrity = GameStateManager.getInstance().integrity;
        
        const rotSpeed = 0.02 + (20 - integrity) * 0.005;
        this.ring1.rotation += rotSpeed * delta;
        this.ring2.rotation -= (rotSpeed * 0.5) * delta;

        const pulse = 0.8 + Math.sin(Date.now() * 0.005) * 0.2;
        this.core.scale.set(pulse);
        this.core.alpha = 0.6 + (integrity / 20) * 0.4;

        if (this.flashTimer > 0) {
            this.flashTimer -= delta;
            this.core.tint = 0xff0000;
        } else {
            this.core.tint = 0xffffff;
        }

        // KERNEL OVERDRIVE: Auto-defense when low integrity
        if (integrity < 5) {
            this.overdriveTimer -= delta;
            if (this.overdriveTimer <= 0) {
                this.fireOverdriveShockwave(enemies);
                this.overdriveTimer = 480; // 8 seconds at 60fps
            }
        }
    }

    private fireOverdriveShockwave(enemies: Enemy[]) {
        const shockwave = new PIXI.Graphics();
        shockwave.circle(0, 0, 10);
        shockwave.stroke({ width: 4, color: 0x00ffff, alpha: 0.8 });
        this.container.addChild(shockwave);

        // Damage enemies in range
        enemies.forEach(e => {
            const dx = e.container.x - this.container.x;
            const dy = e.container.y - this.container.y;
            if (dx*dx + dy*dy < 15000) { // ~120px range
                e.takeDamage(100);
            }
        });

        // Animation
        let size = 10;
        const anim = () => {
            size += 5;
            shockwave.clear();
            shockwave.circle(0, 0, size);
            shockwave.stroke({ width: 4, color: 0x00ffff, alpha: 1 - (size/150) });
            if (size < 150) requestAnimationFrame(anim);
            else shockwave.destroy();
        };
        anim();
    }

    public destroy() {
        this.container.destroy({ children: true });
    }
}
