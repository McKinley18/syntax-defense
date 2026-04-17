import { MusicManager } from './MusicManager';
import { TowerType } from '../entities/Tower';

export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    
    public isSfxMuted: boolean = false;
    public sfxVolume: number = 0.5;

    private constructor() {}

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.ctx.destination);
            MusicManager.getInstance().init(this.ctx, this.masterGain);
        } catch (e) {
            console.error("AUDIO_ENGINE_FAILURE", e);
        }
    }

    public async resume() {
        if (!this.ctx) this.init();
        if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
            await this.ctx.resume();
        }
        if (this.ctx && this.ctx.state === 'running') {
            MusicManager.getInstance().start(); 
        }
    }

    public startMusic() { MusicManager.getInstance().start(); }

    public playUiClick() {
        this.triggerTonedBlip(880, 1200, 0.05, 0.08, 'sine');
    }

    // MECHANICAL KEYBOARD CLICK (Filtered for ear-fatigue)
    public playTypeClick() {
        this.triggerTonedBlip(1200 + Math.random() * 400, 1000, 0.03, 0.04, 'triangle', 2500);
    }

    // AUTOMATED COMPUTER CHATTER (Softened Transients)
    public playDataChatter() {
        this.triggerTonedBlip(2400 + Math.random() * 800, 2000, 0.015, 0.02, 'sine', 2000);
    }

    public playTerminalCommand() {
        this.triggerTonedBlip(140, 60, 0.12, 0.2, 'triangle');
    }

    /**
     * UNIVERSAL BLIP TRIGGER
     * Includes optional Low-Pass Filter for ear-fatigue mitigation.
     */
    private triggerTonedBlip(startF: number, endF: number, dur: number, vol: number, type: OscillatorType, filterF?: number) {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(startF, time);
        osc.frequency.exponentialRampToValueAtTime(endF, time + dur);
        
        g.gain.setValueAtTime(vol * this.sfxVolume, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);

        if (filterF) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = filterF;
            osc.connect(filter);
            filter.connect(g);
        } else {
            osc.connect(g);
        }

        g.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + dur);
    }

    public playFireSfx(type: TowerType) {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const g = this.ctx.createGain();
        g.connect(this.masterGain!);

        switch(type) {
            case TowerType.PULSE_NODE:
                const oscP = this.ctx.createOscillator();
                oscP.type = 'square';
                oscP.frequency.setValueAtTime(440, time);
                oscP.frequency.exponentialRampToValueAtTime(220, time + 0.05);
                g.gain.setValueAtTime(0.05 * this.sfxVolume, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
                oscP.connect(g);
                oscP.start(time);
                oscP.stop(time + 0.05);
                break;
            case TowerType.SONIC_IMPULSE:
                const oscS = this.ctx.createOscillator();
                oscS.type = 'triangle';
                oscS.frequency.setValueAtTime(80, time);
                oscS.frequency.exponentialRampToValueAtTime(200, time + 0.1);
                g.gain.setValueAtTime(0.12 * this.sfxVolume, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
                oscS.connect(g);
                oscS.start(time);
                oscS.stop(time + 0.1);
                break;
            case TowerType.STASIS_FIELD:
                const oscST = this.ctx.createOscillator();
                oscST.type = 'sine';
                oscST.frequency.setValueAtTime(1200, time);
                oscST.frequency.exponentialRampToValueAtTime(800, time + 0.2);
                g.gain.setValueAtTime(0.03 * this.sfxVolume, time);
                g.gain.linearRampToValueAtTime(0, time + 0.2);
                oscST.connect(g);
                oscST.start(time);
                oscST.stop(time + 0.2);
                break;
            case TowerType.PRISM_BEAM:
                const oscPB = this.ctx.createOscillator();
                oscPB.type = 'sine';
                oscPB.frequency.setValueAtTime(2400, time);
                oscPB.frequency.exponentialRampToValueAtTime(3200, time + 0.03);
                g.gain.setValueAtTime(0.04 * this.sfxVolume, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
                oscPB.connect(g);
                oscPB.start(time);
                oscPB.stop(time + 0.03);
                break;
            case TowerType.RAIL_CANNON:
                const oscR = this.ctx.createOscillator();
                oscR.type = 'sawtooth';
                oscR.frequency.setValueAtTime(100, time);
                oscR.frequency.exponentialRampToValueAtTime(50, time + 0.15);
                g.gain.setValueAtTime(0.15 * this.sfxVolume, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                oscR.connect(g);
                oscR.start(time);
                oscR.stop(time + 0.15);
                break;
            case TowerType.VOID_PROJECTOR:
                const oscV = this.ctx.createOscillator();
                oscV.type = 'triangle';
                oscV.frequency.setValueAtTime(60, time);
                oscV.frequency.exponentialRampToValueAtTime(20, time + 0.25);
                g.gain.setValueAtTime(0.25 * this.sfxVolume, time);
                g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
                oscV.connect(g);
                oscV.start(time);
                oscV.stop(time + 0.25);
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
