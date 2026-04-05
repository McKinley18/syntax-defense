export type GlitchType = 'NONE' | 'OVERCLOCK' | 'LAG_SPIKE' | 'SYSTEM_DRAIN';

export class GameStateManager {
    private static instance: GameStateManager;
    
    public credits: number = 500;
    public integrity: number = 20;
    public currentWave: number = 1;
    public isHardcore: boolean = false;
    public activeGlitch: GlitchType = 'NONE';
    public interestRate: number = 0.10; // BASE 10%
    public repairCost: number = 500; // INITIAL REPAIR COST

    private constructor() {}

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public addCredits(amount: number) {
        this.credits += amount;
    }

    public takeDamage(amount: number) {
        this.integrity = Math.max(0, this.integrity - amount);
    }

    // HIGH-INTELLIGENCE: Repair Kernel with scaling costs
    public repairKernel(): boolean {
        if (this.credits >= this.repairCost && this.integrity < 20) {
            this.credits -= this.repairCost;
            this.integrity = Math.min(20, this.integrity + 1);
            this.repairCost += 150; // SCALING FRICTION
            this.save();
            return true;
        }
        return false;
    }

    public resetForNextWave() {
        if (this.integrity <= 0) return;

        // SMART LOGIC: Interest Rate Progression
        // (In future we can check if integrity was lost this wave)
        
        if (!this.isHardcore) {
            const interest = Math.floor(this.credits * this.interestRate);
            this.credits += interest;
        }

        this.currentWave++;
        this.activeGlitch = 'NONE';

        // 20% GLITCH CHANCE
        if (Math.random() < 0.2) {
            const glitches: GlitchType[] = ['OVERCLOCK', 'LAG_SPIKE', 'SYSTEM_DRAIN'];
            this.activeGlitch = glitches[Math.floor(Math.random() * glitches.length)];
        }
    }

    public getWaveName(): string {
        const names = ["CORP_SIG", "ALPHA_PROCESS", "ROOT_SCAN", "NODE_BREACH", "GRID_FAULT", "KERNEL_INIT"];
        return names[this.currentWave % names.length] + "_" + (100 + this.currentWave);
    }

    public resetGame(hardcore: boolean) {
        this.credits = hardcore ? 1000 : 500;
        this.integrity = 20;
        this.currentWave = 1;
        this.isHardcore = hardcore;
        this.activeGlitch = 'NONE';
        this.repairCost = 500;
        this.interestRate = 0.10;
        this.save();
    }

    public save() {
        const data = {
            credits: this.credits,
            integrity: this.integrity,
            currentWave: this.currentWave,
            isHardcore: this.isHardcore,
            repairCost: this.repairCost,
            interestRate: this.interestRate
        };
        localStorage.setItem('syntax_defense_session', JSON.stringify(data));
    }

    public load(): boolean {
        const raw = localStorage.getItem('syntax_defense_session');
        if (raw) {
            const data = JSON.parse(raw);
            this.credits = data.credits;
            this.integrity = data.integrity;
            this.currentWave = data.currentWave;
            this.isHardcore = data.isHardcore;
            this.repairCost = data.repairCost || 500;
            this.interestRate = data.interestRate || 0.10;
            return true;
        }
        return false;
    }
}
