export type TrackID = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export class MusicManager {
    private static instance: MusicManager;
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private globalFilter: BiquadFilterNode | null = null;
    
    // Global Busses
    private delayNode: DelayNode | null = null;
    private delayGain: GainNode | null = null;
    private reverbNode: ConvolverNode | null = null;
    private reverbGain: GainNode | null = null;
    private distortionNode: WaveShaperNode | null = null;
    
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private beatIndex: number = 0;
    private timerID: number | null = null;
    
    public currentTrack: TrackID = 0;
    public enabledTracks: boolean[] = new Array(15).fill(true);

    private constructor() {
        const saved = localStorage.getItem('syntax_enabled_tracks');
        if (saved) {
            this.enabledTracks = JSON.parse(saved);
            if (this.enabledTracks.length < 15) {
                const extra = new Array(15 - this.enabledTracks.length).fill(true);
                this.enabledTracks = [...this.enabledTracks, ...extra];
            }
        }
    }

    public static getInstance(): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager();
        }
        return MusicManager.instance;
    }

    private createDistortionCurve(amount: number) {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    private createReverbImpulse(ctx: AudioContext, duration: number, decay: number) {
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        for (let i = 0; i < 2; i++) {
            const channel = impulse.getChannelData(i);
            for (let j = 0; j < length; j++) {
                channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
            }
        }
        return impulse;
    }

    public init(ctx: AudioContext, masterGain: GainNode) {
        this.ctx = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.25; 
        
        this.globalFilter = ctx.createBiquadFilter();
        this.globalFilter.type = 'lowpass';
        this.globalFilter.frequency.value = 20000; // Starts fully open
        this.globalFilter.Q.value = 1.0;
        
        this.delayNode = ctx.createDelay(1.0);
        this.delayNode.delayTime.value = 0.375; 
        this.delayGain = ctx.createGain();
        this.delayGain.gain.value = 0.2;
        const delayFeedback = ctx.createGain();
        delayFeedback.gain.value = 0.4;
        this.delayNode.connect(this.delayGain);
        this.delayGain.connect(this.masterGain);
        this.delayGain.connect(delayFeedback);
        delayFeedback.connect(this.delayNode);

        this.reverbNode = ctx.createConvolver();
        this.reverbNode.buffer = this.createReverbImpulse(ctx, 3.0, 2.0);
        this.reverbGain = ctx.createGain();
        this.reverbGain.gain.value = 0.3;
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);

        this.distortionNode = ctx.createWaveShaper();
        this.distortionNode.curve = this.createDistortionCurve(400); 
        this.distortionNode.oversample = '4x';
        const distFilter = ctx.createBiquadFilter();
        distFilter.type = 'lowpass';
        distFilter.frequency.value = 3000;
        this.distortionNode.connect(distFilter);
        distFilter.connect(this.masterGain);

        this.masterGain.connect(this.globalFilter);
        this.globalFilter.connect(masterGain);
    }

    public setSystemStress(stress: number) {
        if (!this.ctx || !this.globalFilter) return;
        // Stress 0 -> Muffled (800Hz), Stress 1 -> Fully open (20000Hz)
        const minFreq = 800;
        const maxFreq = 20000;
        // Exponentially open the filter based on stress
        const targetFreq = minFreq + (maxFreq - minFreq) * Math.pow(stress, 1.5); 
        this.globalFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.5);
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
        this.beatIndex = (Math.floor(this.beatIndex / 16) * 16); 
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
        const tempo = 130.0;
        const secondsPerBeat = 60.0 / tempo / 4; 
        this.nextNoteTime += secondsPerBeat;
        // 2600 notes @ 130BPM = Exactly 5 minutes
        this.beatIndex = (this.beatIndex + 1) % 2600; 

        if (this.beatIndex === 0) {
            this.pickNextTrack();
        }
    }

    private pickNextTrack() {
        const indices = this.enabledTracks.map((e, i) => e ? i : -1).filter(i => i !== -1);
        if (indices.length === 0) return;
        this.currentTrack = indices[Math.floor(Math.random() * indices.length)] as TrackID;
    }

    private playBeat(i: number, t: number) {
        if (!this.ctx) return;

        // --- STUDIO ARRANGEMENT GATING ---
        // Intro: 0-400 | Build: 400-800 | Peak: 800-2000 | Breakdown: 2000-2300 | Outro: 2300-2600
        const isIntro = i < 400;
        const isBuild = i >= 400 && i < 800;
        const isPeak = i >= 800 && i < 2000;
        const isBreakdown = i >= 2000 && i < 2300;
        const isOutro = i >= 2300;

        if (i % 4 === 0 && !isBreakdown && this.masterGain) {
            this.masterGain.gain.setTargetAtTime(0.12, t, 0.01);
            this.masterGain.gain.setTargetAtTime(0.45, t + 0.15, 0.1);
        }

        const config = { i, t, isIntro, isBuild, isPeak, isBreakdown, isOutro };

        switch(this.currentTrack) {
            case 0: this.playTrack0(config); break;
            case 1: this.playTrack1(config); break;
            case 2: this.playTrack2(config); break;
            case 3: this.playTrack3(config); break;
            case 4: this.playTrack4(config); break;
            case 5: this.playTrack5(config); break;
            case 6: this.playTrack6(config); break;
            case 7: this.playTrack7(config); break;
            case 8: this.playTrack8(config); break;
            case 9: this.playTrack9(config); break;
            case 10: this.playTrack10(config); break;
            case 11: this.playTrack11(config); break;
            case 12: this.playTrack12(config); break;
            case 13: this.playTrack13(config); break;
            case 14: this.playTrack14(config); break;
        }
    }

    private playTrack0(c: any) { // INDUSTRIAL_BEYER
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.3, 0.4);
        if (c.i % 8 === 4 && (c.isPeak || c.isBuild || c.isOutro)) this.triggerClap(c.t, 0.5, true);
        if (c.i % 2 === 1 && !c.isIntro) this.triggerHat(c.t, 0.2, 0.04);
        if (c.i % 4 === 2 && (c.isPeak || c.isBreakdown)) this.triggerAcidPluck(55, 0.1, c.t, false);
    }

    private playTrack1(c: any) { // MINIMAL_HAWTIN
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 0.8, 0.15);
        if ((c.i % 16 === 7 || c.i % 16 === 13) && !c.isIntro) this.triggerMinimalPerc(c.t, 0.3, 1500, true);
        if (c.i % 2 === 1 && (c.isBuild || c.isPeak)) this.triggerHat(c.t, 0.1, 0.02);
        if (c.i % 32 === 0) this.triggerAmbientPad(220, 2.0, c.t);
    }

    private playTrack2(c: any) { // ACID_DE_WITTE
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerRumbleKick(c.t);
        if (c.i % 4 === 2 && (c.isPeak || c.isOutro)) this.triggerHat(c.t, 0.3, 0.1);
        const acid = [55, 55, 110, 55, 65, 55, 130, 55];
        if (!c.isIntro) this.triggerAcidPluck(acid[c.i % 8], 0.15, c.t, c.i % 16 === 6 && c.isPeak);
    }

    private playTrack3(c: any) { // IDM_APHEX
        if ((c.i % 16 === 0 || c.i % 16 === 3 || c.i % 16 === 10) && !c.isBreakdown) this.triggerDeepKick(c.t, 1.0, 0.2);
        if ((c.i % 4 === 1 || c.i % 16 === 14) && (c.isBuild || c.isPeak)) this.triggerFMPerc(c.t, 800, 2.0, 0.2);
        if (c.i % 2 === 1 && !c.isIntro) this.triggerHat(c.t, 0.1, 0.01);
        if (c.i % 64 === 0) [220, 261, 329].forEach(n => this.triggerAmbientPad(n, 4.0, c.t));
    }

    private playTrack4(c: any) { // DARK_DRONE
        if (c.i % 8 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.5, 0.6);
        if (c.i % 4 !== 0 && !c.isIntro) this.triggerSubBass(41, 0.1, c.t);
        if (c.i % 64 === 0) this.triggerAmbientPad(55, 8.0, c.t);
        if (c.i % 16 === 12 && (c.isPeak || c.isOutro)) this.triggerClap(c.t, 0.2, true);
    }

    private playTrack5(c: any) { // HIGH_SPEED_SYNC
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.1, 0.2);
        if (!c.isIntro) this.triggerHat(c.t, 0.15, 0.03); 
        if (c.i % 8 === 4 && (c.isPeak || c.isBuild)) this.triggerClap(c.t, 0.4, false);
        if (c.i % 4 === 2 && c.isPeak) this.triggerMinimalPerc(c.t, 0.2, 400, true);
    }

    private playTrack6(c: any) { // AGGRESSIVE_OVERCLOCK
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.4, 0.3);
        if ((c.i % 16 === 4 || c.i % 16 === 12) && !c.isIntro) this.triggerClap(c.t, 0.6, true);
        const lead = [110, 110, 146, 110, 164, 110, 130, 110];
        if (c.isPeak || c.isBreakdown) this.triggerAcidPluck(lead[c.i % 8], 0.2, c.t, c.isPeak);
    }

    private playTrack7(c: any) { // AIRY_MEMORY_LEAK
        if (c.i % 8 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 0.7, 0.3);
        if (c.i % 4 === 2 && !c.isIntro) this.triggerHat(c.t, 0.05, 0.1);
        const mel = [440, 523, 659, 783, 880, 783, 659, 523];
        if (c.i % 2 === 0 && (c.isPeak || c.isBreakdown)) this.triggerMinimalPerc(c.t, 0.1, mel[Math.floor(c.i/4)%8], true);
        if (c.i % 32 === 0) this.triggerAmbientPad(329, 4.0, c.t);
    }

    private playTrack8(c: any) { // HYPNOTIC_SCAN
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.0, 0.2);
        if (c.i % 4 !== 0 && !c.isIntro) this.triggerSubBass(49, 0.15, c.t);
        if (c.i % 16 === 10 && c.isPeak) this.triggerMinimalPerc(c.t, 0.3, 2000, true);
        if (c.i % 4 === 2 && (c.isBuild || c.isPeak)) this.triggerHat(c.t, 0.2, 0.05);
    }

    private playTrack9(c: any) { // BREACH_PEAK_TIME
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.2, 0.3);
        if (c.i % 8 === 4 && !c.isIntro) this.triggerClap(c.t, 0.5, true);
        if (c.i % 2 === 1 && (c.isPeak || c.isOutro)) this.triggerHat(c.t, 0.25, 0.06);
        const riff = [110, 110, 220, 110, 110, 110, 164, 196];
        if (c.i % 4 === 3 && c.isPeak) this.triggerAcidPluck(riff[Math.floor(c.i/4)%8], 0.1, c.t, false);
    }

    private playTrack10(c: any) { // GHOST_AMBIENT
        if (c.i % 16 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 0.6, 0.5);
        if (c.i % 32 === 8 && (c.isPeak || c.isBreakdown)) this.triggerFMPerc(c.t, 400, 4.0, 0.1);
        if (c.i % 64 === 0) [110, 138, 164].forEach(n => this.triggerAmbientPad(n, 6.0, c.t));
    }

    private playTrack11(c: any) { // LOGIC_RUMBLE
        if (!c.isBreakdown) this.triggerRumbleKick(c.t);
        if (c.i % 4 === 2 && !c.isIntro) this.triggerHat(c.t, 0.4, 0.15);
        if ((c.i % 16 === 4 || c.i % 16 === 12) && (c.isPeak || c.isBuild)) this.triggerClap(c.t, 0.3, false);
        if (c.i % 16 === 14 && c.isPeak) this.triggerFMPerc(c.t, 1200, 1.5, 0.2);
    }

    private playTrack12(c: any) { // POLY_NEURAL
        if (c.i % 3 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 0.9, 0.15);
        if (c.i % 5 === 0 && (c.isPeak || c.isBuild)) this.triggerMinimalPerc(c.t, 0.2, 3000, true);
        if (c.i % 7 === 0 && c.isPeak) this.triggerFMPerc(c.t, 600, 3.0, 0.1);
        if (!c.isIntro) this.triggerHat(c.t, 0.05, 0.02);
    }

    private playTrack13(c: any) { // KERNEL_ACID_STORM
        if (c.i % 4 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.2, 0.2);
        if (c.i % 2 === 1 && !c.isIntro) this.triggerHat(c.t, 0.2, 0.03);
        const storm = [55, 65, 73, 82, 110, 130, 146, 164];
        if (c.isPeak || c.isBreakdown) this.triggerAcidPluck(storm[c.i % 8], 0.2, c.t, c.isPeak);
    }

    private playTrack14(c: any) { // CINEMATIC_EXIT
        if (c.i % 16 === 0 && !c.isBreakdown) this.triggerDeepKick(c.t, 1.8, 0.8);
        if (c.i % 64 === 0) this.triggerAmbientPad(41, 10.0, c.t);
        if (c.i % 16 === 12 && !c.isIntro) this.triggerClap(c.t, 0.4, true);
        if (c.i % 8 === 6 && (c.isPeak || c.isBreakdown)) this.triggerFMPerc(c.t, 200, 5.0, 0.15);
    }

    private triggerDeepKick(t: number, punch: number = 1.0, decay: number = 0.4) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 * punch, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.1); 
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(800, t);
        clickGain.gain.setValueAtTime(0.2, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        osc.connect(gain);
        clickOsc.connect(clickGain);
        gain.connect(this.masterGain!);
        clickGain.connect(this.masterGain!);
        osc.start(t); osc.stop(t + decay);
        clickOsc.start(t); clickOsc.stop(t + 0.02);
    }

    private triggerRumbleKick(t: number) {
        this.triggerDeepKick(t, 1.2, 0.3);
        if (!this.ctx || !this.reverbNode) return;
        const rumbleOsc = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        const rumbleFilter = this.ctx.createBiquadFilter();
        rumbleOsc.type = 'square';
        rumbleOsc.frequency.setValueAtTime(45, t);
        rumbleGain.gain.setValueAtTime(0, t);
        rumbleGain.gain.setTargetAtTime(0.4, t + 0.1, 0.05); 
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.value = 150;
        rumbleOsc.connect(rumbleGain);
        rumbleGain.connect(rumbleFilter);
        rumbleFilter.connect(this.reverbNode);
        rumbleOsc.start(t);
        rumbleOsc.stop(t + 0.5);
    }

    private triggerClap(t: number, vol: number, sendToReverb: boolean = false) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 0.5;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(vol * 0.2, t + 0.01);
        gain.gain.setValueAtTime(vol, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(vol * 0.1, t + 0.03);
        gain.gain.setValueAtTime(vol * 0.8, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        if (sendToReverb && this.reverbNode) gain.connect(this.reverbNode);
        noise.start(t);
        noise.stop(t + 0.15);
    }

    private triggerMinimalPerc(t: number, vol: number, freq: number, sendToDelay: boolean) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.05);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        if (sendToDelay && this.delayNode) gain.connect(this.delayNode);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    private triggerFMPerc(t: number, carrierFreq: number, modIndex: number, vol: number) {
        if (!this.ctx) return;
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const envGain = this.ctx.createGain();
        carrier.type = 'sine';
        modulator.type = 'sine';
        carrier.frequency.value = carrierFreq;
        modulator.frequency.value = carrierFreq * 1.414;
        modGain.gain.setValueAtTime(carrierFreq * modIndex, t);
        modGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        envGain.gain.setValueAtTime(vol, t);
        envGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(envGain);
        envGain.connect(this.masterGain!);
        if (this.reverbNode) envGain.connect(this.reverbNode);
        carrier.start(t);
        modulator.start(t);
        carrier.stop(t + 0.25);
        modulator.stop(t + 0.25);
    }

    private triggerHat(t: number, vol: number, decay: number) {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
        const baseFreq = 40;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
        ratios.forEach(ratio => {
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = baseFreq * ratio;
            osc.connect(filter);
            osc.start(t);
            osc.stop(t + decay);
        });
        filter.connect(gain);
        gain.connect(this.masterGain!);
    }

    private triggerSubBass(freq: number, vol: number, t: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.setTargetAtTime(vol, t + 0.05, 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    private triggerAcidPluck(freq: number, vol: number, t: number, accent: boolean) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        filter.type = 'lowpass';
        filter.Q.value = accent ? 15 : 8;
        filter.frequency.setValueAtTime(accent ? freq * 12 : freq * 6, t);
        filter.frequency.exponentialRampToValueAtTime(freq, t + (accent ? 0.2 : 0.1));
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(filter);
        if (this.distortionNode && accent) {
            filter.connect(this.distortionNode);
        } else {
            filter.connect(gain);
            gain.connect(this.masterGain!);
        }
        osc.start(t);
        osc.stop(t + 0.25);
    }

    private triggerAmbientPad(freq: number, dur: number, t: number) {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc1.type = 'triangle';
        osc1.frequency.value = freq;
        osc2.type = 'sine';
        osc2.frequency.value = freq * 1.01; 
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.15, t + (dur * 0.3));
        gain.gain.linearRampToValueAtTime(0.001, t + dur);
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        if (this.reverbNode) gain.connect(this.reverbNode);
        osc1.start(t); osc2.start(t);
        osc1.stop(t + dur); osc2.stop(t + dur);
    }
}
