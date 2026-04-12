import { MusicManager } from './MusicManager';

export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    
    // Background Hum
    private humOsc: OscillatorNode | null = null;
    private humGain: GainNode | null = null;
    private humCrusher: BiquadFilterNode | null = null;
    
    public isSfxMuted: boolean = false;
    public isAmbientMuted: boolean = false; 
    public sfxVolume: number = 0.7;
    public musicVolume: number = 0.5;
    private isActivated: boolean = false;

    // A minor pentatonic root notes
    private scale = [220, 261.63, 329.63, 392, 440, 523.25, 659.25, 783.99];

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
        return this.ctx !== null && (this.ctx.state === 'running' || this.ctx.state === 'suspended');
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
            this.sfxGain.gain.value = 1.0; // Force on for refinement
            this.sfxGain.connect(this.masterGain);

            MusicManager.getInstance().init(this.ctx, this.masterGain);
            MusicManager.getInstance().setVolume(this.musicVolume);
        } catch (e) {
            console.error("SYNTAX_AUDIO_ENGINE: INITIALIZATION_FAILED", e);
        }
    }

    private activateAudibles() {
        if (this.isActivated) return;
        this.isActivated = true;
        this.initHum();
        if (!this.isAmbientMuted) {
            MusicManager.getInstance().start();
        }
    }

    private initHum() {
        if (!this.ctx) return;
        this.humOsc = this.ctx.createOscillator();
        this.humGain = this.ctx.createGain();
        this.humCrusher = this.ctx.createBiquadFilter();

        this.humOsc.type = 'sine';
        this.humOsc.frequency.value = 55; 

        this.humCrusher.type = 'highpass';
        this.humCrusher.frequency.value = 20;

        this.humGain.gain.value = 0.05; 

        this.humOsc.connect(this.humCrusher);
        this.humCrusher.connect(this.humGain);
        this.humGain.connect(this.masterGain!);

        this.humOsc.start();
    }

    public updateHum(integrity: number) {
        if (!this.humGain || !this.humCrusher || !this.humOsc || !this.ctx) return;
        if (integrity <= 0) {
            this.humGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            return;
        }

        const healthRatio = Math.max(0, Math.min(1, integrity / 20));
        
        if (healthRatio < 0.3) {
            this.humOsc.type = 'square';
            this.humCrusher.type = 'lowpass';
            this.humCrusher.frequency.setTargetAtTime(100 + (Math.random() * 500), this.ctx.currentTime, 0.1);
            this.humGain.gain.setTargetAtTime(0.1 + (Math.random() * 0.05), this.ctx.currentTime, 0.1);
        } else {
            this.humOsc.type = 'sine';
            this.humCrusher.type = 'highpass';
            this.humCrusher.frequency.setTargetAtTime(20, this.ctx.currentTime, 0.5);
            this.humGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.5);
        }
    }

    public async resume() {
        if (!this.ctx) this.init();
        if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
            await this.ctx.resume();
        }
        if (this.ctx && this.ctx.state === 'running') {
            this.activateAudibles();
        }
    }

    private getPanNode(x: number, maxX: number): StereoPannerNode | GainNode {
        if (!this.ctx) return this.ctx!.createGain();
        const panVal = Math.max(-1, Math.min(1, (x / maxX) * 2 - 1));
        if (this.ctx.createStereoPanner) {
            const panner = this.ctx.createStereoPanner();
            panner.pan.value = panVal * 0.8; 
            return panner;
        }
        return this.ctx.createGain(); 
    }

    public playUiClick() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, time);
        osc.frequency.exponentialRampToValueAtTime(1000, time + 0.04);
        
        g.gain.setValueAtTime(0.1 * this.sfxVolume, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(time);
        osc.stop(time + 0.04);
    }

    public playDataChatter() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3000 + Math.random() * 2000, time);
        g.gain.setValueAtTime(0.01 * this.sfxVolume, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
        osc.connect(g); g.connect(this.sfxGain!);
        osc.start(time); osc.stop(time + 0.02);
    }

    public playTerminalCommand() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        this.playProcedural(400, 200, 0.05, 'square', 0.2);
        const sub = this.ctx.createOscillator();
        const subG = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, time);
        subG.gain.setValueAtTime(0.2 * this.sfxVolume, time);
        subG.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        sub.connect(subG); subG.connect(this.sfxGain!);
        sub.start(time); sub.stop(time + 0.1);
    }

    public playPowerOn() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, time);
        osc.frequency.exponentialRampToValueAtTime(1200, time + 0.6);
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.2, time + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc.connect(g); g.connect(this.sfxGain!);
        osc.start(time); osc.stop(time + 0.6);
    }

    public playTypeClick() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const click = this.ctx.createOscillator();
        const clickG = this.ctx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(3500 + Math.random() * 500, time);
        clickG.gain.setValueAtTime(0.03 * this.sfxVolume, time);
        clickG.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
        click.connect(clickG); clickG.connect(this.sfxGain!);
        click.start(time); click.stop(time + 0.01);

        const bufferSize = this.ctx.sampleRate * 0.03;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const nGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800 + Math.random() * 200;
        filter.Q.value = 1.5;
        nGain.gain.setValueAtTime(0.04 * this.sfxVolume, time);
        nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        noise.connect(filter); filter.connect(nGain); nGain.connect(this.sfxGain!);
        noise.start(time); noise.stop(time + 0.03);
    }

    public playBreach(x: number, maxX: number) { 
        this.playSpatial(100, 40, 0.4, 'sawtooth', 0.2, x, maxX);
    }
    
    public playDramaticGlitch() { /* Silenced */ }

    public playRepair() {
        this.playProcedural(400, 800, 0.2, 'sine', 0.15);
    }

    public playUiDeny() {
        this.playProcedural(150, 50, 0.1, 'square', 0.1);
    }

    public setSfxMuted(v: boolean) {
        this.isSfxMuted = v;
        if (this.sfxGain) this.sfxGain.gain.value = v ? 0 : this.sfxVolume;
    }

    public setAmbientMuted(v: boolean) {
        this.isAmbientMuted = v;
        MusicManager.getInstance().setVolume(v ? 0 : this.musicVolume);
    }

    public playPlacement() {
        this.playProcedural(300, 900, 0.15, 'sine', 0.2);
    }

    public playPurge(x: number = window.innerWidth / 2, maxX: number = window.innerWidth) {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const baseNote = this.scale[Math.floor(Math.random() * this.scale.length)];
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.getPanNode(x, maxX);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseNote * 2, time);
        osc.frequency.exponentialRampToValueAtTime(baseNote / 2, time + 0.25);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        osc.connect(gain); gain.connect(panner); panner.connect(this.sfxGain!);
        osc.start(time); osc.stop(time + 0.25);
    }

    public playRankUp() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const envGain = this.ctx.createGain();
        carrier.type = 'sine'; modulator.type = 'sine';
        carrier.frequency.value = 440; modulator.frequency.value = 440 * 2.5; 
        modGain.gain.setValueAtTime(1000, time);
        modGain.gain.exponentialRampToValueAtTime(10, time + 3.0);
        envGain.gain.setValueAtTime(0.3 * this.sfxVolume, time);
        envGain.gain.setTargetAtTime(0.4 * this.sfxVolume, time + 0.1, 0.1);
        envGain.gain.exponentialRampToValueAtTime(0.001, time + 4.0);
        modulator.connect(modGain); modGain.connect(carrier.frequency);
        carrier.connect(envGain); envGain.connect(this.sfxGain!);
        carrier.start(time); modulator.start(time);
        carrier.stop(time + 4.0); modulator.stop(time + 4.0);
    }

    public playFirePulse(x: number, maxX: number) { this.playSpatial(600, 200, 0.06, 'square', 0.1, x, maxX); }
    public playFireFrost(x: number, maxX: number) { this.playSpatial(800, 1200, 0.2, 'sine', 0.08, x, maxX); }
    public playFireBlast(x: number, maxX: number) { this.playSpatial(200, 60, 0.25, 'sawtooth', 0.12, x, maxX); }
    public playFireTesla(x: number, maxX: number) { this.playSpatial(1200, 1500, 0.1, 'sawtooth', 0.07, x, maxX); }
    public playFireRail(x: number, maxX: number) { this.playSpatial(2500, 100, 0.2, 'square', 0.12, x, maxX); }

    private playSpatial(start: number, end: number, dur: number, type: OscillatorType, vol: number, x: number, maxX: number) {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const panner = this.getPanNode(x, maxX);
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        if (start !== end) osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        gain.gain.setValueAtTime(vol * this.sfxVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain); gain.connect(panner); panner.connect(this.sfxGain!);
        osc.start(time); osc.stop(time + dur);
    }

    private playProcedural(start: number, end: number, dur: number, type: OscillatorType, vol: number) {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        if (start !== end) osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        gain.gain.setValueAtTime(vol * this.sfxVolume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain); gain.connect(this.sfxGain!);
        osc.start(time); osc.stop(time + dur);
    }

    public setSfxVolume(val: number) { this.sfxVolume = val; if (this.sfxGain) this.sfxGain.gain.value = this.isSfxMuted ? 0 : val; localStorage.setItem('syntax_sfx_vol', String(val)); }
    public setMusicVolume(val: number) { this.musicVolume = val; MusicManager.getInstance().setVolume(this.isAmbientMuted ? 0 : this.musicVolume); localStorage.setItem('syntax_music_vol', String(val)); }
    public toggleSfx() { this.isSfxMuted = !this.isSfxMuted; if (this.sfxGain) this.sfxGain.gain.value = this.isSfxMuted ? 0 : this.sfxVolume; localStorage.setItem('syntax_sfx_muted', String(this.isSfxMuted)); if (!this.isSfxMuted) this.playUiClick(); }
    public toggleAmbient() { this.isAmbientMuted = !this.isAmbientMuted; MusicManager.getInstance().setVolume(this.isAmbientMuted ? 0 : this.musicVolume); localStorage.setItem('syntax_ambient_muted', String(this.isAmbientMuted)); if (this.isAmbientMuted) MusicManager.getInstance().stop(); else MusicManager.getInstance().start(); }
}
