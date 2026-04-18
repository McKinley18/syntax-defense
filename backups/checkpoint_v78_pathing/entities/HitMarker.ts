import * as PIXI from 'pixi.js';

export class HitMarker {
    public container: PIXI.Container;
    private text: PIXI.Text;
    private life: number = 60; // Frames

    private static pool: HitMarker[] = [];

    public static create(x: number, y: number, amount: number): HitMarker {
        let marker = this.pool.pop();
        if (!marker) {
            marker = new HitMarker();
        }
        marker.reset(x, y, amount);
        return marker;
    }

    public static release(marker: HitMarker) {
        HitMarker.pool.push(marker);
    }

    private constructor() {
        this.container = new PIXI.Container();
        this.text = new PIXI.Text({
            text: "",
            style: {
                fontFamily: 'Courier New',
                fontSize: 14,
                fill: 0xff3300,
                fontWeight: '900',
                stroke: { color: 0x000000, width: 2 }
            }
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);
    }

    private reset(x: number, y: number, amount: number) {
        this.container.x = x;
        this.container.y = y;
        this.text.text = `-${Math.floor(amount)}`;
        this.life = 60;
        this.container.alpha = 1;
    }

    public update(delta: number): boolean {
        this.life -= delta;
        this.container.y -= 0.5 * delta;
        this.container.alpha = this.life / 60;
        return this.life > 0;
    }
}
