# [02] MAIN_MENU: NAVIGATION_HUB

## I. `MainMenu.tsx` (PRIMARY INTERFACE)
- **Visuals:** Centered title "SYNTAX DEFENSE" + "PLATFORM_M15" spec.
- **Navigation:**
    - `[ INITIALIZE_SIMULATION ]` -> GameCanvas.
    - `[ SYSTEM_ARCHIVE ]` -> Archive Screen.
    - `[ SYSTEM_DIAGNOSTICS ]` -> Settings.
- **Audio:** `AudioManager.startMusic()` triggers upon menu mount.

## II. `MenuBackground.tsx` (ILLUMINATED GRID)
- **Grid Spec:** 40x18 Tactical Grid.
- **Illumination Law:** Epicenter positioned at `(Width / 2) - (14 * rem)`.
- **The Glow:** High-fidelity Radial Gradient (Cyan -> Dark Teal -> Black).
- **Masking:** Grid lines revealed via an Alpha-Mask synced to the radial glow.
- **Vanish:** Lines hit 0% visibility at the edge of the light pool (40% radius).
- **Background:** Absolute Black (`#000000`).

## III. ANIMATION & FX
- **Scanline:** Vertical sweep at constant 0.01 delta speed.
- **Breathing:** Subtle alpha pulse on the central light source.
- **Flicker:** Subtle jitter synced to title glitches (125ms bursts).
