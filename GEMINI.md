# SYNTAX DEFENSE: System Architecture & Mandates (v2.6.0)

This document serves as the primary technical reference for the SYNTAX DEFENSE mainframe. Every process, page, and component is detailed here to ensure logical consistency and seamless maintenance.

---

## I. GLOBAL ARCHITECTURE & SYSTEM STANDARDS
### 1. Visual Identity (CRT Aesthetic)
- **Overlay**: 4px linear-gradient scanlines (`body::after`) at `z-index: 100000`.
- **Atmospheric Distortion**: 5s cycle malfunction engine.
  - **Flicker**: Dimming effect (40% opacity, 30% brightness) simulating power surges.
  - **Glitch**: Red-alert extrusion with horizontal slice distortion (Top/Bottom segments shift laterally).
- **The Logo**: 3D Box Extrusion style. Perfectly straightened (no tilt). Neon Cyan (#00ffff) with deep teal shadow layers.
- **Grid Calibration**: Dynamic `TILE_SIZE` (16px to 32px) based on viewport width. 

### 2. Core Constraints
- **Vertical Buffer**: Strict 1-row margin at top and bottom of grid plus a 20vh (min 110px) dashboard buffer at the bottom.
- **Path Topology**: Exactly 2 tiles wide. Enforced via "Strict Isolation" DFS logic (nodes only advance if they have exactly 1 neighbor).
- **Performance**: FPS-based particle throttling below 45 FPS.

---

## II. INTERFACE ARCHITECTURE (PAGES)

### 1. [MENU] Home Terminal
- **Layout**: High-compression vertical stack. Reduced margins between Rank, Logo, and Options.
- **Components**: 
  - `rank-tag`: Architect level tracking.
  - `menu-options-grid`: Stacks vertically on small mobile (<480px).

### 2. [GAME] Mainframe Grid
- **Terminal UI**: All popups (Summary & Intel) use `TerminalText` component for high-speed (15ms) typing effects.
- **Popup Hierarchy**:
  - `Wave Summary`: Appears at wave end (Kills, Refunds, Interest).
  - `Combat Intel`: Mission briefing with upcoming enemy signatures and "Execute" button.
- **Dashboard Layout**: 
  - Left (Logistics): 180px fixed.
  - Center (Turrets): Flexible, constrained, scrollable, with vertical border separators.
  - Right (Vitals): 180px fixed.

### 3. [ARCHIVE] Data Encyclopedia
- **Content**: Comprehensive technical specs for all 5 Turrets and 4 Viral Signatures.
- **Visuals**: Large-scale shape rendering with priority and speed metrics.

---

## III. GAME LOGIC COMPONENTS (SYSTEMS)

### 1. PathManager (Path Topology Engine)
- **Rules**: 
  - `Level 0`: Locked to centered, straight 2-tile wide path from Left to Right.
  - `Level 1+`: Random DFS walk with neighbor-count validation to prevent "thick" paths.
- **Movement**: Enemies track the mathematical center-line of the 2-tile corridor for smooth motion.

### 2. GameStateManager (Economy & Progress)
- **Structure**: `WaveSummary` interface tracks `kills`, `interest`, `perfectBonus`, and `refunds`.
- **Refunds**: 75% credit recovery at wave end to facilitate defensive rotation.
- **Persistence**: LocalStorage keys `syntax_defense_save` and `syntax_total_xp`.

### 3. WaveManager (Swarm Orchestrator)
- **Tutorial Logic**: Forces a single Glider signature for Level 0 onboarding.
- **Triggering**: Uses `isSummaryActive` flag to signal the UI when to display the Wave Summary.

---

## IV. ENTITY REGISTRY

### 1. Viral Signatures (Enemies)
- `GLIDER`: Standard tutorial class. Fast, low HP.
- `STRIDER`: Gains "Thermal Shield" (50% MG Res) if 5+ MGs are deployed.
- `BEHEMOTH`: Slow, high HP.
- `FRACTAL`: Boss class, 10 Integrity damage on breach.

### 2. Defense Nodes (Turrets)
- `PULSE MG` / `FROST RAY` / `TESLA LINK` / `RAILGUN` / `ARCHITECT CORE`.

---

## V. PERSISTENCE & DATA
- **Build Requirement**: 0 TypeScript errors. `EnemyType` indexing in UI must use direct numeric mapping.
- **Save Trigger**: PREP phase initialization.
