# SYNTAX DEFENSE: SYSTEM RECONSTRUCTION BLUEPRINT (v3.3)
## ARCHITECT'S TECHNICAL MANUAL - [STATUS: MENU LOCKED]

This document provides a thorough, component-level breakdown of the "SYNTAX DEFENSE" mainframe. Sector 2.1 is officially LOCKED.

---

### SECTOR 1: GLOBAL VISUAL MAINFRAME (App.css)
**Core Aesthetics:** Cyberpunk Terminal / CRT / Neon Cyan #00ffff / Deep Black #000000.

#### 1.1 Responsive Root & Variables
*   **Viewport:** Forced Landscape (`852x393` for iPhone 15).
*   **CSS Variables:**
    *   `--neon-blue`: `#0066ff`
    *   `--neon-cyan`: `#00ffff`
    *   `--neon-red`: `#ff3300`
    *   `--dashboard-height`: `clamp(115px, 22vh, 160px)`
*   **CRT Overlay:** `body::after` scanlines at `100% 4px`.

#### 1.2 The "Living Grid" Background
*   **Stacking:** `z-index: 2` (Physically behind the UI layer).
*   **Grid Lines:** `24px x 24px` repeating linear-gradient.
*   **Comet Bits:** `glow-bit` elements (4px circles). **Glow-1 (Top-Left) REMOVED** for clean HUD.
*   **Animations:** `grid-sweep` horizontal light band (8s loop).
*   **Distortion State:** Grid flashes `rgba(255, 51, 0, 0.15)` during glitches.

#### 1.3 The 3D Box Logo [LOCKED]
*   **Background:** `transparent` (Grid visible in void space).
*   **Padding:** `10px 40px` (Maintains physical footprint).
*   **Margins:** `2px 0 8px 0` (Tightened grouping).
*   **Light Source:** 3 layers of soft radial blur (140px / 60px / 20px).
*   **Glitch Profile:** Aggressive horizontal jolt (35px) + Scale/Skew distortion.

---

### SECTOR 2: UI ARCHITECTURE (App.tsx)

#### 2.1 Main Menu (Title Page) [LOCKED - DO NOT MODIFY]
*   **Hierarchy:** Rank Tag -> 3D Logo -> Menu Grid.
*   **Rank Tag:** `transform: translateY(15px)`; Background `#000` (Opaque).
*   **Menu Buttons:** `background: #050505` (Opaque shielding).
*   **Central Gap:** `2.5vh` (Tightened).
*   **Atmospheric Logic:** Glitch (15%), Flicker (25%) triggered every 5s.

#### 2.2 Tactical Dashboard (Triple-Zone)
*   **Left (Logistics):** 25% width. Pause/Speed toggles, Level indicator (Internal), Repair button.
*   **Center (Protocols):** 50% width. Scrollable `turret-row`.
*   **Right (Vitals):** 25% width. Token counter, Integrity Stack, Data Purge.

#### 2.3 Terminal Text & Sequential Reveal
*   **Component:** `TerminalText` (15ms speed) with `onComplete` callback.
*   **Logic:** Buttons only appear after text completion.
*   **Void Space:** Overlays condensed to `max-width: 360px` to anchor buttons.

---

### SECTOR 3: GAME CORE (PIXI.js / TypeScript)
*   **Path Topology:** Strictly 2-tiles wide; "Strict Isolation" DFS logic.
*   **Grid Bounds:** Enforced even column counts for edge-to-edge alignment.
*   **Economy:** 75% Refunds; 10% Interest; 1.15x Supply Multiplier (4+ towers).
*   **Scaling:** +10% HP / +0.5% Speed per wave.

---
**BUILD STATUS:** STABLE // ELITE v3.3
**LOCKED COMPONENTS:** MAIN MENU, TITLE STACK, GRID STACKING.
