# Project Mandates: SYNTAX DEFENSE (v1.6.0)

## 1. Core Identity
- **Theme**: Cyber-Mainframe Security / High-Fidelity Tactical Defense.
- **Visuals**: Matte black void, GPU-cached 24px neon-blue surgical grid, solid black data-paths with scrolling binary flow.
- **Style**: High-fidelity, industrial-mecha architecture with glassmorphism UI.

## 2. Core Mechanics
- **The Shift**: Paths reconfigure using a **Macro-Grid Backbone** algorithm at the start of every wave. 
- **Clean Slate**: All defensive nodes materialize for one wave only and de-materialize upon wave completion.
- **Zero-Loss Persistence**: Game state is instantly saved to `localStorage` after every wave preparation.
- **System Kernel**: The physical objective at the end of the path. Pulses with system health and flashes red on breach.
- **Hardcore Mode**: 1000 starting credits, +50% protocol costs, 0% interest. All-or-nothing tactical planning.
- **Economy (Standard)**: 500 starting credits + 10% Interest Bonus on unspent tokens between waves.

## 3. The Path Engine (Architectural Constraints)
- **Grid Density**: 24px micro-tiles grouped into 4x4 Macro Cells.
- **Dimensions**: Strictly 2 micro-tiles wide (48px).
- **Separation**: Minimum 2-tile buildable gap between parallel paths.
- **Flow**: Starts far-left, ends far-right. 4-directional winding with switch-backs allowed.
- **Margins**: Strictly respects 6-tile top and 8-tile bottom UI safe zones.

## 4. UI/UX Hierarchy (Open-Air Dashboard)
- **Orientation**: Mandatory Landscape mode. Thematic "System Optimization" gate enforced.
- **Top Command HUD**: Floating transparent corners. 
  - Left: `[ PAUSE ]` and `LVL_#` readout.
  - Right: Glowing `TOKENS` count and `INTEGRITY` bar.
- **Planning Phase**: Enemies (Swarm Signatures) are displayed via a central scanner before the wave is manually executed.
- **Economic Dimming**: Turret purchase boxes dim/grayscale if budget is insufficient.
- **Tactical Hub**: Bottom-center horizontal selector with high-fidelity mecha icons and DMG/RNG stats.

## 5. Defensive Protocols (Turrets)
1. **Pulse MG** (150c): Rapid suppressive fire. Dual black barrels, Cyan core.
2. **Frost Ray** (250c): Cryogenic dish. Freezes enemies for processing. Neon-Blue core.
3. **Blast Nova** (350c): Heavy square mortar. Radius/AOE damage. Gold core.
4. **Railgun** (500c): Magnetic accelerator rails. Massive single-target damage. Intense Red core.

## 6. System Anomalies (Random Glitches)
- **Probability**: 20% chance per wave. Pulse color-coded central banner alert (3 flashes).
- **Overclock**: +50% Turret fire rate.
- **Lag Spike**: -30% Viral propagation speed.
- **System Drain**: -20% Turret range efficiency.

## 7. Technical Standards
- **Performance**: GPU Texture Caching for grid lines. 60FPS mobile lock.
- **Navigation**: Exact cell-by-cell coordinate tracking for 100% path accuracy.
- **Verification**: Post-generation DFS (Depth-First Search) goal reachability audit.
