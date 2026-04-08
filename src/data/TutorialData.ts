export interface TutorialStep {
  title: string;
  text: string;
  buttonText?: string;
  showPointer?: boolean;
  target?: 'MG_CARD' | 'GRID_TILE' | 'PLACED_TOWER' | 'UPGRADE_BTN';
}

export const TUTORIAL_STEPS: Record<number, TutorialStep> = {
  0: {
    title: "ARCHITECT ONBOARDING",
    text: "SYSTEM CORE DETECTED. INITIALIZING COMBAT TUTORIAL...\n\nYOU MUST DEFEND THE KERNEL FROM INCOMING VIRAL DATA STREAMS.",
    buttonText: "START ONBOARDING"
  },
  1: {
    title: "SELECTION",
    text: "SELECT PULSE MG",
    showPointer: true,
    target: 'MG_CARD'
  },
  2: {
    title: "PLACEMENT",
    text: "PLACE ON GRID",
    showPointer: true,
    target: 'GRID_TILE'
  },
  3: {
    title: "UNIT DEPLOYED",
    text: "GOOD. NOW TAP THE TURRET TO OPEN ITS CONFIGURATION MENU.",
    buttonText: "UNDERSTOOD"
  },
  4: {
    title: "CONFIGURATION",
    text: "TAP TO CONFIGURE",
    showPointer: true,
    target: 'PLACED_TOWER'
  },
  5: {
    title: "OVERCLOCKING",
    text: "UPGRADE NODE",
    showPointer: true,
    target: 'UPGRADE_BTN'
  },
  6: {
    title: "READY FOR FIRST SWARM",
    text: "SYSTEMS STABLE. INITIALIZE THE TEST PURGE TO OBSERVE DEFENSIVE LOGIC.",
    buttonText: "CONTINUE"
  },
  7: {
    title: "TESTING",
    text: "" // Empty during virus spawn
  },
  8: {
    title: "PURGE SUCCESSFUL",
    text: "AS THE SYSTEM ARCHITECT, YOU MUST SECURE THE SYNTAX CORE AGAINST ALL INCOMING VIRAL SIGNATURES. DIFFERENT VIRUSES HAVE UNIQUE SPEED AND ARMOR PROFILES.\n\nMONITOR YOUR KERNEL INTEGRITY BAR AT THE BOTTOM RIGHT; IF IT REACHES ZERO, THE SYSTEM COLLAPSES.\n\nDEFEATING VIRUSES GRANTS TOKEN BOUNTIES, WHILE MAINTAINING A HIGH BALANCE EARNS 10% INTEREST PER SWARM. SPEND WISELY TO UPGRADE YOUR DEFENSES.",
    buttonText: "FINISH ONBOARDING"
  }
};
