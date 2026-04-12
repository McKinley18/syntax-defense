# Constraint-Based Pathing (Verified Production)

## Act 1: 2x2 Macro-Block Generation
- **Architecture:** The path is constructed using 2x2 grid "Macro Blocks" to guarantee a strict 2-tile width at all times.
- **Rules:**
    - Must start at Column 0 (Left).
    - Must end at Max Column (Right).
    - Only the entrance and exit are permitted to touch the screen borders.
- **Turns:** All turns are mathematically forced to be rigid 90-degree angles (no curves).

## Act 2: Spatial Buffer Guard
- **Constraint:** The path is forbidden from touching any existing part of itself (other than its direct predecessor).
- **Result:** This guarantees at least a 1-macro-block (2-micro-tile) gap between parallel path segments for clean tower placement.

## Act 3: Side-by-Side Travel
- **Lanes:** Parallel invisible paths (Lane A/B) offset by +/- 5px from the center.
- **Smoothness:** Spline-based coordinate updates ensure jitter-free travel even through 90-degree snaps.
