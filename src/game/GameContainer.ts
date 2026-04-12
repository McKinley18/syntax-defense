import * as PIXI from 'pixi.js';
import { PathManager } from './systems/PathManager';
import { WaveManager } from './systems/WaveManager';
import { TowerManager } from './systems/TowerManager';
import { ParticleManager } from './systems/ParticleManager';
import { MapManager } from './systems/MapManager';
import { InputHandler } from './systems/InputHandler';
import { TextureGenerator } from './utils/TextureGenerator';
import { Kernel } from './entities/Kernel';
import { GameStateManager } from './systems/GameStateManager';
import { AudioManager } from './systems/AudioManager';
import { MusicManager } from './systems/MusicManager';

export class GameContainer {
    public app: PIXI.Application;
    public viewport: PIXI.Container;
    
    public groundLayer: PIXI.Container;
    public pathLayer: PIXI.Container;
    public towerLayer: PIXI.Container;
    public enemyLayer: PIXI.Container;
    public effectLayer: PIXI.Container;
    public uiLayer: PIXI.Container;

    public pathManager!: PathManager;
    public waveManager!: WaveManager;
    public towerManager!: TowerManager;
    public particleManager!: ParticleManager;
    public mapManager!: MapManager;
    public inputHandler!: InputHandler;
    public kernel!: Kernel;
    public isPaused: boolean = false; 
    public isFastForward: boolean = false; 
    public isTutorialActive: boolean = false;
    public tutorialStep: number = 0;

    private colorFilter: PIXI.ColorMatrixFilter;
    private breachTimer: number = 0;
    private purgeTimer: number = 0;
    private baseShake: { x: number, y: number } = { x: 0, y: 0 };

    public static instance: GameContainer | null = null;
    private static initPromise: Promise<GameContainer> | null = null;

    private constructor() {
        this.app = new PIXI.Application();
        this.viewport = new PIXI.Container();
        this.groundLayer = new PIXI.Container();
        this.pathLayer = new PIXI.Container();
        this.towerLayer = new PIXI.Container();
        this.enemyLayer = new PIXI.Container();
        this.effectLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();
        this.colorFilter = new PIXI.ColorMatrixFilter();
    }

    public static async getInstance(): Promise<GameContainer> {
        if (this.instance && this.instance.app && this.instance.app.renderer) return this.instance;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            const instance = new GameContainer();
            await instance.init();
            if (instance.app && instance.app.renderer) {
                GameContainer.instance = instance;
            }
            return instance;
        })();

        return this.initPromise;
    }

    private async init() {
        if (this.app.renderer) return;

        // NUCLEAR RESET: Kill all stale state
        GameStateManager.getInstance().hardReset();
        TextureGenerator.getInstance().enemyTextures.clear(); // Kill cached shapes

        await this.app.init({
            resizeTo: window,
            antialias: true,
            roundPixels: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0 
        });

        const tg = TextureGenerator.getInstance();
        tg.generate(this.app);

        const container = document.getElementById('game-container') || document.body;
        if (container && !container.contains(this.app.canvas)) {
            container.appendChild(this.app.canvas);
        }

        this.viewport.filters = [this.colorFilter];

        this.app.stage.addChild(this.viewport);
        this.viewport.addChild(this.groundLayer, this.pathLayer, this.towerLayer, this.enemyLayer, this.effectLayer);
        this.app.stage.addChild(this.uiLayer);

        this.particleManager = new ParticleManager(this);
        this.mapManager = new MapManager(this);
        this.pathManager = new PathManager();
        this.towerManager = new TowerManager(this);
        this.waveManager = new WaveManager(this);
        this.inputHandler = new InputHandler();

        this.kernel = new Kernel(this, 0, 0);
        this.towerLayer.addChild(this.kernel.container);

        window.addEventListener('resize', this.handleResize);
        this.app.ticker.add(this.update, this);
    }

    private handleResize = () => {
        if (this.app && this.app.renderer) {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            if (this.mapManager) this.mapManager.render();
        }
    };

    public update(ticker: PIXI.Ticker) {
        if (this.isPaused || !this.app || !this.app.renderer) return;

        try {
            if (this.breachTimer > 0) {
                this.breachTimer -= ticker.deltaTime;
                this.colorFilter.reset();
                this.colorFilter.colorTone(0xff0000, 0.6, 0xffffff, 0, false); 
                this.viewport.x = this.baseShake.x + (Math.random() * 10 - 5);
                this.viewport.y = this.baseShake.y + (Math.random() * 10 - 5);
            } else if (this.purgeTimer > 0) {
                this.purgeTimer -= ticker.deltaTime;
                this.colorFilter.reset();
                this.colorFilter.brightness(1.2 + (this.purgeTimer / 30), true); 
                this.viewport.x = this.baseShake.x;
                this.viewport.y = this.baseShake.y;
            } else {
                this.colorFilter.reset();
                this.viewport.x = this.baseShake.x;
                this.viewport.y = this.baseShake.y;
            }

            if (ticker.FPS < 45) {
                if (this.particleManager) this.particleManager.isThrottled = true;
            } else if (ticker.FPS > 55) {
                if (this.particleManager) this.particleManager.isThrottled = false;
            }

            let delta = ticker.deltaTime;
            if (this.isFastForward) delta *= 2;

            const enemies = this.waveManager ? this.waveManager.enemies : [];
            
            // ADAPTIVE AUDIO
            const stress = Math.min(1.0, enemies.length / 30); 
            MusicManager.getInstance().setSystemStress(stress);
            AudioManager.getInstance().updateHum(GameStateManager.getInstance().integrity);

            if (this.waveManager) this.waveManager.update(delta);
            if (this.towerManager) this.towerManager.update(delta);
            if (this.particleManager) this.particleManager.update(delta);
            if (this.kernel) this.kernel.update(delta, this.waveManager?.enemies || []);
            if (this.mapManager) this.mapManager.update();
            if (this.kernel) this.kernel.update(delta, enemies);
        } catch (e) {
            // Silently skip update if middle of destruction
        }
    }

    public destroy() {
        window.removeEventListener('resize', this.handleResize);
        
        try {
            if (this.app) {
                this.app.ticker.stop();
                this.app.ticker.remove(this.update, this);
                this.app.stop();
            }

            if (this.viewport) {
                this.viewport.filters = null;
            }
            if (this.app && this.app.stage) {
                this.app.stage.filters = null;
                this.app.stage.removeChildren();
            }

            const app = this.app;
            (this as any).app = null;
            (this as any).waveManager = null;
            (this as any).towerManager = null;
            (this as any).particleManager = null;
            (this as any).mapManager = null;
            (this as any).viewport = null;
            
            if (app) {
                app.destroy(true, { children: true, texture: true });
            }
        } catch (e) {
            console.warn("PIXI Cleanup Warning:", e);
        }
        
        GameContainer.instance = null; 
        (GameContainer as any).initPromise = null; 
    }

    public triggerBreachEffect() {
        this.breachTimer = 20; 
    }

    public triggerPurgeEffect() {
        this.purgeTimer = 10; 
    }
}
