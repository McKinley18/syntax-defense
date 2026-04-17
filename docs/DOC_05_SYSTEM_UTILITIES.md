# [05] SYSTEM_UTILITIES: OPERATOR_INTERFACE

## I. SEAMLESS_SKIP_PROTOCOL
- **Logic:** System checks `localStorage:syndef_intro_seen` on mount.
- **Behavior:**
  - **First Run:** Full CRT ignition -> Terminal Boot -> Studio Splash.
  - **Subsequent:** Immediate transition to `AppState.MAIN_MENU`.
- **Interaction Gate:** Removed for returning users to allow automatic appearance.

## II. INTEGRATED_AUDIO_SYNC
- **Context Management:** `AudioContext` is resumed on the very first operator interaction within the Main Menu.
- **Mechanical Typing:** Multi-layered Noise/Triangle signature for user prompts.
- **Technical Chatter:** High-pitched sine blips for computer responses.
- **Fatigue Mitigation:** Global 2500Hz low-pass filter + 0.1s decay on all technical SFX.

## III. PERSISTENCE & DIAGNOSTICS
- **Checksum Validation:** Prevents loading corrupted save data.
- **Operator Overrides:** Manual toggles in System Diagnostics for Intro and Tutorial bypass.
- **Track Rotation:** Neural music rotation increased to 512 beats for immersive atmosphere.
