import { MusicManager } from './MusicManager';
import { TowerType } from '../entities/Tower';

export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private musicManager: MusicManager;
    private isInitialized: boolean = false;
    private _sfxVolume: number = 0.5;

    private constructor() {
        this.musicManager = MusicManager.getInstance();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) AudioManager.instance = new AudioManager();
        return AudioManager.instance;
    }

    public get sfxVolume(): number { return this._sfxVolume; }
    public set sfxVolume(val: number) {
        this._sfxVolume = val;
    }

    public async resume() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 1.0; 
            this.musicManager.init(this.ctx, this.masterGain);
            this.isInitialized = true;
        }
        if (this.ctx.state === 'suspended') await this.ctx.resume();
    }

    public triggerTonedBlip(freq: number, duration: number, volume: number, decay: number, type: OscillatorType = 'sine') {
        if (!this.isInitialized || !this.ctx || !this.masterGain) return;
        
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.ctx.currentTime + duration/1000);
        
        const finalVol = volume * this._sfxVolume;
        g.gain.setValueAtTime(finalVol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + decay);
        
        osc.connect(g);
        g.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration/1000);
    }

    public startMusic() { this.musicManager.start(); }
    public stopMusic() { this.musicManager.stop(); }
    public playUiClick() { this.triggerTonedBlip(1200, 40, 0.2, 0.05, 'sine'); }
    
    public playTerminalCommand() {
        this.triggerTonedBlip(400, 100, 0.3, 0.1, 'square');
    }

    public playTypeClick() {
        this.triggerTonedBlip(800 + Math.random() * 200, 20, 0.1, 0.01, 'sine');
    }

    public playDataChatter() {
        this.triggerTonedBlip(2000, 10, 0.05, 0.01, 'sine');
    }

    public playFireSfx(type: TowerType) {
        switch(type) {
            case TowerType.PULSE_NODE:
                this.triggerTonedBlip(600, 50, 0.15, 0.05, 'sine');
                break;
            case TowerType.ROCKET_BATTERY:
                this.triggerTonedBlip(150, 150, 0.4, 0.2, 'sawtooth');
                break;
            case TowerType.STASIS_FIELD:
                this.triggerTonedBlip(800, 100, 0.1, 0.2, 'sine');
                break;
            case TowerType.PRISM_BEAM:
                this.triggerTonedBlip(2000, 20, 0.05, 0.02, 'sine');
                break;
            case TowerType.RAIL_CANNON:
                this.triggerTonedBlip(100, 300, 0.5, 0.4, 'sawtooth');
                break;
            case TowerType.VOID_PROJECTOR:
                this.triggerTonedBlip(50, 600, 0.6, 0.5, 'sine');
                break;
        }
    }

    public playPurge() {
        this.triggerTonedBlip(800, 100, 0.3, 0.1, 'sine');
    }

    public playBreach() {
        this.triggerTonedBlip(60, 40, 0.5, 0.2, 'sawtooth');
    }
}
