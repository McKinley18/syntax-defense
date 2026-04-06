# Project Mandates: SYNTAX DEFENSE (Checkpoint v2.4.3)

## 1. Core Identity & Elite Visuals
- **Status**: Mainframe Elite - v2.4.3 Onboarding & Interface Calibration.
- **Global CRT Aesthetic**: Global 4px linear-gradient scanline overlay (`body::after`) for authentic terminal feel.
- **Atmospheric Distortion**: 
  - **Malfunction Engine**: Optimized 8s cycle. Short (200ms) visual glitches with "Glitch Buzz" SFX.
  - **Audio Guard**: Ambient Breach SFX removed from random glitches; strictly reserved for actual core damage.
- **Background**: GPU-cached 24px neon-blue grid with "Glow Trail" data comets.
- **Color Palette**: Distinct Cyan (`#00ffff`) for engagement ranges and Pink (`#ff00ff`) for STRIDER class viral signatures.

## 2. Interactive Onboarding (Tutorial System)
- **Three-Step Engagement**:
  1. **Select Pulse MG**: Accurate highlight on the dashboard card.
  2. **Initialize Placement**: Strategic "Radius Engagement" briefing popup detailing unlock tiers (Lvl 4, 8, 15, 20).
  3. **Deploy Node**: Vertical pointer pointing to Tile (5, 6).
  4. **Commence Defense**: "Syntax Mainframe" briefing explaining Left-to-Right pathing and integrity loss.
- **Demo Mode**: Tutorial Wave 1 features a high-HP (500) single enemy to allow users to observe engagement mechanics.
- **Path Override**: Wave 1 tutorial forces a straight horizontal path to simplify initial learning.
- **Reset Logic**: "Reset Tutorial" available in System Settings to purge LocalStorage flag.

## 3. UI/UX Hierarchy
- **Tactical Dashboard**:
  - **Right Zone (Financial/Integrity)**: Right-aligned vertical stack. 160px width.
    - Tokens: Big value with "TOKENS:" label on the left.
    - System Status: Dynamic text (STABLE / DEGRADED / CRITICAL) aligned with the life bar.
  - **Left Zone (Logistics)**: Standardized Pause and >> (2X) buttons.
- **Clean Interface**: Full sweep removing underscores from UI labels (e.g., "INITIALIZE STANDARD", "EXIT TUTORIAL").
- **Overlay Management**: Condensed "Execute Defense Protocol" box with scroll support to prevent dashboard occlusion.

## 4. Multi-Mode & Adaptive Logic
- **Elite Difficulty (Wave 20+)**: "Logic Overload" speed boost (+15%) if credits > 3000.
- **Viral Learning**: If the player deploys 5 or more Pulse MGs, newly spawned Striders gain a "Thermal Shield" granting 50% resistance to Pulse MG attacks.
- **Advanced Protocols**: Hardcore, Endless, Sudden Death, Eco Challenge.

## 5. Mainframe Evolution Mechanics
- **Tactical Feedback ("Juice")**: 
  - **Hit-Markers**: Floating red damage numbers on every turret strike.
  - **Boss HUD**: Microscopic health bars for Elite and Fractal signatures.
- **Cyber-Acoustic Engine**: 
  - **SFX Muting**: Patched `playProcedural` to respect SFX master toggle for placement/purge sounds.
  - **Music Engine**: Subtle 124 BPM background data-track.
- **Tactical Synergies**: Data Links (+10% DMG), Kernel Overdrive, Ghost Reveal.

## 6. Technical Optimization
- **PixiJS 8 Integrity**: Updated `destroy()` patterns to prevent `_cancelResize` TypeErrors.
- **Performance Auto-Throttle**: FPS-based particle reduction (throttles below 45 FPS).
- **Persistence**: LocalStorage snapshot for Credits, Integrity, Wave, and Audio preferences.
- **TypeScript Compliance**: Full casting for Registry indexing and corrected Tower property definitions (`rate`).

## 7. Development Safeguards
- **Grid Buffer**: Strict 8-tile bottom margin ensures path never intrudes on Dashboard.
- **Boundary Guard**: Top/Bottom rows restricted from turret placement.
- **Audio Guard**: Initialization deferred to first interaction via Wake Overlay.
