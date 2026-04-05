import * as PIXI from 'pixi.js';

export class HitMarker {
    public container: PIXI.Container;
    private text: PIXI.Text;
    private life: number = 60; // Frames

    constructor(x: number, y: number, amount: number) {
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        this.text = new PIXI.Text({
            text: `-${Math.floor(amount)}`,
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

    public update(delta: number): boolean {
        this.life -= delta;
        this.container.y -= 0.5 * delta;
        this.container.alpha = this.life / 60;
        return this.life > 0;
    }
}
