import { AudioManager } from './AudioManager';

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
    points: number;
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
    public spentXP: number = 0;
    public totalScore: number = 0;
    public architectRank: string = "INITIATE";
    public lifetimeKills: number = 0;
    public highestWave: number = 0;

    public upgrades = {
        pulseMgOpt: 0,
        kernelHardening: 0,
        frostOverclock: 0,
        tokenMining: 0
    };

    public lastWaveSummary: WaveSummary = { kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0, points: 0 };

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

    public clearStats() {
        this.totalXP = 0;
        this.spentXP = 0;
        this.totalScore = 0;
        this.architectRank = "INITIATE";
        this.lifetimeKills = 0;
        this.highestWave = 0;
        this.upgrades = { pulseMgOpt: 0, kernelHardening: 0, frostOverclock: 0, tokenMining: 0 };
        localStorage.removeItem('syntax_total_xp');
        localStorage.removeItem('syntax_spent_xp');
        localStorage.removeItem('syntax_upgrades');
        localStorage.removeItem('syntax_hall_of_fame');
        localStorage.removeItem('syntax_defense_save');
        this.saveXP();
        this.saveHallOfFame();
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
        localStorage.setItem('syntax_spent_xp', String(this.spentXP));
        localStorage.setItem('syntax_upgrades', JSON.stringify(this.upgrades));
    }

    public loadXP() {
        const xp = localStorage.getItem('syntax_total_xp');
        if (xp) {
            this.totalXP = parseInt(xp);
            this.architectRank = this.calculateRank();
        }
        const spent = localStorage.getItem('syntax_spent_xp');
        if (spent) this.spentXP = parseInt(spent);
        const upgs = localStorage.getItem('syntax_upgrades');
        if (upgs) this.upgrades = JSON.parse(upgs);
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
        const maxIntegrity = 20 + (this.upgrades.kernelHardening * 5);
        if (this.credits >= this.repairCost && this.integrity < maxIntegrity) {
            this.credits -= this.repairCost;
            this.integrity = Math.min(maxIntegrity, this.integrity + 1);
            this.repairCost += 150;
            return true;
        }
        return false;
    }

    public resetForNextWave() {
        if (this.integrity <= 0) return;

        const killPoints = this.lastWaveSummary.totalKills * 100;
        const econPoints = this.lastWaveSummary.interest * 10;
        const integrityPoints = this.integrity * 50;
        this.lastWaveSummary.points = killPoints + econPoints + integrityPoints;
        this.totalScore += this.lastWaveSummary.points;

        const waveXP = this.currentWave * 50 * (this.gameMode === 'HARDCORE' ? 2 : 1);
        this.totalXP += waveXP;
        this.saveXP();
        this.saveHallOfFame(); 
        
        const previousRank = this.architectRank;
        this.architectRank = this.calculateRank();
        if (previousRank !== this.architectRank) {
            AudioManager.getInstance().playRankUp();
        }

        if (this.currentWave > this.highestWave) {
            this.highestWave = this.currentWave;
        }

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

        if (Math.random() < 0.25) { 
            const glitches: GlitchType[] = ['OVERCLOCK', 'LAG_SPIKE', 'SYSTEM_DRAIN'];
            this.activeGlitch = glitches[Math.floor(Math.random() * glitches.length)];
        }
    }

    public getWaveName(): string {
        const names = ["CORP SIG", "ALPHA PROCESS", "ROOT SCAN", "NODE BREACH", "GRID FAULT", "KERNEL INIT"];
        return names[this.currentWave % names.length] + " " + (100 + this.currentWave);
    }

    public isTowerUnlocked(type: number): boolean {
        const wave = this.currentWave;
        if (type === 0) return true; // Pulse MG: Always
        if (type === 1) return wave >= 3;  // Frost Ray: Swarm 3
        if (type === 2) return wave >= 6;  // Blast Nova: Swarm 6
        if (type === 3) return wave >= 9;  // Railgun: Swarm 9
        if (type === 4) return wave >= 12; // Tesla Link: Swarm 12
        return false;
    }

    public resetGame(mode: GameMode, startingWave: number = 1) {
        this.gameMode = mode;
        const bonus = this.getRankBonus();
        if (mode === 'HARDCORE') this.credits = 1000;
        else if (mode === 'ECO_CHALLENGE') this.credits = 1200; 
        else this.credits = (startingWave === 1 ? 850 : 850 + bonus);
        const maxIntegrity = 20 + (this.upgrades.kernelHardening * 5);
        this.integrity = mode === 'SUDDEN_DEATH' ? 1 : maxIntegrity;
        this.currentWave = startingWave; 
        this.repairCost = 500;
        const baseInterest = 0.10 + (this.upgrades.tokenMining * 0.02);
        if (mode === 'HARDCORE' || mode === 'SUDDEN_DEATH') this.interestRate = 0;
        else if (mode === 'ECO_CHALLENGE') this.interestRate = baseInterest + 0.05; 
        else this.interestRate = baseInterest;
        this.lastWaveSummary = { kills: 0, totalKills: 0, interest: 0, perfectBonus: 0, refunds: 0, total: 0, points: 0 };
        this.totalScore = 0; 
        this.integrityLostThisWave = false;
        this.activeGlitch = 'NONE';
    }

    public save(towers: any[] = []) {
        const data = {
            credits: this.credits,
            integrity: this.integrity,
            currentWave: this.currentWave,
            gameMode: this.gameMode,
            repairCost: this.repairCost,
            interestRate: this.interestRate,
            towers: towers 
        };
        localStorage.setItem('syntax_defense_save', JSON.stringify(data));
    }

    public load(): any {
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
            return data;
        }
        return null;
    }
}
