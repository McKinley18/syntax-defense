# 🌌 SYNTAX DEFENSE: Authoritative Technical Blueprint (v48.0)

This document is the definitive master record of the "Syntax Defense" tactical simulation. It contains the hard-locked architectural laws, behavioral scripts, and visual mandates required to reconstruct the simulation with 100% fidelity.

---

## 🏗️ 1. ARCHITECTURAL TOPOLOGY
- **Grid Resolution:** 40 Columns x 14 Rows logical; 40px native tile size.
- **Playable Zone:** Logical Rows 1-12 (User Rows 2-13). 
- **Forbidden Buffers:** Row 0 and Row 13 are strictly prohibited for tactical deployment or pathing.
- **Scaling Law:** Universal `vh`-based scaling: `document.documentElement.style.fontSize = clamp(10px, 1.8vh, 26px)`. Ensures 100% aspect ratio consistency across mobile/desktop.
- **HUD Geometry:** 4 tiles high (160px); anchored below Row 0. Symmetrical 1-tile outer gutters.

---

## 🛤️ 2. TRAVERSAL & PATHING ENGINE (PathManager v47.0)
- **Path Protocol:** Exactly 2 boxes wide (80px); 100% orthogonal (Zero Diagonals).
- **Rail Architecture:** Dual discrete parallel rails consisting of the **exact mathematical centers** of every 1x1 grid box in the path.
- **Abreast formation:** Units move through matching point indices. Since point counts are identical, units round corners in perfect parallel alignment.
- **Turn Enforcement:** Connections are strictly tile-to-tile, forcing sharp 90-degree shifts.

---

## 👾 3. UNIT BEHAVIOR & VISUALS (Enemy v48.0)
- **Traversal Logic:** **Overflow Consumption Protocol**. Units snap instantly to grid centers and apply any remaining frame distance to the next waypoint. Mathematically eliminates jitter and "bouncing."
- **Formation Law:** **5x2 Tactical Blocks**. Spawns 5 rows of abreast pairs with 1200ms row-delays and 5000ms block-delays.
- **Intel Sync:** 1:1 Manifestation. If Intel reports 16 enemies, exactly 8 abreast pairs are enqueued and rendered.
- **Visual Profile:** 16px "Elite" stealth profile. 
- **Orientation:** Mathematically locked to the travel vector (Right, Up, Down).
- **Visibility:** Scale-locked to prevent pulsing animations from overwriting tactical dimensions.

---

## ⚔️ 4. COMBAT & DEPLOYMENT (TowerManager v48.0)
- **Interaction Law:** **Select-and-Commit Build Protocol**. Tap a turret icon in the HUD to arm, tap a grid node to manifest. 
- **Mapping Precision:** Utilizes PIXI's native `stage.toLocal(e.global)` mapping. 100% accuracy regardless of viewport scaling or centering.
- **Ballistics Engine:** Active frame-by-frame projectile tracking.
- **Lethality:** Projectiles use high-intensity graphics on Layer 3. Impact detection at `dist < 10px` with 100% weapon-to-target resolution.

---

## 🎭 5. ATMOSPHERIC PROTOCOL (MainMenu v48.0)
- **3D Title:** Tilted 35deg back with `perspective(1000px)`, `rotateX(35deg)`, and `translateZ(50px)`.
- **Hardware Heartbeat:** Stochastic technical flickers (6s-18s intervals) synchronized across the Title, Background Grid, and Global Illumination.
- **Anomalies:** Rare red symbol-rotation glitches (8% chance per 9s).
- **Navigation:** Conditional initialization. Instant restoration from system tabs; cinematic entry only from Studio Splash.

---

## 🛠️ RECONSTRUCTION COMMANDS
1. **Initialize Root:** `npm install pixi.js react react-dom`
2. **Setup Engine:** Verify `Engine.ts` initializes logical 1600x720 canvas with independent X/Y stretch.
3. **Mount Hierarchy:** 
   - Layer 0: MapManager (Grid/Path)
   - Layer 1: WaveManager (Enemies)
   - Layer 2: Kernel (Objective)
   - Layer 3: Ballistics (Projectiles)
   - Layer 4: TowerManager (Turret Entities/Ghost)
4. **Deploy Authority:** Run `npm run dev` in `/Users/mckinley/Desktop/Syndef`.

**藍図 (BLUEPRINT) STATUS: [AUTHORITATIVE / LOCKED]**
