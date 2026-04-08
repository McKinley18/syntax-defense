# SYNTAX DEFENSE: SYSTEM REFERENCE GUIDE

This document serves as the definitive technical and design reference for the **Syntax Defense** application. It categorizes every interaction, visual standard, core process, and structural element for precision maintenance and development.

---

## I. VISUAL IDENTITY & THEME

### 1. Color Palette (NEON PROTOCOL)
| Variable | Value | Usage |
|----------|-------|-------|
| `--neon-cyan` | `#00ffff` | Primary UI accents, Active nodes, Terminal text, Success states. |
| `--neon-blue` | `#0066ff` | Secondary UI borders, Button backgrounds, Radar lines. |
| `--neon-red` | `#ff3300` | Critical errors, Glitch states, Abandon buttons, Damage fill. |
| `--bg-deep` | `#000000` | Global background. |
| `0x00ffff` | PIXI Cyan | Pulse MG, Frost Ray, Glider signature. |
| `0xff00ff` | PIXI Magenta| Strider signature. |
| `0x00ff00` | PIXI Green | Behemoth signature. |
| `0xffff00` | PIXI Yellow | Fractal (Boss) signature. |
| `0xffcc00` | PIXI Gold | Blast Nova core. |
| `0xaa00ff` | PIXI Purple | Tesla Link core. |

### 2. Typography
- **Primary Font**: `'Courier New', Courier, monospace` (Applied to `*`).
- **Logo/Title Font**: `'Arial Black', sans-serif`.
- **Global Character Weight**: `900` (for bold neon impact).
- **Text Scaling**: `clamp(1.2rem, 7.2vw, 3.4rem)` for main logo; `clamp(0.9rem, 4vw, 1.1rem)` for card titles.

### 3. Visual Effects (CRT & GLITCH)
- **Scanlines**: `body::after` uses a repeating linear gradient (`4px` height) with `0.15` alpha to simulate a CRT monitor.
- **Full Screen Scan**: A full-height linear gradient sweeps down the screen every 8 seconds to give a "radar sweep" look.
- **Subtle Glitch**: A random, subtle glitch (`subtle-glitch` animation) occurs on the main menu, causing slight translation and a magenta/cyan chromatic aberration effect.
- **Boot Glitch**: A more aggressive "Virus Leak" stutter sequence with red text (`WIPE_U$ER_SYS_ROOT [ERROR_505]`) and violent screen shake.
- **Subliminal Message**: During the main menu glitch, the message "CORE INTEGRITY COMPROMISED" flashes faintly over the logo.

---

## II. UI STRUCTURE & FORMATTING

### 1. Layout Modules
- **`main-menu`**: A responsive flex container that centers the core content.
- **`menu-top-bar`**: Contains absolutely positioned breadcrumbs (top-left) and diagnostics (top-right).
- **`terminal-menu-window`**: A compact, responsive window with a technical header and list-based content.
- **`encyclopedia`**: Full-screen modal for multi-page information display.

### 2. Main Menu (System Root)
- **Header**: Displays `ARCHITECT@SYNTAX_CORE:~/ROOT$` and a live `DIAGNOSTICS` box (Uptime, Entropy).
- **Logo**: "SYNTAX DEFENSE" on a single, large, responsive line.
- **Terminal Window**:
    - **Header**: `SYSTEM_EXECUTABLES_V2.7` with colored OS dots (red, yellow, green).
    - **List Items**: Vertical list with simulated file size, label, extension, and a color-coded status tag (e.g., `[READY]`).
    - **Interaction**: On hover, a `>>` pointer appears, a full-line gradient highlights the item, and the associated command appears in the bottom input line.
- **Glitch**: Randomly affects the logo, list items, and status tags with a staggered red color shift and chromatic aberration.

### 3. Advanced Protocols Screen
- **Header**: A "command-generated" title that types out `> RUN: LIST_PROTOCOLS.SH`.
- **Layout**: A responsive grid (`mode-grid`) of clickable cards that adapts to screen size.
- **Cards**: Compact elements with reduced padding and responsive text for title and description, optimized for mobile.

### 4. Settings Screen (System Configuration)
- **Header**: Command-generated title types out `> EDIT: /SYS/CONFIG/USER_PREFS.JSON`.
- **Modules**: Organized into three distinct technical modules (Interface, Audio, Diagnostics) with darker backgrounds, stronger borders, and defined headers.
- **Controls**:
    - **Interface Protocols**: Toggle `SKIP SYSTEM BOOT`, `PURGE ONBOARDING CACHE` button.
    - **Audio Engine**: Volume sliders and mute toggles for SFX and Music. Active playlist with refined track item spacing and responsive toggle buttons.
    - **System Diagnostics**: Read-only display of `BUILD_ID`, `KERNEL_STABILITY`, `LIFETIME_PURGES`, `PEAK_WAVE_INDEX`, `CLEARANCE_LEVEL`.

---

## III. CORE PROCESSES & LOGIC

### 1. Cinematic Boot Sequence (Command & Response)
1.  **Command 1**: Types `auth --request-access` in white.
2.  **Response 1**: System types `User access authorized [CLEARANCE_CONFIRMED]` in neon green.
3.  **Command 2**: Types `sys --init-protocols` in white.
4.  **Response 2**: System types `INITIATING DEFENSE PROTOCOL DOWNLOAD...`.
5.  **Loading & Upload**: A progress bar fills, followed by three logs: `UPLOADING KERNEL_MODULES...`, `MOUNTING TACTICAL_ASSETS...`, and `SYNCHRONIZING CORE_LOGIC...`.
6.  **Final Validation**: Sequential typing of `Status: Successful.`, `Access: Granted.`, and the red caution message.
7.  **Virus Leak**: A stuttering red glitch sequence occurs before the final "ACCESS SYSTEM ROOT" button appears.

### 2. Economy & Interest System
- **Kill Bounty**: Credits awarded per virus purged (Glider: 25c, Fractal: 500c).
- **Interest**: 10% base rate on current balance, capped at 1000c per wave.
- **Perfect Wave**: No integrity lost results in `+150c` bonus and `+2%` permanent interest rate increase (max 20%).
- **Repair**: Starts at `500c`, adds `+150c` per use. Restores `1` unit of Kernel Integrity.

### 3. Progression (Architect Ranks)
| Rank | XP Required | Starting Bonus | Unlock |
|------|-------------|----------------|--------|
| **INITIATE** | 0 | +0c | Pulse MG |
| **SCRIPTER** | 1,000 | +50c | Frost Ray |
| **SYS_ARCHITECT** | 5,000 | +100c | Blast Nova |
| **SENIOR_ENGR** | 10,000 | +150c | Railgun |
| **ELITE_ARCHITECT**| 25,000 | +200c | Tesla Link |
| **CORE_GUARDIAN** | 50,000 | +300c | - |
| **GOD_MOD_ADMIN** | 100,000 | +500c | - |

---

## IV. DATA PERSISTENCE

### 1. LocalStorage Keys
- `syntax_total_xp`: BigInt string of total experience.
- `syntax_hall_of_fame`: JSON object `{lifetimeKills, highestWave}`.
- `syntax_defense_save`: JSON object containing active session state (credits, integrity, wave, mode, repair cost).
- `syntax_skip_intro`: Boolean string to bypass the boot sequence.
- `syntax_tutorial_done`: Boolean string to track onboarding completion.

---

*This document is the authoritative source for Syntax Defense. Refer to it for all structural and stylistic edits.*
