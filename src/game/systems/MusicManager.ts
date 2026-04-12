export type TrackID = 0 | 1 | 2 | 3 | 4;

export class MusicManager {
    private static instance: MusicManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private globalFilter: BiquadFilterNode | null = null;
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private beatIndex: number = 0;
    private timerID: number | null = null;
    public currentTrack: TrackID = 0;
    public enabledTracks: boolean[] = new Array(5).fill(true);

    private constructor() {
        const saved = localStorage.getItem('syntax_enabled_tracks');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.enabledTracks = parsed.slice(0, 5);
            while(this.enabledTracks.length < 5) this.enabledTracks.push(true);
        }
    }

    public static getInstance(): MusicManager {
        if (!MusicManager.instance) MusicManager.instance = new MusicManager();
        return MusicManager.instance;
    }

    public init(ctx: AudioContext, masterGain: GainNode) {
        this.ctx = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.35;
        this.globalFilter = ctx.createBiquadFilter();
        this.globalFilter.type = 'lowpass';
        this.globalFilter.frequency.value = 20000;
        this.masterGain.connect(this.globalFilter);
        this.globalFilter.connect(masterGain);
    }

    public start() { if (this.isPlaying || !this.ctx) return; this.isPlaying = true; this.nextNoteTime = this.ctx.currentTime; this.scheduler(); }
    public stop() { this.isPlaying = false; if (this.timerID) cancelAnimationFrame(this.timerID); }
    public setVolume(val: number) { if (this.masterGain) this.masterGain.gain.value = val * 0.5; }
    
    public setSystemStress(stress: number) {
        if (!this.ctx || !this.globalFilter) return;
        const minFreq = 800;
        const maxFreq = 20000;
        const targetFreq = minFreq + (maxFreq - minFreq) * Math.pow(stress, 1.5); 
        this.globalFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
    }

    public toggleTrack(id: number) { this.enabledTracks[id] = !this.enabledTracks[id]; localStorage.setItem('syntax_enabled_tracks', JSON.stringify(this.enabledTracks)); }
    public previewTrack(id: number) { if (!this.ctx || !this.isPlaying) return; this.currentTrack = id as TrackID; this.beatIndex = (Math.floor(this.beatIndex / 16) * 16); }

    private scheduler() {
        if (!this.isPlaying || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBeat(this.beatIndex, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = requestAnimationFrame(() => this.scheduler());
    }

    private advanceNote() {
        const secondsPerBeat = 60.0 / 126.0 / 4; 
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 128; 
        if (this.beatIndex === 0) this.pickNextTrack();
    }

    private pickNextTrack() {
        const indices = this.enabledTracks.map((e, i) => e ? i : -1).filter(i => i !== -1);
        if (indices.length === 0) return;
        this.currentTrack = indices[Math.floor(Math.random() * indices.length)] as TrackID;
    }

    private playBeat(i: number, t: number) {
        if (!this.ctx) return;
        // SIDECHAIN COMPRESSION EFFECT
        if (i % 4 === 0 && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(0.1, t, 0.01);
            this.masterGain.gain.setTargetAtTime(0.5, t + 0.1, 0.1);
        }
        switch(this.currentTrack) {
            case 0: this.playCoreLogic(i, t); break;
            case 1: this.playNeonBreach(i, t); break;
            case 2: this.playLiquidData(i, t); break;
            case 3: this.playVoidSignal(i, t); break;
            case 4: this.playGridRunner(i, t); break;
        }
    }

    // --- TRACK 0: CORE_LOGIC (Deep/Industrial) ---
    private playCoreLogic(i: number, t: number) {
        if (i % 4 === 0) this.triggerKick(t, 150, 40, 0.4);
        if (i % 8 === 4) this.triggerNoise(t, 0.15, 0.1, 'bandpass', 1000);
        if (i % 2 === 1) this.triggerNoise(t, 0.05, 0.02, 'highpass', 8000);
        const bass = [55, 55, 65, 55, 55, 82, 55, 41];
        if (i % 4 === 2) this.triggerSynth(t, bass[Math.floor(i/4)%8], 0.2, 'sawtooth', 0.15);
    }

    // --- TRACK 1: NEON_BREACH (Aggressive/Fast) ---
    private playNeonBreach(i: number, t: number) {
        if (i % 4 === 0) this.triggerKick(t, 180, 50, 0.2);
        if (i % 4 === 2) this.triggerNoise(t, 0.1, 0.05, 'highpass', 10000);
        const melody = [110, 138, 164, 196, 220, 196, 164, 138];
        if (i % 4 === 1) this.triggerSynth(t, melody[Math.floor(i/4)%8], 0.1, 'square', 0.1);
    }

    // --- TRACK 2: LIQUID_DATA (Ambient/Tech) ---
    private playLiquidData(i: number, t: number) {
        if (i % 8 === 0) this.triggerKick(t, 100, 30, 0.6);
        if (i % 16 === 12) this.triggerNoise(t, 0.05, 0.4, 'lowpass', 2000);
        const pad = [220, 329, 440, 659];
        if (i % 32 === 0) this.triggerSynth(t, pad[Math.floor(i/32)%4], 3.0, 'triangle', 0.2);
    }

    // --- TRACK 3: VOID_SIGNAL (Minimal/Eerie) ---
    private playVoidSignal(i: number, t: number) {
        if (i % 16 === 0) this.triggerKick(t, 80, 20, 0.8);
        if (i % 4 === 3) this.triggerSynth(t, 880 + (Math.random()*440), 0.05, 'sine', 0.05);
        if (i % 64 === 0) this.triggerSynth(t, 55, 8.0, 'sine', 0.1);
    }

    // --- TRACK 4: GRID_RUNNER (Synthwave/Driving) ---
    private playGridRunner(i: number, t: number) {
        if (i % 4 === 0) this.triggerKick(t, 140, 45, 0.3);
        if (i % 8 === 4) this.triggerNoise(t, 0.2, 0.15, 'lowpass', 1500);
        if (i % 2 === 1) this.triggerNoise(t, 0.08, 0.05, 'highpass', 7000);
        const drive = [110, 110, 110, 110, 130, 130, 146, 164];
        this.triggerSynth(t, drive[Math.floor(i/2)%8], 0.1, 'sawtooth', 0.12);
    }

    // --- ENGINE PRIMITIVES ---
    private triggerKick(t: number, start: number, end: number, dur: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(start, t);
        osc.frequency.exponentialRampToValueAtTime(end, t + dur);
        g.gain.setValueAtTime(0.8, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g); g.connect(this.masterGain!);
        osc.start(t); osc.stop(t + dur);
    }

    private triggerNoise(t: number, vol: number, dur: number, filterType: BiquadFilterType, freq: number) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(filter); filter.connect(g); g.connect(this.masterGain!);
        noise.start(t); noise.stop(t + dur);
    }

    private triggerSynth(t: number, freq: number, dur: number, type: OscillatorType, vol: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g); g.connect(this.masterGain!);
        osc.start(t); osc.stop(t + dur);
    }
}
