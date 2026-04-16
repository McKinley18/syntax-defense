# GEMINI OPERATIONAL DIRECTIVES

## 1. SOURCE OF TRUTH: LAYOUT
- Always refer to `SYNDEF_LAYOUT_BLUEPRINT.md` for environmental, grid, and HUD parameters.
- Do not alter the scaling law `min(1.7vw, 3.4vh)` or the banner height `8.2rem` without explicit authorization.
- The **Kernel Hub** must remain centered at `visibleRight - 80px`.

## 2. HUD ARCHITECTURE
- Maintain the **Island Architecture**: 3 modules centered in the banner with 5% side gutters.
- **Left Module:** Logistics Stack + Token Readout.
- **Center Module:** 3-Slot scrollable Protocol Deck.
- **Right Module:** Mission ID + Integrity Gauge + Initiate Button.

## 3. GRID & PATHING
- Path is strictly **2-wide**, **Absolute Black**, and **Edge-to-Edge**.
- Grid lines must always render **ON TOP** of the path to define borders.
- Path must terminate at the Hub on the right.

## 4. UI COMPONENTS
- Turret cards: Name (Top) -> Icon (Mid) -> Stats (Bottom).
- All UI measurements must be in `rem`.
