export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    
    public isSfxMuted: boolean = false;
    public isAmbientMuted: boolean = false; // RETAINED FOR SETTINGS COMPATIBILITY

    private constructor() {
        this.isSfxMuted = localStorage.getItem('syntax_sfx_muted') === 'true';
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
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn("AUDIO_INIT_FAILED:", e);
        }
    }

    public async resume() {
        if (!this.ctx) this.init();
        if (this.ctx?.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    public isSuspended(): boolean {
        return !this.ctx || this.ctx.state === 'suspended';
    }

    // --- UNIVERSAL CLICK ---
    public playUiClick() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
        osc.connect(gain); gain.connect(this.masterGain!);
        osc.start(); osc.stop(this.ctx.currentTime + 0.04);
    }

    // --- BREACH SFX ---
    public playBreach() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain); gain.connect(this.masterGain!);
        osc.start(); osc.stop(this.ctx.currentTime + 0.3);
    }

    // --- UNIQUE TURRET ACOUSTICS ---
    public playFirePulse() {
        if (!this.ctx || this.isSfxMuted) return;
        this.playProcedural(440, 220, 0.05, 'square', 0.08);
    }

    public playFireFrost() {
        if (!this.ctx || this.isSfxMuted) return;
        this.playProcedural(880, 1200, 0.1, 'sine', 0.05);
    }

    public playFireBlast() {
        if (!this.ctx || this.isSfxMuted) return;
        this.playProcedural(150, 40, 0.2, 'sawtooth', 0.1);
    }

    public playFireRail() {
        if (!this.ctx || this.isSfxMuted) return;
        this.playProcedural(2000, 100, 0.15, 'triangle', 0.1);
    }

    public playFireTesla() {
        if (!this.ctx || this.isSfxMuted) return;
        this.playProcedural(600, 800, 0.08, 'sawtooth', 0.06);
    }

    private playProcedural(startFreq: number, endFreq: number, duration: number, type: OscillatorType, vol: number) {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain); gain.connect(this.masterGain!);
        osc.start(); osc.stop(this.ctx.currentTime + duration);
    }

    public playPlacement() {
        this.playProcedural(220, 880, 0.1, 'sine', 0.15);
    }

    public playPurge() {
        this.playProcedural(1200, 100, 0.15, 'triangle', 0.08);
    }

    // --- SETTINGS ---
    public toggleSfx() {
        this.isSfxMuted = !this.isSfxMuted;
        localStorage.setItem('syntax_sfx_muted', String(this.isSfxMuted));
    }

    public startAmbient() { /* REMOVED HUM AS REQUESTED */ }
    public toggleAmbient() { /* PLACEHOLDER FOR UI COMPATIBILITY */ }
}
