# [05] SYSTEM_UTILITIES: ARCHIVE_&_AUDIO

## I. `SystemArchive.tsx` (DATABASE)
- **Content:** Technical specifications for all Turrets and Viral enemies.
- **Attribution:** Project architectural design by C. McKinley.
- **Visuals:** Grid-based technical readout with high-alpha highlights.

## II. `SystemDiagnostics.tsx` (SETTINGS)
- **Controls:** Performance monitoring and audio toggles.
- **Logic:** Direct state-hook to `AudioManager` levels.

## III. `AudioManager.ts` (SOUNDSCAPE)
- **Decoupled Logic:** `resume()` handles AudioContext; `startMusic()` handles playback.
- **Music Trigger:** Only upon Main Menu mounting.
- **Profiles:** Custom EQ profiles for typing, glitches, and system blips.

## IV. `TutorialOverlay.tsx` (ONBOARDING)
- **Forced Protocol:** Mandatory for 0-wave users.
- **Sequence:** 8-step highlight-driven instruction.
- **Target:** Row 6, Col 10 highlight for primary building demonstration.
