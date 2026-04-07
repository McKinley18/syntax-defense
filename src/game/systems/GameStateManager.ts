export type GlitchType = 'NONE' | 'OVERCLOCK' | 'LAG_SPIKE' | 'SYSTEM_DRAIN';
export type GameMode = 'STANDARD' | 'HARDCORE' | 'ENDLESS' | 'SUDDEN_DEATH' | 'ECO_CHALLENGE';
export type GamePhase = 'PREP' | 'WAVE';

export interface WaveSummary {
    kills: number;
    totalKills: number; 
    interest: number;
    perfectBonus: number;
    refunds: number;
    total: number;
}

export class GameStateManager {
    private static instance: GameStateManager;
    
    public credits: number = 850; 
    public integrity: number = 20;
    public currentWave: number = 0; 
    public gameMode: GameMode = 'STANDARD';
    public phase: GamePhase = 'PREP'; 
    public activeGlitch: GlitchType = 'NONE';
    public interestRate: number = 0.10; 
    public repairCost: number = 500; 
    
    public totalXP: number = 0;
    public architectRank: string = "INITIATE";
    public lifetimeKills: number = 0;
    public highestWave: number = 0;

    public lastWaveSummary: WaveSummary = { kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0 };

    private integrityLostThisWave: boolean = false;

    private constructor() {
        this.loadXP();
        this.loadHallOfFame();
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

        if (reason === 'kill') {
            this.lastWaveSummary.kills += amount;
            this.lastWaveSummary.totalKills++; 
            this.lifetimeKills++;
        }
        else if (reason === 'interest') this.lastWaveSummary.interest += amount;
        else if (reason === 'perfect') this.lastWaveSummary.perfectBonus += amount;
        else if (reason === 'refund') this.lastWaveSummary.refunds += amount;
        
        if (amount > 0 && reason !== 'refund') {
            this.lastWaveSummary.total += amount;
        }
    }

    public takeDamage(amount: number) {
        this.integrity = Math.max(0, this.integrity - amount);
        this.integrityLostThisWave = true;
        if (this.integrity === 0) {
            if (this.currentWave > this.highestWave) {
                this.highestWave = this.currentWave;
                this.saveHallOfFame();
            }
            localStorage.removeItem('syntax_defense_save');
        }
    }

    public calculateRank(): string {
        const xp = this.totalXP;
        if (xp >= 100000) return "GOD_MOD_ADMIN";
        if (xp >= 50000) return "CORE_GUARDIAN";
        if (xp >= 25000) return "ELITE_ARCHITECT";
        if (xp >= 10000) return "SENIOR_ENGR";
        if (xp >= 5000) return "SYS_ARCHITECT";
        if (xp >= 1000) return "SCRIPTER";
        return "INITIATE";
    }

    public getRankBadge(): string {
        const rank = this.calculateRank();
        switch(rank) {
            case "GOD_MOD_ADMIN":   return "[ < ❖ > ]";
            case "CORE_GUARDIAN":   return "[ < + > ]";
            case "ELITE_ARCHITECT": return "[ « 0 » ]";
            case "SENIOR_ENGR":     return "[ | - | ]";
            case "SYS_ARCHITECT":   return "[ / / ]";
            case "SCRIPTER":        return "[ - - ]";
            default:                return "[ · · ]";
        }
    }

    public getNextRankXP(): number {
        const xp = this.totalXP;
        if (xp < 1000) return 1000;
        if (xp < 5000) return 5000;
        if (xp < 10000) return 10000;
        if (xp < 25000) return 25000;
        if (xp < 50000) return 50000;
        if (xp < 100000) return 100000;
        return 100000;
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

    public saveHallOfFame() {
        const data = {
            lifetimeKills: this.lifetimeKills,
            highestWave: this.highestWave
        };
        localStorage.setItem('syntax_hall_of_fame', JSON.stringify(data));
    }

    public loadHallOfFame() {
        const raw = localStorage.getItem('syntax_hall_of_fame');
        if (raw) {
            const data = JSON.parse(raw);
            this.lifetimeKills = data.lifetimeKills || 0;
            this.highestWave = data.highestWave || 0;
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

        const waveXP = this.currentWave * 50 * (this.gameMode === 'HARDCORE' ? 2 : 1);
        this.totalXP += waveXP;
        this.saveXP();
        this.saveHallOfFame(); // SAVE LIFETIME KILLS
        this.architectRank = this.calculateRank();

        if (this.currentWave > this.highestWave) {
            this.highestWave = this.currentWave;
        }

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

        if (Math.random() < 0.25) { // SLIGHTLY INCREASED CHANCE
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
        this.lastWaveSummary = { kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0 };
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
