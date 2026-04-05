# Project Mandates: SYNTAX DEFENSE (Checkpoint v2.3.0)

## 1. Core Identity & Elite Visuals
- **Status**: Mainframe Elite - v2.3.0 Intelligence & Interface Overhaul.
- **Global Centering**: Logo and Menu are mathematically locked to the absolute center of the viewport via full-height column flexbox.
- **Atmospheric Distortion**: Chromatic Aberration (RGB Split) + 3D 45-degree tilt.
  - **Malfunction Engine**: Ambient Natural Flicker vs. Rare Red Breach (150ms).
- **Background**: GPU-cached 24px neon-blue grid with "Glow Trail" data comets and subtle scan-line sweep.
- **Archive Typographics**: "Terminal Fade-In" effect for Archive manuals, simulating console rendering.

## 2. Multi-Mode & Adaptive Logic
- **Initialize Standard**: The primary balanced experience (Victory at Wave 50).
- **Elite Difficulty (Wave 20+)**: "Logic Overload" speed boost (+15%) if credits > 3000.
- **Viral Learning**: If the player deploys 5 or more Pulse MGs, newly spawned Striders gain a "Thermal Shield" granting 50% resistance to Pulse MG attacks.
- **Advanced Protocols**: Hardcore, Endless, Sudden Death, Eco Challenge.

## 3. The "Mainframe Evolution" Mechanics
- **Tactical Feedback ("Juice")**: 
  - **Hit-Markers**: Floating red damage numbers on every turret strike.
  - **Boss HUD**: Microscopic health bars for Elite and Fractal signatures.
  - **Grid Interaction**: Hovering or selecting buildable tiles triggers a "Safe Drop Zone" pulse.
- **Cyber-Acoustic Engine**: 
  - **Wake Protocol**: Silent initialization tied to the very first user interaction.
  - **SFX/Ambient**: Decoupled procedural channels with independent persistent toggles.
- **Tactical Synergies**: Data Links (+10% DMG), Kernel Overdrive, Ghost Reveal.

## 4. UI/UX Hierarchy
- **Predictive Maintenance HUD**:
  - The `[ REPAIR ]` button pulses with a high-intensity critical glow if Integrity is ≤ 5 and the player has sufficient credits.
  - The `dashboard-right` Token/Integrity zone glitches visually if Integrity falls below 10.
  - **Interest Milestones**: The Token display flashes `MAX_INT` when the balance exceeds 2000 credits.
- **Mobile Landscape Lock**:
  - **Arsenal Hard-Lock**: `width: max-content` + `flex-wrap: nowrap` forces strictly horizontal turret scrolling.
  - **Touch Scrolling**: Native `-webkit-overflow-scrolling` enabled for smooth arsenal navigation.
- **Archive Hub**: Unified 6-tab system with compact margins to ensure "Terminate" buttons are visible without scrolling.
- **Tactical Dashboard**: 
  - Left Zone: Logistics (Side-by-side Pause and 2X Speed buttons).
  - Center Zone: 130px protocol cards with permanent technical intelligence.

## 5. Technical Optimization
- **Performance Auto-Throttle**: The engine monitors FPS. If it dips below 45 FPS, ParticleManager is throttled, reducing explosion particle loads to secure a 60FPS lock.
- **Memory Integrity**: Object Pooling implemented for HitMarkers to prevent rapid instantiation overhead and Garbage Collection spikes.
- **Mathematical Scrutiny**: All targeting uses Squared Distance Comparisons (no `Math.sqrt` in update loop).
- **Persistence**: LocalStorage snapshot for Credits, Integrity, Wave, and Audio preferences.

## 6. Development Safeguards
- **Grid Buffer**: Strict 8-tile bottom margin ensures path never intrudes on Dashboard.
- **Boundary Guard**: Top/Bottom rows restricted from turret placement.
- **Audio Guard**: Initialization deferred to first interaction via Wake Overlay.
