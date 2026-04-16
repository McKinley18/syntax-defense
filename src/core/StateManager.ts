import { TowerType } from '../entities/Tower';

export enum AppState {
    ORIENTATION_LOCK,
    POWER_ON,
    SYSTEM_CHECK,
    TERMINAL_BOOT,
    STUDIO_SPLASH,
    MAIN_MENU,
    ARCHIVE,
    DIAGNOSTICS,
    GAME_PREP,
    GAME_WAVE,
    GAME_PAUSED,
    GAME_OVER,
    WAVE_COMPLETED,
    WAVE_PREP
}

export class StateManager {
    private static _instance: StateManager | null = null;
    
    public currentState: AppState = AppState.ORIENTATION_LOCK;
    public previousState: AppState | null = null;
    public credits: number = 500;
    public currentWave: number = 0;
    public integrity: number = 20;
    public isPaused: boolean = false;
    public isRedMode: boolean = false;
    
    // PREFERENCES
    public skipCinematics: boolean = false;
    public selectedTurretType: TowerType | null = null;

    private listeners: ((state: AppState) => void)[] = [];

    private constructor() {
        // Load preferences on init
        const skip = localStorage.getItem('syndef_skip_cinematics');
        this.skipCinematics = skip === 'true';
    }

    public static get instance(): StateManager {
        if (!this._instance) this._instance = new StateManager();
        return this._instance;
    }

    public transitionTo(state: AppState) {
        console.log(`[StateManager] Transitioning to: ${AppState[state]}`);
        this.previousState = this.currentState;
        this.currentState = state;
        this.listeners.forEach(l => l(state));
    }

    public subscribe(listener: (state: AppState) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    public setSkipCinematics(val: boolean) {
        this.skipCinematics = val;
        localStorage.setItem('syndef_skip_cinematics', val ? 'true' : 'false');
    }

    public addCredits(amount: number) {
        this.credits += amount;
    }

    public takeDamage(amount: number) {
        this.integrity = Math.max(0, this.integrity - amount);
        if (this.integrity <= 0) {
            this.transitionTo(AppState.GAME_OVER);
        }
    }

    public saveGame() {
        const saveData = {
            credits: this.credits,
            currentWave: this.currentWave,
            integrity: this.integrity,
            timestamp: Date.now()
        };
        localStorage.setItem('syndef_save_data', JSON.stringify(saveData));
    }

    public loadGame(): boolean {
        const raw = localStorage.getItem('syndef_save_data');
        if (!raw) return false;
        try {
            const data = JSON.parse(raw);
            this.credits = data.credits;
            this.currentWave = data.currentWave;
            this.integrity = data.integrity;
            this.transitionTo(AppState.WAVE_COMPLETED);
            return true;
        } catch (e) {
            return false;
        }
    }

    public hasSaveData(): boolean {
        return localStorage.getItem('syndef_save_data') !== null;
    }

    public resetSession() {
        this.credits = 500;
        this.currentWave = 0;
        this.integrity = 20;
        this.isPaused = false;
        this.selectedTurretType = null;
    }
}
