# [01] MONOLITH_PRODUCER: CORE VISION & INITIALIZATION

## I. STUDIO IDENTITY (MONOLITH_STUDIOS)
The game must open with a high-fidelity studio splash to establish production value.
- **GATE**: Orientation must be `LANDSCAPE`.
- **DURATION**: 3.5s - 7.0s (Adaptive).
- **VISUAL**: Minimalist three-bar monument logo + "MONOLITH PRESENTS".
- **TRANSITION**: Smooth fade-out via `studio-fade-out` class.

## II. CINEMATIC BOOT (TERMINAL_LOGIC)
A multi-stage authentication and system mount sequence.
- **PHASES**: 18-step terminal sequence.
- **SKIP_LOGIC**: `localStorage.getItem('syntax_skip_intro')` bypasses the typing animation.
- **WIPE_GLITCH**: Final phase MUST trigger the 400ms "WIPE USER SYSTEM" distortion.
- **ACCESS_POINT**: The sequence concludes with the `[ ACCESS SYSTEM ROOT ]` button.

## III. MASTER PARAMETERS
- **GRID_CALIBRATION**: 2px thickness, Cyan (0x00ffff).
- **ALPHA_CHANNELS**: 0.6 (Borders) | 0.15 (Internal).
- **THEME**: Neon Terminal / Cyberpunk Minimalist.
- **MASTER_SINGLETON**: `GameStateManager`.
