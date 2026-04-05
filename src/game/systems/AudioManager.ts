export class AudioManager {
    private static instance: AudioManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private ambientGain: GainNode | null = null;
    private ambientOsc: OscillatorNode | null = null;
    
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
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5; // BOOSTED FOR MOBILE
            this.masterGain.connect(this.ctx.destination);

            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.value = this.isAmbientMuted ? 0 : 0.08; // BOOSTED AMBIENT
            this.ambientGain.connect(this.masterGain);
        } catch (e) {
            console.warn("AUDIO_INIT_FAILED:", e);
        }
    }

    public async resume() {
        if (!this.ctx) this.init();
        if (this.ctx?.state === 'suspended') {
            await this.ctx.resume();
        }
        this.startAmbient();
    }

    public isSuspended(): boolean {
        return !this.ctx || this.ctx.state === 'suspended';
    }

    public playUiClick() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    public playBreach() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    public playPlacement() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    public playPurge() {
        if (!this.ctx || this.isSfxMuted || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    public startAmbient() {
        if (!this.ctx || this.ambientOsc || this.ctx.state !== 'running') return;
        try {
            this.ambientOsc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            this.ambientOsc.type = 'sawtooth';
            this.ambientOsc.frequency.value = 40; 
            filter.type = 'lowpass';
            filter.frequency.value = 150;
            this.ambientOsc.connect(filter);
            filter.connect(this.ambientGain!);
            this.ambientOsc.start();
        } catch (e) {}
    }

    public toggleSfx() {
        this.isSfxMuted = !this.isSfxMuted;
        localStorage.setItem('syntax_sfx_muted', String(this.isSfxMuted));
    }

    public toggleAmbient() {
        this.isAmbientMuted = !this.isAmbientMuted;
        localStorage.setItem('syntax_ambient_muted', String(this.isAmbientMuted));
        if (this.ambientGain) {
            this.ambientGain.gain.setTargetAtTime(this.isAmbientMuted ? 0 : 0.08, this.ctx!.currentTime, 0.1);
        }
    }
}
