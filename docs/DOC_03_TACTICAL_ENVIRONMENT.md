# [03] TACTICAL_ENVIRONMENT: MASTER_LAYOUT_BLUEPRINT

## I. PHYSICAL TOPOGRAPHY (V1.6.0)
- **Grid Resolution:** 40 Columns x 14 Rows.
- **Node Matrix:** 560 logical nodes.
- **Scaling Law:** Full-Surface Stretch (Independent X/Y).
- **Logical Dimension:** 1600px x 560px (Simulation) within a 720px Engine Frame.

## II. ZONAL DEFINITIONS
- **ROW 0:** Top Forbidden Buffer. No Pathing. No Placement.
- **ROWS 1-12:** Playable Tactical Zone. Authorized for Pathing and Deployment.
- **ROW 13:** Bottom Forbidden Buffer. Primary HUD interface. No Pathing. No Placement.
- **HUD ZONE:** Rows 14-17 (Engine Space). Hard-affixed UI layer.

## III. PATH ARCHITECTURE (AUTHORITY VOID)
- **Width:** Exactly 2 grid boxes wide (80px logical).
- **Flow:** Continuous left-to-right (Col 0 to Col 40).
- **Parallel Separation:** Minimum 1-grid square empty buffer between parallel segments.
- **Visuals:** Solid black mask erasing internal grid lines with sharp cyan side-borders.

## IV. UNIT TRAVERSAL
- **Formation:** Atomic Pair-Spawning (Zero Stagger).
- **Alignment:** Perpendicular vector offsets (+/- 18px).
- **Scale:** Reduced 14px virus profile for spacious combat feel.
