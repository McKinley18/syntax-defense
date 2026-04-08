# SYNTAX DEFENSE: SYSTEM RECONSTRUCTION BLUEPRINT (v3.4)
## ARCHITECT'S TECHNICAL MANUAL - [STATUS: STABLE // LOCKED]

---

### SECTOR 1: GLOBAL VISUAL MAINFRAME (App.css)
**Core Aesthetics:** Cyberpunk Terminal / CRT / Neon Cyan #00ffff / Deep Black #000000.

#### 1.1 Grid Calibration [LOCKED]
*   **Thickness:** 2px stroke for all lines.
*   **Color:** `--neon-cyan` (#00ffff).
*   **Borders:** `rgba(0, 255, 255, 0.6)` (Outer frame).
*   **Internal:** `rgba(0, 255, 255, 0.15)` (Grid density).
*   **Tile Size:** Dynamic (MapManager.calculateTileSize), Logical base 24px.

#### 1.2 The "Living Grid" Background
*   **Comet Bits:** `glow-bit` elements. **Glow-1 REMOVED** to preserve HUD clarity.
*   **Animations:** `grid-sweep` (8s loop).
*   **Distortion:** 400ms "WIPE USER SYSTEM" burst during boot.

---

### SECTOR 2: UI ARCHITECTURE (App.tsx)

#### 2.1 Main Menu (Title Page) [LOCKED]
*   **Hierarchy:** Rank Tag -> 3D Logo -> Menu Grid.
*   **Menu Buttons:** centered (`align-self: center`) for all sub-navigation.

#### 2.2 Tactical Dashboard (Triple-Zone)
*   **Left (Logistics):** Pause/Speed, Level, Repair.
*   **Center (Protocols):** Turret selection.
*   **Right (Vitals):** Tokens, Integrity, Data Purge.

#### 2.3 Onboarding Protocol (Tutorial)
*   **Logical Spot:** Row 6, Column 10.
*   **Override:** Snap-to-Grid active during Step 3 to ensure success.
*   **Popups:** Descriptive, scrollable, and include visual references (Mini-Kernel, Virus DB).

---
**BUILD STATUS:** STABLE // ELITE v3.4
**LOCKED COMPONENTS:** GRID CALIBRATION, BOOT GLITCH, TUTORIAL FLOW, ARCHIVE REVEAL.
