export enum EnemyType { GLIDER, STRIDER, BEHEMOTH, FRACTAL, PHANTOM, WORM, BOSS }

export interface EnemyConfig {
    hp: number;
    speed: number;
    color: number;
    name: string;
    threat: number; 
    reward: number; 
}

export const VISUAL_REGISTRY: Record<EnemyType, EnemyConfig> = {
    [EnemyType.GLIDER]: {
        hp: 20,
        speed: 1.8,
        color: 0x00ffff,
        name: "GLIDER",
        threat: 10,
        reward: 15 
    },
    [EnemyType.STRIDER]: {
        hp: 50,
        speed: 1.3,
        color: 0x00ff66,
        name: "STRIDER",
        threat: 25,
        reward: 20
    },
    [EnemyType.BEHEMOTH]: {
        hp: 250,
        speed: 0.6,
        color: 0xff3300,
        name: "BEHEMOTH",
        threat: 100,
        reward: 75
    },
    [EnemyType.FRACTAL]: {
        hp: 80,
        speed: 1.5,
        color: 0xff00ff,
        name: "FRACTAL",
        threat: 40,
        reward: 35
    },
    [EnemyType.PHANTOM]: {
        hp: 40,
        speed: 2.4,
        color: 0x888888,
        name: "PHANTOM",
        threat: 35,
        reward: 30
    },
    [EnemyType.WORM]: {
        hp: 120,
        speed: 1.0,
        color: 0xffff00,
        name: "WORM",
        threat: 60,
        reward: 50
    },
    [EnemyType.BOSS]: {
        hp: 2500,
        speed: 0.4,
        color: 0xffffff,
        name: "KERNEL_CRUSHER",
        threat: 1000,
        reward: 500
    }
};

export const COLORS = {
    CYAN: 0x00ffff,
    RED: 0xff0000,
    BACKGROUND: 0x0a0a0a
};
