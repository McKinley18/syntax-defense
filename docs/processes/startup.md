# Cinematic Startup Sequence (Verified)

## Act 1: Cold Boot Power-On
- **Trigger:** Initial user gesture on `BootScreen.tsx`.
- **Stage 0 (FLASH):** 0.5s CSS `.crt-beam` flash (Cyan).
- **Stage 1 (LOGS):** 3s auto-scrolling terminal logs (Green text).
- **Stage 2 (LOADING):** 3s resource progress bar (0% -> 100%).
- **Stage 3 (READY):** UI overlay switch to `InitializeSystem` prompt.
- **Stage 4 (INIT):** User click triggers `initializeSystem`.

## Act 2: Studio Splash (Monolith)
- **Duration:** 8.0s total display.
- **Exit Animation:** Starts at 10.5s (2.5s fade-out).
- **Visuals:** 4 CSS pillars, `MONOLITH` title, and `PRESENTS` subtext.
- **Z-Index:** Must be `70000+` to cover all layers.

## Act 3: Main Menu Transition
- **Z-Index Sync:** Menu layers must fade in behind the splash exit.
- **State Switch:** `studioComplete` set to true only after exit animation finishes.
- **Aesthetic:** Neon cyan/green accents, scanline overlay, and mechanical audio hum.
