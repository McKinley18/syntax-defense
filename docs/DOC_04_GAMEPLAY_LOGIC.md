# [04] GAMEPLAY_LOGIC: CORE_ENGINE

## I. STAT_CONSTANCY_LAW
The following unit statistics are absolute constants across all sessions:
- **Enemies:** Base HP, Speed, and Rewards defined in `VISUAL_REGISTRY`.
- **Turrets:** Damage, Range, and Upgrade Costs defined in `TOWER_CONFIGS`.
- **Progression:** HP scales linearly by wave (`+5% per wave`).

## II. STRATEGIC_AI
- **Neural Brain:** Directs session-wide composition (e.g., SWARM vs. SHIELD directives).
- **Predictive Combat:** Projectiles use fixed-vector math to intercept predicted target locations.

## III. UNIT_PERFORMANCE
- **PURGE_LOG:** Every individual turret tracks its own kill count.
- **Unit Intel:** Real-time readout of Lethality (DPS) and Node Range in HUD.

## IV. VIRAL SIGNATURES (CONSTANTS)
- **GLIDER:** 20 HP | 1.8x Spd.
- **STRIDER:** 50 HP | 1.3x Spd.
- **BEHEMOTH:** 250 HP | 0.6x Spd.
- **FRACTAL:** 80 HP | 1.5x Spd.
- **PHANTOM:** 40 HP | 2.4x Spd.
- **WORM:** 120 HP | 1.0x Spd.
- **BOSS:** 2500 HP | 0.4x Spd.
