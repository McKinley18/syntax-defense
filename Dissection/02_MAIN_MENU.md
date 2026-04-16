# [02] MAIN_MENU: SYSTEM ROOT HUB

## I. TRANSITION FLOW
- **TRIGGER**: `[ ACCESS SYSTEM ROOT ]` click.
- **AUDIO**: `AudioManager.getInstance().playPowerOn()`.
- **ANIMATION**: Transition from Boot to Menu screen.

## II. INTERFACE MODULES
- **CENTRAL_NAV**:
  - `[ INFILTRATE_CORE ]` -> `MODES`
  - `[ SYSTEM_ARCHIVE ]` -> `ARCHIVE`
  - `[ DIAGNOSTICS ]` -> `SETTINGS`
- **DIAGNOSTIC_OVERLAY**:
  - **UPTIME**: Counter (s).
  - **ENTROPY**: 0.00 - 1.00 (Dynamic jitter).
  - **STATUS**: `ACTIVE` (Neon Green).

## III. VISUALS
- **BACKGROUND**: `GridBackground` component.
- **EFFECTS**: Periodic menu glitches (`menuGlitchActive`).
- **CURSOR**: Mouse-reactive `mousePos` for subtle parallax effects.
