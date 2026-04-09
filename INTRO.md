# SYNTAX DEFENSE: BOOT SEQUENCE BLUEPRINT

This document serves as the master specification for the three-act "hacking" boot sequence. We will build this sequence act-by-act to ensure perfect timing, visual fidelity, and audio synchronization.

---

## ACT 0: THE PRODUCTION SPLASH (STUDIO INTRO)
**Objective**: A professional, cinematic studio introduction.

- **Visuals**: 
    - Full black background.
    - **Monolith Monument**: 3 cyan bars of varying heights (8px, 16px, 8px width).
    - **Text**: "MONOLITH" (Large, 1.8rem, heavy letter spacing) followed by "PRESENTS" (Small, 0.5rem).
    - **Animation**: `fade-in-out` over 3.5 seconds.
    - **Gate**: Mandatory landscape orientation.
- **Completion**: Transition to Phase 0 (Terminal Initial State).

---

## ACT 1: AUTHORIZATION (THE CLEAN LOGON)
**Objective**: Establish a clean, professional terminal environment.

1.  **Phase 0**: System shows "SYSTEM_READY: [ INITIALIZE_MAINFRAME ]". User clicks/taps to start.
2.  **Phase 1 (Command)**: `auth --request-access --identity=ARCHITECT` types out.
    - **Speed**: Human typing (rhythmic delays on spaces/symbols).
    - **Visual**: White text.
3.  **Phase 3 (Response)**: `ACCESS_REQUEST_RECEIVED... SCANNING_BIOMETRICS... AUTHORIZED.` types out.
    - **Speed**: Machine speed (fast, consistent).
    - **Visual**: Green text (#00ff66).
4.  **Phase 4.1 (Welcome)**: `WELCOME BACK, ARCHITECT.` types out.
    - **Speed**: Machine speed.
    - **Visual**: Green text (#00ff66).
5.  **Phase 4.2 (Retention)**: Wait **EXACTLY 2 SECONDS** after Welcome Back finishes. All lines stay on screen.
6.  **Phase 4.5 (Wipe)**: HARD CLEAR of all terminal logs. Transition to Act 2.

---

## ACT 2: MOUNTING & LOADING (SYSTEM PREP)
**Objective**: Technical setup with "Daemon Chatter" background activity.

1.  **Phase 5 (Pause)**: 1.2s blank screen pause after wipe.
2.  **Phase 6.1 (Command)**: `sys --mount-tactical-logic --force` types out.
    - **Speed**: Human typing.
    - **Visual**: White text.
3.  **Phase 6.5 (Response)**: `MOUNTING_LOGIC_PACKETS... INITIATING_DOWNLOAD.` types out.
    - **Speed**: Machine speed.
    - **Visual**: Green text.
4.  **Phase 6.6 (Loading)**: Progress bar (0% to 100%) appears.
    - **Speed**: ~6 seconds total.
    - **Side-Effect**: "Daemon Chatter" (technical metadata) scrolls rapidly in the bottom-right corner.
5.  **Phase 7 (Technical Logs)**: 4 lines of tactical logs appear sequentially (e.g., `UPLOADING KERNEL_MODULES... [OK]`).
6.  **Phase 9 (Status)**: `Status: Successful.` types out.
7.  **Phase 11 (Access)**: `Access: Granted.` types out.
8.  **Phase 13 (Retention)**: Wait **EXACTLY 2 SECONDS** after Access Granted finishes. All Act 2 lines stay on screen.
9.  **Phase 13.5 (No Wipe)**: Transition directly to Act 3. Act 2 text remains visible as historical logs. Progress bar collapses at this stage.

---

## ACT 3: THE BREACH (CRITICAL FAILURE)
**Objective**: Pure terminal chaos and corruption.

1.  **Phase 13.5 (Command)**: `sys --scan-integrity --deep` types out below Act 2 logs.
    - **Speed**: Human typing.
2.  **Phase 14 (The Hit)**: `CRITICAL_ALERT: MALICIOUS_DATA_INBOUND` triggers.
    - **Visual**: Strict Red styling (#ff3300), TV horizontal glitches, mutation effects.
    - **SFX**: `playDramaticGlitch` triggered.
3.  **Phase 14.5+ (Hacking Sequence)**:
    - User attempts `sys --purge-auto --all`.
    - System responds: `ERROR: AUTO_PURGE_FAILED [GLITCH_OVERLOAD]`.
    - **Visual**: Character mutation rate 35ms, 25% probability, expanded symbol pool.
4.  **Final Phase**: Initialize Emergency Override button appears. Clicking initiates the Main Menu transition.
