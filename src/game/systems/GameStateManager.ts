export type GameMode = 'STANDARD' | 'HARDCORE' | 'SUDDEN_DEATH';
export type GamePhase = 'BOOT' | 'PREP' | 'COMBAT' | 'SUMMARY';
export type GlitchType = 'NONE' | 'LAG_SPIKE' | 'BUFFER_OVERFLOW' | 'DATA_CORRUPTION';

export interface WaveSummary {
    totalKills: number;
    creditsEarned: number;
    interest: number;
    scrapValue: number;
    integrityLost: number;
    points: number;
}

export interface PersistentUpgrades {
    startingCredits: number;
    interestRateBoost: number;
    scrapReclamation: number; // Percentage back when round ends
    kernelArmor: number;
    killXpBoost: number;
    linkAmplifier: number;
    signalBoost: number;
    // TOWER SPECIFIC UPGRADES
    pulseMgOpt: number;
    frostOverclock: number;
    blastNovaReach: number;
    railgunPenetration: number;
    teslaLinkArc: number;
}

export class GameStateManager {
    public currentWave: number = 1;
    public credits: number = 850;

    public get displayWave(): number {
        return Math.max(0, this.currentWave - 1);
    }
    public integrity: number = 20;
    public phase: GamePhase = 'PREP';
    public gameMode: GameMode = 'STANDARD';
    
    public totalXP: number = 0;
    public spentXP: number = 0;
    public totalScore: number = 0;
    public highestWave: number = 0;
    public lifetimeKills: number = 0;
    public architectRank: string = 'NOVICE';
    public repairCost: number = 100;
    
    public upgrades: PersistentUpgrades = {
        startingCredits: 0,
        interestRateBoost: 0,
        scrapReclamation: 0, 
        kernelArmor: 0,
        killXpBoost: 0,
        linkAmplifier: 0,
        signalBoost: 0,
        pulseMgOpt: 0,
        frostOverclock: 0,
        blastNovaReach: 0,
        railgunPenetration: 0,
        teslaLinkArc: 0
    };

    public lastWaveSummary: WaveSummary = {
        totalKills: 0,
        creditsEarned: 0,
        interest: 0,
        scrapValue: 0,
        integrityLost: 0,
        points: 0
    };

    public integrityLostThisWave: boolean = false;
    public activeGlitch: string = 'NONE';
    public interestRate: number = 0.10; // Base 10%

    private static instance: GameStateManager;

