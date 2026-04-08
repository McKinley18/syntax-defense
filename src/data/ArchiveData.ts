export const ARCHIVE_LORE = {
  collapse: {
    title: ">> LOG ENTRY: THE SYNTAX COLLAPSE",
    text: [
      "> IN THE YEAR 2048, THE GLOBAL NETWORK EXPERIENCED A CATASTROPHIC RAW-OVERWRITE. THE WORLD'S DATA WAS FRAGMENTED INTO HOSTILE VIRAL SIGNATURES.",
      "> THE KERNEL IS THE LAST REMAINING BASTION OF PURE LOGIC. IF IT FALLS, THE DIGITAL UNIVERSE WILL DESCEND INTO PERMANENT ENTROPY.",
      "> YOU ARE THE SYSTEM ARCHITECT. YOUR MISSION IS TO DEPLOY DEFENSE NODES AND PURGE THE SWARMS BEFORE THEY BREACH THE CORE MEMORY BANKS."
    ]
  }
};

export const TURRET_DESCRIPTIONS: Record<number, string> = {
  0: "Rapid-fire logic pulse. Standard frontline defense.",
  1: "Cryo-cycle beam. Applies 50% movement reduction.",
  2: "High-voltage bridge. Arc damage to 3 adjacent targets.",
  3: "Sub-atomic accelerator. High damage + Reveal stealth.",
  4: "Global system buffer. Grants +25% DMG to all linked nodes."
};

export const THREAT_INTEL = [
  {
    label: "ELITE SIGNATURES:",
    content: "EVERY 5 SWARMS, MINI-BOSSES WITH 3.5x HP MATERIALIZE."
  },
  {
    label: "GHOST PACKETS:",
    content: "INVISIBLE ON THE GRID SENSOR. REVEALED BY FROST RAY OR TESLA RADIUS."
  },
  {
    label: "BOSS CORE:",
    content: "FRACTAL VIRUSES DEAL 10 UNITS OF DAMAGE TO KERNEL UPON BREACH."
  }
];

export const SYSTEM_LOGIC = [
  {
    label: "DATA LINKS:",
    content: "PLACING IDENTICAL TURRETS ADJACENT FORMS A SYNERGY LINK (+10% DMG)."
  },
  {
    label: "OVERCLOCKING:",
    content: "TAP ANY PLACED TURRET TO UPGRADE ITS CORE SYSTEMS (3 LEVELS)."
  },
  {
    label: "INTEREST:",
    content: "MAINTAIN A HIGH TOKEN BALANCE TO EARN 10% INTEREST PER SWARM."
  },
  {
    label: "KERNEL OVERDRIVE:",
    content: "CORE SHOCKWAVE PURGES NEARBY VIRUSES WHEN INTEGRITY DROPS BELOW 5."
  }
];
