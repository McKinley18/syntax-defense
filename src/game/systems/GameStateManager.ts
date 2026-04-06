export type GlitchType = 'NONE' | 'OVERCLOCK' | 'LAG_SPIKE' | 'SYSTEM_DRAIN';
export type GameMode = 'STANDARD' | 'HARDCORE' | 'ENDLESS' | 'SUDDEN_DEATH' | 'ECO_CHALLENGE';
export type GamePhase = 'PREP' | 'WAVE';

export class GameStateManager {
    private static instance: GameStateManager;
    
    public credits: number = 850; 
    public integrity: number = 20;
    public currentWave: number = 0; // START AT 0
    public gameMode: GameMode = 'STANDARD';
    public phase: GamePhase = 'PREP'; 
    public activeGlitch: GlitchType = 'NONE';
    public interestRate: number = 0.10; 
    public repairCost: number = 500; 
    
    // META-PROGRESSION
    public totalXP: number = 0;
    public architectRank: string = "INITIATE";

    public lastWaveSummary = { kills: 0, interest: 0, perfectBonus: 0, total: 0 };

    private integrityLostThisWave: boolean = false;

    private constructor() {
        this.loadXP();
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public addCredits(amount: number, reason: 'kill' | 'interest' | 'perfect' | 'spend' | 'refund' = 'kill') {
        if (this.gameMode === 'ECO_CHALLENGE' && reason === 'kill') return; 
        this.credits += amount;

        if (reason === 'kill') this.lastWaveSummary.kills += amount;
        else if (reason === 'interest') this.lastWaveSummary.interest += amount;
        else if (reason === 'perfect') this.lastWaveSummary.perfectBonus += amount;
        
        if (amount > 0 && reason !== 'refund') {
            this.lastWaveSummary.total += amount;
        }
    }

    public takeDamage(amount: number) {
        this.integrity = Math.max(0, this.integrity - amount);
        this.integrityLostThisWave = true;
        if (this.integrity === 0) {
            localStorage.removeItem('syntax_defense_save');
        }
    }

    public calculateRank(): string {
        const xp = this.totalXP;
        if (xp > 100000) return "GOD_MOD_ADMIN";
        if (xp > 50000) return "CORE_GUARDIAN";
        if (xp > 25000) return "ELITE_ARCHITECT";
        if (xp > 10000) return "SENIOR_ENGR";
        if (xp > 5000) return "SYS_ARCHITECT";
        if (xp > 1000) return "SCRIPTER";
        return "INITIATE";
    }

    public getRankBonus(): number {
        const rank = this.calculateRank();
        if (rank === "GOD_MOD_ADMIN") return 500;
        if (rank === "CORE_GUARDIAN") return 300;
        if (rank === "ELITE_ARCHITECT") return 200;
        if (rank === "SENIOR_ENGR") return 150;
        if (rank === "SYS_ARCHITECT") return 100;
        if (rank === "SCRIPTER") return 50;
        return 0;
    }

    public saveXP() {
        localStorage.setItem('syntax_total_xp', String(this.totalXP));
    }

    public loadXP() {
        const xp = localStorage.getItem('syntax_total_xp');
        if (xp) {
            this.totalXP = parseInt(xp);
            this.architectRank = this.calculateRank();
        }
    }

    public repairKernel(): boolean {
        if (this.gameMode === 'SUDDEN_DEATH') return false; 
        if (this.credits >= this.repairCost && this.integrity < 20) {
            this.credits -= this.repairCost;
            this.integrity = Math.min(20, this.integrity + 1);
            this.repairCost += 150;
            this.save();
            return true;
        }
        return false;
    }

    public resetForNextWave() {
        if (this.integrity <= 0) return;

        // META XP GRANT
        const waveXP = this.currentWave * 50 * (this.gameMode === 'HARDCORE' ? 2 : 1);
        this.totalXP += waveXP;
        this.saveXP();
        this.architectRank = this.calculateRank();

        // RESET WAVE SUMMARY FOR THE NEW WAVE WE ARE ABOUT TO ENTER
        this.lastWaveSummary = { kills: 0, interest: 0, perfectBonus: 0, total: 0 };

        // PERFECT WAVE BONUS
        if (!this.integrityLostThisWave && this.gameMode !== 'HARDCORE') {
            this.addCredits(150, 'perfect'); 
            this.interestRate = Math.min(0.20, this.interestRate + 0.02);
        } else if (this.integrityLostThisWave) {
            this.interestRate = 0.10; 
        }

        if (this.gameMode !== 'HARDCORE') {
            const potentialInterest = Math.ceil(this.credits * this.interestRate); 
            const interest = Math.min(1000, potentialInterest); 
            this.addCredits(interest, 'interest');
        }

        this.currentWave++;
        this.integrityLostThisWave = false;
        this.activeGlitch = 'NONE';

        if (Math.random() < 0.2) {
            const glitches: GlitchType[] = ['OVERCLOCK', 'LAG_SPIKE', 'SYSTEM_DRAIN'];
            this.activeGlitch = glitches[Math.floor(Math.random() * glitches.length)];
        }
    }

    public getWaveName(): string {
        const names = ["CORP SIG", "ALPHA PROCESS", "ROOT SCAN", "NODE BREACH", "GRID FAULT", "KERNEL INIT"];
        return names[this.currentWave % names.length] + " " + (100 + this.currentWave);
    }

    public resetGame(mode: GameMode) {
        this.gameMode = mode;
        const bonus = this.getRankBonus();
        this.credits = (mode === 'HARDCORE' || mode === 'ECO_CHALLENGE') ? 1000 : (850 + bonus);
        this.integrity = mode === 'SUDDEN_DEATH' ? 1 : 20;
        this.currentWave = 1; 
        this.repairCost = 500;
        this.interestRate = mode === 'HARDCORE' ? 0 : 0.10;
        this.lastWaveSummary = { kills: 0, interest: 0, perfectBonus: 0, total: 0 };
        this.integrityLostThisWave = false;
        this.activeGlitch = 'NONE';
        this.save();
    }

    public save() {
        const data = {
            credits: this.credits,
            integrity: this.integrity,
            currentWave: this.currentWave,
            gameMode: this.gameMode,
            repairCost: this.repairCost,
            interestRate: this.interestRate
        };
        localStorage.setItem('syntax_defense_save', JSON.stringify(data));
    }

    public load(): boolean {
        const raw = localStorage.getItem('syntax_defense_save');
        if (raw) {
            const data = JSON.parse(raw);
            this.credits = data.credits;
            this.integrity = data.integrity;
            this.currentWave = data.currentWave;
            this.gameMode = data.gameMode || 'STANDARD';
            this.repairCost = data.repairCost || 500;
            this.interestRate = data.interestRate || 0.10;
            this.loadXP();
            return true;
        }
        return false;
    }
}
