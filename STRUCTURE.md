# SYNTAX DEFENSE: MAINFRAME BLUEPRINT (v3.5)

## I. PRODUCTION & INITIALIZATION (Onboarding Flow)

### 1. MASTER INITIALIZATION HIERARCHY [LOCKED]
The system enforces a strict sequential gate to ensure production value and technical stability. The sequence MUST proceed in this exact order:

1. **ORIENTATION GATE**: 
   - **Condition**: `!isLandscape`
   - **Visual**: "LANDSCAPE MODE REQUIRED" full-screen warning.
   - **Logic**: Entire app is hidden until correct physical orientation is achieved.

2. **STUDIO SPLASH (MONOLITH_STUDIOS)**:
   - **Condition**: `isLandscape && !studioComplete`
   - **Duration**: 3.5s (Managed via `showStudioSplash` timer).
   - **Visual**: Minimalist three-bar monument logo + "MONOLITH PRESENTS".
   - **Transition**: Fades out via CSS `studio-fade-out`.

3. **CINEMATIC BOOT (Terminal Sequence)**:
   - **Condition**: `studioComplete && screen === 'BOOT'`
   - **Visual**: One-by-one terminal commands and responses (auth, sys, login).
   - **Final Trigger**: Manual [ ACCESS SYSTEM ROOT ] button appearing after sequence completion (Phase 18).

### 2. BOOT SEQUENCE SCHEMATIC [PHASES]
| Act | Phase | Action | Type | Condition |
|-----|-------|--------|------|-----------|
| **1** | 1 | `auth --request-access` | User | Auto-start |
| **1** | 3 | Access Authorized | Sys | Act 1 response |
| **1** | 4.1 | Welcome Back | Sys | Session start |
| **CL** | 4.5 | [ CLEAR TERMINAL ] | Logic | 5s delay |
| **2** | 5 | Welcome back, ARCHITECT | Log | Act 2 start |
| **2** | 6.1 | `sys --mount-tactical-logic` | User | Act 2 command |
| **2** | 6.6 | Protocol Download | Loader | Act 2 loading |
| **2** | 7 | technical_logs.sh | Logs | Act 2 detail |
| **CL** | 8.5 | [ CLEAR TERMINAL ] | Logic | Transition |
| **3** | 10 | Status: Successful | Sys | Act 3 start |
| **3** | 12 | Access: Granted | Sys | Act 3 response |
| **3** | 13.5 | `sys --scan-integrity --deep` | User | **The Trigger** |
| **3** | 14 | CRITICAL_ALERT | Alert | System Failure |
| **3** | 14.5 | Manual Containment? | Prompt | Crisis Choice |
| **3** | 14.7 | "Y" | User | Hesitation |
| **3** | 14.9 | `sys --purge-auto --all` | User | Final Attempt |
| **3** | 15.2 | AUTO_PURGE_FAILED | Error | Glitch Line |
| **3** | 15.5 | EMERGENCY_HANDOFF | Handoff | Manual Req. |
| **3** | 16 | RED GLITCH (300ms) | Effect | "INITIALIZE" |
| **3** | 18 | SYSTEM ROOT | Entry | Main Menu |

---

## II. TACTICAL DATABASE (Combat Specs)

### 1. VIRAL SIGNATURES (Enemies)
- **GLIDER**: 40 HP | 1.2x Speed | 18c | Standard unit.
- **STRIDER**: 120 HP | 1.0x Speed | 35c | 50% Pulse MG Resistance.
- **BEHEMOTH**: 450 HP | 0.6x Speed | 45c | High Priority / Tank.
- **FRACTAL**: 2500 HP | 0.4x Speed | 180c | Boss (10 Kernel Damage).

### 2. DEFENSE PROTOCOLS (Towers)
- **PULSE MG**: 150c | 10 DMG | 4 Range | Fast.
- **FROST RAY**: 250c | 2 DMG | 5 Range | Med (Freeze 30f).
- **BLAST NOVA**: 350c | 30 DMG | 3 Range | Slow (AOE).
- **RAILGUN**: 500c | 250 DMG | 10 Range | Slow (Pierce).
- **TESLA LINK**: 750c | 45 DMG | 5 Range | Med (Chain Arcs).

---

## III. CORE SYSTEM ENGINES (Logic & Performance)

### 1. ADAPTIVE SWARM ENGINE (Intelligence)
- **Difficulty Grace (Wave 1-4)**: Engine runs at **35% intensity**.
- **Wave 1 Fixed**: Strictly **10 GLIDERS** side-by-side.
- **Hoard Counter**: If credits > 1500, swarm size and HP scale dynamically.
- **Power Counter**: Enemy HP scales based on total turret DPS.
- **Side-by-Side Movement**: Enemies travel in parallel lanes across the 2-wide path.

### 2. PERFORMANCE LAYER (Efficiency)
- **Concurrency Cap**: Max **40 concurrent enemies**.
- **HP Compression**: Excess enemy count converted to HP multiplier (`currentWaveHpMult`).
- **Resource Pooling**: 
    - **Enemy Pool**: (Future implementation pending)
    - **Graphic Pool**: Projectiles, muzzle flashes, and lightning are recycled via `ParticleManager`.

### 3. AUDIO SYNTHESIS (Techno Engine)
- **Routing**: Synth -> Master Lowpass Filter -> Stereo Delay -> Master Gain.
- **Sidechain**: Kick drum triggers master volume ducking (pump effect).
- **Tracks**: 15 unique tracks with analog-style waveforms (Sine, Saw, Square, Triangle).
- **Rotation**: 3-minute phrases (128-384 beats @ 126 BPM).

---

## IV. MAINFRAME CONFIGURATION (UI & Settings)

### 1. SYSTEM CALIBRATION
- **CRT Scanlines**: Toggable 3px horizontal overlay.
- **Glitch Events**: Toggle random background distortions.
- **Auto-Pause**: Optional wave-end system lock.
- **Stats Purge**: Reset all lifetime XP and persistence via Settings.

### 2. ARCHITECT CLEARANCE (Progression)
- **XP Scaling**: 50 XP per wave (Standard) | 100 XP per wave (Hardcore).
- **Ranks**: INITIATE -> SCRIPTER -> SYS_ARCHITECT -> SENIOR_ENGR -> ELITE_ARCHITECT -> CORE_GUARDIAN -> GOD_MOD_ADMIN.

---
**BLUEPRINT VERIFIED: v3.5 // MONOLITH_STUDIOS**
