# Aesthetic & UX Stability (Verified Production)

## Act 1: The Mainframe Grid
- **Scale:** Hard-coded to exactly 20px to match main menu.
- **Render:** PIXI `TilingSprite` for 100% uniformity.
- **Aesthetic:** rgba(0, 255, 255, 0.3) lines on pure black background.
- **Pathing:** Solid black void construction (no gridlines).

## Act 2: Singleton Integrity (HMR Protection)
- **Protocol:** `GameStateManager` and `TextureGenerator` must be cleared and reset during the `GameContainer.init()` phase.
- **Reason:** Prevents browser-cached singletons from holding stale state across reloads.

## Act 3: Coordinate Mapping
- **Mandate:** Use `viewport.toGlobal(target)` combined with `updateTransform()` for every UI highlight.
- **Fallback:** Step 3 and 6 must have hard-coded pixel fallbacks for tutorial reliability.
