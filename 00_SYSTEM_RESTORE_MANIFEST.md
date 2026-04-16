# [00] SYSTEM_RESTORE_MANIFEST: TOTAL_PROJECT_RECOVERY

**STATUS:** FULLY RESTORED & MODULARIZED
**VERSION:** 1.0.4 STABLE
**UI_ENGINE:** PIXI_v8_STABLE

This document serves as the absolute blueprint and "Penny-Perfect" restoration script for the *Syntax Defense* application. It guarantees that any future intelligence can rebuild the exact state of this system from a blank folder.

---

## I. CORE ARCHITECTURE MAPPING (src/core/ & src/systems/)

### 1. `Engine.ts` (The Singleton Hub)
- **Role:** Replaces the legacy monolithic `GameContainer`.
- **Initialization:** Uses a strict `_initialized` boolean flag and a `100ms` setTimeout delay before `app.init()` to ensure DOM layout readiness.
- **Rendering:** Employs a custom `100ms` `setInterval` render loop (bypassing the Pixi v8 `app.ticker`) to avoid hardware acceleration conflicts and guarantee visual output.
- **Scaling:** `INTERNAL_HEIGHT` is locked to `720`. `app.stage.scale.set(window.innerHeight / 720)` is used to ensure perfect 16:9 responsive scaling.

### 2. `StateManager.ts` (The Global Brain)
- **Role:** Manages the strict state transitions and global variables.
- **AppState Enum:** `POWER_ON`, `SYSTEM_CHECK`, `TERMINAL_BOOT`, `STUDIO_SPLASH`, `MAIN_MENU`, `GAME_PREP`, `GAME_WAVE`, `GAME_PAUSED`, `GAME_OVER`.
- **Global Variables:** `credits = 500`, `currentWave = 0`, `integrity = 20`.
- **Modifiers:** `isRedMode = false` (triggers global chaos visuals).

### 3. `MapManager.ts` (The Tactical Grid)
- **Role:** Renders the combat grid and enforces buildable bounds.
- **Grid Law:** 40px `TILE_SIZE`. Top 2 rows and bottom 3 rows are strictly locked (non-buildable).
- **Visual Law:** Grid lines are rendered at `0x00ffff` (Cyan) with `0.15` Alpha.
- **Interface:** Implements `IMapManager` (`isBuildable`, `getTileCenter`).

### 4. `PathManager.ts` (The Route Generator)
- **Role:** Calculates the enemy pathing.
- **Pathing Law:** 2-wide parallel lanes. The algorithm guarantees a 1-tile buffer between lanes and strictly avoids the locked boundary rows.
- **Kernel Docking:** The `endNodePos` (Kernel) is hardcoded to dock at the right-hand border, calculated via `logicalWidth - (TILE_SIZE * 1.5)`.

---

## II. CINEMATIC LOGIC SCRUTINY (src/components/)

### 1. `PowerOn.tsx` (CRT Boot)
- **Phase 1 (300ms):** Ignition Point (White dot).
- **Phase 2 (600ms):** Horizontal Beam (Flickering line).
- **Phase 3 (800ms):** Vertical Expansion (`tv-expand-v` animation).
- **Phase 4 (1200ms):** Fade to `0x050505`.
- **Transition (1800ms):** Handoff to `SYSTEM_CHECK`.

### 2. `SystemCheck.tsx` (BIOS Precheck)
- **Interval:** 100ms per line.
- **Animation:** `fade-in-bios` (Subtle upward slide and fade).
- **Transition:** 1000ms hold after the final line before handoff to `TERMINAL_BOOT`.

### 3. `BootSequence.tsx` (Terminal Breach)
- **The 18-Step Array:** Uses a strictly typed `PhaseConfig` array to enforce sequential rendering.
- **Human-Fidelity Typing:** `speed` and `delay` properties simulate human burst rhythms. The "Y" response includes a hardcoded `1000ms` pause.
- **Act 3 Isolation:** The `clearBefore: true` flag on `sys --scan-integrity` purges previous history.
- **Red Mode Trigger:** Reaching Phase 15.2 (`ERROR_0x88`) immediately activates `isRedMode`, turning all text Red (`#ff3300`) and triggering the `glitch-distortion` CSS animation for 400ms.

### 4. `StudioSplash.tsx` (Monolith Manifest)
- **Duration:** 7000ms total.
- **Manifestation:** Logo and text blur-in from `scale(0.1)` over 2.5s.
- **Transformation:** The 4-pillars straighten from a skewed "M" state over 1.5s, starting at 4.0s.
- **Fade Out:** A 600ms exit animation blurs the sequence before handoff to `MAIN_MENU`.

---

## III. MATHEMATICAL BASELINE & CONSTANTS

- **TILE_SIZE:** `40px` (Strict).
- **LANE_WIDTH:** `2` (Parallel).
- **KERNEL_INTEGRITY:** `20`.
- **BASE_CREDITS:** `500`.
- **RESOLUTION_TARGET:** `1280x720` (16:9 Aspect Ratio).
- **PRIMARY_CYAN:** `#00ffff` / `0x00ffff`.
- **RED_MODE_ALERT:** `#ff3300` / `0xff3300`.
- **SYSTEM_GREEN:** `#00ff66`.

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
      {(state === AppState.GAME_PREP || state === AppState.GAME_WAVE) && <GameCanvas />}
    </div>
  </div>
</App>
```

---

## V. STEP-BY-STEP RESTORATION SCRIPT (ARCHITECT COMMANDS)

*For use by future intelligence to rebuild the system from scratch.*

1.  **Initialize Project:** `npm create vite@latest Syndef -- --template react-ts`
2.  **Install Dependencies:** `npm install pixi.js`
3.  **Establish Directories:** `mkdir -p src/core src/systems src/entities src/components/ui src/config src/utils`
4.  **Enforce Viewport:** Add `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />` to `index.html`.
5.  **Build Core:** Create `Engine.ts` and `StateManager.ts` using the Singleton pattern. Ensure `Engine` uses the 100ms manual render loop fallback.
6.  **Apply CSS Laws:** Populate `index.css` with `.game-container` (100vw/100vh) and the `crt-vignette` / `crt-flicker` pseudo-elements. Set global font to `Courier New`.
7.  **Reconstruct Cinematics:** Build `PowerOn.tsx`, `SystemCheck.tsx`, `BootSequence.tsx`, and `StudioSplash.tsx` following the exact timing constants in Section II.
8.  **Reconstruct Tactical Menu:** Build `MainMenu.tsx` with `MenuBackground.tsx`. Ensure Pixi v8 destruction bug is mitigated by nullifying `app.resizeTo` before `app.destroy()`.
9.  **Wire App.tsx:** Implement the state-driven component router (Section IV) and force `AppState.POWER_ON` upon initial mount.
10. **Compile & Verify:** Run `npx tsc --noEmit` to guarantee 0 architectural flaws.
