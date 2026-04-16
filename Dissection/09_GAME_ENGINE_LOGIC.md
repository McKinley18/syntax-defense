# [09] GAME_ENGINE: TACTICAL_LOGIC

## I. GRID_&_MAP (MAP_MANAGER)
- **TILE_SIZE**: 40px.
- **PATHING**: 2-wide parallel lanes.
- **SNAP_LOGIC**: Overrides to center placement on nodes.

## II. SWARM_ENGINE (WAVE_MANAGER)
- **ADAPTIVE_SCALING**: Intensity starts at 35% (Waves 1-4).
- **HP_MULTIPLIER**: Scaled based on credits > 1500 and total turret DPS.
- **CONCURRENCY**: Max 40 enemies (Excess count converts to HP boost).

## III. PERFORMANCE
- **PARTICLE_POOLING**: Reusable muzzle flashes and lightning.
- **ENEMY_POOLING**: Future-state optimization.
- **FRAME_RATE**: Targeted 60 FPS update loop.
