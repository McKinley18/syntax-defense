export type GlitchType = 'NONE' | 'OVERCLOCK' | 'LAG_SPIKE' | 'SYSTEM_DRAIN';

export class GameStateManager {
    private static instance: GameStateManager;
    
    public credits: number = 500;
    public integrity: number = 20;
    public currentWave: number = 1; // START AT LEVEL 1
    public isHardcore: boolean = false;
    public activeGlitch: GlitchType = 'NONE';
    
    private readonly WAVE_ERRORS: string[] = [
        "BOOT_SECTOR_INIT",
        "SEGMENTATION_FAULT",
        "STACK_OVERFLOW",
        "NULL_POINTER_EXCEPTION",
        "INFINITE_LOOP",
        "MEMORY_LEAK",
        "BUFFER_OVERRUN",
        "CONCURRENCY_CONFLICT",
        "RACE_CONDITION",
        "DEADLOCK_DETECTED",
        "KERNEL_PANIC"
    ];

    private constructor() {}

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public getWaveName(): string {
        const index = Math.max(0, Math.min(this.currentWave - 1, this.WAVE_ERRORS.length - 1));
        let name = this.WAVE_ERRORS[index];
        if (this.activeGlitch !== 'NONE') {
            name += ` // GLITCH: ${this.activeGlitch}`;
        }
        return name;
    }

    public addCredits(amount: number) {
        this.credits += amount;
    }

    public spendCredits(amount: number): boolean {
        if (this.credits >= amount) {
            this.credits -= amount;
            return true;
        }
        return false;
    }

    public takeDamage(amount: number = 1) {
        this.integrity -= amount;
        if (this.integrity <= 0) this.integrity = 0;
    }

    public resetForNextWave() {
        this.currentWave++;
        this.activeGlitch = 'NONE';
        
        // Random Glitch Chance (20%)
        if (Math.random() > 0.8) {
            const glitches: GlitchType[] = ['OVERCLOCK', 'LAG_SPIKE', 'SYSTEM_DRAIN'];
            this.activeGlitch = glitches[Math.floor(Math.random() * glitches.length)];
        }

        // Standard Mode: 10% Interest on unspent credits
        if (!this.isHardcore) {
            const interest = Math.floor(this.credits * 0.10);
            this.credits += interest;
        }
        this.save();
    }

    public resetGame(hardcore: boolean = false) {
        this.isHardcore = hardcore;
        this.credits = hardcore ? 1000 : 500;
        this.integrity = 20;
        this.currentWave = 1; // RESET TO LEVEL 1
        this.activeGlitch = 'NONE';
        localStorage.removeItem('syntax_defense_save');
    }

    public save() {
        const data = {
            credits: this.credits,
            integrity: this.integrity,
            currentWave: this.currentWave,
            isHardcore: this.isHardcore
        };
        localStorage.setItem('syntax_defense_save', JSON.stringify(data));
    }

    public load(): boolean {
        const data = localStorage.getItem('syntax_defense_save');
        if (data) {
            const parsed = JSON.parse(data);
            this.credits = parsed.credits;
            this.integrity = parsed.integrity;
            this.currentWave = parsed.currentWave;
            this.isHardcore = parsed.isHardcore || false;
            this.activeGlitch = 'NONE';
            return true;
        }
        return false;
    }
}
