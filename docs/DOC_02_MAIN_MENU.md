# [02] MAIN_MENU: COMPACT_TACTICAL_HUB

## I. ATMOSPHERIC_IGNITION
- **Phase 1 (0.0s - 2.2s):** Absolute black background. Solitary title reveal.
- **Audio Sync:** `MusicManager` initialization triggered at 0.2s.
- **Phase 2 (2.2s+):** Slow manifestation of Neural Grid and Tactical UI.

## II. COMMAND_WINDOW (2D)
- **Geometry:** 28rem width, centered, flat 2D architecture.
- **Container:** High-fidelity black window (`rgba(0,0,0,0.92)`) with technical border.
- **Interactive Units:** Multi-layered buttons with secondary log-metadata labels.
- **Navigation:**
  - `INFILTRATE CORE`: Triggers `NeuralBrain.initializeSession()`.
  - `RESUME SESSION`: Restores Archive safe-state.

## III. DYNAMIC METADATA
- **System Vitals:** Top right (Uptime, Entropy, Threat).
- **Neural Logs:** Bottom left (Tactical stream: `KERN_LINK`, `MEM_SYNC`).
- **Brightness Law:** Vitals (0.8 alpha), Logs (0.6 alpha).
