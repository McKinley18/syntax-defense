# [04] MODES_SCREEN: INFILTRATION_PARAMS

## I. MISSION_TYPES
- **STANDARD**: Baseline difficulty, 50 XP/wave.
- **HARDCORE**: Increased difficulty, 100 XP/wave, permanent consequences.

## II. STATE_HANDOFF
- **INITIALIZER**: Calls `GameStateManager.resetGame(mode, 1)`.
- **TRANSITION**: Sets `screen('GAME')` and triggers `initializeSystem()`.
