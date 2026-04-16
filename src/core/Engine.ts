import * as PIXI from 'pixi.js';

export class Engine {
    private static _instance: Engine | null = null;
    public app: PIXI.Application;
    private _initialized: boolean = false;

    // HARDENED 40x14 MATHEMATICAL WORKSPACE
    public readonly INTERNAL_WIDTH = 1600;  // 40 tiles * 40px
    public readonly INTERNAL_HEIGHT = 560; // 14 tiles * 40px
    public readonly TILE_SIZE = 40;

    private constructor() {
        this.app = new PIXI.Application();
    }

    public static get instance(): Engine {
        if (!this._instance) {
            this._instance = new Engine();
        }
        return this._instance;
    }

    public async init(container: HTMLElement) {
        if (this._initialized) {
            if (this.app.canvas.parentElement !== container) {
                container.appendChild(this.app.canvas);
            }
            return;
        }

        try {
            await this.app.init({
                resizeTo: window,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                backgroundColor: 0x050505,
                antialias: true
            });

            container.appendChild(this.app.canvas);

            const handleResize = () => {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                this.app.renderer.resize(vw, vh);

                // Scaling Law: Account for Grid + HUD Space
                const scale = vh / (this.INTERNAL_HEIGHT + 160);
                this.app.stage.scale.set(scale);
                
                // QUANTUM SNAP: Integer Tile Alignment
                const rawX = (vw - (this.INTERNAL_WIDTH * scale)) / 2;
                const sTile = this.TILE_SIZE * scale;
                this.app.stage.x = Math.floor(rawX / sTile) * sTile;
                this.app.stage.y = 0;
            };

            window.addEventListener('resize', handleResize);
            handleResize();
            this._initialized = true;
        } catch (e) {
            console.error("[Engine] INIT_ERROR", e);
        }
    }

    public screenToLogical(sX: number, sY: number): { x: number, y: number } {
        const sc = this.app.stage.scale.x;
        return { x: (sX - this.app.stage.x) / sc, y: (sY - this.app.stage.y) / sc };
    }
}
