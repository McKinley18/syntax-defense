# [00] SYSTEM_RESTORE_MANIFEST: TOTAL_PROJECT_RECOVERY

**STATUS:** FULLY RESTORED & MODULARIZED
**VERSION:** 1.0.5 STABLE (SYNCED)
**UI_ENGINE:** PIXI_v8_STABLE

This document serves as the absolute blueprint and "Penny-Perfect" restoration script for the *Syntax Defense* application. It guarantees that any future intelligence can rebuild the exact state of this system from a blank folder.

---

## I. CORE ARCHITECTURE MAPPING (src/core/ & src/systems/)

### 1. `Engine.ts` (The Singleton Hub)
- **Role:** Central PIXI Application management.
- **Initialization:** Uses an async `init()` method with standard `app.init`.
- **Scaling:** `INTERNAL_WIDTH = 1600` and `INTERNAL_HEIGHT = 560`. Scale is calculated based on viewport height: `vh / (INTERNAL_HEIGHT + 160)`.
- **Quantum Snap:** Stage X-position snaps to `TILE_SIZE * scale` to center the grid and eliminate partial boxes.

### 2. `StateManager.ts` (The Global Brain)
- **Role:** Manages the strict state transitions and global variables.
- **AppState Enum:** `ORIENTATION_LOCK`, `POWER_ON`, `SYSTEM_CHECK`, `TERMINAL_BOOT`, `STUDIO_SPLASH`, `MAIN_MENU`, `ARCHIVE`, `DIAGNOSTICS`, `GAME_PREP`, `GAME_WAVE`, `GAME_PAUSED`, `GAME_OVER`, `WAVE_COMPLETED`, `WAVE_PREP`.
- **Global Variables:** `credits = 500`, `currentWave = 0`, `integrity = 20`.

### 3. `MapManager.ts` (The Tactical Grid)
- **Role:** Renders the combat grid and manages cell occupancy.
- **Grid Law:** 40x14 Grid of 40px `TILE_SIZE`. Any node not occupied by the Viral Path is strictly buildable.
- **Visual Law:** Grid lines are rendered at `0x00ffff` (Cyan) with `0.6` Alpha.
- **Kernel Position:** Hardcoded to dock at `LogicalRight - 20px`.

### 4. `PathManager.ts` (The Route Generator)
- **Role:** Calculates the enemy pathing.
- **Pathing Law:** 2-wide parallel lanes. Generation uses a macro-grid (20x7) mapped to micro-tiles (40x14).
- **Lane Offsets:** Lanes are offset $\pm$ 15px from the path's center seam.

---

## II. CINEMATIC LOGIC SCRUTINY (src/components/ui/)

### 1. `PowerOn.tsx` (CRT Boot)
- **Phase 1 (300ms):** Ignition Point.
- **Phase 2 (600ms):** Horizontal Beam.
- **Phase 3 (800ms):** Vertical Expansion.
- **Transition (1800ms):** Handoff to `SYSTEM_CHECK`.

### 2. `SystemCheck.tsx` (BIOS Precheck)
- **Interval:** 100ms per line.
- **Transition:** 1000ms hold after final line.

### 3. `BootSequence.tsx` (Terminal Breach)
- **18-Step Array:** Sequential typing simulation.
- **Red Mode Trigger:** Phase 15.2 activates `isRedMode`.

---

## III. MATHEMATICAL BASELINE & CONSTANTS

- **TILE_SIZE:** `40px`.
- **GRID_DIMENSIONS:** `40x14`.
- **KERNEL_INTEGRITY:** `20`.
- **BASE_CREDITS:** `500`.
- **PRIMARY_CYAN:** `#00ffff` / `0x00ffff`.
- **BANNER_HEIGHT:** `8.2rem`.
- **SCALING_LAW:** `clamp(10px, 1.6vw, 18px)`.

---

## IV. DEPENDENCY TREE & HIERARCHY

**Required Libraries:**
- `react`, `react-dom` (^19.0.0)
- `pixi.js` (^8.17.1)
- `vite`, `@vitejs/plugin-react`

**App.tsx Component Hierarchy:**
```tsx
<App>
  <div className="game-wrapper">
    <div className="game-container">
        <div className="crt-vignette"></div>
        {state === AppState.POWER_ON && <PowerOn />}
        {state === AppState.SYSTEM_CHECK && <SystemCheck />}
        {state === AppState.TERMINAL_BOOT && <BootSequence />}
        {state === AppState.STUDIO_SPLASH && <StudioSplash />}
        {state === AppState.MAIN_MENU && <MainMenu />}
        {state === AppState.ARCHIVE && <SystemArchive />}
        {state === AppState.DIAGNOSTICS && <SystemDiagnostics />}
        {(state === AppState.GAME_PREP || state === AppState.GAME_WAVE || state === AppState.WAVE_COMPLETED || state === AppState.WAVE_PREP) && <GameCanvas />}
        {state === AppState.GAME_OVER && <GameOver />}
    </div>
  </div>
</App>
```
