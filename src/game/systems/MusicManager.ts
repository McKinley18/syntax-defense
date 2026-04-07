export class MusicManager {
    private static instance: MusicManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private beatIndex: number = 0;
    private timerID: number | null = null;

    private constructor() {}

    public static getInstance(): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager();
        }
        return MusicManager.instance;
    }

    public init(ctx: AudioContext, masterGain: GainNode) {
        this.ctx = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.25; // SLIGHTLY LOUDER
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

    private scheduler() {
        if (!this.isPlaying || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBeat(this.beatIndex, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = requestAnimationFrame(() => this.scheduler());
    }

    private advanceNote() {
        const tempo = 120.0;
        const secondsPerBeat = 60.0 / tempo / 2; // 8th notes
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 16;
    }

    private playBeat(index: number, time: number) {
        if (!this.ctx) return;

        // 1. CYBER KICK (Every 1st and 3rd quarter note)
        if (index % 4 === 0) {
            this.triggerPulse(100, 30, 0.15, 'sine', 0.3, time);
        }

        // 2. TECH SNARE / NOISE (On 2 and 4)
        if (index === 4 || index === 12) {
            this.triggerNoise(0.05, 0.1, time);
        }

        // 3. SYNTH BASS LINE
        const bassScale = [55, 55, 65, 55, 82, 55, 65, 73]; // A1, A1, C2, A1, E2, A1, C2, D2
        if (index % 2 === 0) {
            const freq = bassScale[(index / 2) % bassScale.length];
            this.triggerPulse(freq, freq, 0.2, 'sawtooth', 0.05, time);
        }

        // 4. DATA GLITCH (High chirps)
        if (index % 7 === 0) {
            this.triggerPulse(1200, 2000, 0.03, 'square', 0.02, time);
        }
    }

    private triggerPulse(start: number, end: number, dur: number, type: OscillatorType, vol: number, time: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(time);
        osc.stop(time + dur);
    }

    private triggerNoise(vol: number, dur: number, time: number) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
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
