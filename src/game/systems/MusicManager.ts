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
        this.masterGain.gain.value = 0.15; // Subtle background level
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
        if (this.masterGain) this.masterGain.gain.value = val;
    }

    private scheduler() {
        while (this.nextNoteTime < this.ctx!.currentTime + 0.1) {
            this.playBeat(this.beatIndex, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = requestAnimationFrame(() => this.scheduler());
    }

    private advanceNote() {
        const tempo = 124.0;
        const secondsPerBeat = 60.0 / tempo / 2; // 8th notes
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 16;
    }

    private playBeat(index: number, time: number) {
        if (!this.ctx) return;

        // 1. DIGITAL KICK (Every 1st and 3rd beat)
        if (index % 4 === 0) {
            this.triggerPulse(60, 20, 0.1, 'sine', 0.2, time);
        }

        // 2. DATA CHIRP (Syncopated)
        if (index % 3 === 0 || index === 7 || index === 13) {
            const freq = index % 2 === 0 ? 880 : 1200;
            this.triggerPulse(freq, freq * 0.8, 0.05, 'square', 0.03, time);
        }

        // 3. AMBIENT DATA WASH (Longer pulses)
        if (index === 0 || index === 8) {
            this.triggerPulse(110, 110, 0.4, 'triangle', 0.02, time);
        }
    }

    private triggerPulse(start: number, end: number, dur: number, type: OscillatorType, vol: number, time: number) {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
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
}
