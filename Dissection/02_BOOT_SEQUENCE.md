# [02] BOOT_SEQUENCE: CINEMATIC_TERMINAL (FINAL SPEC)

## I. SYSTEM GATE (PHASE 0)
- **TRIGGER**: User click `[ INITIALIZE SYSTEM ]`.
- **AUDIO**: `AudioManager.playUiClick()` + `AudioManager.resume()`.
- **VISUAL**: Header text (#aaa) appears.

## II. ACT 1 & 2: AUTHORIZATION & MOUNTING
*Refer to earlier sections for Packet 01-04 and Progress Bar logic.*
- **FINAL STEP**: `Access: Granted.` holds for 2.0s.
- **TRANSITION**: Phase 13.4 -> 13.5 (Clear Terminal).

## III. ACT 3: THE BREACH
1. **COMMAND**: `sys --scan-integrity --deep` (White | Speed 60).
2. **SCAN**: `SCANNING_MEM_SECTOR_0x1... OK. ...0x3...` (Green | Speed 15).
3. **ALERT**: `>> MALICIOUS_DATA_DETECTED: [STORM_LEVEL_7]` (Green | Speed 40).
4. **PROMPT**: `Proceed with automated containment? (Y/N)` (Green | Speed 40).
5. **USER**: `Y` (White | Speed 150) appended to the same line as prompt after 500ms.
6. **FAILURE 1**: `INITIATING_AUTOMATED_CONTAINMENT... [FAILED]` (Green | Speed 40).
7. **COMMAND 2**: `sys --purge-auto --all --force` (White | Speed 60).
8. **FORCED PURGE**: `FORCING_PURGE... ERROR_0x88... OVERLOAD_DETECTED...` (Red | Speed 15).
9. **CRITICAL ERROR**: `CRITICAL_ERROR: MANUAL_PURGE_FAILED [KERNEL_OVERLOAD]` (Red | Speed 40).
   - **CHAOS TRIGGER**: Once this line finishes (Phase 15.3), `isRedMode` activates.
   - **EFFECTS**: All text turns Red, Header enters Chaos Chatter, Distortion active.
10. **SAFE MODE**: `INITIATING_SAFE_MODE_SEQUENCE... [CRITICAL_FAILURE]` (Red | Speed 40).
11. **HANDOFF**: `RELINQUISHING_SYSTEM_CONTROL... MANUAL_DEFENSE_REQUIRED.` (Red | Speed 40).
12. **EXIT**: `[ ACCESS SYSTEM ROOT ]` button (Red/Blinking).

## IV. REFINED AUDIO (V4.0)
- **TYPING**: Realistic "Cherry MX Blue" profile (3500Hz Transient + 1800Hz Resonant Noise).
- **SYSTEM**: Sharp digital square blip (950Hz-1000Hz).
- **CHAOS**: Subtle "Data Chatter" (3000Hz-5000Hz Sine) during header jitter.
- **FAILURE**: All aggressive breach/distortion sounds are SILENCED for professionalism.
