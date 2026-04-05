export type GlitchType = 'NONE' | 'OVERCLOCK' | 'LAG_SPIKE' | 'SYSTEM_DRAIN';
export type GameMode = 'STANDARD' | 'HARDCORE' | 'ENDLESS' | 'SUDDEN_DEATH' | 'ECO_CHALLENGE';

export class GameStateManager {
    private static instance: GameStateManager;
    
    public credits: number = 500;
    public integrity: number = 20;
    public currentWave: number = 1;
    public gameMode: GameMode = 'STANDARD';
    public activeGlitch: GlitchType = 'NONE';
    public interestRate: number = 0.10; 
    public repairCost: number = 500; 
    
    private integrityLostThisWave: boolean = false;

    private constructor() {}

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public addCredits(amount: number) {
        if (this.gameMode === 'ECO_CHALLENGE' && amount > 0) return; // NO KILL REWARDS
        this.credits += amount;
    }

    public takeDamage(amount: number) {
        this.integrity = Math.max(0, this.integrity - amount);
        this.integrityLostThisWave = true;
    }

    public repairKernel(): boolean {
        if (this.gameMode === 'SUDDEN_DEATH') return false; // NO REPAIRS
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

        // ADAPTIVE PROFICIENCY: Perfect Wave Bonus
        if (!this.integrityLostThisWave && this.gameMode !== 'HARDCORE') {
            this.interestRate = Math.min(0.20, this.interestRate + 0.02);
        } else if (this.integrityLostThisWave) {
            this.interestRate = 0.10; // Reset on damage
        }

        if (this.gameMode !== 'HARDCORE') {
            const interest = Math.floor(this.credits * this.interestRate);
            this.credits += interest;
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
        const names = ["CORP_SIG", "ALPHA_PROCESS", "ROOT_SCAN", "NODE_BREACH", "GRID_FAULT", "KERNEL_INIT"];
        return names[this.currentWave % names.length] + "_" + (100 + this.currentWave);
    }

    public resetGame(mode: GameMode) {
        this.gameMode = mode;
        this.credits = (mode === 'HARDCORE' || mode === 'ECO_CHALLENGE') ? 1000 : 500;
        this.integrity = (mode === 'SUDDEN_DEATH') ? 1 : 20;
        this.currentWave = 1;
        this.activeGlitch = 'NONE';
        this.repairCost = 500;
        this.interestRate = 0.10;
        this.integrityLostThisWave = false;
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
        localStorage.setItem('syntax_defense_session_v2', JSON.stringify(data));
    }

    public load(): boolean {
        const raw = localStorage.getItem('syntax_defense_session_v2');
        if (raw) {
            const data = JSON.parse(raw);
            this.credits = data.credits;
            this.integrity = data.integrity;
            this.currentWave = data.currentWave;
            this.gameMode = data.gameMode || 'STANDARD';
            this.repairCost = data.repairCost || 500;
            this.interestRate = data.interestRate || 0.10;
            return true;
        }
        return false;
    }
}
