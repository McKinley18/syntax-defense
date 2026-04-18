import * as PIXI from 'pixi.js';

/**
 * CORE ENGINE: Full-Surface Stretch Protocol
 * Ensures the 40x18 grid fills 100% of the screen area with mathematically equal segments.
 */
export class Engine {
    private static _instance: Engine | null = null;
    public app: PIXI.Application;
    private _initialized: boolean = false;
    private resizeListeners: (() => void)[] = [];

    private constructor() {
        this.app = new PIXI.Application();
    }

    public static get instance(): Engine {
        if (!Engine._instance) Engine._instance = new Engine();
        return Engine._instance;
    }

    public async init(container: HTMLElement) {
        if (this._initialized) {
            if (this.app.canvas.parentElement !== container) {
                container.appendChild(this.app.canvas);
                this.resize();
            }
            return;
        }

        try {
            await this.app.init({
                background: '#000',
                resizeTo: container,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            container.appendChild(this.app.canvas);
            
            this.app.stage.alpha = 1;
            this.app.stage.visible = true;
            this.app.stage.eventMode = 'static';

            this._initialized = true;
            this.resize();
            window.addEventListener('resize', () => this.resize());
        } catch (e) {
            console.error("PIXI_INIT_ERROR", e);
        }
    }

    public resize() {
        if (!this._initialized || !this.app.canvas.parentElement) return;

        const parent = this.app.canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;

        // LAW: THE 1600x720 LOGICAL MATRIX
        const logicalW = 1600;
        const logicalH = 720;

        // LAW: FULL-SURFACE STRETCH
        // We calculate unique scales for X and Y to force the grid to fill the entire container.
        const scaleX = width / logicalW;
        const scaleY = height / logicalH;
        
        // Apply independent scaling to remove all gaps
        this.app.stage.scale.x = scaleX;
        this.app.stage.scale.y = scaleY;

        // LOCK TO EDGES
        this.app.stage.x = 0;
        this.app.stage.y = 0;

        this.resizeListeners.forEach(l => l());
    }

    public onResize(cb: () => void) {
        this.resizeListeners.push(cb);
    }
}
