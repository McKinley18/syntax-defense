export type TrackID = 0 | 1 | 2 | 3 | 4 | 5;

export class MusicManager {
    private static instance: MusicManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private beatIndex: number = 0;
    private timerID: number | null = null;
    
    public currentTrack: TrackID = 0;
    public enabledTracks: boolean[] = [true, true, true, true, true, true];

    private constructor() {
        const saved = localStorage.getItem('syntax_enabled_tracks');
        if (saved) {
            this.enabledTracks = JSON.parse(saved);
        }
    }

    public static getInstance(): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager();
        }
        return MusicManager.instance;
    }

    public init(ctx: AudioContext, masterGain: GainNode) {
        this.ctx = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.22; 
        this.masterGain.connect(masterGain);
    }

    public start() {
        if (this.isPlaying || !this.ctx) return;
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    public stop() {
        this.isPlaying = false;
        if (this.timerID) cancelAnimationFrame(this.timerID);
    }

    public setVolume(val: number) {
        if (this.masterGain) this.masterGain.gain.value = val * 0.45;
    }

    public toggleTrack(id: TrackID) {
        this.enabledTracks[id] = !this.enabledTracks[id];
        localStorage.setItem('syntax_enabled_tracks', JSON.stringify(this.enabledTracks));
    }

    public previewTrack(id: TrackID) {
        if (!this.ctx || !this.isPlaying) return;
        this.currentTrack = id;
        this.beatIndex = (Math.floor(this.beatIndex / 4) * 4); // Align to bar
    }

    private scheduler() {
        if (!this.isPlaying || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBeat(this.beatIndex, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = requestAnimationFrame(() => this.scheduler());
    }

    private advanceNote() {
        const tempo = 124.0;
        const secondsPerBeat = 60.0 / tempo / 4; 
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 128;

        if (this.beatIndex === 0) {
            this.pickNextTrack();
        }
    }

    private pickNextTrack() {
        const indices = this.enabledTracks.map((e, i) => e ? i : -1).filter(i => i !== -1);
        if (indices.length === 0) return;
        this.currentTrack = indices[Math.floor(Math.random() * indices.length)] as TrackID;
    }

    private playBeat(index: number, time: number) {
        if (!this.ctx) return;

        // TRACK-SPECIFIC LOGIC (Each track now defines its own rhythm/voice)
        switch(this.currentTrack) {
            case 0: this.playTrack0(index, time); break; // AMBIENT TECH
            case 1: this.playTrack1(index, time); break; // HEAVY INDUSTRIAL
            case 2: this.playTrack2(index, time); break; // SYSTEM FLOW
            case 3: this.playTrack3(index, time); break; // CORE LOGIC
            case 4: this.playTrack4(index, time); break; // DARK GLITCH
            case 5: this.playTrack5(index, time); break; // UPLINK SYNC
        }
    }

    private playTrack0(i: number, t: number) { // AMBIENT TECH (Sine based, smooth)
        if (i % 8 === 0) this.triggerPulse(100, 40, 0.2, 'sine', 0.3, t); // Deep Kick
        if (i % 16 === 8) this.triggerNoise(0.03, 0.1, t); // Soft Snare
        
        const mel = [220, 0, 261, 0, 293, 0, 220, 329];
        const freq = mel[i % 8];
        if (freq > 0) this.triggerPulse(freq, freq, 0.15, 'sine', 0.04, t);
    }

    private playTrack1(i: number, t: number) { // HEAVY INDUSTRIAL (Sawtooth, aggressive)
        if (i % 4 === 0) this.triggerPulse(80, 40, 0.15, 'sawtooth', 0.4, t); // Punchy Kick
        if (i % 8 === 4) this.triggerNoise(0.08, 0.05, t); // Snap Snare
        
        const bass = [41, 41, 41, 41, 41, 41, 41, 49];
        if (i % 2 === 0) this.triggerPulse(bass[(i/2)%8], bass[(i/2)%8], 0.1, 'sawtooth', 0.08, t);
    }

    private playTrack2(i: number, t: number) { // SYSTEM FLOW (Triangle, melodic)
        if (i % 4 === 0) this.triggerPulse(120, 60, 0.1, 'sine', 0.3, t); // Clean Kick
        if (i % 4 === 2) this.triggerNoise(0.04, 0.08, t); // Ghost Snare
        
        const arp = [440, 523, 587, 659, 440, 523, 659, 783];
        if (i % 2 === 1) this.triggerPulse(arp[(i-1)/2 % 8], arp[(i-1)/2 % 8], 0.08, 'triangle', 0.03, t);
    }

    private playTrack3(i: number, t: number) { // CORE LOGIC (Square, pulsing)
        if (i % 2 === 0) this.triggerPulse(60, 60, 0.08, 'sine', 0.25, t); // Fast Kick
        if (i % 16 === 12) this.triggerNoise(0.06, 0.15, t); // Long Snare
        
        const seq = [110, 110, 110, 110, 146, 146, 164, 164];
        if (i % 4 === 1) this.triggerPulse(seq[Math.floor(i/4)%8], seq[Math.floor(i/4)%8], 0.2, 'square', 0.05, t);
    }

    private playTrack4(i: number, t: number) { // DARK GLITCH (Irregular, sine/noise)
        const bass = [41, 41, 55, 41];
        if (i % 4 === 0) this.triggerPulse(bass[Math.floor(i/4)%4], bass[Math.floor(i/4)%4], 0.2, 'square', 0.08, t);
        if (i % 7 === 3) this.triggerNoise(0.05, 0.02, t); // Glitch Snare
        
        if (i % 8 === 0) this.triggerPulse(55, 110, 0.3, 'sine', 0.08, t); // Deep Swell
    }

    private playTrack5(i: number, t: number) { // UPLINK SYNC (High-tech, triangle)
        if (i % 4 === 0) this.triggerPulse(140, 50, 0.1, 'sine', 0.3, t); // Tech Kick
        if (i % 8 === 4) this.triggerNoise(0.07, 0.04, t); // Tight Snare
        
        const lead = [329, 329, 329, 329, 392, 392, 440, 440];
        if (i % 4 >= 2) this.triggerPulse(lead[i%8], lead[i%8], 0.05, 'triangle', 0.04, t);
    }

    private triggerPulse(start: number, end: number, dur: number, type: OscillatorType, vol: number, time: number) {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        if (start !== end) osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + dur);
    }

    private triggerNoise(vol: number, dur: number, time: number) {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);
        noise.connect(g);
        g.connect(this.masterGain!);
        noise.start(time);
        noise.stop(time + dur);
    }
}