    private constructor() {
        this.loadProfile();
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public hardReset() {
        localStorage.removeItem('syntax_profile');
        localStorage.removeItem('syntax_session_save');
        this.currentWave = 1;
        this.credits = 850;
        this.integrity = 20;
        this.totalXP = 0;
        this.lifetimeKills = 0;
        this.phase = 'PREP';
        console.log("SYSTEM: GameStateManager Hard Reset Triggered");
    }

    public resetGame(mode: GameMode = 'STANDARD', startWave: number = 1) {
        this.currentWave = startWave;
        this.integrity = mode === 'SUDDEN_DEATH' ? 1 : 20 + (this.upgrades.kernelArmor * 2);
        this.credits = 850 + (this.upgrades.startingCredits * 150);
        this.gameMode = mode;
        this.phase = 'PREP';
        this.interestRate = 0.10;
        this.integrityLostThisWave = false;
        this.activeGlitch = 'NONE';
        
        this.lastWaveSummary = {
            totalKills: 0,
            creditsEarned: 0,
            interest: 0,
            scrapValue: 0,
            integrityLost: 0,
            points: 0
        };

        // Clear any abandoned session when starting fresh
        this.deleteSession();
    }

    public saveSession() {
        if (this.currentWave === 0 || this.integrity <= 0) return;
        
        const sessionData = {
            wave: this.currentWave,
            credits: this.credits,
            integrity: this.integrity,
            gameMode: this.gameMode,
            interestRate: this.interestRate,
            timestamp: Date.now()
        };
        localStorage.setItem('syntax_session_save', JSON.stringify(sessionData));
    }

    public loadSession(): boolean {
        const saved = localStorage.getItem('syntax_session_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentWave = data.wave;
            this.credits = data.credits;
            this.integrity = data.integrity;
            this.gameMode = data.gameMode;
            this.interestRate = data.interestRate;
            return true;
        }
        return false;
    }

    public deleteSession() {
        localStorage.removeItem('syntax_session_save');
    }

    public addCredits(amount: number, type: 'kill' | 'interest' | 'scrap' | 'perfect' = 'kill') {
        this.credits += amount;
        if (type === 'kill') this.lastWaveSummary.creditsEarned += amount;
        else if (type === 'interest') this.lastWaveSummary.interest += amount;
        else if (type === 'scrap') this.lastWaveSummary.scrapValue += amount;
    }

    public takeDamage(amount: number) {
        this.integrity -= amount;
        this.integrityLostThisWave = true;
        if (this.integrity < 0) this.integrity = 0;
    }

    public calculateEndOfWave(turretValue: number) {
        if (this.integrity <= 0) return;

        // 1. CALCULATE SCRAP RECOVERY (The "Wipe" Reward)
        // Base 50% back + 5% per upgrade level
        const scrapMult = 0.50 + (this.upgrades.scrapReclamation * 0.05);
        const scrapReward = Math.floor(turretValue * scrapMult);
        this.addCredits(scrapReward, 'scrap');

        // 2. CALCULATE INTEREST (Risk-Reward)
        // High interest on unspent credits. Rewarding efficiency.
        const potentialInterest = Math.ceil(this.credits * this.interestRate);
        const interestCap = 1000 + (this.upgrades.interestRateBoost * 200);
        const actualInterest = Math.min(interestCap, potentialInterest);
        this.addCredits(actualInterest, 'interest');

        // 3. PERFECT BONUS
        if (!this.integrityLostThisWave) {
            const perfectBonus = 100 + (this.currentWave * 10);
            this.addCredits(perfectBonus, 'perfect');
            // Increase interest rate for next wave if perfect
            this.interestRate = Math.min(0.25, this.interestRate + 0.02);
        } else {
            // Reset interest rate on failure
            this.interestRate = 0.10;
        }

        // 4. XP & RANKING
        const waveXP = this.currentWave * 50;
        const killXP = this.lastWaveSummary.totalKills * (1 + (this.upgrades.killXpBoost * 0.1));
        this.totalXP += Math.floor(waveXP + killXP);
        
        this.saveProfile();
        this.architectRank = this.calculateRank();
    }

    public calculateRank(): string {
        if (this.totalXP > 100000) return 'ELITE_ARCHITECT';
        if (this.totalXP > 50000) return 'SENIOR_ENGR';
        if (this.totalXP > 20000) return 'SYS_ARCHITECT';
        if (this.totalXP > 5000) return 'SCRIPTER';
        return 'NOVICE';
    }

    public isTowerUnlocked(type: number): boolean {
        
        if (type === 0) return true; // Pulse MG
        if (type === 1) return this.totalXP > 2000; // Frost Ray
        if (type === 2) return this.totalXP > 8000; // Blast Nova
        if (type === 3) return this.totalXP > 25000; // Railgun
        if (type === 4) return this.totalXP > 60000; // Tesla Link
        return false;
    }

    public getWaveName(): string {
        if (this.currentWave === 0) return 'TUTORIAL_INITIALIZATION';
        if (this.currentWave % 10 === 0) return 'BOSS_CORE_ENCOUNTER';
        if (this.activeGlitch !== 'NONE') return `GLITCH_PROTOCOL_${this.activeGlitch}`;
        return `SWARM_INTRUSION_${this.currentWave}`;
    }

    public repairKernel(): boolean {
        if (this.credits >= this.repairCost && this.integrity < 20) {
            this.credits -= this.repairCost;
            this.integrity = 20;
            return true;
        }
        return false;
    }

    public clearStats() {
        this.totalXP = 0;
        this.spentXP = 0;
        this.highestWave = 0;
        this.lifetimeKills = 0;
        this.architectRank = 'NOVICE';
        this.upgrades = {
            startingCredits: 0,
            interestRateBoost: 0,
            scrapReclamation: 0,
            kernelArmor: 0,
            killXpBoost: 0,
            linkAmplifier: 0,
            signalBoost: 0,
            pulseMgOpt: 0,
            frostOverclock: 0,
            blastNovaReach: 0,
            railgunPenetration: 0,
            teslaLinkArc: 0
        };
        this.saveProfile();
    }

    public saveXP() {
        this.saveProfile();
    }

    private saveProfile() {
        const data = {
            totalXP: this.totalXP,
            highestWave: this.highestWave,
            lifetimeKills: this.lifetimeKills,
            upgrades: this.upgrades
        };
        localStorage.setItem('syntax_profile', JSON.stringify(data));
    }

    private loadProfile() {
        const saved = localStorage.getItem('syntax_profile');
        const tutorialDone = localStorage.getItem('syntax_tutorial_done') === 'true';
        
        if (saved && tutorialDone) {
            const data = JSON.parse(saved);
            this.totalXP = data.totalXP || 0;
            this.highestWave = data.highestWave || 0;
            this.lifetimeKills = data.lifetimeKills || 0;
            this.upgrades = { ...this.upgrades, ...data.upgrades };
            this.architectRank = this.calculateRank();
        } else {
            // FORCE FRESH TUTORIAL STATE
            this.currentWave = 1; 
            this.integrity = 20;
            this.credits = 850;
        }
    }
}
