# [03] GAMEPLAY_CORE: TACTICAL ENGINE

## I. GRID & PATHING (MAP_MANAGER)
- **TILE_SIZE**: 40px.
- **PATH_WIDTH**: 2-wide parallel lanes.
- **SNAP_LOGIC**: `Snap-to-Grid` override active.
- **THEME**: 2px Cyan borders, 0.15 Alpha lines.

## II. WAVE_MANAGER & ENEMY_SWARM
- **SWARM_SCALING**: HP scaling starts after credits exceed 1500.
- **ADAPTIVE_SWARM**: Wave 1 fixed (10 GLIDERS). 35% intensity (Waves 1-4).
- **ENEMIES**:
  - GLIDER (40 HP | 1.2x)
  - STRIDER (120 HP | 1.0x)
  - BEHEMOTH (450 HP | 0.6x)
  - FRACTAL (2500 HP | 0.4x)

## III. DEFENSE_PROTOCOLS (TOWERS)
- **TURRET_UNLOCKS**: 
  - MG: Initial
  - Frost Ray: SCRIPTER
  - Blast Nova: SYS_ARCHITECT
  - Railgun: SENIOR_ENGR
  - Tesla Link: ELITE_ARCHITECT
- **PLACEMENT**: Only on valid grid nodes.

## IV. TUTORIAL_SYSTEM (8-STEP_SEQUENCE)
- **PHASE_GATE**: Tutorial MUST be completed for new users.
- **STEP_3_SPEC**: Highlight Grid (Row 6, Col 10).
- **FINAL_STEP**: Reset to Wave 1, 850 Tokens.
