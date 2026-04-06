# SYNTAX DEFENSE: System Architecture & Mandates (v2.5.0)

This document serves as the primary technical reference for the SYNTAX DEFENSE mainframe. Every process, page, and component is detailed here to ensure logical consistency and seamless maintenance.

---

## I. GLOBAL ARCHITECTURE & SYSTEM STANDARDS
### 1. Visual Identity (CRT Aesthetic)
- **Overlay**: 4px linear-gradient scanlines (`body::after`) at `z-index: 100000`.
- **Atmospheric Distortion**: 8s cycle malfunction engine with 200ms visual glitches and "Glitch Buzz" SFX.
- **Color Logic**: 
  - `Neon Cyan (#00ffff)`: Engagement ranges, positive status, data links.
  - `Neon Pink (#ff00ff)`: Strider viral signatures.
  - `Neon Red (#ff3300)`: System failure, damage, critical warnings.
- **Grid Calibration**: Dynamic `TILE_SIZE` (16px to 32px) based on viewport width.

### 2. Core Constraints
- **Vertical Buffer**: Strict 1-row margin at top and bottom of grid (No pathing/placement allowed).
- **Dashboard Buffer**: 8-tile bottom margin prevents path intrusion into UI.
- **Performance**: FPS-based particle throttling below 45 FPS.

---

## II. INTERFACE ARCHITECTURE (PAGES)

### 1. [MENU] Home Terminal
- **Process**: Main entry point and rank visualization.
- **Layout**: Centered flex column with 25dvh bottom padding for mobile clearance.
- **Components**: 
  - `rank-tag`: Displays current architect level based on total XP.
  - `menu-options-grid`: Navigation to Standard, Advanced, Archive, and Settings.

### 2. [GAME] Mainframe Grid
- **Process**: Real-time tactical defense simulation.
- **Components**:
  - `PixiJS Canvas`: Hardware-accelerated rendering layer.
  - `Tactical Dashboard`: Bottom-anchored UI providing turret selection and system vitals.
  - `Pre-Wave Overlay`: Centered mission briefing with mobile-responsive auto-scaling.
  - `Tutorial System`: Level 0 step-by-step onboarding with dynamic coordinate tracking.

### 3. [ARCHIVE] Data Encyclopedia
- **Process**: In-game wiki for player research.
- **Sub-Tabs**:
  - `LORE`: Log entries regarding the Syntax Collapse.
  - `VIRUSES`: Stats and descriptions for Gliders, Striders, Behemoths, and Fractals.
  - `TURRETS`: Technical specs for Pulse MG, Frost Ray, Tesla Link, Railgun, and Architect Core.
  - `MODES`: Documentation for Advanced Protocols.
  - `LOGIC`: Explanation of Data Links, Overclocking, and Kernel Overdrive.

### 4. [MODES] Advanced Protocols
- **Process**: Selection logic for non-standard game variants.
- **Available Modes**:
  - `HARDCORE`: No interest, 1.5x cost, high XP.
  - `ECO CHALLENGE`: Interest income only (No tokens from kills).
  - `SUDDEN DEATH`: 1 Integrity.
  - `ENDLESS LOOP`: No wave cap, exponential HP scaling.

### 5. [SETTINGS] Configuration Center
- **Process**: Preference management and debug tools.
- **Features**: Master SFX toggle, Music toggle, and "Purge Tutorial Data" tool.

---

## III. GAME LOGIC COMPONENTS (SYSTEMS)

### 1. PathManager (Path Topology Engine)
- **Mandate**: Generate a crisp 2-tile wide path from Left to Right.
- **Rules**: 
  - `Level 0`: Forced straight path.
  - `Level 1+`: Random DFS (Depth First Search) walk.
  - `Constraint`: Only start/end touch screen edges; 1-tile buffer on all other sides.
- **Movement**: Enemies track the absolute center-line of the macro-blocks for fluid motion.

### 2. GameStateManager (Economy & Progress)
- **Tokens**: 75% refund on all towers/upgrades at wave end. 10% interest (capped at 1000c).
- **Scaling**: +10% HP and +0.5% Speed per wave.
- **Integrity**: 20 units (except Sudden Death). Purges save file on 0 integrity (Anti-Cheat).

### 3. WaveManager (Swarm Orchestrator)
- **Batching**: Multi-batch spawning starts at Wave 15.
- **Rewards**: Kills provide tokens scaled at 8% per wave.
- **Boss Logic**: Fractal viruses appear every 10 waves (Level 10, 20, etc).

### 4. TowerManager (Defense Integration)
- **Placement**: Snaps to grid centers using `MapManager` coordinates.
- **Synergy**: Identical turrets form "Data Links" for +10% DMG (Max +30%).
- **Upgrades**: 3 Tiers per node. Tier 2 = 1.5x Base Cost, Tier 3 = 2.0x Base Cost.

### 5. AudioManager (Cyber-Acoustic Engine)
- **Music**: 124 BPM data-track.
- **SFX**: Procedural procedural synthesis for UI and combat events.

---

## IV. ENTITY REGISTRY

### 1. Viral Signatures (Enemies)
- `GLIDER`: Fast, low HP.
- `STRIDER`: Medium, Gains "Thermal Shield" (50% MG Res) if user spams 5+ MGs.
- `BEHEMOTH`: Slow, high HP.
- `FRACTAL`: Boss class, 10 Integrity damage on breach.
- `GHOST`: Invisible status; must be revealed by Frost/Tesla/Architect radius.

### 2. Defense Nodes (Turrets)
- `PULSE MG`: Standard DPS.
- `FROST RAY`: Slowing beam (30-frame freeze).
- `TESLA LINK`: Chain lightning (Arks to 3 targets).
- `RAILGUN`: High damage, reveal stealth.
- `ARCHITECT CORE`: Global buffer node (+25% Link DMG).

---

## V. PERSISTENCE & DATA
- **Local Storage Key**: `syntax_defense_save` (Game state) and `syntax_total_xp` (Rank).
- **Save Trigger**: End of every wave (PREP phase start).
- **Build Instruction**: `npm run build` (Requires 0 TS errors).
