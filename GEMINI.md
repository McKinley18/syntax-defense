# Project Mandates: SYNTAX DEFENSE (Checkpoint v2.0.0)

## 1. Core Identity & Elite Visuals
- **Status**: Mainframe Elite - v2.0 Production Baseline.
- **Atmospheric Distortion**: Chromatic Aberration (RGB Channel Splitting).
  - Triggers specifically during "Rare Breach" events to simulate deep hardware failure.
- **Title**: 45-degree 3D tilt with refined dual-mode malfunction engine.
  - **Ambient**: Natural electrical flicker (multi-phase shimmer jitter).
  - **Rare Breach**: 150ms sharp burst (Red-letter flash + technical red grid strobe + glitch-snap jitter + Chromatic Distortion).
- **Background**: GPU-cached 24px neon-blue grid with high-intensity "Glow Trail" data comets.
- **Scan Line**: Subtle atmospheric sweep (0.05 opacity) traversing the grid every 8 seconds.

## 2. Multi-Mode & Adaptive Logic
- **Initialize Standard**: The primary balanced experience.
- **Elite Difficulty (Wave 20+)**: 
  - **Greed-Reactive Swarms**: If credits > 3000, swarms gain +15% speed (Logic Overload).
- **Advanced Protocols**: Hardcore, Endless, Sudden Death, Eco Challenge.

## 3. The "Mainframe Evolution" Mechanics
- **Tactical Synergies**: Adjacent identical turrets form "Data Links" for +10% DMG (max +30%).
- **Kernel Overdrive**: Automatic 360-degree shockwave defense when Integrity < 5.
- **Elite Signatures**: 3.5x HP mini-bosses appearing every 5 waves.
- **Ghost Packets**: Invisible viruses targetable only when revealed by Frost Ray/Tesla Link.
- **Cyber-Acoustic Engine**: Native Web Audio API procedural soundscape with independent SFX/Ambient channels.

## 4. UI/UX Hierarchy
- **System Settings Hub**: Persistent configuration for audio channels and system diagnostics.
- **System Information Hub (Archive)**: 6-tab navigation (LORE, VIRUSES, TURRETS, MODES, THREATS, LOGIC).
- **Tactical Dashboard**: 
  - Anchor Lock: Pulse MG (index 0) always visible.
  - Permanent Intelligence: ATK, RNG, and COST visible for all units.
  - Floating Lock: Absolute positioning prevents data obstruction.

## 5. Technical Optimization (Performance Lock)
- **Mathematical Scrutiny**: All targeting uses Squared Distance Comparisons (no `Math.sqrt` in update loop).
- **Memory Integrity**: Explicit ticker removal and renderer guards prevent leaks.
- **Restoration Logic**: `prepareWave(false)` ensures map-sync without progress skipping.

## 6. Development Safeguards
- **Grid Clearance**: Strict 8-tile bottom margin in PathManager.
- **Boundary Enforcement**: Top and bottom grid rows are off-limits for unit placement.
- **Audio Guard**: Context initialization deferred to first user interaction.
