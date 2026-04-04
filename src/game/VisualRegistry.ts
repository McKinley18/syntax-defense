export const EnemyType = {
    GLIDER: 0,
    STRIDER: 1,
    BEHEMOTH: 2,
    FRACTAL: 3
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];

export interface VisualConfig {
    name: string;
    shape: 'circle' | 'triangle' | 'square' | 'hexagon';
    color: number;
    colorHex: string;
    priority: string;
    baseHp: number;
    speed: number;
    reward: number;
}

export const VISUAL_REGISTRY: Record<EnemyType, VisualConfig> = {
    [EnemyType.GLIDER]: {
        name: 'GLIDER',
        shape: 'circle',
        color: 0x00ffff,
        colorHex: '#00ffff',
        priority: 'LOW',
        baseHp: 30,
        speed: 2,
        reward: 25
    },
    [EnemyType.STRIDER]: {
        name: 'STRIDER',
        shape: 'triangle',
        color: 0xff00ff,
        colorHex: '#ff00ff',
        priority: 'MED',
        baseHp: 100,
        speed: 1.2,
        reward: 50
    },
    [EnemyType.BEHEMOTH]: {
        name: 'BEHEMOTH',
        shape: 'square',
        color: 0x00ff00,
        colorHex: '#00ff00',
        priority: 'HIGH',
        baseHp: 400,
        speed: 0.7,
        reward: 150
    },
    [EnemyType.FRACTAL]: {
        name: 'FRACTAL',
        shape: 'hexagon',
        color: 0xffff00,
        colorHex: '#ffff00',
        priority: 'CRITICAL',
        baseHp: 2000,
        speed: 0.4,
        reward: 500
    }
};
