# Tactical Economy Engine (Verified Production)

## Act 1: The Liquidity Loop
- **Mandatory Wipe:** All turrets are cleared via `clearTowers()` at the end of every round.
- **Scrap Reclamation:** Players receive a base 50% refund of total field value (upgradable).
- **Interest:** 10-25% compounding interest awarded on *unspent* credits.
- **Win-State Logic:** The combination of scrap + interest guarantees ~120% budget carry-over for wise spenders.

## Act 2: Progression & Milestone
- **Wave 1:** Tutorial (Displays as LVL 0).
- **Wave 2:** Official Start (Displays as LVL 1).
- **Wave 51 (Level 50):** Trigger for the **"FINAL_PURGE"** victory state.
- **Scaling:** Enemy health and rewards scale exponentially (`15 * 1.15^wave`) from Wave 2 onwards.

## Act 3: XP & Ranking
- **Ranks:** Novice -> Scripter -> Sys_Architect -> Senior_Engr -> Elite_Architect.
- **Unlocks:** High-tier Railguns and Tesla Links are strictly rank-gated.
