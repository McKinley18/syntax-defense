import { TowerType } from '../entities/Tower';

export enum AppState {
    ORIENTATION_LOCK,
    TERMINAL_BOOT,
    STUDIO_SPLASH,
    MAIN_MENU,
    ARCHIVE,
    DIAGNOSTICS,
    GAME_PREP,
    GAME_WAVE,
    WAVE_COMPLETED,
    WAVE_PREP,
    GAME_OVER
}

type StateListener = (value: any) => void;

export class StateManager {
    private static _instance: StateManager | null = null;
    
    public currentState: AppState = AppState.ORIENTATION_LOCK;
    public previousState: AppState | null = null;
    
    // --- PERSISTED STATE ---
    private _credits: number = 500;
    private _integrity: number = 20;
    public currentWave: number = 0;
    public totalPurged: number = 0;
    
    // --- REAL-TIME FLAGS ---
    public isPaused: boolean = false;
    public isRedMode: boolean = false;
    public gameSpeed: number = 1.0;
    public nearKernelAlert: boolean = false;
    public activeDraggingTurret: TowerType | null = null;
    
    // --- PREFERENCES ---
    public skipCinematics: boolean = false;
    public hasSeenTutorial: boolean = false;
    public hiResEnabled: boolean = true;
    public uiScale: number = 1.0;
    public selectedTurretType: TowerType | null = null;
    
    private discoveredEnemies: Set<number> = new Set([0]); 
    private listeners: Record<string, StateListener[]> = {};

    private constructor() {
        this.loadPreferences();
    }

    public static get instance(): StateManager {
        if (!this._instance) this._instance = new StateManager();
        return this._instance;
    }

    // --- PUB/SUB ENGINE (Replaces Polling) ---
    public subscribe(key: string, callback: StateListener) {
        if (!this.listeners[key]) this.listeners[key] = [];
        this.listeners[key].push(callback);
        return () => { this.listeners[key] = this.listeners[key].filter(l => l !== callback); };
    }

    private emit(key: string, value: any) {
        if (this.listeners[key]) this.listeners[key].forEach(l => l(value));
    }

    // --- ACCESORS WITH EMISSION ---
    get credits() { return this._credits; }
    set credits(v: number) { this._credits = v; this.emit('credits', v); }

    get integrity() { return this._integrity; }
    set integrity(v: number) { this._integrity = v; this.emit('integrity', v); }

    public addCredits(amount: number) {
        this.credits += Math.round(amount);
    }

    // --- SAVE VALIDATION (Integrity Check) ---
    public saveGame(towers: any[] = []) {
        try {
            const towerData = towers.map(t => ({ type: t.type, x: t.container.x, y: t.container.y, tier: t.tier }));
            const saveData = {
                credits: this.credits,
                currentWave: this.currentWave,
                integrity: this.integrity,
                towers: towerData,
                checksum: btoa(`${this.credits}-${this.currentWave}`) // Simple integrity check
            };
            localStorage.setItem('syndef_save_data', JSON.stringify(saveData));
        } catch (e) { console.error("SAVE_FAILURE", e); }
    }

    public loadGame(): any {
        const raw = localStorage.getItem('syndef_save_data');
        if (!raw) return null;
        try {
            const data = JSON.parse(raw);
            // Validation: Checksum verification
            const expected = btoa(`${data.credits}-${data.currentWave}`);
            if (data.checksum !== expected) throw new Error("DATA_CORRUPTION_DETECTED");

            this.credits = data.credits;
            this.currentWave = data.currentWave;
            this.integrity = data.integrity;
            this.transitionTo(AppState.WAVE_COMPLETED);
            return data;
        } catch (e) {
            console.warn("RECOVERY_PROTOCOL: Resetting malformed save.");
            localStorage.removeItem('syndef_save_data');
            return null;
        }
    }

    // --- JOURNEY ---
    private loadPreferences() {
        const introSeen = localStorage.getItem('syndef_intro_seen');
        this.skipCinematics = (introSeen === 'true');
        const tutSeen = localStorage.getItem('syndef_tutorial_v19');
        this.hasSeenTutorial = tutSeen === 'true';
        const scale = localStorage.getItem('syndef_ui_scale');
        if (scale) this.uiScale = parseFloat(scale);
    }

    public recordIntroSeen() {
        localStorage.setItem('syndef_intro_seen', 'true');
        this.skipCinematics = true;
    }

    public recordTutorialSeen() {
        localStorage.setItem('syndef_tutorial_v19', 'true');
        this.hasSeenTutorial = true;
    }

    public transitionTo(state: AppState) {
        this.previousState = this.currentState;
        this.currentState = state;
        this.emit('state', state);
    }

    public takeDamage(amount: number) {
        this.integrity = Math.max(0, this.integrity - amount);
        this.isRedMode = true;
        this.emit('breach', true);
        setTimeout(() => { this.isRedMode = false; this.emit('breach', false); }, 150);
        if (this.integrity <= 0) this.transitionTo(AppState.GAME_OVER);
    }

    public resetSession() {
        this.credits = 500;
        this.currentWave = 0;
        this.integrity = 20;
        this.isPaused = false;
        this.totalPurged = 0;
    }

    public hasSaveData() { return localStorage.getItem('syndef_save_data') !== null; }
    public discoverEnemy(t: number) { this.discoveredEnemies.add(t); }
    public isDiscovered(t: number) { return this.discoveredEnemies.has(t); }
    public setUiScale(v: number) { this.uiScale = v; localStorage.setItem('syndef_ui_scale', v.toString()); }
}
