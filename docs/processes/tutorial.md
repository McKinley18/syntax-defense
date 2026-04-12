# Tutorial Orchestration (Verified Production)

## Act 1: The 11-Step Sequence
- **Step 3:** Deployment at Grid {13, 5}.
- **Step 4:** Success Button (Clears modal).
- **Step 5:** Status Briefing (Introduces Overclocking).
- **Step 6:** Interaction-Only Step (Orange "Select Node" indicator).
- **Step 7:** Close Detection (Upgrade Menu must be closed to proceed).
- **Step 8:** Final Briefing (Top-anchored, "Start Purge" button).

## Act 2: Viral Stasis Protocol
- **Constraint:** The tutorial swarm is locked at (0,0) until Step 8/9.
- **Trigger:** Clicking "START PURGE" lifts the lock and initiates the Glider.
- **Success:** Tutorial ends automatically when the Glider is destroyed.

## Act 3: UI Stabilization
- **Centering:** All popups centered in the area ABOVE the HUD.
- **Ghost Purge:** Strict `y > 0` checks prevent any top-left artifacts.
- **Hard-Coded Anchors:** Position for Step 3/6 is fixed to {13, 5} for 100% reliability.
