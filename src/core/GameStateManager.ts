export type GameMode = 'STANDARD' | 'HARDCORE' | 'SUDDEN_DEATH';
export type GamePhase = 'BOOT' | 'PREP' | 'COMBAT' | 'SUMMARY';
export type GlitchType = 'NONE' | 'LAG_SPIKE' | 'BUFFER_OVERFLOW' | 'DATA_CORRUPTION';
import { AISystem } from '../systems/AISystem';

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
    scrapReclamation: number; 
    kernelArmor: number;
    killXpBoost: number;
    linkAmplifier: number;
    signalBoost: number;
    pulseMgOpt: number;
    frostOverclock: number;
    blastNovaReach: number;
    railgunPenetration: number;
    teslaLinkArc: number;
}

export class GameStateManager {
    public currentWave: number = 0; // 0 = Tutorial, 1 = Lvl 1
    public credits: number = 850;
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

    public activeGlitch: string = 'NONE';
    public interestRate: number = 0.20; 

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

    public get displayWave(): number {
        return this.currentWave; // Wave 0 shows 0, Wave 1 shows 1. Simple.
    }

    public resetGame(mode: GameMode = 'STANDARD', startWave: number = 0) {
        this.currentWave = startWave;
        this.integrity = mode === 'SUDDEN_DEATH' ? 1 : 20;
        this.credits = 850;
        this.gameMode = mode;
        this.phase = 'PREP';
        this.activeGlitch = 'NONE';
        
        // VITAL: When starting fresh, ensure no old session lingers
        localStorage.removeItem('syntax_session_save');
    }

    public saveSession(towers: any[] = []) {
        if (this.currentWave === 0 && localStorage.getItem('syntax_tutorial_done') !== 'true') return;
        if (this.integrity <= 0) return;
        
        const sessionData = {
            wave: this.currentWave,
            credits: this.credits,
            integrity: this.integrity,
            gameMode: this.gameMode,
            towers: towers.map(t => ({ type: t.type, x: t.container.x, y: t.container.y, level: t.level })),
            timestamp: Date.now()
        };
        localStorage.setItem('syntax_session_save', JSON.stringify(sessionData));
    }

    public loadSession(): any {
        const saved = localStorage.getItem('syntax_session_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentWave = data.wave;
            this.credits = data.credits;
            this.integrity = data.integrity;
            this.gameMode = data.gameMode;
            return data.towers || [];
        }
        return null;
    }

    public deleteSession() {
        localStorage.removeItem('syntax_session_save');
    }

    public calculateEndOfWave(fieldValue: number) {
        // 1. Scrap Value (50% base + upgrades)
        const scrapMult = 0.5 + (this.upgrades.scrapReclamation * 0.05);
        const scrapAmount = Math.floor(fieldValue * scrapMult);
        this.credits += scrapAmount;
        this.lastWaveSummary.scrapValue = scrapAmount;

        // 2. Interest (10% base on remaining)
        const interest = Math.floor(this.credits * this.interestRate);
        this.credits += interest;
        this.lastWaveSummary.interest = interest;

        this.currentWave++;
        this.saveProfile();
    }

    public isTowerUnlocked(type: number): boolean {
        if (type === 0) return true; // Pulse MG
        if (type === 1) return this.totalXP > 5000;
        if (type === 2) return this.totalXP > 15000;
        if (type === 3) return this.totalXP > 35000;
        if (type === 4) return this.totalXP > 75000;
        return false;
    }

    public getWaveName(): string {
        return "WAVE_DATA"; // AISystem.generateWaveName(this.currentWave);
    }

    public addCredits(amount: number, type?: string) {
        this.credits += amount;
        if (type === 'kill') {
            this.lastWaveSummary.creditsEarned += amount;
        } else if (type === 'scrap') {
            this.lastWaveSummary.scrapValue += amount;
        }
    }

    public takeDamage(amount: number) {
        this.integrity -= amount;
        this.lastWaveSummary.integrityLost += amount;
        if (this.integrity < 0) this.integrity = 0;
        if (this.gameMode === 'SUDDEN_DEATH' && this.integrity < 1) {
            this.integrity = 0;
        }
    }

    public repairKernel(): boolean {
        if (this.credits >= this.repairCost && this.integrity < 20) {
            this.credits -= this.repairCost;
            this.integrity = 20;
            return true;
        }
        return false;
    }

    public saveXP() {
        this.saveProfile();
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

    private loadProfile() {
        const saved = localStorage.getItem('syntax_profile');
        if (saved) {
            const data = JSON.parse(saved);
            this.totalXP = data.totalXP || 0;
            this.highestWave = data.highestWave || 0;
            this.lifetimeKills = data.lifetimeKills || 0;
            this.upgrades = { ...this.upgrades, ...data.upgrades };
            this.architectRank = this.calculateRank();
        }
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

    private calculateRank(): string {
        if (this.totalXP > 100000) return 'ELITE_ARCHITECT';
        if (this.totalXP > 50000) return 'SENIOR_ENGR';
        if (this.totalXP > 20000) return 'SYS_ARCHITECT';
        if (this.totalXP > 5000) return 'SCRIPTER';
        return 'NOVICE';
    }

    public hardReset() {
        this.currentWave = 0;
        this.credits = 850;
        this.integrity = 20;
        this.phase = 'PREP';
    }
}
