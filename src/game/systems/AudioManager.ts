import { MusicManager } from './MusicManager';

export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    
    public isSfxMuted: boolean = false;
    public isAmbientMuted: boolean = false; 
    public sfxVolume: number = 0.7;
    public musicVolume: number = 0.5;

    private constructor() {
        this.isSfxMuted = localStorage.getItem('syntax_sfx_muted') === 'true';
        this.isAmbientMuted = localStorage.getItem('syntax_ambient_muted') === 'true';
        this.sfxVolume = parseFloat(localStorage.getItem('syntax_sfx_vol') || '0.7');
        this.musicVolume = parseFloat(localStorage.getItem('syntax_music_vol') || '0.5');
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public isReady(): boolean {
        return this.ctx !== null && this.ctx.state === 'running';
    }

    public init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            this.ctx = new AudioContextClass();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 1.0;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.isSfxMuted ? 0 : this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            MusicManager.getInstance().init(this.ctx, this.masterGain);
            MusicManager.getInstance().setVolume(this.isAmbientMuted ? 0 : this.musicVolume);
            
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
        }
        // Music start removed from here - managed by App.tsx logic
    }

    public playTypeClick() {
        this.playProcedural(600, 600, 0.015, 'square', 0.03); // Lowered from 0.05
    }

    public playBreach() {
        this.playProcedural(120, 40, 0.4, 'sawtooth', 0.4);
    }

    public playPlacement() {
        this.playProcedural(300, 900, 0.15, 'sine', 0.2);
    }

    public playPurge() {
        this.playProcedural(1000, 50, 0.25, 'sawtooth', 0.2);
    }

    // UNIQUE TURRET SOUNDS
    public playFirePulse() { // MG
        this.playProcedural(600, 200, 0.06, 'square', 0.1);
    }
    public playFireFrost() { // FROST
        this.playProcedural(800, 1200, 0.2, 'sine', 0.08);
    }
    public playFireBlast() { // BLAST
        this.playProcedural(200, 60, 0.25, 'sawtooth', 0.12);
    }
    public playFireTesla() { // TESLA
        this.playProcedural(1200, 1500, 0.1, 'sawtooth', 0.07);
    }
    public playFireRail() { // RAIL
        this.playProcedural(2500, 100, 0.2, 'square', 0.12);
    }

    private playProcedural(start: number, end: number, dur: number, type: OscillatorType, vol: number) {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        if (start !== end) osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        
        gain.gain.setValueAtTime(vol * this.sfxVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(time);
        osc.stop(time + dur);
    }

    public playGlitchBuzz() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(60, time);
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        mod.frequency.value = 30;
        modGain.gain.value = 20;
        mod.connect(modGain); modGain.connect(osc.frequency);
        gain.gain.setValueAtTime(0.03 * this.sfxVolume, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.15);
        osc.connect(gain); gain.connect(this.sfxGain!);
        mod.start(time); osc.start(time);
        mod.stop(time + 0.15); osc.stop(time + 0.15);
    }

    public setSfxVolume(val: number) {
        this.sfxVolume = val;
        if (this.sfxGain) this.sfxGain.gain.value = this.isSfxMuted ? 0 : val;
        localStorage.setItem('syntax_sfx_vol', String(val));
    }

    public setMusicVolume(val: number) {
        this.musicVolume = val;
        MusicManager.getInstance().setVolume(this.isAmbientMuted ? 0 : val);
        localStorage.setItem('syntax_music_vol', String(val));
    }

    public toggleSfx() {
        this.isSfxMuted = !this.isSfxMuted;
        if (this.sfxGain) this.sfxGain.gain.value = this.isSfxMuted ? 0 : this.sfxVolume;
        localStorage.setItem('syntax_sfx_muted', String(this.isSfxMuted));
        if (!this.isSfxMuted) this.playUiClick();
    }

    public toggleAmbient() {
        this.isAmbientMuted = !this.isAmbientMuted;
        MusicManager.getInstance().setVolume(this.isAmbientMuted ? 0 : this.musicVolume);
        localStorage.setItem('syntax_ambient_muted', String(this.isAmbientMuted));
        if (this.isAmbientMuted) MusicManager.getInstance().stop();
        else MusicManager.getInstance().start();
    }
}
