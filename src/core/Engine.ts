import * as PIXI from 'pixi.js';

export class Engine {
    private static _instance: Engine | null = null;
    public app: PIXI.Application;
    private _initialized: boolean = false;
    private resizeListeners: (() => void)[] = [];

    // HARDENED 40x18 MATHEMATICAL WORKSPACE (1600x720)
    public readonly INTERNAL_WIDTH = 1600;  
    public readonly INTERNAL_HEIGHT = 720; 
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

    public onResize(cb: () => void) {
        this.resizeListeners.push(cb);
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

                // LAW: Vertical scaling fills the absolute viewport height.
                const scale = vh / this.INTERNAL_HEIGHT;
                this.app.stage.scale.set(scale);
                
                // QUANTUM TILE SNAP
                // We calculate the center, but snap X to ensure NO partial tiles.
                const scaledTile = this.TILE_SIZE * scale;
                const idealX = (vw - (this.INTERNAL_WIDTH * scale)) / 2;
                
                // Absolute Snapping: stage.x must be a multiple of scaledTile
                this.app.stage.x = Math.floor(idealX / scaledTile) * scaledTile;
                
                // Anchor to absolute top to maximize vertical space
                this.app.stage.y = 0; 

                this.resizeListeners.forEach(cb => cb());
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
