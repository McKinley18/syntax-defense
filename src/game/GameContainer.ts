import * as PIXI from 'pixi.js';
import { PathManager } from './systems/PathManager';
import { WaveManager } from './systems/WaveManager';
import { TowerManager } from './systems/TowerManager';
import { ParticleManager } from './systems/ParticleManager';
import { MapManager } from './systems/MapManager';
import { InputHandler } from './systems/InputHandler';
import { TextureGenerator } from './utils/TextureGenerator';
import { Kernel } from './entities/Kernel';

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
    public isPaused: boolean = false; // GLOBAL PAUSE STATE

    public static instance: GameContainer;

    private constructor() {
        this.app = new PIXI.Application();
        this.viewport = new PIXI.Container();
        this.groundLayer = new PIXI.Container();
        this.pathLayer = new PIXI.Container();
        this.towerLayer = new PIXI.Container();
        this.enemyLayer = new PIXI.Container();
        this.effectLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();
    }

    public static async getInstance(): Promise<GameContainer> {
        if (!GameContainer.instance) {
            GameContainer.instance = new GameContainer();
            await GameContainer.instance.init();
        }
        return GameContainer.instance;
    }

    private async init() {
        if (this.app.renderer) return;

        await this.app.init({
            background: '#0a0a0a',
            resizeTo: window,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        const tg = TextureGenerator.getInstance();
        tg.generate(this.app);

        const container = document.getElementById('game-container') || document.body;
        container.appendChild(this.app.canvas);

        this.app.stage.addChild(this.viewport);
        this.viewport.addChild(this.groundLayer, this.pathLayer, this.towerLayer, this.enemyLayer, this.effectLayer);
        this.app.stage.addChild(this.uiLayer);

        this.particleManager = new ParticleManager(this);
        this.pathManager = new PathManager();
        this.mapManager = new MapManager(this);
        this.towerManager = new TowerManager(this);
        this.waveManager = new WaveManager(this);
        this.inputHandler = new InputHandler(this);

        this.mapManager.setPathFromCells(this.pathManager.pathCells);
        this.kernel = new Kernel(this.pathManager.endNodePos.x, this.pathManager.endNodePos.y);
        
        window.addEventListener('resize', () => {
            if (this.app.renderer) {
                this.app.renderer.resize(window.innerWidth, window.innerHeight);
                if (this.mapManager) this.mapManager.render();
            }
        });
        
        this.app.ticker.add((ticker) => this.update(ticker));
    }

    public update(ticker: PIXI.Ticker) {
        if (this.isPaused) return; // FREEZE ENGINE
        
        const delta = ticker.deltaTime;
        this.waveManager.update(delta);
        this.towerManager.update(delta);
        this.particleManager.update(delta);
        if (this.mapManager) this.mapManager.update(delta);
        if (this.kernel) this.kernel.update(delta);
    }
}
