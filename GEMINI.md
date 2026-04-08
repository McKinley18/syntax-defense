# SYNTAX DEFENSE: CORE MANDATES

## 1. VISION & AESTHETIC
- **Cinematic Boot**: MUST include the multi-stage authorization typing, technical logs, and the **400ms** "WIPE USER SYSTEM" distortion glitch.
- **Visuals**: Neon terminal theme. Grid calibration: **2px thickness**, **Cyan (0x00ffff)** color, **0.6 Alpha** borders, **0.15 Alpha** internal lines.
- **Background**: Title screen MUST feature the animated `grid-background` with sweep and comet effects. **Glow-1 (Top-Left) REMOVED** for clean HUD.

## 2. ENGINEERING STANDARDS
- **State Management**: `GameStateManager` is the master singleton. Use `resetGame(mode, wave)` for session initialization.
- **Persistence**: Rigorously use `localStorage`. `syntax_skip_intro` must bypass boot terminal typing.
- **Tower Context Menu**: Must appear above the dashboard on selection.
- **Turret Unlocks**: 
  - MG: Initial
  - Frost Ray: SCRIPTER
  - Blast Nova: SYS_ARCHITECT
  - Railgun: SENIOR_ENGR
  - Tesla Link: ELITE_ARCHITECT

## 3. TUTORIAL MANDATES (8-Step Sequence)
- **Step 0**: THREAT DETECTED popup -> WARNING: VIRAL DATA INTRUSION.
- **Step 1**: Select Pulse MG (Highlight card).
- **Step 2**: Node Intel Popup -> Explain Radius/Logic.
- **Step 3**: Place on Grid (Highlight Row 6, Col 10). **Snap-to-Grid Override active.**
- **Step 4**: System Upgrade Popup -> Explain Overclocking -> **"CONTINUE"** to start wave.
- **Step 5**: Test Purge (Spawn 1 standard GLIDER).
- **Step 6**: Final Descriptive Popup -> Scrollable info on Kernel, UI locations (Vitals/Tokens), and Virus DB.
- **Step 7**: Finish Onboarding -> Reset to Wave 1, **850 Tokens**, generate new map.

## 4. UI/UX STANDARDS
- **Responsive Navigation**: All "Return to Root" buttons MUST be centered (`align-self: center`).
- **Organized Settings**: Grid layout with three modules: Interface, Audio, Diagnostics. Dark backgrounds (#050505) and 2px neon-blue borders.
- **Instant Archive**: Archive content MUST be visible immediately; header typing is secondary.
