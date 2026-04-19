import { EnemyType } from '../VisualRegistry';
import { AISystem } from '../systems/AISystem';

export enum AppState {
    ORIENTATION_LOCK,
    TERMINAL_BOOT,
    STUDIO_SPLASH,
    MAIN_MENU,
    GAME_PREP,
    WAVE_PREP,
    GAME_WAVE,
    WAVE_COMPLETED,
    GAME_OVER,
    ARCHIVE,
    DIAGNOSTICS,
    MAP_DEBUG
}

export type GameMode = 'STANDARD' | 'HARDCORE';

export class StateManager {
    private static _instance: StateManager;
    public currentState: AppState = AppState.ORIENTATION_LOCK;
    public previousState: AppState = AppState.ORIENTATION_LOCK;
    public gameMode: GameMode = 'STANDARD';
    
    public credits: number = 600;
    public integrity: number = 20;
    public maxIntegrity: number = 20;
    public currentWave: number = 1;
    public waveName: string = "BOOT_SEQUENCE";
    
    public totalPurged: number = 0;
    public perfectWaves: number = 0;
    public waveDamageTaken: number = 0;

    public waveCreditsEarned: number = 0;
    public wavePurgedCount: number = 0;
    public lastWaveInterest: number = 0;
    public lastWaveBonus: number = 0;
    
    private _isPaused: boolean = false;
    public gameSpeed: number = 1.0;
    public uiScale: number = 1.0;
    public skipCinematics: boolean = false; // DEFAULT: ENABLED for immersion
    
    public nearKernelAlert: boolean = false;
    public selectedTurretType: number | null = null;
    public hasSeenTutorial: boolean = false;

    private listeners: Map<string, ((value: any) => void)[]> = new Map();

    private constructor() {
        this.currentState = AppState.ORIENTATION_LOCK; // FORCE GATEWAY
        
        const saved = localStorage.getItem('syndef_prefs');
        if (saved) {
            const p = JSON.parse(saved);
            this.uiScale = p.uiScale || 1.0;
            // Respect saved, but allow intro by default if not set
            this.skipCinematics = p.skipCinematics === true;
            this.hasSeenTutorial = !!p.hasSeenTutorial;
        }
    }

    public static get instance(): StateManager {
        if (!StateManager._instance) StateManager._instance = new StateManager();
        return StateManager._instance;
    }

    public get isPaused(): boolean { return this._isPaused; }
    public set isPaused(val: boolean) {
        if (this._isPaused === val) return;
        this._isPaused = val;
        this.notify('isPaused', val);
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
        if (amount > 0) this.waveCreditsEarned += amount;
        this.notify('credits', this.credits);
    }

    public applyWaveBonuses(bonusBase: number) {
        let interest = 0;
        if (this.waveDamageTaken === 0) {
            const rate = this.gameMode === 'HARDCORE' ? 0.01 : 0.05;
            interest = Math.min(1500, Math.floor(this.credits * rate));
            this.addCredits(interest);
            this.perfectWaves++;
        }
        this.lastWaveInterest = interest;
        this.lastWaveBonus = bonusBase;
        this.addCredits(bonusBase);
        this.waveDamageTaken = 0; 
    }

    public getRepairCost(): number {
        return 250 + (this.currentWave * 50);
    }

    public attemptRepair() {
        const cost = this.getRepairCost();
        if (this.credits >= cost && this.integrity < this.maxIntegrity) {
            this.credits -= cost;
            this.integrity = Math.min(this.maxIntegrity, this.integrity + 5);
            this.notify('credits', this.credits);
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

    public resetSession(mode: GameMode = 'STANDARD') {
        // AUTH_CLEANUP: Clear previous save data for a fresh infiltration
        localStorage.removeItem('syndef_game_save');
        
        this.gameMode = mode;
        this.credits = mode === 'HARDCORE' ? 450 : 600;
        this.integrity = 20;
        this.currentWave = 1;
        this.totalPurged = 0;
        this.perfectWaves = 0;
        this.waveDamageTaken = 0;
        this.waveCreditsEarned = 0;
        this.wavePurgedCount = 0;
        this.isPaused = false;
        this.gameSpeed = 1.0;
        this.notify('credits', this.credits);
        this.notify('integrity', this.integrity);
        this.notify('state', this.currentState);
        this.notify('gameMode', this.gameMode);
    }

    public resetTutorial() {
        this.hasSeenTutorial = false;
        localStorage.removeItem('syndef_tutorial_v19');
        this.notify('hasSeenTutorial', false);
    }

    public saveGame(towers: any[] = []) {
        const data = {
            gameMode: this.gameMode,
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
        if (saved) {
            const data = JSON.parse(saved);
            this.gameMode = data.gameMode || 'STANDARD';
            this.currentWave = data.currentWave || 1;
            this.credits = data.credits || 600;
            this.integrity = data.integrity || 20;
            this.notify('credits', this.credits);
            this.notify('integrity', this.integrity);
            this.notify('gameMode', this.gameMode);
            return data;
        }
        return null;
    }

    public hasSaveData() { return !!localStorage.getItem('syndef_game_save'); }
}
