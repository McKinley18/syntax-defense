# [00] SYSTEM_MANIFEST: TOTAL_PROJECT_RECOVERY
**VERSION:** 1.1.0 (Landscape Optimized)
**STATUS:** STABLE
**ENGINE:** PIXI.js v8.x + React v19.x

## I. ARCHITECTURAL OVERVIEW
Syntax Defense is a high-fidelity, landscape-optimized tactical simulation built on a React/PIXI hybrid stack. This manifest serves as the absolute "Penny-Perfect" restoration script for the system.

## II. DEPENDENCY STACK
- **Frontend:** React 19.x, TypeScript 5.x
- **Rendering:** PIXI.js 8.x (WebGPU/WebGL)
- **Build Tool:** Vite 8.x
- **Audio:** Web Audio API (via AudioManager Singleton)

## III. COMPONENT HIERARCHY (Order of Appearance)
1. **PowerOn:** Initial CRT ignition and boot sequence.
2. **SystemCheck:** BIOS-level diagnostic pre-check.
3. **BootSequence:** Terminal-style breach cinematic.
4. **StudioSplash:** Brand identity ("MONOLITH") manifestation.
5. **MainMenu:** Primary navigation hub.
   - **MenuBackground:** 40x18 Tactical Grid + Radial Illumination.
6. **GameCanvas:** Core simulation engine.
   - **MapManager:** 40x18 Grid + Pathing.
   - **TacticalHUD:** Rem-relative command console.
7. **SystemArchive:** Game database and attribution.
8. **SystemDiagnostics:** Performance and settings control.

## V. DOCUMENTATION INDEX (Modular)
- **DOC_00_SYSTEM_MANIFEST.md:** Architectural recovery and dependency tree.
- **DOC_01_BOOT_PROTOCOL.md:** PowerOn, SystemCheck, and Cinematic sequencing.
- **DOC_02_MAIN_MENU.md:** Menu interface and Neon/Grid visual logic.
- **DOC_03_TACTICAL_ENVIRONMENT.md:** Master Layout Blueprint (40x18 Grid & Scaling).
- **DOC_04_GAMEPLAY_LOGIC.md:** Simulation engine, Wave protocols, and Turret specs.
- **DOC_05_SYSTEM_UTILITIES.md:** Archive, Settings, Audio, and Tutorial systems.
## VI. FOUNDATIONAL CONSTANTS
- **TILE_SIZE:** 40px (Physical) / 1.0rem (Logical).
- **GRID_DIMENSIONS:** 40 Columns (X) x 18 Rows (Y).
- **PRIMARY_CYAN:** `#00ffff` / `0x00ffff`.
- **SCALING_LAW:** `clamp(10px, 1.6vw, 18px)` via root font-size.
- **BANNER_HEIGHT:** `8.2rem`.
- **ILLUMINATION_LAW:** `(Width / 2) - (14 * rem)` focal point.
