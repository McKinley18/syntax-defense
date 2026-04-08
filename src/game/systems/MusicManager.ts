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
        // Immediate jump to new track logic
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
        const tempo = 128.0;
        const secondsPerBeat = 60.0 / tempo / 4; 
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 128; // Longer phrases

        // TRACK ROTATION: Every 128 beats (~1 minute)
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

        // GLOBAL DRUM LAYER
        if (index % 4 === 0) this.triggerPulse(150, 40, 0.12, 'sine', 0.4, time); // KICK
        if (index % 4 === 2) this.triggerNoise(0.08, 0.05, time); // SNARE
        if (index % 2 === 1) this.triggerPulse(3000, 1500, 0.02, 'sine', 0.015, time); // SOFT HAT (Clean)

        // TRACK-SPECIFIC LOGIC
        switch(this.currentTrack) {
            case 0: this.playTrack0(index, time); break;
            case 1: this.playTrack1(index, time); break;
            case 2: this.playTrack2(index, time); break;
            case 3: this.playTrack3(index, time); break;
            case 4: this.playTrack4(index, time); break;
            case 5: this.playTrack5(index, time); break;
        }
    }

    private playTrack0(i: number, t: number) { // HYPNOTIC
        const bass = [55, 55, 55, 65, 55, 55, 73, 65]; 
        if (i % 2 === 0) this.triggerPulse(bass[(i/2)%8], bass[(i/2)%8], 0.1, 'square', 0.06, t);
        const arp = [220, 0, 330, 0, 440, 0, 330, 440, 0, 440, 330, 0, 220, 330, 440, 550];
        const freq = arp[i % 16];
        if (freq > 0) this.triggerPulse(freq, freq * 1.01, 0.04, 'triangle', 0.03, t);
    }

    private playTrack1(i: number, t: number) { // INDUSTRIAL
        const bass = [41, 41, 41, 41, 41, 41, 41, 49]; 
        if (i % 2 === 0) this.triggerPulse(bass[(i/2)%8], bass[(i/2)%8], 0.12, 'sawtooth', 0.07, t);
        if (i % 8 === 0) this.triggerPulse(440, 220, 0.15, 'square', 0.04, t);
    }

    private playTrack2(i: number, t: number) { // DATA STREAM
        const bass = [65, 65, 82, 65, 98, 65, 82, 73];
        if (i % 2 === 0) this.triggerPulse(bass[(i/2)%8], bass[(i/2)%8], 0.08, 'square', 0.05, t);
        const arp = [440, 550, 660, 880];
        if (i % 4 >= 2) this.triggerPulse(arp[i%4], arp[i%4], 0.03, 'sine', 0.02, t);
    }

    private playTrack3(i: number, t: number) { // KERNEL
        if (i % 4 === 0) this.triggerPulse(110, 110, 0.2, 'sawtooth', 0.08, t);
        const seq = [440, 440, 440, 440, 550, 550, 440, 440];
        if (i % 2 === 1) this.triggerPulse(seq[(i-1)/2 % 8], seq[(i-1)/2 % 8], 0.05, 'triangle', 0.03, t);
    }

    private playTrack4(i: number, t: number) { // GLITCH
        const bass = [41, 41, 55, 41];
        if (i % 4 === 0) this.triggerPulse(bass[i/4%4], bass[i/4%4], 0.2, 'square', 0.08, t);
        if (i % 3 === 0) this.triggerPulse(Math.random()*400 + 200, 100, 0.02, 'sine', 0.02, t);
    }

    private playTrack5(i: number, t: number) { // UPLINK
        const bass = [73, 73, 73, 73, 87, 87, 98, 98];
        if (i % 2 === 0) this.triggerPulse(bass[(i/2)%8], bass[(i/2)%8], 0.1, 'square', 0.05, t);
        const lead = [550, 0, 550, 0, 660, 0, 440, 0];
        if (i % 2 === 1) this.triggerPulse(lead[(i-1)/2 % 8], lead[(i-1)/2 % 8], 0.06, 'sine', 0.02, t);
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
