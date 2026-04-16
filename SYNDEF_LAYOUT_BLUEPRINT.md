# SYNTAX DEFENSE: MASTER LAYOUT BLUEPRINT [STABLE_v2.0]
*This document serves as the absolute source of truth for the physical layout, scaling, and positioning of the Syndef environment and HUD. This version reflects the 40x14 End-to-End Quantum Grid architecture.*

## I. UNIVERSAL SCALING & QUANTIZATION
- **Logical Canvas:** 1600 x 560 (at 40x14 nodes).
- **Proportion Law:** `font-size: clamp(10px, 1.6vw, 18px);`
- **Quantum Snap:** Stage X-position must snap to `TILE_SIZE * scale` to eliminate partial grid boxes at screen edges.
- **iPhone 15 Spec:** 852 x 393 (Landscape).

## II. TACTICAL GRID (40 x 14)
- **Node Size:** 40px x 40px (TILE_SIZE).
- **Dimensions:** 40 Columns (X) x 14 Rows (Y).
- **Coordinate System:** Bottom-Left is 0, 0 (Logical).
- **Visibility:** Alpha 0.6, Stroke 1.5px, Color `#00ffff` (Neon Cyan).
- **Occupancy Law:** 1 Turret per 40px square. Multiple units cannot stack in the same node.

## III. SMART DATA PATH (VIRAL STREAM)
- **Width:** Strictly 2 grid squares wide.
- **Continuity:** End-to-End (Physical Left Edge to Physical Right Edge).
- **Color:** Absolute Black (`#000000`).
- **Generation Logic:** 100% Efficient Zig-Zag (Right -> Vertical -> Right).
- **Parallel Isolation:** Minimum 1-tile void gap between parallel path segments.
- **Perimeter:** Top-layer Cyan grid lines explicitly outline all path boundaries.

## IV. CYBERNETIC KERNEL HUB
- **Visual Identity:** Digital Nucleus with Multi-Layer Bloom.
    - **Layers:** Outer Atmospheric Glow -> Core Hull -> Internal Power Spark -> Logic Unit (White).
    - **Orbits:** 3D Axial Tumbling Rings (X and Y axis flip).
- **Positioning:**
    - **Horizontal:** `LogicalRight - 20px` (Logical).
    - **Vertical:** Perfectly centered on the horizontal seam of the 2-wide path.
- **Status Glow:** Terminal Cyan (Stable) -> Neon Red (Breach Alert < 25% Integrity).

## V. VIRAL INGRESS PROTOCOL
- **Spawning:** Simultaneous side-by-side Pairs.
- **Size:** 20px Diameter (Logical).
- **Formation:** Lane offsets $\pm$ 15px from the path's mathematical center seam.
- **Interval:** 25-frame spawn delay (High-density tactical stream).
- **Ingress Origin:** `visibleLeft - 80px` (Physical off-screen).

## VI. COMMAND CONSOLE (HUD)
- **Banner Height:** `8.2rem`.
- **Architecture:** 3-Module Centric Island (Logistics | Protocol Deck | Vitals).
- **Gutters:** 2.5% per side (Total 5% Horizontal screen margin).
- **Tokens Readout:** 1.1rem Font-size, bold white.
- **Initiate Button:** 3.0rem height, 1.1rem font-size, Neon Green box.

---
*V2.0 Blueprint updated to match current code implementation.*
