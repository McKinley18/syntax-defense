export const GAME_CONFIG = {
    RENDER: {
        WIDTH: 1280,
        HEIGHT: 720,
        TILE_SIZE: 40,
        GRID_THICKNESS: 2,
        CYAN: 0x00ffff,
        BG_COLOR: 0x0a0a0a,
    },
    GRID: {
        LOCKED_TOP_ROWS: 2,
        LOCKED_BOTTOM_ROWS: 3,
    }
} as const;
