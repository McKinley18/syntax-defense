# SYNTAX DEFENSE: MASTER LAYOUT BLUEPRINT [STABLE_v2.0]
*This document serves as the absolute source of truth for the physical layout, scaling, and positioning of the Syndef environment and HUD. This version reflects the 39x13 End-to-End Quantum Grid architecture.*

## I. UNIVERSAL SCALING & QUANTIZATION
- **Logical Canvas:** 1560 x 520 (at 39x13 nodes).
- **Proportion Law:** `font-size: min(1.7vw, 3.4vh);`
- **Quantum Snap:** Stage X-position must snap to `TILE_SIZE * scale` to eliminate partial grid boxes at screen edges.
- **iPhone 15 Spec:** 852 x 393 (Landscape).

## II. TACTICAL GRID (39 x 13)
- **Node Size:** 40px x 40px (TILE_SIZE).
- **Dimensions:** 39 Columns (X) x 13 Rows (Y).
- **Coordinate System:** Bottom-Left is 1x, 1y (Logical 0, 12).
- **Visibility:** Alpha 0.5, Stroke 1.5px, Color `#00ffff` (Neon Cyan).
- **Occupancy Law:** 1 Turret per 40px square. Multiple units cannot stack in the same node.
- **Top/Bottom Buffers:** Row 1 (Bottom) and Row 13 (Top) are strictly BUILDABLE but off-limits for the path generator.

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
    - **Horizontal:** `visibleRight - 40px` (Logical).
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
- **Gutters:** 5% Horizontal screen margin.
- **Tokens Readout:** 2.0rem Font-size, bold white.
- **Initiate Button:** 2.6rem height, 0.85rem font-size, Neon Green box.

---
*V2.0 Blueprint locked. Authorized for complete system restoration.*
