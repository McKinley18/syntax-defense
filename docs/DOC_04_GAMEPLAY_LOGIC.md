# [04] GAMEPLAY_LOGIC: CORE_ENGINE

## I. `Engine.ts` (THE HUB)
- **Singleton:** Manages the main PIXI application instance.
- **Scaling:** `vh / (720 + 160)` calculation for consistent framing.

## II. `StateManager.ts` (THE BRAIN)
- **Global States:** `ORIENTATION_LOCK`, `MAIN_MENU`, `ARCHIVE`, `GAME_PREP`, `GAME_WAVE`, etc.
- **Initial Values:** `Credits: 500`, `Integrity: 20`, `Wave: 0`.

## III. WAVE_GENERATING_ENGINE (V3.5)
- **Dynamic Scaling Logic:** Budget ($B$) = $(1.0 + 0.15L + 0.02L^2) \times playerTokens$.
- **Adaptive Integrity Loop:** 
    - **Relief Mode:** Budget -20% if Integrity < 10.
    - **Hard Mode:** Budget +10% if Integrity == 20.
- **Fairness Threshold:** Wave HP capped at 85% of theoretical max damage arsenal capacity.
- **Cluster Spawning:** Enemies group into sub-waves of 5; rapid burst (400ms) followed by re-calibration pause (3000ms).
- **Dynamic Rewards:** 30% reduction in `rewardPerKill` if player hoards > 5000 credits.
- **Viral "Boss" Tiers:** Every 10 waves, 50% of budget is allocated to a **KERNEL_CRUSHER** boss entity.

## IV. TACTICAL PATH SCALING
- **Path Complexity:** Run lengths decrease as Wave increases ($MinRun = 3 - \lfloor L/10 \rfloor$).
- **Turn Frequency:** Late-game maps feature significantly more vertical snake segments.

## V. VIRAL SIGNATURES
- **GLIDER:** 20 HP | 1.8x Speed | 10 Threat.
- **STRIDER:** 50 HP | 1.3x Speed | 25 Threat.
- **BEHEMOTH:** 250 HP | 0.6x Speed | 100 Threat.
- **FRACTAL:** 80 HP | 1.5x Speed | 40 Threat.
- **PHANTOM:** 40 HP | 2.4x Speed | 35 Threat.
- **WORM:** 120 HP | 1.0x Speed | 60 Threat.
- **BOSS (KERNEL_CRUSHER):** 2500 HP | 0.4x Speed | 1000 Threat.

## V. DEFENSE_PROTOCOLS (TOWERS)
- **Pulse Node:** Basic close-range cyan pulse.
- **Sonic Impulse:** Medium-range sonic wave.
- **Stasis Field:** Slows enemies within range.
- **Prism Beam:** Continuous high-damage laser.
- **Rail Cannon:** Ultra-long-range piercing projectile.
- **Void Projector:** High-damage singularity launcher.
- **Upgrade System:** Exponential stat scaling (1.5x damage per Tier).
