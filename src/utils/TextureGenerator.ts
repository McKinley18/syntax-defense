import * as PIXI from 'pixi.js';
import { EnemyType, VISUAL_REGISTRY } from '../VisualRegistry';
import { TILE_SIZE } from '../systems/MapManager';
import { TowerType, TOWER_CONFIGS } from '../entities/Tower';

export class TextureGenerator {
    private static instance: TextureGenerator;
    public basePlateTexture!: PIXI.Texture;
    public enemyTextures: Map<EnemyType, PIXI.Texture> = new Map();
    public towerChassisTextures: Map<TowerType, PIXI.Texture> = new Map();

    private constructor() {}

    public static getInstance(): TextureGenerator {
        if (!TextureGenerator.instance) {
            TextureGenerator.instance = new TextureGenerator();
        }
        return TextureGenerator.instance;
    }

    public generate(app: PIXI.Application) {
        // --- 1. REINFORCED BASE PLATE ---
        const bg = new PIXI.Graphics();
        const s = 18; 
        bg.poly([
            {x: -s, y: -s*0.4}, {x: -s*0.4, y: -s},
            {x: s*0.4, y: -s}, {x: s, y: -s*0.4},
            {x: s, y: s*0.4}, {x: s*0.4, y: s},
            {x: -s*0.4, y: s}, {x: -s, y: s*0.4}
        ]).fill({ color: 0x0a0a0a }).stroke({ width: 2, color: 0x333333 });
        bg.rect(-s*0.5, -s*0.5, s, s).stroke({ width: 1, color: 0x1a1a1a });
        this.basePlateTexture = app.renderer.generateTexture(bg);

        // --- 2. UNIQUE CHASSIS ASSEMBLIES ---
        const towerTypes = [
            TowerType.PULSE_NODE, TowerType.ROCKET_BATTERY, TowerType.STASIS_FIELD,
            TowerType.PRISM_BEAM, TowerType.RAIL_CANNON, TowerType.VOID_PROJECTOR
        ];

        towerTypes.forEach(type => {
            const config = TOWER_CONFIGS[type];
            const g = new PIXI.Graphics();
            const color = config.color;
            const cs = 16;

            switch(type) {
                case TowerType.PULSE_NODE:
                    for(let x of [-6, 6]) {
                        g.rect(x-2, -cs*1.8, 4, cs*1.6).fill(0x1a1a1a).stroke({ width: 1.5, color });
                        g.rect(x-3, -cs*2.0, 6, 3).fill(color);
                    }
                    g.circle(0, 0, 6).fill(0x111111).stroke({ width: 2, color: 0x444444 });
                    break;
                case TowerType.ROCKET_BATTERY:
                    // Quad Rocket Pod
                    g.rect(-10, -12, 20, 14).fill(0x1a1a1a).stroke({ width: 2, color: 0x444444 });
                    for(let x of [-6, -2, 2, 6]) {
                        g.circle(x, -8, 2).fill(color);
                    }
                    g.rect(-4, -4, 8, 8).fill(0x222222).stroke({ width: 1, color });
                    break;
                case TowerType.STASIS_FIELD:
                    // Crystalline Dish
                    g.circle(0, 0, cs*1.2).stroke({ width: 2, color, alpha: 0.6 });
                    for(let i=0; i<6; i++) {
                        const rot = (Math.PI/3) * i;
                        g.moveTo(0, 0).lineTo(Math.cos(rot)*cs, Math.sin(rot)*cs).stroke({ width: 1.5, color });
                    }
                    g.circle(0, 0, 5).fill(0xffffff).stroke({ width: 1, color });
                    break;
                case TowerType.PRISM_BEAM:
                    g.poly([{x:0, y:-cs*2.2}, {x:12, y:0}, {x:-12, y:0}]).fill(0x1a1a1a).stroke({ width: 2, color });
                    g.circle(0, -cs*1.2, 6).fill({ color, alpha: 0.5 }).stroke({ width: 1, color: 0xffffff });
                    break;
                case TowerType.RAIL_CANNON:
                    for(let x of [-4, 4]) {
                        g.rect(x-1, -cs*2.8, 2, cs*2.6).fill(0x050505).stroke({ width: 2, color });
                    }
                    g.rect(-8, -4, 16, 8).fill(0x111111).stroke({ width: 1, color: 0x444444 });
                    break;
                case TowerType.VOID_PROJECTOR:
                    for(let rot of [Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4]) {
                        g.rect(Math.cos(rot)*10 - 2, Math.sin(rot)*10 - 2, 4, 12).fill(0x222222).stroke({ width: 1, color });
                    }
                    g.circle(0, 0, 8).fill(0x000000).stroke({ width: 2, color });
                    g.circle(0, 0, 4).fill(color);
                    break;
            }
            this.towerChassisTextures.set(type, app.renderer.generateTexture(g));
        });

        // --- 3. ENEMY TEXTURES ---
        const enemyTypes = [
            EnemyType.GLIDER, EnemyType.STRIDER, EnemyType.BEHEMOTH, 
            EnemyType.FRACTAL, EnemyType.PHANTOM, EnemyType.WORM, EnemyType.BOSS
        ];

        enemyTypes.forEach(type => {
            const config = VISUAL_REGISTRY[type];
            const eg = new PIXI.Graphics();
            const es = 12;
            const color = config.color;

            switch(type) {
                case EnemyType.GLIDER:
                    eg.poly([{x:0, y:-es*1.4}, {x:es, y:es}, {x:0, y:es*0.4}, {x:-es, y:es}]).fill({ color, alpha: 0.8 }).stroke({ width: 2, color: 0xffffff });
                    break;
                case EnemyType.STRIDER:
                    eg.poly([
                        {x:-es, y:-es*0.5}, {x:0, y:-es}, {x:es, y:-es*0.5},
                        {x:es, y:es*0.5}, {x:0, y:es}, {x:-es, y:es*0.5}
                    ]).fill({ color, alpha: 0.8 }).stroke({ width: 2, color: 0xffffff });
                    eg.circle(0, 0, es*0.4).fill(0xffffff);
                    break;
                case EnemyType.BEHEMOTH:
                    eg.rect(-es, -es, es*2, es*2).fill({ color, alpha: 0.9 }).stroke({ width: 3, color: 0xffffff });
                    eg.rect(-es*0.5, -es*0.5, es, es).stroke({ width: 1, color: 0x000000 });
                    break;
                case EnemyType.FRACTAL:
                    for(let i=0; i<4; i++) {
                        const rot = (Math.PI/2) * i;
                        eg.rect(Math.cos(rot)*es - 2, Math.sin(rot)*es - 2, 4, 14).fill(color);
                    }
                    eg.poly([{x:-es, y:0}, {x:0, y:-es}, {x:es, y:0}, {x:0, y:es}]).fill(0xffffff);
                    break;
                case EnemyType.PHANTOM:
                    eg.circle(0, 0, es).stroke({ width: 2, color, alpha: 0.4 });
                    eg.circle(0, 0, es*0.6).stroke({ width: 2, color, alpha: 0.7 });
                    eg.circle(0, 0, 3).fill(0xffffff);
                    break;
                case EnemyType.WORM:
                    for(let x of [-es, 0, es]) {
                        eg.circle(x, 0, es*0.6).fill(color).stroke({ width: 1, color: 0xffffff });
                    }
                    break;
                case EnemyType.BOSS:
                    const bs = es * 2;
                    eg.poly([
                        {x:-bs, y:-bs*0.5}, {x:-bs*0.5, y:-bs}, {x:bs*0.5, y:-bs}, {x:bs, y:-bs*0.5},
                        {x:bs, y:bs*0.5}, {x:bs*0.5, y:bs}, {x:-bs*0.5, y:bs}, {x:-bs, y:bs*0.5}
                    ]).fill({ color: 0xff3300 }).stroke({ width: 4, color: 0xffffff });
                    eg.circle(0, 0, bs*0.6).fill(0x000000).stroke({ width: 2, color: 0xffffff });
                    eg.circle(0, 0, bs*0.3).fill(0xffffff);
                    break;
                default:
                    eg.circle(0, 0, es).fill(color).stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
            }
            this.enemyTextures.set(type, app.renderer.generateTexture(eg));
        });
    }

    public getTowerBaseTexture(): PIXI.Texture { return this.basePlateTexture; }
    public getTowerChassisTexture(type: TowerType): PIXI.Texture { return this.towerChassisTextures.get(type)!; }
    public getEnemyTexture(type: EnemyType): PIXI.Texture { return this.enemyTextures.get(type)!; }
    
    public getGridTexture(app: PIXI.Application): PIXI.Texture {
        const g = new PIXI.Graphics();
        g.rect(0, 0, TILE_SIZE, TILE_SIZE).fill({ color: 0x000000, alpha: 0 });
        g.moveTo(0, 0).lineTo(TILE_SIZE, 0).moveTo(0, 0).lineTo(0, TILE_SIZE);
        g.stroke({ width: 1.5, color: 0x00ffff, alpha: 0.3 }); 
        return app.renderer.generateTexture(g);
    }
}
