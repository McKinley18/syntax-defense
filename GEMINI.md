# GEMINI OPERATIONAL DIRECTIVES

## 1. SOURCE OF TRUTH: LAYOUT
- Always refer to `SYNDEF_LAYOUT_BLUEPRINT.md` for environmental, grid, and HUD parameters.
- Do not alter the scaling law `clamp(10px, 1.6vw, 18px)` or the banner height `8.2rem` without explicit authorization.
- The **Kernel Hub** must remain centered at `LogicalRight - 20px`.

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
