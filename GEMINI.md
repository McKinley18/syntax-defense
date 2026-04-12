# SYNTAX DEFENSE: SYSTEM RECONSTRUCTION PROTOCOLS (SOP)

## 1. CORE MISSION & AESTHETIC
- **Vision:** Neon Terminal / Cyberpunk Minimalist. High-fidelity tactical defense.
- **Palette:** Cyan (Primary UI), Green (Success), Red (Warning), Orange (Tactical Highlight).
- **Iconography:** **CSS-ONLY SHAPES ONLY.** No external assets or SVGs for UI icons. 
- **UX:** High-fidelity animations (CRT beam, scanning, glitching) paired with mechanical keyboard audio.

## 2. VERIFIED PROCESS DOCUMENTATION
These blueprints are the **Single Source of Truth** for rebuilding the production build:
- **Startup:** `docs/processes/startup.md` (Cold Boot sequence & Splash timing).
- **Tutorial:** `docs/processes/tutorial.md` (9-Step Sequential Flow).
- **Pathing:** `docs/processes/pathing.md` (Constraint-based generation & Smooth Lanes).
- **Economy:** `docs/processes/economy.md` (Scrap Reclamation & Compounding Interest).
- **Combat:** `docs/processes/mechanics.md` (Targeting Profiles & Proximity Synergies).
- **Stability:** `docs/processes/ux-stability.md` (PIXI Lifecycle & Scaling).

## 3. MASTER-DEVELOPER MANDATES

### A. Environment & Pathing
- **Generation:** Paths MUST start at Col 0 and end at Max Col. 
- **Playable Zone:** Top 2 and Bottom 3 rows are mathematically locked from pathing/building.
- **Lanes:** Use pre-calculated smooth splines (Lane A/B) for side-by-side enemy travel.

### B. The Economy Loop (The Wipe)
- **Mandatory Wipe:** ALL turrets are cleared via `clearTowers()` at the end of every round.
- **Scrap Reclamation:** Players receive a base 50% refund (upgradable) of total field value at round end.
- **Interest:** 10-25% compounding interest on unspent credits awarded per wave.

### C. Combat Intelligence
- **Targeting Profiles:** 
    - MG: Closest to Kernel.
    - Railgun: Highest HP.
    - Frost: Fastest non-frozen.
    - Nova: Clusters.
    - Tesla: Shielded.
- **Synergies:** Adjacency (2.0 tiles) triggers links (Frost+MG = Slow, Tesla = +30% Speed).

### D. Swarm Evolution
- **Scaling:** Exponential budget (`15 * 1.15^wave`).
- **Complex Units:** 
    - **Splitters:** Behemoths split to 2 Striders; Striders to 3 Gliders.
    - **Shields:** Behemoths carry Thermal Shields (Cyan pulse).

## 4. REPOSITORY MAINTENANCE
- **Clean State:** Only production-ready files allowed. Purge all `temp-*`, `Untitled`, and `TODO` logs.
- **Documentation Sync:** Any logic change MUST be updated in the relevant `/docs/processes/` page.
