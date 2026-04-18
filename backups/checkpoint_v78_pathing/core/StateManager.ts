import { EnemyType } from '../VisualRegistry';
import { AISystem } from '../systems/AISystem';

export enum AppState {
    ORIENTATION_LOCK,
    TERMINAL_BOOT,
    STUDIO_SPLASH,
    MAIN_MENU,
    GAME_PREP,    // Building before wave 1
    WAVE_PREP,    // 15s timer between waves
    GAME_WAVE,    // Enemies active
    WAVE_COMPLETED, // Interstitial after wave cleared
    GAME_OVER,
    ARCHIVE,
    DIAGNOSTICS,
    MAP_DEBUG
}

export class StateManager {
    private static _instance: StateManager;
    public currentState: AppState = AppState.ORIENTATION_LOCK;
    public previousState: AppState = AppState.ORIENTATION_LOCK;
    
    // ECONOMY & VITALITY
    public credits: number = 600;
    public integrity: number = 20;
    public maxIntegrity: number = 20;
    public currentWave: number = 0;
    public waveName: string = "BOOT_SEQUENCE";
    
    // STATS
    public totalPurged: number = 0;
    public perfectWaves: number = 0;
    public waveDamageTaken: number = 0;
    
    // SETTINGS
    public isPaused: boolean = false;
    public gameSpeed: number = 1.0;
    public uiScale: number = 1.0;
    public skipCinematics: boolean = true; // DEV_MODE: TRUE
    
    // INTERACTION
    public activeDraggingTurret: any = null;
    public nearKernelAlert: boolean = false;
    public selectedTurretType: number | null = null;
    public hasSeenTutorial: boolean = false;

    private listeners: Map<string, ((value: any) => void)[]> = new Map();

    private constructor() {
        // Force Main Menu for instant dev access
        this.currentState = AppState.MAIN_MENU;
        
        const saved = localStorage.getItem('syndef_prefs');
        if (saved) {
            const p = JSON.parse(saved);
            this.uiScale = p.uiScale || 1.0;
            this.skipCinematics = !!p.skipCinematics;
            this.hasSeenTutorial = !!p.hasSeenTutorial;
        }
    }

    public static get instance(): StateManager {
        if (!StateManager._instance) StateManager._instance = new StateManager();
        return StateManager._instance;
    }

    public transitionTo(newState: AppState) {
        if (this.currentState === newState) return;
        this.previousState = this.currentState;
        this.currentState = newState;
        this.notify('state', newState);

        if (newState === AppState.GAME_WAVE || newState === AppState.WAVE_PREP) {
            this.waveName = AISystem.generateWaveName(this.currentWave);
            this.notify('waveName', this.waveName);
        }
    }

    public setUiScale(scale: number) {
        this.uiScale = scale;
        this.notify('uiScale', scale);
    }

    public isDiscovered(type: EnemyType): boolean {
        const seen = JSON.parse(localStorage.getItem('syndef_archive_v2') || '[]');
        return seen.includes(type);
    }

    public addCredits(amount: number) {
        this.credits += amount;
        this.notify('credits', this.credits);
    }

    /**
     * INTEREST BONUS LAW:
     * +2% bonus for perfect waves.
     */
    public applyWaveBonuses() {
        if (this.waveDamageTaken === 0) {
            const bonus = Math.floor(this.credits * 0.02);
            this.addCredits(bonus);
            this.perfectWaves++;
        }
        this.waveDamageTaken = 0; // Reset for next wave
    }

    /**
     * INCREMENTAL REPAIR LAW:
     * +5 HP for 250c.
     */
    public attemptRepair() {
        const cost = 250;
        if (this.credits >= cost && this.integrity < this.maxIntegrity) {
            this.addCredits(-cost);
            this.integrity = Math.min(this.maxIntegrity, this.integrity + 5);
            this.notify('integrity', this.integrity);
            return true;
        }
        return false;
    }

    public takeDamage(amount: number) {
        this.integrity -= amount;
        this.waveDamageTaken += amount;
        this.notify('integrity', this.integrity);
        if (this.integrity <= 0) {
            this.transitionTo(AppState.GAME_OVER);
        }
    }

    public discoverEnemy(type: EnemyType) {
        const seen = JSON.parse(localStorage.getItem('syndef_archive_v2') || '[]');
        if (!seen.includes(type)) {
            seen.push(type);
            localStorage.setItem('syndef_archive_v2', JSON.stringify(seen));
        }
    }

    /**
     * INTRO PERSISTENCE:
     * Records that the user has witnessed the studio splash.
     */
    public recordIntroSeen() {
        localStorage.setItem('syndef_intro_seen_v50', 'true');
    }

    public subscribe(key: string, fn: (value: any) => void) {
        if (!this.listeners.has(key)) this.listeners.set(key, []);
        this.listeners.get(key)!.push(fn);
        return () => {
            const filtered = this.listeners.get(key)!.filter(f => f !== fn);
            this.listeners.set(key, filtered);
        };
    }

    private notify(key: string, value: any) {
        this.listeners.get(key)?.forEach(fn => fn(value));
    }

    public resetSession() {
        this.credits = 600;
        this.integrity = 20;
        this.currentWave = 0;
        this.totalPurged = 0;
        this.perfectWaves = 0;
        this.waveDamageTaken = 0;
        this.isPaused = false;
        this.gameSpeed = 1.0;
        this.notify('credits', this.credits);
        this.notify('integrity', this.integrity);
    }

    public saveGame(towers: any[] = []) {
        const data = {
            currentWave: this.currentWave,
            credits: this.credits,
            integrity: this.integrity,
            towers: towers.map(t => ({ type: t.type, x: t.container.x, y: t.container.y, tier: t.tier })),
            timestamp: Date.now()
        };
        localStorage.setItem('syndef_game_save', JSON.stringify(data));
    }

    public loadGame() {
        const saved = localStorage.getItem('syndef_game_save');
        if (saved) return JSON.parse(saved);
        return null;
    }

    public hasSaveData() { return false; }
}
