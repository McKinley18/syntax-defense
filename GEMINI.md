# Project Mandates: SYNTAX DEFENSE

## 1. Core Identity
- **Theme**: Cyber-System / Digital Mainframe Defense.
- **Visuals**: Matte black background, high-contrast surgical blue grid, solid grey data-paths (exactly 2 blocks wide).
- **Style**: Minimalist, high-tech, geometric.

## 2. Core Mechanics
- **The Shift**: The path reconfigures randomly at the start of every wave (winding, branching, and merging).
- **Deployment**: Turrets are temporary and disappear after each wave.
- **Economy**: No refunds. Your budget for the next wave is determined solely by credits earned during the current wave. Starting Credits: 500.
- **Health**: 20 System Integrity (Lives).
- **Difficulty**: Progressive scaling. Waves must feel like swarms (large enemy counts). New enemy types are introduced every 3-4 waves.

## 3. UI/UX Standards
- **Responsive Design**: Mobile-first priority. Full-screen canvas that scales to window size.
- **The Command Banner**: Bottom-aligned, perfectly snapped to the grid. 
- **Turret Information**: The banner must display cost, damage type, damage value, and range (measured in grid squares).
- **Turret Hierarchy**: Ordered by increasing cost and impact.

## 4. Turret Arsenal
1. **Pulse MG** (150c): Rapid-fire, low damage, single target.
2. **Frost Ray** (250c): Slower fire rate, minimal damage, but freezes enemies for 5 seconds.
3. **Blast Nova** (350c): Moderate fire rate, radius/AOE damage.
4. **Railgun** (500c): Very slow fire rate, massive single-target damage, long range.

## 5. Unique Variables (Random Events)
- **System Glitches**: Occur on random waves at random times.
- **Event Types**: 
  - *Overclock*: Temporary damage boost.
  - *Lag Spike*: Temporary enemy slow.
  - *Data Corruption*: Reduced visibility/Fog of War.
  - *System Drain*: Turret range reduced.

## 6. Technical Requirements
- **Grid System**: Strict 64px global grid.
- **Navigation**: Node-based graph for branching/merging paths.
