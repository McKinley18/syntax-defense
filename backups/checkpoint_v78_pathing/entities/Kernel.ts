import * as PIXI from 'pixi.js';
import { StateManager } from '../core/StateManager';

export class Kernel {
    public container: PIXI.Container;
    private core: PIXI.Graphics;
    private rings: PIXI.Graphics[] = [];
    private glow: PIXI.Graphics;

    constructor() {
        this.container = new PIXI.Container();
        
        // 1. OUTER BLOOM
        this.glow = new PIXI.Graphics();
        this.glow.circle(0, 0, 60).fill({ color: 0x00ffff, alpha: 0.15 });
        this.container.addChild(this.glow);

        // 2. 3D AXIAL RINGS
        for (let i = 0; i < 3; i++) {
            const ring = new PIXI.Graphics();
            ring.circle(0, 0, 30 + i * 8).stroke({ width: 2, color: 0x00ffff, alpha: 0.4 - i * 0.1 });
            this.rings.push(ring);
            this.container.addChild(ring);
        }

        // 3. CORE HULL
        this.core = new PIXI.Graphics();
        this.core.circle(0, 0, 20).fill(0x0a0a0a).stroke({ width: 3, color: 0x00ffff });
        this.core.circle(0, 0, 10).fill(0xffffff); // Internal Spark
        this.container.addChild(this.core);
    }

    public update(dt: number) {
        const integrity = StateManager.instance.integrity;
        const isCritical = integrity <= 6;
        const color = isCritical ? 0xff0000 : 0x00ffff;

        // ANIMATION: Axial Tumbling
        this.rings.forEach((ring, i) => {
            ring.rotation += (0.02 + i * 0.01) * dt;
            ring.skew.x = Math.sin(Date.now() * 0.001 + i) * 0.5;
            ring.scale.y = Math.cos(Date.now() * 0.0015 + i) * 0.8;
            
            // Status Color Sync
            ring.tint = color;
        });

        // Core Pulse
        const s = 1.0 + Math.sin(Date.now() * 0.005) * 0.1;
        this.core.scale.set(s);
        this.core.tint = color;
        this.glow.tint = color;
        this.glow.alpha = 0.1 + Math.sin(Date.now() * 0.003) * 0.05;
    }

    public setPosition(x: number, y: number) {
        this.container.position.set(x, y);
    }
}
