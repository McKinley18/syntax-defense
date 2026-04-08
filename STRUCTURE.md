# SYNTAX DEFENSE: MAINFRAME ARCHIVE STRUCTURE

## I. TACTICAL DATABASE (Combat Specs)

### 1. VIRAL DB (Enemy Signatures)
| Signature | HP (Base) | Speed | Reward | Special Protocol |
|-----------|-----------|-------|--------|------------------|
| **GLIDER** | 40 | 1.2x | 18c | Standard packet stream. |
| **STRIDER**| 120 | 1.0x | 35c | **Thermal Shield**: 50% resistance to Pulse MG. |
| **BEHEMOTH**| 450 | 0.6x | 45c | Heavy bulk data. High priority target. |
| **FRACTAL** | 2500 | 0.4x | 180c | **Boss Unit**: Deals 10 Kernel Damage on breach. |

### 2. PROTOCOLS (Defensive Nodes)
| Node Type | Cost | DMG | Range | Rate | Unlock Rank | Special Ability |
|-----------|------|-----|-------|------|-------------|-----------------|
| **PULSE MG** | 150c | 10 | 4 tiles | Fast | INITIATE | Rapid-fire logic pulses. |
| **FROST RAY**| 250c | 2 | 5 tiles | Med | SCRIPTER | **Freeze (30f)** + Reveals Ghost Packets. |
| **BLAST NOVA**| 350c | 30 | 3 tiles | Slow | SYS_ARCH | **AOE Burst**: 60px impact radius. |
| **RAILGUN** | 500c | 250 | 10 tiles| Slow | SR_ENGR | **Piercing**: High DMG + Reveals Ghosts. |
| **TESLA LINK**| 750c | 45 | 5 tiles | Med | ELITE_ARCH | **Chain**: Arcs to 3 adjacent targets. |

### 3. THREAT VECTORS
- **ELITE SIGNATURES**: 15% spawn chance every 5 swarms. 3.5x HP, 2.5x Bounty. Visualized by white outer glow.
- **GHOST PACKETS**: Spawn after Wave 10. 15% chance. Nearly invisible (0.15 alpha). Must be revealed by Frost/Tesla/Railgun.
- **SYSTEM GLITCHES**: 25% chance per wave start.
  - `OVERCLOCK`: +25% Tower Fire Rate / +25% Enemy Speed.
  - `LAG_SPIKE`: Enemies slowed by 30%.
  - `SYSTEM_DRAIN`: Interest rate locked to 0% for one swarm.

## II. SYSTEM HANDBOOK (Logic & Progression)

### 1. CORE LOGIC
- **SYNERGY LINKS**: Adjacent identical turrets grant cumulative **+10% DMG**. Visualized by connecting neon lines.
- **OVERCLOCKING**: Turrets can be upgraded to **Level 3**. L2: +25% DMG, L3: +50% DMG + Bonus (e.g., Frost Ray +1 Range).
- **INTEREST**: 10% base rate on current balance (capped at 1000c). Perfect waves grant **+2% permanent increase** (max 20%).
- **REPAIR**: Kernel can be repaired for tokens. Cost starts at 500c and increases by 150c per use.

### 2. ARCHITECT RANKS
| Rank | XP Required | Starting Token Bonus |
|------|-------------|----------------------|
| **INITIATE** | 0 | +0c |
| **SCRIPTER** | 1,000 | +50c |
| **SYS_ARCHITECT** | 5,000 | +100c |
| **SENIOR_ENGR** | 10,000 | +150c |
| **ELITE_ARCHITECT**| 25,000 | +200c |
| **CORE_GUARDIAN** | 50,000 | +300c |
| **GOD_MOD_ADMIN** | 100,000 | +500c |

## III. MAINFRAME MANIFEST (Lore & Meta)

### 1. SYSTEM MODES
- **STANDARD**: Standard rules. 850c start (plus rank bonus).
- **HARDCORE**: 1000c start. **No Interest**. All towers cost 50% more. **2x XP Gain**.
- **SUDDEN DEATH**: Integrity set to 1. No repairs. High-stakes logic preservation.
- **ECO CHALLENGE**: **No Kill Bounties**. All income must be generated via the Interest system.
- **ENDLESS LOOP**: No wave cap. Viral signatures gain exponential HP multipliers.

### 2. ARCHITECT ONBOARDING (Tutorial)
- **8-Step Guided Entry**:
  0. Intro (Threat Detected) -> 1. Select MG -> 2. Node Intel (Radius) -> 3. Place (10,6) -> 4. Upgrade Intel -> 5. Test Purge (1 Glider) -> 6. Final Descriptive Popup (Kernel/UI/Viruses) -> 7. Reset to Wave 1.

### 3. PERSISTENCE LAYER
- `syntax_total_xp`: Total XP.
- `syntax_hall_of_fame`: `{highestWave, lifetimeKills}`.
- `syntax_defense_save`: Full session state (Credits, Integrity, Wave, Mode).
- `syntax_skip_intro`: User boot preference.
