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

    private scheduler() {
        if (!this.isPlaying || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBeat(this.beatIndex, this.nextNoteTime);
            this.advanceNote();
        }
        this.timerID = requestAnimationFrame(() => this.scheduler());
    }

    private advanceNote() {
        const tempo = 128.0; // TECHNO TEMPO
        const secondsPerBeat = 60.0 / tempo / 4; // 16th notes for techno drive
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 32; // Longer loop
    }

    private playBeat(index: number, time: number) {
        if (!this.ctx) return;

        // 1. DRIVING TECHNO KICK (On quarters)
        if (index % 4 === 0) {
            this.triggerPulse(150, 40, 0.12, 'sine', 0.4, time);
        }

        // 2. TECHNO PERCUSSION (Syncopated noise)
        if (index % 4 === 2) { // "Clap" on 2 and 4
            this.triggerNoise(0.08, 0.05, time);
        }
        if (index % 2 === 1) { // 16th note hats
            this.triggerPulse(8000, 4000, 0.02, 'square', 0.02, time);
        }

        // 3. HYPNOTIC BASS (Driving 8ths)
        const bassNotes = [55, 55, 55, 65, 55, 55, 73, 65]; 
        if (index % 2 === 0) {
            const freq = bassNotes[(index / 2) % bassNotes.length];
            this.triggerPulse(freq, freq, 0.1, 'square', 0.06, time);
        }

        // 4. TECHNO ARPEGGIO (Fast 16th notes)
        const arp = [220, 0, 330, 0, 440, 0, 330, 550, 0, 440, 330, 0, 220, 330, 440, 660];
        const freq = arp[index % arp.length];
        if (freq > 0) {
            this.triggerPulse(freq, freq * 1.01, 0.04, 'square', 0.03, time);
        }
    }

    private triggerPulse(start: number, end: number, dur: number, type: OscillatorType, vol: number, time: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(start, time);
        if (start !== end) {
            osc.frequency.exponentialRampToValueAtTime(end, time + dur);
        }
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
