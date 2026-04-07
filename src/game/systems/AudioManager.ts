import { MusicManager } from './MusicManager';

export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    
    public isSfxMuted: boolean = false;
    public isAmbientMuted: boolean = false; 

    private constructor() {
        this.isSfxMuted = localStorage.getItem('syntax_sfx_muted') === 'true';
        this.isAmbientMuted = localStorage.getItem('syntax_ambient_muted') === 'true';
    }

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
            this.masterGain.gain.value = 0.7; // INCREASED VOLUME
            this.masterGain.connect(this.ctx.destination);

            MusicManager.getInstance().init(this.ctx, this.masterGain);
            if (!this.isAmbientMuted) {
                MusicManager.getInstance().start();
            }
            console.log("SYNTAX_AUDIO_ENGINE: ONLINE");
        } catch (e) {
            console.error("SYNTAX_AUDIO_ENGINE: INITIALIZATION_FAILED", e);
        }
    }

    public async resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
            console.log("SYNTAX_AUDIO_ENGINE: RESUMED");
        }
        if (!this.isAmbientMuted) {
            MusicManager.getInstance().start();
        }
    }

    public playUiClick() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, time); // LOWER PITCH
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.08);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + 0.08);
    }

    public playTypeClick() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, time);
        gain.gain.setValueAtTime(0.02, time); // VERY SUBTLE
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + 0.015);
    }

    public playBreach() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.linearRampToValueAtTime(40, time + 0.4);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + 0.4);
    }

    public playPlacement() {
        this.playProcedural(300, 900, 0.1, 'sine', 0.2);
    }

    public playPurge() {
        this.playProcedural(1000, 50, 0.2, 'sawtooth', 0.15);
    }

    public playFirePulse() {
        this.playProcedural(600, 200, 0.06, 'square', 0.1);
    }

    public playFireFrost() {
        this.playProcedural(800, 1200, 0.12, 'sine', 0.08);
    }

    public playFireBlast() {
        this.playProcedural(200, 60, 0.25, 'sawtooth', 0.12);
    }

    public playFireTesla() {
        this.playProcedural(1200, 1500, 0.08, 'triangle', 0.07);
    }

    public playFireRail() {
        this.playProcedural(2500, 100, 0.15, 'square', 0.12);
    }

    private playProcedural(start: number, end: number, dur: number, type: OscillatorType, vol: number) {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + dur);
    }

    public playGlitchBuzz() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(60, time); // LOW ELECTRICAL HUM
        // Add fast vibrato for "buzz"
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        mod.frequency.value = 30;
        modGain.gain.value = 20;
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.03, time); // FAINT
        gain.gain.linearRampToValueAtTime(0, time + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        mod.start(time);
        osc.start(time);
        mod.stop(time + 0.15);
        osc.stop(time + 0.15);
    }

    public toggleSfx() {
        this.isSfxMuted = !this.isSfxMuted;
        localStorage.setItem('syntax_sfx_muted', String(this.isSfxMuted));
        if (!this.isSfxMuted) this.playUiClick();
    }

    public toggleAmbient() {
        this.isAmbientMuted = !this.isAmbientMuted;
        localStorage.setItem('syntax_ambient_muted', String(this.isAmbientMuted));
        if (this.isAmbientMuted) {
            MusicManager.getInstance().stop();
        } else {
            MusicManager.getInstance().start();
        }
    }
}
