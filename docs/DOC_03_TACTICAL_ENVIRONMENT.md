# [03] TACTICAL_ENVIRONMENT: MASTER_LAYOUT_BLUEPRINT

## I. UNIVERSAL SCALING
- **Logical Workspace:** 1600 x 720 (Native 40x18 nodes).
- **Quantum Snap:** All tactical entities strictly lock to `TILE_SIZE` (40px).

## II. HIGH-CONTRAST TOPOLOGY
- **Tactical Grid:** Cyan stroke (`0x00ffff`, 0.08 alpha) over absolute black.
- **Pathway Architecture:**
  - **Visual:** Solid, opaque black blocks (`alpha: 1.0`).
  - **Logic:** The path layer is mounted *above* the grid, effectively masking it to create a clear corridor.
  - **Definition:** Subtle cyan edge stroke (`alpha: 0.15`) defines the corridor boundaries.

## III. QUANTUM HUD GEOMETRY
- **Safe Zone:** Content anchored between Column 3 and Column 39.
- **Distribution:**
  - **STATUS:** 9 Tiles (Left).
  - **PROTOCOL:** 17 Tiles (Center, includes 3-Wide Array + Intel).
  - **LOGISTICS:** 9 Tiles (Right).
- **Buffers:** 1-tile length gutters on all module boundaries.

## IV. PLACEMENT VALIDATION
- **Neural Brain Mapping:** Proactively identifies 100% of non-path squares.
- **Indicator Protocol:**
  - **Green Snap:** Available node.
  - **Red Snap:** Occupied or Path cell.
  - **Reach Signature:** Cyan halo represents weapon range during drag.
