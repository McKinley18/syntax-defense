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
        this.masterGain.gain.value = 0.2; 
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
        const tempo = 110.0;
        const secondsPerBeat = 60.0 / tempo / 2; // 8th notes
        this.nextNoteTime += secondsPerBeat;
        this.beatIndex = (this.beatIndex + 1) % 16;
    }

    private playBeat(index: number, time: number) {
        if (!this.ctx) return;

        // 1. VINTAGE DIGITAL KICK (Steady pulse)
        if (index % 4 === 0) {
            this.triggerPulse(80, 40, 0.1, 'square', 0.15, time);
        }

        // 2. PC SPEAKER CLICK (On 2 and 4)
        if (index === 4 || index === 12) {
            this.triggerPulse(1200, 100, 0.01, 'square', 0.05, time);
        }

        // 3. 8-BIT BASS LINE (A minor pattern)
        const bassNotes = [110, 110, 130, 110, 146, 110, 130, 123]; 
        if (index % 2 === 0) {
            const freq = bassNotes[(index / 2) % bassNotes.length];
            this.triggerPulse(freq, freq, 0.15, 'pulse' as OscillatorType || 'square', 0.04, time);
        }

        // 4. DIGITAL ARPEGGIO (The "Computer" sound)
        const arp = [440, 523, 659, 783, 880, 783, 659, 523];
        if (index % 1 === 0) { // 16th notes
            const freq = arp[index % arp.length];
            this.triggerPulse(freq, freq, 0.05, 'square', 0.02, time);
        }
    }

    private triggerPulse(start: number, end: number, dur: number, type: OscillatorType, vol: number, time: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        // Emulate pulse wave if possible, else square
        osc.type = type === 'pulse' as any ? 'square' : type;
        
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
}
