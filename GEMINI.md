# SYNTAX DEFENSE: System Architecture & Mandates (v2.7.0)

This document serves as the primary technical reference for the SYNTAX DEFENSE mainframe. Every process, page, and component is detailed here to ensure logical consistency and seamless maintenance.

---

## I. GLOBAL ARCHITECTURE & SYSTEM STANDARDS
### 1. Visual Identity (CRT Aesthetic)
- **Overlay**: 4px linear-gradient scanlines (`body::after`) at `z-index: 100000`.
- **Atmospheric Distortion**: 5s cycle malfunction engine.
  - **Flicker**: Dimming effect (40% opacity, 30% brightness) simulating power surges.
  - **Glitch**: Red-alert extrusion with horizontal slice distortion.
- **The Logo**: 3D Box Extrusion style. Diagonal floating offset with layered teal shadows. Neon Cyan (#00ffff).
- **Background Lighting**: Unified grid and data comets affected by a radial mask centered on the logo (`50% 30%`). Comets fade as they move away from the light source.
- **Terminal Behavior**: 800ms green prompt flash -> Title typing animation. Swarm Data popups are minimalist (symbols + names only, no background boxes).
- **Audio Mandate**: 100% procedural synthesis via Web Audio API. No external files. No copyright risk. Audio must be resumed via explicit user interaction (`wakeAudioSystem`).

### 2. Core Constraints
- **Vertical Buffer**: Strict 1-row margin at top/bottom of grid plus a dashboard buffer at the bottom.
- **Path Topology Engine**: 2-tiles wide. Only the start and end points may touch the far-left and far-right screen edges respectively. Enforced via BFS/DFS neighbor validation.
- **Grid Visibility**: 1.2px thickness. Standard lines at 0.22 Alpha, Path Borders at 0.5 Alpha for high contrast.

---

## II. INTERFACE ARCHITECTURE (PAGES)

### 1. [MENU] Home Terminal
- **Rank Evolution**: Architect Rank features an evolving ASCII Badge (bracketed icons) that increases in complexity from Initiate to God-Mod Admin.
- **Diagnostics**: Real-time status polling (Kernel Stability, Tokens).

### 2. [GAME] Mainframe Grid
- **Interactive Upgrades**: Tapping a placed node opens the **NODE CONFIGURATION** window (Overclocking stats, Recycle options).
- **Glitches**: Random system instability events (OVERCLOCK, LAG_SPIKE, SYSTEM_DRAIN). 
  - **Visuals**: Active glitches must apply a chromatic aberration or tint shift to the grid.
- **Dashboard**:
  - **Left**: Tactical controls (Pause, FWD, Repair, Purge).
  - **Center**: Protocol Scroll Wheel (Turrets).
  - **Right**: Mission Vitals.

### 3. [ARCHIVE] Data Hub
- **Categorized Navigation**: Two-step entry system:
  1. **Category Selection**: TACTICAL DATABASE, SYSTEM HANDBOOK, MAINFRAME MANIFEST.
  2. **Sub-Tabs**: Detailed technical specs, ranks, and credits.
- **Hall of Fame**: Persistent tracking of Highest Wave and Total Viral Deletions across all sessions.

---

## III. GAMEPLAY MECHANICS & BALANCING

### 1. Population-Based Difficulty
- **Enemy Stats**: Viral signatures maintain **consistent strength** (HP/Speed) across all waves to ensure tactical predictability.
- **Density Scaling**: Difficulty scales purely through **Population Volume**.
  - **Wave 1**: 20 enemies.
  - **Scaling**: Increases by **5.5 enemies per wave**.
- **Greed Mechanic**: (Wave 20+) Viral signatures move **15% faster** if player holds >3000 tokens.

### 2. Interactive Systems
- **Overclocking**: 3 levels of progression per node. Each level increases Damage (~50%) and Range (~15%).
- **Recycling**: 75% credit refund on all sold nodes.
- **Kernel Repair**: Progressive cost scaling (+150c per repair).

### 3. Viral Signatures (Enemies)
- `GLIDER`: Standard tutorial class. Fast, low HP.
- `STRIDER`: Gains "Thermal Shield" (50% MG Res) if 5+ MGs are deployed.
- `BEHEMOTH`: Slow, high HP bulk data.
- `FRACTAL`: Boss class. 10 Integrity damage on breach.

---

## IV. ONBOARDING (TUTORIAL)
- **Granular Steps**:
  1. **Threat Intro**: Contextual briefing on Glider signature.
  2. **Selection**: Pulse MG requirement.
  3. **Deployment**: Fixed position node placement.
  4. **Overclocking**: Mandatory interaction with placed node to explain upgrades.
  5. **Malfunction Protocol**: Mention of random system **Glitches** and their impact on data integrity.
  6. **Economy**: Briefing onInterest and Bounties.

---

## V. PERSISTENCE & DATA
- **Save Trigger**: Wave initialization (PREP phase).
- **LocalStorage Keys**: 
  - `syntax_defense_save`: Current session state.
  - `syntax_total_xp`: Lifetime progression.
  - `syntax_hall_of_fame`: Record-breaking metrics.
