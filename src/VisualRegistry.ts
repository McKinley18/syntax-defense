export enum EnemyType { GLIDER, STRIDER, BEHEMOTH, FRACTAL, PHANTOM, WORM, BOSS }

export interface EnemyConfig {
    hp: number;
    speed: number;
    color: number;
    name: string;
    threat: number; 
    reward: number; 
}

/**
 * VISUAL REGISTRY v86.5: Economic Rebalance
 * REBUILD PAYOUTS: Rewards increased to support full wave rebuilding.
 */
export const VISUAL_REGISTRY: Record<EnemyType, EnemyConfig> = {
    [EnemyType.GLIDER]: {
        hp: 24,
        speed: 1.8,
        color: 0x00ffff,
        name: "GLIDER_SCRIPT",
        threat: 15,
        reward: 12  // Increased from 6
    },
    [EnemyType.STRIDER]: {
        hp: 55,
        speed: 1.3,
        color: 0x00ff66,
        name: "LOGIC_STRIDER",
        threat: 35,
        reward: 25  // Increased from 15
    },
    [EnemyType.BEHEMOTH]: {
        hp: 280,
        speed: 0.6,
        color: 0xff00ff,
        name: "DATA_FORTRESS",
        threat: 100,
        reward: 80  // Increased from 45
    },
    [EnemyType.FRACTAL]: {
        hp: 90,
        speed: 1.5,
        color: 0xffff00,
        name: "FRACTAL_MALWARE",
        threat: 50,
        reward: 40  // Increased from 25
    },
    [EnemyType.PHANTOM]: {
        hp: 45,
        speed: 2.4,
        color: 0xffffff,
        name: "PHANTOM_LINK",
        threat: 80,
        reward: 60  // Increased from 35
    },
    [EnemyType.WORM]: {
        hp: 140,
        speed: 1.0,
        color: 0x0066ff,
        name: "SEGMENT_PARASITE",
        threat: 60,
        reward: 50  // Increased from 30
    },
    [EnemyType.BOSS]: {
        hp: 3500,
        speed: 0.4,
        color: 0xff3300,
        name: "KERNEL_CRUSHER",
        threat: 1000,
        reward: 1500 // Significant boss payout
    }
};

export const COLORS = {
    CYAN: 0x00ffff,
    RED: 0xff0000,
    BACKGROUND: 0x0a0a0a
};
