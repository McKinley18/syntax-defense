export type TrackID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export class MusicManager {
    private static instance: MusicManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private mainFilter: BiquadFilterNode | null = null;
    private delayNode: DelayNode | null = null;
    private delayGain: GainNode | null = null;
    
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private beatIndex: number = 0;
    private timerID: number | null = null;
    
    public currentTrack: TrackID = 0;
    public enabledTracks: boolean[] = new Array(11).fill(true);

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
        this.mainFilter = ctx.createBiquadFilter();
        this.mainFilter.type = 'lowpass';
        this.mainFilter.frequency.value = 2500;
        this.mainFilter.Q.value = 1.0;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.25; 
        this.delayNode = ctx.createDelay(1.0);
        this.delayNode.delayTime.value = 0.375; 
        this.delayGain = ctx.createGain();
        this.delayGain.gain.value = 0.15;
        this.mainFilter.connect(this.masterGain);
        this.delayNode.connect(this.delayGain);
        this.delayGain.connect(this.mainFilter);
        this.delayGain.connect(this.delayNode); 
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
        this.beatIndex = (Math.floor(this.beatIndex / 4) * 4);
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
        const tempo = 126.0;
        const secondsPerBeat = 60.0 / tempo / 4; 
        this.nextNoteTime += secondsPerBeat;
        
        // 126 BPM = 2.1 Beats/sec. 180 seconds (~3 mins) = ~378 beats.
        // We use 384 beats (96 bars of 4/4) for perfect musical phrasing.
        this.beatIndex = (this.beatIndex + 1) % 384; 

        if (this.mainFilter) {
            const mod = Math.sin(this.ctx!.currentTime * 0.1) * 1000;
            this.mainFilter.frequency.setTargetAtTime(2000 + mod, this.ctx!.currentTime, 0.5);
        }

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
        if (index % 4 === 0 && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(0.1, time, 0.01);
            this.masterGain.gain.setTargetAtTime(0.45, time + 0.1, 0.05);
        }

        switch(this.currentTrack) {
            case 0: this.playTrack0(index, time); break;
            case 1: this.playTrack1(index, time); break;
            case 2: this.playTrack2(index, time); break;
            case 3: this.playTrack3(index, time); break;
            case 4: this.playTrack4(index, time); break;
            case 5: this.playTrack5(index, time); break;
            case 6: this.playTrack6(index, time); break;
            case 7: this.playTrack7(index, time); break;
            case 8: this.playTrack8(index, time); break;
            case 9: this.playTrack9(index, time); break;
            case 10: this.playTrack10(index, time); break;
        }
    }

    private playTrack0(i: number, t: number) { 
        if (i % 4 === 0) this.triggerKick(t);
        if (i % 16 === 8) this.triggerSnare(t, 0.1, 800);
        const mel = [220, 0, 261, 293, 0, 220, 0, 196];
        if (mel[i % 8] > 0) this.triggerSynth(mel[i % 8], 0.2, 'sine', 0.05, t, true);
    }

    private playTrack1(i: number, t: number) { 
        if (i % 4 === 0) this.triggerKick(t, 1.2);
        if (i % 8 === 4) this.triggerSnare(t, 0.15, 1200);
        if (i % 2 === 1) this.triggerHat(t, 0.02);
        const bass = [41, 0, 41, 0, 41, 41, 49, 0];
        if (bass[i % 8] > 0) this.triggerSynth(bass[i % 8], 0.15, 'sawtooth', 0.08, t);
    }

    private playTrack2(i: number, t: number) { 
        if (i % 4 === 0) this.triggerKick(t);
        if (i % 4 === 2) this.triggerHat(t, 0.04);
        const arp = [440, 523, 659, 783, 880, 783, 659, 523];
        if (i % 2 === 1) this.triggerSynth(arp[Math.floor(i/2) % 8], 0.1, 'triangle', 0.04, t, true);
    }

    private playTrack3(i: number, t: number) { 
        if (i % 2 === 0) this.triggerKick(t, 0.8);
        if (i % 8 === 4) this.triggerSnare(t, 0.08, 600);
        const seq = [110, 110, 146, 110, 164, 110, 146, 130];
        if (i % 4 === 1) this.triggerSynth(seq[Math.floor(i/4) % 8], 0.2, 'square', 0.06, t);
    }

    private playTrack4(i: number, t: number) { 
        if (i % 6 === 0) this.triggerKick(t, 1.1);
        if (i % 16 === 12) this.triggerSnare(t, 0.2, 400);
        if (i % 8 === 0) this.triggerSynth(55, 0.6, 'sine', 0.1, t, true);
        if (i % 12 === 4) this.triggerSynth(880, 0.05, 'sine', 0.02, t, true);
    }

    private playTrack5(i: number, t: number) { 
        if (i % 4 === 0) this.triggerKick(t);
        if (i % 8 === 4) this.triggerSnare(t, 0.1, 1500);
        if (i % 4 >= 2) this.triggerHat(t, 0.03);
        const chords = [329, 392, 440, 293];
        if (i % 16 === 0) {
            this.triggerSynth(chords[Math.floor(i/16) % 4], 0.8, 'sine', 0.05, t, true);
            this.triggerSynth(chords[Math.floor(i/16) % 4] * 1.5, 0.8, 'sine', 0.03, t, true);
        }
    }

    // --- NEW TRACKS (6-10) ---

    private playTrack6(i: number, t: number) { // NEON NIGHTS (Fast, Pulse)
        if (i % 4 === 0) this.triggerKick(t, 1.3);
        if (i % 4 === 2) this.triggerHat(t, 0.05);
        const seq = [440, 440, 523, 440, 587, 440, 523, 659];
        if (i % 2 === 0) this.triggerSynth(seq[i % 8], 0.08, 'square', 0.04, t, true);
    }

    private playTrack7(i: number, t: number) { // GRID RUNNER (Steady, Bass)
        if (i % 4 === 0) this.triggerKick(t, 0.9);
        if (i % 16 === 8) this.triggerSnare(t, 0.12, 1000);
        const bass = [55, 55, 65, 55, 73, 55, 65, 82];
        this.triggerSynth(bass[Math.floor(i/2) % 8], 0.1, 'sawtooth', 0.07, t);
    }

    private playTrack8(i: number, t: number) { // SYSTEM ERROR (Irregular, Tech)
        if (i % 3 === 0) this.triggerKick(t, 1.1);
        if (i % 16 === 10) this.triggerSnare(t, 0.15, 300);
        if (i % 4 === 1) this.triggerSynth(Math.random() * 100 + 100, 0.05, 'square', 0.03, t, true);
    }

    private playTrack9(i: number, t: number) { // VIRTUAL HORIZON (Melodic, Wide)
        if (i % 8 === 0) this.triggerKick(t);
        if (i % 8 === 4) this.triggerSnare(t, 0.05, 2000);
        const mel = [293, 329, 349, 392, 440, 392, 349, 329];
        if (i % 4 === 0) this.triggerSynth(mel[Math.floor(i/8) % 8], 1.2, 'sine', 0.06, t, true);
    }

    private playTrack10(i: number, t: number) { // CORE BREACH (Aggressive, Heavy)
        if (i % 2 === 0) this.triggerKick(t, 1.5);
        if (i % 4 === 1) this.triggerHat(t, 0.06);
        const lead = [110, 110, 110, 146, 110, 110, 164, 110];
        if (i % 2 === 1) this.triggerSynth(lead[i % 8], 0.15, 'sawtooth', 0.1, t);
    }

    private triggerKick(t: number, punch: number = 1.0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(150 * punch, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(g);
        g.connect(this.mainFilter!);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    private triggerSnare(t: number, vol: number, freq: number) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        noise.connect(filter);
        filter.connect(g);
        g.connect(this.mainFilter!);
        noise.start(t);
        noise.stop(t + 0.1);
    }

    private triggerHat(t: number, vol: number) {
        if (!this.ctx) return;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 10000;
        osc.connect(filter);
        filter.connect(g);
        g.connect(this.mainFilter!);
        osc.start(t);
        osc.stop(t + 0.02);
    }

    private triggerSynth(freq: number, dur: number, type: OscillatorType, vol: number, t: number, sendToDelay: boolean = false) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const sub = this.ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.value = freq / 2;
        const subG = this.ctx.createGain();
        subG.gain.value = vol * 0.5;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.setTargetAtTime(freq * 1.005, t + 0.05, 0.1);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(g);
        sub.connect(subG);
        subG.connect(g);
        g.connect(this.mainFilter!);
        if (sendToDelay && this.delayNode) g.connect(this.delayNode);
        osc.start(t);
        sub.start(t);
        osc.stop(t + dur);
        sub.stop(t + dur);
    }
}
